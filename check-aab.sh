#!/bin/bash
AAB=/root/reklamabot/mobile/build/app/outputs/bundle/driverRelease/app-driver-release.aab
AAPT2=/opt/android-sdk/build-tools/34.0.0/aapt2

echo "=== File ==="
ls -lh "$AAB"

echo
echo "=== Package / Version ==="
"$AAPT2" dump xmltree --file base/manifest/AndroidManifest.xml "$AAB" 2>&1 | \
  grep -E "package=|versionCode|versionName|targetSdkVersion|minSdkVersion|application-label|usesCleartextTraffic|networkSecurityConfig" | head -15

echo
echo "=== READ_MEDIA permissions (must be EMPTY) ==="
PERMS=$("$AAPT2" dump xmltree --file base/manifest/AndroidManifest.xml "$AAB" 2>&1 | grep -i "READ_MEDIA")
if [ -z "$PERMS" ]; then
  echo "OK — no READ_MEDIA permissions"
else
  echo "WARNING — found:"
  echo "$PERMS"
fi

echo
echo "=== All permissions ==="
"$AAPT2" dump xmltree --file base/manifest/AndroidManifest.xml "$AAB" 2>&1 | \
  grep "uses-permission" | head -25
