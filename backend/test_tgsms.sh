#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:3010/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).access_token))")

echo "Token: $TOKEN"

curl -s -X POST http://localhost:3010/api/v1/telegram-sms/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"targetTelegramId":"47172319","message":"Test xabar from session"}'

echo ""
sleep 3
pm2 logs 39 --lines 20 --nostream 2>&1 | grep -iE "TG SMS|sms-w|sendDm|PEER|yuborildi|error|INVALID"
