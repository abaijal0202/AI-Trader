from __future__ import annotations

import asyncio
import hashlib
import json
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Callable, Optional

import httpx
from pydantic import BaseModel


class BreezeAPIError(Exception):
    def __init__(self, status_code: int, message: str, payload: Any | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.payload = payload


class BreezeAuthError(BreezeAPIError):
    pass


class BreezeRateLimitError(BreezeAPIError):
    pass


class BreezeTransientError(BreezeAPIError):
    pass


class BreezeFatalError(BreezeAPIError):
    pass


class BreezeResponse(BaseModel):
    Success: Any | None = None
    Status: int
    Error: Any | None = None


@dataclass
class BreezeConfig:
    base_url: str = "https://api.icicidirect.com"
    login_url: str = "https://api.icicidirect.com/apiuser/login"
    timeout_seconds: float = 5.0
    max_retries: int = 3
    retry_base_ms: int = 100
    calls_per_minute: int = 100
    calls_per_day: int = 5000


class BreezeClient:
    def __init__(
        self,
        app_key: str,
        secret_key: str,
        api_session_provider: Callable[[], str],
        audit_hook: Optional[Callable[[dict], None]] = None,
        config: BreezeConfig | None = None,
    ):
        self.app_key = app_key
        self.secret_key = secret_key
        self.api_session_provider = api_session_provider
        self.audit_hook = audit_hook or (lambda event: None)
        self.config = config or BreezeConfig()
        self._session_token: Optional[str] = None
        self._client = httpx.AsyncClient(
            timeout=self.config.timeout_seconds,
            base_url=self.config.base_url,
        )

    @staticmethod
    def _timestamp() -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")

    @staticmethod
    def _compact_json(payload: dict[str, Any]) -> str:
        return json.dumps(payload, separators=(",", ":"), ensure_ascii=False)

    def _checksum(self, timestamp: str, payload_str: str) -> str:
        raw = f"{timestamp}{payload_str}{self.secret_key}"
        digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
        return f"token {digest}"

    async def bootstrap_session(self) -> str:
        api_session = self.api_session_provider()
        payload = {"SessionToken": api_session, "AppKey": self.app_key}

        resp = await self._client.request(
            "GET",
            "/breezeapi/api/v1/customerdetails",
            headers={"Content-Type": "application/json"},
            content=self._compact_json(payload),
        )

        data = self._parse_response(resp)
        token = data["Success"]["session_token"]
        self._session_token = token

        self.audit_hook({
            "type": "breeze.session_bootstrap",
            "status": "success",
            "ts": self._timestamp(),
        })
        return token

    async def ensure_session(self) -> str:
        if self._session_token:
            return self._session_token
        return await self.bootstrap_session()

    def _signed_headers(self, payload: dict[str, Any]) -> dict[str, str]:
        if not self._session_token:
            raise BreezeAuthError(401, "Session not initialized")

        payload_str = self._compact_json(payload)
        timestamp = self._timestamp()
        
        return {
            "Content-Type": "application/json",
            "X-Checksum": self._checksum(timestamp, payload_str),
            "X-Timestamp": timestamp,
            "X-AppKey": self.app_key,
            "X-SessionToken": self._session_token,
        }

    def _parse_response(self, resp: httpx.Response) -> dict[str, Any]:
        try:
            data = resp.json()
        except Exception:
            raise BreezeFatalError(resp.status_code, "Non-JSON response", resp.text)

        if resp.status_code in (401, 403):
            raise BreezeAuthError(resp.status_code, "Unauthorized", data)
        if resp.status_code == 429:
            raise BreezeRateLimitError(resp.status_code, "Rate limit exceeded", data)
        if resp.status_code in (408, 500, 502, 503, 504):
            raise BreezeTransientError(resp.status_code, "Transient broker error", data)
        if resp.status_code >= 400:
            raise BreezeFatalError(resp.status_code, "Broker request failed", data)
        
        return data

    async def request(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        *,
        idempotent: bool = True,
        operation_name: str = "unknown"
    ) -> dict[str, Any]:
        payload = payload or {}
        await self.ensure_session()
        
        headers = self._signed_headers(payload)
        body = self._compact_json(payload)

        for attempt in range(self.config.max_retries + 1):
            try:
                resp = await self._client.request(
                    method=method,
                    url=path,
                    headers=headers,
                    content=body if method in ["POST", "PUT", "PATCH", "GET"] else None
                )
                return self._parse_response(resp)
            except (BreezeTransientError, httpx.RequestError) as e:
                if attempt == self.config.max_retries or not idempotent:
                    raise e
                await asyncio.sleep((self.config.retry_base_ms / 1000) * (2 ** attempt))
        
        raise BreezeFatalError(500, "Max retries exceeded")
