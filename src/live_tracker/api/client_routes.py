import asyncio

from fastapi import APIRouter, HTTPException
from live_tracker.api.browser_routes import send_one
from live_tracker.api.connection_manager import ConnectionManager, ws_manager
from live_tracker.schema import ClientRecord
from live_tracker.api.schema import SendRecordMessage, Record, DataSource

client_router = APIRouter()


async def broadcast_record(record: Record, ws_manager: ConnectionManager) -> bool:
    """
    Broadcast a record to all active connections
    Note: if a connection is closed / disconnected, we remove it from the active connections
    """
    active_connections = ws_manager.get_active_connections_for_data_source(record.data_source)
    send_tasks = [send_one(SendRecordMessage(record=record), client_id, connection) for client_id, connection in active_connections.items()]
    sent_to_all = True
    for completed_task in asyncio.as_completed(send_tasks):
        client_id, is_successful = await completed_task
        if not is_successful:
            ws_manager.disconnect(client_id)
            sent_to_all = False
    
    return sent_to_all


@client_router.post("/record")
async def send_record(client_record: ClientRecord) -> None:
    # TODO: also store the record in the database / file
    # convert from ClientRecord to Record
    record_data_source = ws_manager.get_data_source_by_id(client_record.record.data_source_id)
    record = Record(record_value=client_record.record.value, data_source=record_data_source)
    sent_to_all = await broadcast_record(record, ws_manager)
    if not sent_to_all:
        raise HTTPException(status_code=200, detail="Data received successfully but failed to send data to some clients")
    return  # raise 200 with no content if success

# TODO: add an endpoint to add a data source
@client_router.post("/data_source")
async def add_data_source(data_source: DataSource) -> dict:
    is_successful = ws_manager.add_data_source(data_source)
    if not is_successful:
        raise HTTPException(status_code=400, detail="Data source already exists")
    return {"data_source_id": data_source.id}
