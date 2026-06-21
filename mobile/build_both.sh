#!/bin/bash
# Ikkala APK ni build qilish

cd /root/reklamabot/mobile

echo "=== 1. DISPATCHER APK (com.reklama.bot) ==="
# Default main.dart — dispatcher
sed -i 's/applicationId = "uz.yolda.driver"/applicationId = "com.reklama.bot"/' android/app/build.gradle.kts
sed -i 's/namespace = "uz.yolda.driver"/namespace = "com.reklama.bot"/' android/app/build.gradle.kts
/opt/flutter/bin/flutter build apk --release -t lib/main.dart
cp build/app/outputs/flutter-apk/app-release.apk /root/reklamabot/yolda-dispatcher.apk
echo "✅ Dispatcher APK: /root/reklamabot/yolda-dispatcher.apk"

echo ""
echo "=== 2. DRIVER APK (uz.yolda.driver) ==="
# Driver mode
sed -i 's/applicationId = "com.reklama.bot"/applicationId = "uz.yolda.driver"/' android/app/build.gradle.kts
sed -i 's/namespace = "com.reklama.bot"/namespace = "uz.yolda.driver"/' android/app/build.gradle.kts
/opt/flutter/bin/flutter build apk --release -t lib/main_driver.dart
cp build/app/outputs/flutter-apk/app-release.apk /root/reklamabot/yolda-driver.apk
echo "✅ Driver APK: /root/reklamabot/yolda-driver.apk"

# Qaytarish — default dispatcher
sed -i 's/applicationId = "uz.yolda.driver"/applicationId = "com.reklama.bot"/' android/app/build.gradle.kts
sed -i 's/namespace = "uz.yolda.driver"/namespace = "com.reklama.bot"/' android/app/build.gradle.kts

echo ""
echo "=== TAYYOR ==="
ls -lh /root/reklamabot/yolda-dispatcher.apk /root/reklamabot/yolda-driver.apk
