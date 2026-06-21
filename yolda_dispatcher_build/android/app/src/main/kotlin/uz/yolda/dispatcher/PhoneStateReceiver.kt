package uz.yolda.dispatcher

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.telephony.TelephonyManager

class PhoneStateReceiver : BroadcastReceiver() {
    companion object {
        private var lastState: String? = null
        private var lastNumber: String? = null
    }

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_NEW_OUTGOING_CALL -> {
                val number = intent.getStringExtra(Intent.EXTRA_PHONE_NUMBER)
                lastNumber = number
                sendEvent("OUTGOING_DIALING", number)
            }
            "android.intent.action.PHONE_STATE" -> {
                val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
                val number = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER) ?: lastNumber
                when (state) {
                    TelephonyManager.EXTRA_STATE_RINGING -> { lastNumber = number; sendEvent("INCOMING_RING", number) }
                    TelephonyManager.EXTRA_STATE_OFFHOOK -> sendEvent("OFFHOOK", lastNumber)
                    TelephonyManager.EXTRA_STATE_IDLE -> { sendEvent("IDLE", lastNumber); lastNumber = null }
                }
                lastState = state
            }
        }
    }

    private fun sendEvent(state: String, phone: String?) {
        Handler(Looper.getMainLooper()).post {
            val payload = hashMapOf<String, Any?>("state" to state, "phone" to phone)
            try { MainActivity.eventSink?.success(payload) } catch (_: Exception) {}
        }
    }
}
