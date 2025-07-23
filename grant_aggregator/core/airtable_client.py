from airtable import Airtable
import os

class AirtableClient:
    def __init__(self):
        self.api_key = os.getenv("AIRTABLE_API_KEY")
        self.base_id = os.getenv("AIRTABLE_BASE_ID")
        self.table_name = os.getenv("AIRTABLE_TABLE_NAME")
        self.client = Airtable(self.base_id, self.table_name, api_key=self.api_key)
    
    def upsert_record(self, record_data):
        """Upsert record to Airtable with unique identifier"""
        try:
            # Find existing record by URL (assuming URL is unique)
            existing_records = self.client.get_all(view="Grid view", formula=f"{{URL}} = '{record_data.get('URL')}'")
            
            if existing_records:
                # Update existing record
                self.client.update(existing_records[0]['id'], record_data)
                return f"Updated record: {record_data.get('Title')}"
            else:
                # Create new record
                new_record = self.client.insert(record_data)
                return f"Created new record: {record_data.get('Title')}"
                
        except Exception as e:
            return f"Error processing record: {str(e)}"
    
    def get_all_records(self):
        """Retrieve all records from the table"""
        return self.client.get_all(view="Grid view")
