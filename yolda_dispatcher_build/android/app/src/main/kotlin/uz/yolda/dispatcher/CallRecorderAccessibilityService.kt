package uz.yolda.dispatcher

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class CallRecorderAccessibilityService : AccessibilityService() {
    companion object {
        var isRunning: Boolean = false
            private set
    }

    override fun onServiceConnected() { super.onServiceConnected(); isRunning = true }
    override fun onInterrupt() { isRunning = false }
    override fun onDestroy() { super.onDestroy(); isRunning = false }
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
}
