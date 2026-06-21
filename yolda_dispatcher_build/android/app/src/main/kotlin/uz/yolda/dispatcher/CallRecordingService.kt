package uz.yolda.dispatcher

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import java.io.File

class CallRecordingService : Service() {
    companion object {
        private const val TAG = "CallRecording"
        private const val NOTIFICATION_ID = 101
        const val CHANNEL_ID = "call_recorder"

        @JvmStatic var currentFilePath: String? = null
        @JvmStatic var lastSavedPath: String? = null
    }

    private var recorder: MediaRecorder? = null
    private var filePath: String? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "START" -> start(intent.getStringExtra("audioSource") ?: "VOICE_RECOGNITION")
            "STOP" -> stop()
        }
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun start(audioSource: String) {
        try {
            startForegroundNotification()
            val dir = File(cacheDir, "yolda_recordings")
            if (!dir.exists()) dir.mkdirs()
            val file = File(dir, "rec_${System.currentTimeMillis()}.m4a")
            filePath = file.absolutePath
            currentFilePath = filePath

            recorder = (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(applicationContext)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }).apply {
                val source = when (audioSource) {
                    "VOICE_CALL" -> MediaRecorder.AudioSource.VOICE_CALL
                    "VOICE_COMMUNICATION" -> MediaRecorder.AudioSource.VOICE_COMMUNICATION
                    "VOICE_RECOGNITION" -> MediaRecorder.AudioSource.VOICE_RECOGNITION
                    "MIC" -> MediaRecorder.AudioSource.MIC
                    else -> MediaRecorder.AudioSource.VOICE_RECOGNITION
                }
                try { setAudioSource(source) } catch (e: Exception) {
                    Log.w(TAG, "Audio source $audioSource not allowed, falling back to MIC")
                    setAudioSource(MediaRecorder.AudioSource.MIC)
                }
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioSamplingRate(44100)
                setAudioEncodingBitRate(128000)
                setOutputFile(file.absolutePath)
                try { prepare(); start(); Log.i(TAG, "Recording started: $filePath") }
                catch (e: Exception) { Log.e(TAG, "Recording start failed: ${e.message}"); release(); recorder = null }
            }
        } catch (e: Exception) { Log.e(TAG, "Start error: ${e.message}") }
    }

    private fun stop() {
        try {
            recorder?.apply {
                try { stop() } catch (_: Exception) {}
                try { release() } catch (_: Exception) {}
            }
            recorder = null
            lastSavedPath = filePath
            Log.i(TAG, "Recording stopped: $filePath")
        } catch (e: Exception) { Log.e(TAG, "Stop error: ${e.message}") }
        finally {
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        }
    }

    private fun startForegroundNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(CHANNEL_ID, "Qo'ng'iroq yozish", NotificationManager.IMPORTANCE_LOW)
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(channel)
        }
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Yo'lda Dispatcher")
            .setContentText("Qo'ng'iroq yozilmoqda")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE or ServiceInfo.FOREGROUND_SERVICE_TYPE_PHONE_CALL)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        recorder?.apply {
            try { stop() } catch (_: Exception) {}
            try { release() } catch (_: Exception) {}
        }
    }
}
