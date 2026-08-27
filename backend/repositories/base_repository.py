from backend.database import Database

class BaseRepository:
    def __init__(self, table_name: str):
        self.table_name = table_name

    def find_all(self, page=1, limit=20, search_query=None, search_column='name', where_clause="", where_params=()):
        offset = (page - 1) * limit
        params = list(where_params)
        sql_where = f"WHERE is_deleted = 0 {where_clause}"

        if search_query:
            sql_where += f" AND LOWER({search_column}) LIKE ?"
            params.append(f"%{search_query.lower()}%")

        query = f"SELECT * FROM {self.table_name} {sql_where} ORDER BY id DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        count_query = f"SELECT COUNT(*) FROM {self.table_name} {sql_where}"
        total_records = Database.execute_single(count_query, tuple(params[:-2]))['COUNT(*)']

        rows = Database.execute_query(query, tuple(params))
        return rows, total_records

    def find_by_id(self, record_id: int):
        query = f"SELECT * FROM {self.table_name} WHERE id = ? AND is_deleted = 0"
        return Database.execute_single(query, (record_id,))

    def soft_delete(self, record_id: int):
        query = f"UPDATE {self.table_name} SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        return Database.execute_write(query, (record_id,))
