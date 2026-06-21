#!/bin/bash
AAB=/root/reklamabot/mobile/build/app/outputs/bundle/driverRelease/app-driver-release.aab
TOKEN=8790291087:AAGsM_0cUqSRai41mtyBeJtrO6BIH8tElm8
CHAT=5475915736
CAPTION="YOLDA Driver v3.4.10+39 (AAB) - Play Market uchun. Build: $(date '+%Y-%m-%d %H:%M %Z')"

echo "Sending $AAB ($(du -h $AAB | cut -f1)) to chat $CHAT via @yoldadriverbot..."

curl -sS \
  -F "chat_id=$CHAT" \
  -F "document=@$AAB" \
  -F "caption=$CAPTION" \
  "https://api.telegram.org/bot$TOKEN/sendDocument" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('ok') else 'FAIL'); print('msg_id:', d.get('result',{}).get('message_id', '-')); print('file_size:', d.get('result',{}).get('document',{}).get('file_size','-')); print('error:', d.get('description','-')) if not d.get('ok') else None"
