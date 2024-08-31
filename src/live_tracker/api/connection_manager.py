from fastapi import WebSocket

from live_tracker.schema import APIRecord


class ConnectionManager:
    def __init__(self) -> None:
        self.active_client_id: str | None = None  # we only keep one to avoid sending data to multiple frontends and so we don't really need this
        self.active_client_socket: WebSocket | None = None

    async def connect(self, websocket: WebSocket, client_id: str) -> None:
        await websocket.accept()
        self.active_client_id = client_id
        self.active_client_socket = websocket

    def disconnect(self) -> None:
        self.active_client_socket = self.active_client_id = None

    async def send_record(self, record: APIRecord) -> None:
        if self.active_client_socket is not None:
            await self.active_client_socket.send_json(record.model_dump())

ws_manager = ConnectionManager()