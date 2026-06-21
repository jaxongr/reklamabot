#!/bin/bash
# Get token
TOKEN=$(curl -s http://localhost:3010/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"telegramId":"5475915736"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])")

echo "Token: ${TOKEN:0:20}..."

# Get stats
echo "=== STATS ==="
curl -s http://localhost:3010/api/v1/telegram-sms/stats \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Get sessions
echo "=== SESSIONS ==="
curl -s http://localhost:3010/api/v1/telegram-sms/sessions \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Get drivers
echo "=== DRIVERS ==="
curl -s http://localhost:3010/api/v1/telegram-sms/targets/drivers \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; data=json.load(sys.stdin); print(f'Count: {len(data)}'); [print(f'  {d.get(\"fullName\",\"?\")} -> tgId: {d.get(\"user\",{}).get(\"telegramId\",\"?\")}') for d in data[:5]]"

# Get history
echo "=== HISTORY ==="
curl -s "http://localhost:3010/api/v1/telegram-sms/history?limit=5" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
