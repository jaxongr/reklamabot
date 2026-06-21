#!/bin/bash
# Build driver AAB on server
cd /root/reklamabot/mobile
export PATH=/opt/flutter/bin:/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools:$PATH
export ANDROID_HOME=/opt/android-sdk

echo "=== Starting driver AAB build at $(date) ==="
echo "Flutter version: $(/opt/flutter/bin/flutter --version | head -1)"
echo "Project version: $(grep '^version:' pubspec.yaml)"
echo

/opt/flutter/bin/flutter build appbundle --release --flavor driver 2>&1
EXIT=$?

echo
echo "=== Build finished at $(date), exit code: $EXIT ==="
if [ $EXIT -eq 0 ]; then
  AAB=build/app/outputs/bundle/driverRelease/app-driver-release.aab
  ls -lh "$AAB" 2>&1
fi
exit $EXIT
