from fastapi import WebSocket

from live_tracker.api.schema import DataSource

class ConnectionManager:
    def __init__(self) -> None:
        # i think these attributes should be persistent
        self.current_data_source_id = 0
        self.data_sources: dict[int, DataSource] = {}
        self.active_connections: dict[str, WebSocket] = {}
        self.client_to_subscriptions: dict[str, set[DataSource]] = {}
        self.subscription_to_clients: dict[DataSource, set[str]] = {}
        self.active_client_id: str | None = None  # we only keep one to avoid sending data to multiple frontends and so we don't really need this
        self.active_client_socket: WebSocket | None = None

    async def connect(self, websocket: WebSocket, client_id: str) -> None:
        if websocket in self.active_connections.values():
            return
        await websocket.accept()
        self.active_connections[client_id] = websocket
    
    def get_data_source_by_id(self, data_source_id: int) -> DataSource:
        return self.data_sources[data_source_id]
        
    def add_data_source(self, data_source: DataSource) -> bool:
        if data_source in self.data_sources.values():
            return False
        
        data_source.id = self.current_data_source_id
        self.current_data_source_id += 1  # TODO: hide this
        self.data_sources[data_source.id] = data_source
        return True

    def disconnect(self, client_id: str) -> None:
        # TODO: i think we need to actually disconnect the websocket
        self.active_connections.pop(client_id)
        
        # TODO: unsubscribe this client from all data sources
    
    def subscribe(self, data_source: DataSource, client_id: str) -> bool:
        if data_source in self.data_sources.values():
            return False
        
        self.client_to_subscriptions[client_id].add(data_source)
        self.subscription_to_clients[data_source].add(client_id)
        return True
    
    def unsubscribe(self, data_source: DataSource, client_id: str) -> bool:
        try:
            self.client_to_subscriptions[client_id].remove(data_source)
            self.subscription_to_clients[data_source].remove(client_id)
            return True
        except KeyError:
            return False
    
    def get_active_connections_for_data_source(self, data_source: DataSource) -> dict[str, WebSocket]:
        return {client_id: self.active_connections[client_id] for client_id in self.subscription_to_clients[data_source]}
    
    def get_data_sources(self) -> list[DataSource]:
        return list(self.data_sources.values())


ws_manager = ConnectionManager()