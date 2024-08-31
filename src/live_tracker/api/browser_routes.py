from fastapi import APIRouter, WebSocket

from live_tracker.api.connection_manager import ConnectionManager, ws_manager
from live_tracker.schema import APIRecord



# TODO: add get method for single page app and it must initialize the websocket connection
# TODO: add an get endpoint that loads all data and sends to the frontend
browser_router = APIRouter()

@browser_router.websocket("/ws/{client_id}")
async def initialize_ws(websocket: WebSocket, client_id: str,) -> None:
    await ws_manager.connect(websocket, client_id)
    
    # TODO: send success message to the frontend?
    # TODO: by default, the API server should load all existing data and push it to the frontend
    # because the server might have been restarted and the frontend should be able to recover the data