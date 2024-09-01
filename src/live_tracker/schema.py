from enum import Enum
from datetime import datetime
from pathlib import Path
from typing import TypeVar, Generic

from pydantic import BaseModel


class DataType(str, Enum):
    number = "number"  # e.g. x
    number_pair = "number_pair"  # e.g. (x, y)
    number_list = "number_list"  # e.g. [x, y, z]
    text = "text"  # e.g. "hello"
    image = "image"


class DataSource(BaseModel):
    id: int | None = None
    name: str
    type: DataType
    _data_path: Path | None = None  # for now we use actual files not db
    
    def __hash__(self):
        if self.id is None:
            raise ValueError("Cannot hash unsaved data source")
        return self.id


RecordValueT = TypeVar('RecordValueT')
class Record(BaseModel, Generic[RecordValueT]):
    data_source_id: int
    value: RecordValueT


class ClientRecord(BaseModel):
    record: Record
    # datetime: datetime

