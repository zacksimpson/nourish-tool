package com.zacksimpson.nourish.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.thelightphone.sdk.ui.LightBarButton
import com.thelightphone.sdk.ui.LightIcon
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightScrollView
import com.thelightphone.sdk.ui.LightText
import com.thelightphone.sdk.ui.LightTextVariant
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.LightTopBar
import com.thelightphone.sdk.ui.LightTopBarCenter
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.thelightphone.sdk.ui.lightClickable
import com.zacksimpson.nourish.data.SIGNAL_OPTIONS

private const val MAX_SIGNALS = 3

/** Enable up to three nutrition signals. Numeric targets per signal are a later phase. */
@Composable
fun SignalsContent(
    signals: List<String>,
    onBack: () -> Unit,
    onToggle: (String) -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightThemeTokens.colors.background),
    ) {
        LightTopBar(
            leftButton = LightBarButton.LightIcon(LightIcons.BACK, onClick = onBack),
            center = LightTopBarCenter.Text("Nutrition Focus"),
            modifier = Modifier.padding(bottom = 1f.gridUnitsAsDp()),
        )

        LightScrollView(modifier = Modifier.fillMaxSize()) {
            SIGNAL_OPTIONS.forEach { signal ->
                val isSelected = signal.id in signals
                val atLimit = signals.size >= MAX_SIGNALS && !isSelected
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .lightClickable(enabled = !atLimit) { onToggle(signal.id) }
                        .padding(horizontal = 1.5f.gridUnitsAsDp(), vertical = 1f.gridUnitsAsDp()),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    LightIcon(
                        icon = if (isSelected) LightIcons.TOGGLE_STATE_ON else LightIcons.TOGGLE_STATE_OFF,
                        size = 1.8f,
                        modifier = Modifier.padding(end = 1f.gridUnitsAsDp()),
                    )
                    LightText(text = signal.label, variant = LightTextVariant.Heading)
                }
            }
        }
    }
}
