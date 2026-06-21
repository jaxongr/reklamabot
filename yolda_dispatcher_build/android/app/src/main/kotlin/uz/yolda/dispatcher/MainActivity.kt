package uz.yolda.dispatcher

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    companion object {
        const val METHOD_CHANNEL = "uz.yolda.dispatcher/call_recorder"
        const val EVENT_CHANNEL = "uz.yolda.dispatcher/call_events"

        @JvmField
        var eventSink: EventChannel.EventSink? = null
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, METHOD_CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "startRecording" -> {
                    val audioSource = call.argument<String>("audioSource") ?: "VOICE_RECOGNITION"
                    val intent = Intent(this, CallRecordingService::class.java).apply {
                        action = "START"
                        putExtra("audioSource", audioSource)
                    }
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        startForegroundService(intent)
                    } else {
                        startService(intent)
                    }
                    result.success(CallRecordingService.currentFilePath)
                }
                "stopRecording" -> {
                    val intent = Intent(this, CallRecordingService::class.java).apply { action = "STOP" }
                    startService(intent)
                    result.success(CallRecordingService.lastSavedPath)
                }
                "isRooted" -> result.success(isRooted())
                "androidVersion" -> result.success(Build.VERSION.SDK_INT)
                "isAccessibilityEnabled" -> result.success(CallRecorderAccessibilityService.isRunning)
                "openAccessibilitySettings" -> {
                    startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                    result.success(null)
                }
                "canDrawOverlays" -> {
                    val ok = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
                        Settings.canDrawOverlays(this) else true
                    result.success(ok)
                }
                "requestOverlayPermission" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                            Uri.parse("package:$packageName"))
                        startActivity(intent)
                    }
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        }

        EventChannel(flutterEngine.dartExecutor.binaryMessenger, EVENT_CHANNEL)
            .setStreamHandler(object : EventChannel.StreamHandler {
                override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                    eventSink = events
                }
                override fun onCancel(arguments: Any?) {
                    eventSink = null
                }
            })
    }

    private fun isRooted(): Boolean {
        val paths = arrayOf("/system/bin/su", "/system/xbin/su", "/sbin/su",
            "/system/app/Superuser.apk", "/su/bin/su")
        return paths.any { java.io.File(it).exists() } || Build.TAGS?.contains("test-keys") == true
    }
}
