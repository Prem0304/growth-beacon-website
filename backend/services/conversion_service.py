from backend.database import Database

class ConversionService:
    @staticmethod
    def convert_deal_to_client(deal_id: int, company_name: str, user_id: int):
        """Transactional Deal ➔ Client conversion workflow"""
        conn = Database.get_connection()
        try:
            conn.execute("BEGIN IMMEDIATE;")
            cursor = conn.cursor()

            # 1. Check deal exists
            cursor.execute("SELECT * FROM deals WHERE id = ? AND is_deleted = 0", (deal_id,))
            deal = cursor.fetchone()
            if not deal:
                conn.rollback()
                conn.close()
                return {"success": False, "error": "Deal not found"}

            # 2. Check if client already exists to prevent duplication
            cursor.execute("SELECT id FROM clients WHERE company_name = ? AND is_deleted = 0", (company_name,))
            existing_client = cursor.fetchone()

            if existing_client:
                client_id = existing_client[0]
            else:
                cursor.execute("""
                    INSERT INTO clients (company_name, industry, website, status, health_score, health_status)
                    VALUES (?, 'Commercial', '', 'Active', 90, 'Green')
                """, (company_name,))
                client_id = cursor.lastrowid

            # 3. Create Contract Record
            contract_num = f"CON-2026-{client_id:03d}"
            cursor.execute("""
                INSERT INTO contracts (contract_number, client_id, deal_id, start_date, end_date, value, status, signature_status)
                VALUES (?, ?, ?, CURRENT_DATE, DATE('now', '+1 year'), ?, 'Active', 'Signed')
            """, (contract_num, client_id, deal_id, deal['value']))

            # 4. Create Onboarding Project
            proj_name = f"{company_name} — Onboarding Project"
            cursor.execute("""
                INSERT INTO projects (project_name, client_id, status, progress, priority)
                VALUES (?, ?, 'Active', 10, 'High')
            """, (proj_name, client_id))
            project_id = cursor.lastrowid

            # 5. Create Default Onboarding Tasks
            cursor.execute("""
                INSERT INTO tasks (title, description, client_id, project_id, status, priority)
                VALUES ('Schedule Client Onboarding Discovery Call', 'Coordinate team kickoff call', ?, ?, 'Todo', 'High')
            """, (client_id, project_id))

            # 6. Update Deal Status to Won
            cursor.execute("UPDATE deals SET status = 'Won', company_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (client_id, deal_id))

            # 7. Audit Log Entry
            cursor.execute("""
                INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
                VALUES (?, 'DEAL_WON_CONVERTED', 'Deal', ?, ?)
            """, (user_id, str(deal_id), f"Deal converted to Client ID {client_id} ({company_name})"))

            # 8. Targeted Notification
            cursor.execute("""
                INSERT INTO notifications (user_id, client_id, type, title, message, link_url)
                VALUES (?, ?, 'Deal', 'Deal Marked WON!', ?, '/app/#clients')
            """, (user_id, client_id, f"Client {company_name} auto-created with onboarding project."))

            conn.commit()
            conn.close()

            return {
                "success": True,
                "client_id": client_id,
                "project_id": project_id,
                "contract_number": contract_num
            }
        except Exception as e:
            conn.rollback()
            conn.close()
            return {"success": False, "error": str(e)}
