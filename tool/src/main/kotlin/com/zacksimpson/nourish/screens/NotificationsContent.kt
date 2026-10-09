package com.zacksimpson.nourish.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.thelightphone.sdk.ui.LightBarButton
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightText
import com.thelightphone.sdk.ui.LightTextVariant
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.LightTopBar
import com.thelightphone.sdk.ui.LightTopBarCenter
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.thelightphone.sdk.ui.lightClickable
import com.zacksimpson.nourish.data.NotificationsSettings
import com.zacksimpson.nourish.data.formatTime
import com.zacksimpson.nourish.ui.ToggleSwitch

/**
 * Notifications settings. The SDK has no local-alarm/notification-posting API yet
 * (only server push and periodic background jobs), so these toggles persist state but
 * don't schedule anything — ready to wire up once that capability exists.
 */
@Composable
fun NotificationsContent(
    settings: NotificationsSettings,
    onBack: () -> Unit,
    onSetEnabled: (Boolean) -> Unit,
    onSetReminderEnabled: (Boolean) -> Unit,
    onOpenTimePicker: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightThemeTokens.colors.background),
    ) {
        LightTopBar(
            leftButton = LightBarButton.LightIcon(LightIcons.BACK, onClick = onBack),
            center = LightTopBarCenter.Text("Notifications"),
            modifier = Modifier.padding(bottom = 1f.gridUnitsAsDp()),
        )

        ToggleSwitch(
            label = "Enable Notifications",
            value = settings.enabled,
            onValueChange = onSetEnabled,
        )

        if (settings.enabled) {
            ToggleSwitch(
                label = "Daily Log Reminder",
                value = settings.reminderEnabled,
                onValueChange = onSetReminderEnabled,
            )

            if (settings.reminderEnabled) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .lightClickable(onClick = onOpenTimePicker)
                        .padding(horizontal = 1.5f.gridUnitsAsDp(), vertical = 1f.gridUnitsAsDp()),
                ) {
                    LightText(text = "Notification Time", variant = LightTextVariant.Detail)
                    LightText(
                        text = formatTime(settings.reminderTime),
                        variant = LightTextVariant.Heading,
                        modifier = Modifier.padding(top = 0.25f.gridUnitsAsDp()),
                    )
                }
            }
        }
    }
}
