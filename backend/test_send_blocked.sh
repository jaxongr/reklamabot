#!/bin/bash
# Wait for server to start
sleep 18

# Get token
TOKEN=$(curl -s -X POST http://localhost:3010/api/v1/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).accessToken))")

echo "Token: ${TOKEN:0:20}..."

# Send test
curl -s -X POST http://localhost:3010/api/v1/telegram-sms/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"targetTelegramId":"8239974952","message":"Test xabar","targetPhone":"+998903870656"}'

echo ""
sleep 5
pm2 logs 39 --lines 30 --nostream 2>&1 | grep -iE 'SMS|Import|Kontakt|PEER|903870'
