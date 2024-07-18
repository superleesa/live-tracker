from typing import Generic, Deque
from datetime import datetime
from pathlib import Path
from collections import deque

import requests

from live_tracker.schema import Record, RecordValueT, APIRecord


DEFAULT_SERVER_URL = 'http://localhost:5000/record'

class Tracker(Generic[RecordValueT]):
    """
    Append added record to csv and post it to the server
    """
    # TODO: replace print with logging
    def __init__(self, record_name: str, save_path: Path, server_url: str = DEFAULT_SERVER_URL, queue_maxsize: int = 300) -> None:
        self.save_path = save_path
        self.server_url = server_url
        
        self.record_name = record_name
        self.record_index = 0
        
        self.record_queue: Deque[Record[RecordValueT]] = deque(maxlen=queue_maxsize)  # if queue is full, older records will be discarded
    
    def add(self, record_value: RecordValueT) -> None:
        record = Record(index=self.record_index, name=self.record_name, value=record_value)
        self._save_record(record)
        self._post_pending_records()

    def _post_pending_records(self) -> None:
        body = [
            APIRecord(record=record, datetime=datetime.now()).model_dump()
            for record in self.record_queue
        ]
        response = requests.post(self.server_url, json=body)
        if response.status_code != 200:
            print('Failed to post records in queue')
        else:
            self.record_queue.clear()
        
    def _save_record(self, record: Record[RecordValueT]) -> None:
        # TODO: add error handling (i think it's actually better to simply raise the error)
        with open(self.save_path, 'a') as file:
            file.write(str(record.value))
            
        self.record_queue.append(record)
        self.record_index += 1
