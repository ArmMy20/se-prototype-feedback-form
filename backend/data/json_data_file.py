import json
from pydantic import BaseModel


class JsonRecordFile:
    all_records = list()

    def __init__(self, file_path: str):
        self.file_path = file_path
        try:
            with open(self.file_path, 'r') as file:
                self.all_records = json.load(file)
        except Exception as e:
            raise e

    def getRecords(self):
        return self.all_records

    def addRecord(self, new_record: BaseModel):
        self.all_records.append(new_record.model_dump())
        self.saveToFile()

    def saveToFile(self):
        try:
            with open(self.file_path, 'w') as file:
                json.dump(self.all_records, file, indent=4)
        except Exception as e:
            raise e
