from backend.database import Database
from backend.repositories.base_repository import BaseRepository

class LeadRepository(BaseRepository):
    def __init__(self):
        super().__init__('leads')

    def find_duplicate(self, email: str, phone: str):
        query = "SELECT * FROM leads WHERE is_deleted = 0 AND (email = ? OR phone = ?)"
        return Database.execute_single(query, (email, phone))

    def create_lead(self, data: dict):
        query = """
            INSERT INTO leads (name, company, email, phone, whatsapp, website, location, industry, lead_source, interested_services, budget, lead_score, status, owner_id, notes, utm_source, utm_medium, utm_campaign)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        params = (
            data.get('name'), data.get('company'), data.get('email'), data.get('phone'),
            data.get('whatsapp'), data.get('website'), data.get('location'), data.get('industry'),
            data.get('lead_source', 'Website'), data.get('interested_services'), data.get('budget', 0),
            data.get('lead_score', 50), data.get('status', 'New'), data.get('owner_id'),
            data.get('notes'), data.get('utm_source'), data.get('utm_medium'), data.get('utm_campaign')
        )
        return Database.execute_write(query, params)

    def update_lead(self, lead_id: int, data: dict, version: int):
        query = """
            UPDATE leads
            SET name = ?, company = ?, email = ?, phone = ?, status = ?, lead_score = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND version = ? AND is_deleted = 0
        """
        conn = Database.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, (data.get('name'), data.get('company'), data.get('email'), data.get('phone'), data.get('status'), data.get('lead_score'), lead_id, version))
        affected = cursor.rowcount
        conn.commit()
        conn.close()
        return affected > 0
