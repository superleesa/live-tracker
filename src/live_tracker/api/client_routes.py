from fastapi import APIRouter, WebSocketDisconnect, HTTPException
from live_tracker.schema import APIRecord
from live_tracker.api.connection_manager import ws_manager

client_router = APIRouter()

@client_router.post("/record")
async def send_record(record: APIRecord) -> None:
    try:
        await ws_manager.send_record(record)
    except WebSocketDisconnect:
        # we don't necessarily need to disconnect the ws manager just tell that it couldn't send the record
        # ws_manager.disconnect()
        raise HTTPException(status_code=400, detail="Client disconnected")
    
    return  # raise 200 with no content if success