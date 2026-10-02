"""Creates and enriches leads in the main backend (the owner of lead data)."""

import asyncio
import logging

import httpx

from app.config import get_settings

log = logging.getLogger(__name__)
settings = get_settings()


class LeadServiceError(RuntimeError):
    pass


def _lead_payload(lead: dict) -> dict:
    details = []
    if lead.get("freight"):
        details.append(f"Freight: {lead['freight']}")
    if lead.get("pickup_date"):
        details.append(f"Pickup date: {lead['pickup_date']}")
    if lead.get("notes"):
        details.append(f"Notes: {lead['notes']}")
    payload = {
        "name": lead.get("name"),
        "phone": lead.get("phone"),
        "email": lead.get("email"),
        "selected_service": lead.get("service"),
        "pickup": lead.get("pickup"),
        "drop": lead.get("delivery"),
        "details": "\n".join(details) or None,
    }
    return {k: v for k, v in payload.items() if v}


class BackendClient:
    """Retries transient failures; the backend makes creation idempotent per session."""

    def __init__(self, transport: httpx.AsyncBaseTransport | None = None) -> None:
        self._transport = transport

    def _client(self) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            base_url=settings.backend_url,
            timeout=10,
            headers={"X-Service-Token": settings.service_token},
            transport=self._transport,
        )

    async def _request(self, method: str, path: str, json: dict) -> dict:
        last_error: Exception | None = None
        for attempt in range(3):
            try:
                async with self._client() as client:
                    resp = await client.request(method, path, json=json)
                if resp.status_code < 500:
                    if resp.status_code >= 400:
                        raise LeadServiceError(f"Backend rejected the lead ({resp.status_code}): {resp.text[:200]}")
                    return resp.json()
                last_error = LeadServiceError(f"Backend error {resp.status_code}")
            except httpx.HTTPError as exc:
                last_error = exc
            await asyncio.sleep(0.5 * (attempt + 1))
        raise LeadServiceError(str(last_error))

    async def create_lead(self, lead: dict, session_id: str) -> int:
        body = _lead_payload(lead) | {"chat_session_id": session_id, "callback_requested": True}
        data = await self._request("POST", "/api/internal/chat-leads", body)
        return int(data["id"])

    async def update_lead(self, lead_id: int, lead: dict) -> None:
        await self._request("PATCH", f"/api/internal/chat-leads/{lead_id}", _lead_payload(lead))


backend = BackendClient()
