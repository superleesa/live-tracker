from enum import Enum
from typing import Any, Generic, TypeVar

from live_tracker.schema import DataSource
from pydantic import BaseModel

ResponseT = TypeVar('ResponseT', bound=Any)


class Record(BaseModel):
    record_value: Any
    data_source: DataSource


class MessageEvent(str, Enum):
    subscription = "subscription"
    unsubscription = "unsubscription"
    listDataSources = "listDataSources"
    sendRecord = "sendRecord"


class WebsocketResponseStatus(str, Enum):
    OK = 'ok'
    ERROR = 'error'


class WebsocketMessage(BaseModel):
    event: MessageEvent


class WebsocketResponse(BaseModel, Generic[ResponseT]):
    output: ResponseT
    status: WebsocketResponseStatus


class SubscriptionMessage(WebsocketMessage):
    event: MessageEvent = MessageEvent.subscription
    subscription: DataSource


class SubscriptionMessageResponse(WebsocketResponse[None], SubscriptionMessage):
    output: None = None


class UnsubscriptionMessage(WebsocketMessage):
    event: MessageEvent = MessageEvent.unsubscription
    unsubscription: DataSource


class UnsubscriptionMessageMessageResponse(WebsocketResponse[None], UnsubscriptionMessage):
    output: None = None


class ListDataSorcesMessage(WebsocketMessage):
    event: MessageEvent = MessageEvent.listDataSources


class ListDataSorcesMessageResponse(WebsocketResponse[list[DataSource]], ListDataSorcesMessage):
    output: list[DataSource]


class SendRecordMessage(WebsocketMessage):
    event: MessageEvent = MessageEvent.sendRecord
    record: Record

class WebsocketMessageRaw(BaseModel):
    event: MessageEvent
    data: Any
