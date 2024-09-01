from typing import Generic, Deque
from datetime import datetime
from pathlib import Path
from collections import deque

import requests

from live_tracker.schema import Record, RecordValueT, ClientRecord, DataSource, DataType


DEFAULT_SERVER_URL = 'http://localhost:8000'
DEFAULT_SEND_RECORD_ENDPOINT = DEFAULT_SERVER_URL + '/client/record'
DEFAULT_ADD_DATA_SOURCE_ENDPOINT = DEFAULT_SERVER_URL + '/client/data_source'

class Tracker(Generic[RecordValueT]):
    """
    Append added record to csv and post it to the server
    """
    # TODO: replace print with logging
    def __init__(self, record_name: str, save_path: Path, data_type: DataType, queue_maxsize: int = 300) -> None:
        self.save_path = save_path
        
        self.record_name = record_name
        self.record_index = 0
        
        self.record_queue: Deque[Record[RecordValueT]] = deque(maxlen=queue_maxsize)  # if queue is full, older records will be discarded
        
        self.data_source = DataSource(name=record_name, type=data_type, _data_path=save_path)
        self.publish_data_source()
    
    def publish_data_source(self) -> None:
        response = requests.post(DEFAULT_ADD_DATA_SOURCE_ENDPOINT, json=self.data_source.model_dump())
        if response.status_code != 200:
            raise ValueError('Failed to publish data source')
        self.data_source.id = response.json()['data_source_id']
    
    def add(self, record_value: RecordValueT) -> None:
        if self.data_source.id is None:
            raise ValueError('Data Record must be published before adding records')
        record = Record(data_source_id=self.data_source.id, value=record_value)
        # self._save_record(record)  # TODO: we don't save record unless we get an error response
        # self._post_pending_records()
        self._post_one_record(record)
    
    def _post_one_record(self, record: Record[RecordValueT]) -> None:
        print(ClientRecord(record=record).model_dump_json())
        response = requests.post(DEFAULT_SEND_RECORD_ENDPOINT, json=ClientRecord(record=record).model_dump())
        if response.status_code != 200:
            print(response)
            print(response.text)
            print('Failed to post record')

    # TODO: this requires the server to accept multiple records in one request
    # def _post_pending_records(self) -> None:
        
    #     body = [
    #         ClientRecord(record=record, datetime=datetime.now()).model_dump_json()
    #         for record in self.record_queue
    #     ]
    #     response = requests.post(DEFAULT_SEND_RECORD_ENDPOINT, json=body)
    #     if response.status_code != 200:
    #         print(response)
    #         print(response.text)
    #         print('Failed to post records in queue')
    #     else:
    #         self.record_queue.clear()
        
    def _save_record(self, record: Record[RecordValueT]) -> None:
        # TODO: add error handling (i think it's actually better to simply raise the error)
        with open(self.save_path, 'a') as file:
            file.write(str(record.value))
            
        self.record_queue.append(record)
        self.record_index += 1


class NumberTracker(Tracker[float]):
    def __init__(self, record_name: str, save_path: Path, queue_maxsize: int = 300) -> None:
        super().__init__(record_name, save_path, DataType.number, queue_maxsize)


class NumberPairTracker(Tracker[tuple[float, float]]):
    def __init__(self, record_name: str, save_path: Path, queue_maxsize: int = 300) -> None:
        super().__init__(record_name, save_path, DataType.number_pair, queue_maxsize)