from fastapi import FastAPI, WebSocket, Request, HTTPException
from fastapi.websockets import WebSocketDisconnect

from live_tracker.api.connection_manager import ConnectionManager
from live_tracker.schema import APIRecord

app = FastAPI()
ws_manager = ConnectionManager()

# TODO: add get method for single page app and it must initialize the websocket connection
# TODO: add an get endpoint that loads all data and sends to the frontend

@app.post("/record")
async def send_record(record: APIRecord) -> None:
    try:
        await ws_manager.send_record(record)
    except WebSocketDisconnect:
        ws_manager.disconnect()
        raise HTTPException(status_code=400, detail="Client disconnected")
    
    return  # raise 200 with no content if success


@app.websocket("/ws/{client_id}")
async def initialize_ws(websocket: WebSocket, client_id: str,) -> None:
    await ws_manager.connect(websocket, client_id)
    
    # TODO: send success message to the frontend?