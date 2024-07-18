from typing import TypeVar, Generic
from datetime import datetime

from pydantic import BaseModel


RecordValueT = TypeVar('RecordValueT')
class Record(BaseModel, Generic[RecordValueT]):
    index: int
    name: str
    value: RecordValueT


class APIRecord(BaseModel):
    record: Record
    datetime: datetime

