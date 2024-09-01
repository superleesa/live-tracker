from typing import Callable

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from live_tracker.api.connection_manager import ws_manager
from live_tracker.api.schema import (
    ListDataSorcesMessage,
    ListDataSorcesMessageResponse,
    SubscriptionMessage,
    SubscriptionMessageResponse,
    UnsubscriptionMessage,
    UnsubscriptionMessageMessageResponse,
    WebsocketMessage,
    WebsocketResponseStatus,
    WebsocketMessageRaw,
)

browser_router = APIRouter()
websocket_routes: dict[str, Callable] = {}


# A decorator to register a WebSocket route
def websocket_route(path: str):
    def decorator(func: Callable):
        websocket_routes[path] = func
        return func

    # TODO: add automatic validation??
    return decorator


@browser_router.websocket("/ws/{client_id}")
async def initialize_ws(
    websocket: WebSocket,
    client_id: str,
) -> None:
    global websocket_routes

    await ws_manager.connect(websocket, client_id)
    try:
        while True:
            try:
                message_raw = WebsocketMessageRaw(**await websocket.receive_json())
            except Exception:
                # should raise pydantic_core._pydantic_core.ValidationError
                await websocket.send_text("Invalid message format")
                continue
            
            route, data = message_raw.event, message_raw.data
            if route in websocket_routes:
                await websocket_routes[route](data, client_id, websocket)
            else:
                await websocket.send_text(f"Unknown action: {route}")
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")

    # TODO: send success message to the frontend?
    # TODO: by default, the API server should load all existing data and push it to the frontend
    # because the server might have been restarted and the frontend should be able to recover the data


@websocket_route("listDataSources")
async def list_data_sources(
    message: ListDataSorcesMessage, client_id: str, websocket: WebSocket
) -> None:
    # Handle the "getDataSources" action
    data_source_list = ws_manager.get_data_sources()
    await websocket.send_json(
        ListDataSorcesMessageResponse(
            status=WebsocketResponseStatus.OK, output=data_source_list
        ).model_dump()
    )


@websocket_route("subscribe")
async def subscribe(
    message: SubscriptionMessage, client_id: str, websocket: WebSocket
) -> None:
    # Handle the "subscribe" action
    data_source = message.subscription
    is_successful = ws_manager.subscribe(data_source, client_id)
    if is_successful:
        await websocket.send_json(
            SubscriptionMessageResponse(
                status=WebsocketResponseStatus.OK, subscription=data_source
            ).model_dump()
        )
        # TODO: send all existing data for this data source to the client
    else:
        await websocket.send_json(
            SubscriptionMessageResponse(
                status=WebsocketResponseStatus.ERROR, subscription=data_source
            ).model_dump()
        )


@websocket_route("unsubscribe")
async def unsubscribe(
    message: UnsubscriptionMessage, client_id: str, websocket: WebSocket
) -> None:
    # Handle the "unsubscribe" action
    data_source = message.unsubscription
    is_successful = ws_manager.unsubscribe(data_source, client_id)
    if is_successful:
        await websocket.send_json(
            UnsubscriptionMessageMessageResponse(
                status=WebsocketResponseStatus.OK, unsubscription=data_source
            ).model_dump()
        )
    else:
        await websocket.send_json(
            UnsubscriptionMessageMessageResponse(
                status=WebsocketResponseStatus.ERROR, unsubscription=data_source
            ).model_dump()
        )


async def send_one(
    message: WebsocketMessage, client_id: str, connection: WebSocket
) -> tuple[str, bool]:
    # TODO: add retry
    async def wrapped_send_record(
        message: WebsocketMessage, connection: WebSocket
    ) -> None:
        await connection.send_json(message.model_dump())

    try:
        await wrapped_send_record(message, connection)
    except WebSocketDisconnect as e:
        print(f"An error occurred while sending data to a client: {e}")
        return client_id, False

    return client_id, True
