#!/bin/bash
set -e
AAB="/root/reklamabot/mobile/build/app/outputs/bundle/driverRelease/app-driver-release.aab"
AAPT2="/opt/android-sdk/build-tools/34.0.0/aapt2"
TOKEN="8790291087:AAGsM_0cUqSRai41mtyBeJtrO6BIH8tElm8"
CHAT="5475915736"

echo "=== File ==="
ls -lh "$AAB"

echo
echo "=== Manifest via aapt2 ==="
"$AAPT2" dump xmltree --file base/manifest/AndroidManifest.xml "$AAB" 2>&1 | \
  grep -E "package=|versionCode|versionName|application-label|targetSdkVersion|minSdkVersion|usesCleartextTraffic|networkSecurityConfig" | head -10

echo
echo "=== READ_MEDIA permissions (must be EMPTY/none) ==="
"$AAPT2" dump xmltree --file base/manifest/AndroidManifest.xml "$AAB" 2>&1 | \
  grep -E "READ_MEDIA|uses-permission" | head -20 || echo "NONE"

echo
echo "=== Sending to admin via @yoldadriverbot ==="
SIZE=$(du -h "$AAB" | cut -f1)
CAPTION="🚛 YOLDA Driver v3.4.10+39 (AAB)
Play Market'ga chiqarish uchun.
Hajmi: $SIZE
Build: $(date '+%Y-%m-%d %H:%M %Z')"

curl -sS -F "chat_id=$CHAT" \
     -F "document=@$AAB" \
     -F "caption=$CAPTION" \
     "https://api.telegram.org/bot$TOKEN/sendDocument" | head -c 500
echo
