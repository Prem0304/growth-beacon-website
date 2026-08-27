# Deployment & Production Configuration — GrowthBeacon CRM

## Domain Setup
- Public Website: `https://www.growthbeacon.co.in`
- CRM App: `https://app.growthbeacon.co.in`
- Client Portal: `https://app.growthbeacon.co.in/portal`

## Production Execution
Run server as a background systemd daemon or Windows service:
```bash
python server.py
```
Environment Variables:
- `PORT`: Server listening port (default: 8080)
- `DB_FILE`: SQLite database path (default: growth_beacon_crm.db)