package com.zacksimpson.nourish.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.thelightphone.sdk.ui.LightIcon
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightText
import com.thelightphone.sdk.ui.LightTextVariant
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.zacksimpson.nourish.data.TimePickerLogic
import com.zacksimpson.nourish.data.digitsToTime
import com.zacksimpson.nourish.data.timeToDisplayParts
import com.zacksimpson.nourish.ui.SdkScaledText

/** Numpad time entry. SAVE confirms with the entered "HH:MM" (24h); the close icon,
 *  only available with zero digits typed, dismisses without a value. */
@Composable
fun TimePickerContent(
    initialValue: String?,
    onConfirm: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    val seed = remember { initialValue?.let { timeToDisplayParts(it) } }
    var digits by remember { mutableStateOf(seed?.digits ?: "") }
    var ampm by remember { mutableStateOf(seed?.ampm ?: "AM") }

    val hasDigits = digits.isNotEmpty()
    val canConfirm = digits.length == 3 || digits.length == 4

    fun tapDigit(d: Char) {
        if (digits.length >= 4) return
        if (TimePickerLogic.isValidNextDigit(digits, d)) digits += d
    }

    fun backspace() {
        digits = digits.dropLast(1)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightThemeTokens.colors.background),
    ) {
        // No LightTopBar — an empty one still reserves 3 grid units of height,
        // pushing this block lower than intended. AM/PM pinned to the row's
        // edges; time display centered over the same Box so it doesn't shift
        // as digits are typed.
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(
                    top = 0.75f.gridUnitsAsDp(),
                    bottom = 0.5f.gridUnitsAsDp(),
                    start = 1.5f.gridUnitsAsDp(),
                    end = 1.5f.gridUnitsAsDp(),
                ),
            contentAlignment = Alignment.Center,
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                AmPmSlot("AM", ampm) { ampm = "AM" }
                AmPmSlot("PM", ampm) { ampm = "PM" }
            }
            SdkScaledText(
                text = TimePickerLogic.buildDisplay(digits),
                fontSizeDesignPx = 115f,
                fontWeight = FontWeight.Light,
                align = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
        }

        // Each digit column is weight(1f), so the 3 columns split the row width
        // evenly — more side padding narrows the row and pulls them closer together.
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(
                    start = 3f.gridUnitsAsDp(),
                    end = 3f.gridUnitsAsDp(),
                    bottom = 1f.gridUnitsAsDp(),
                ),
            verticalArrangement = Arrangement.SpaceEvenly,
        ) {
            listOf("123", "456", "789").forEach { row ->
                NumRow {
                    row.forEach { d -> NumBtn(d.toString()) { tapDigit(d) } }
                }
            }
            NumRow {
                // Matches NumBtn's own vertical padding so all four rows line up.
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .padding(vertical = 0.2f.gridUnitsAsDp()),
                    contentAlignment = Alignment.Center,
                ) {
                    when {
                        canConfirm -> LightText(
                            text = "SAVE",
                            variant = LightTextVariant.Paragraph,
                            modifier = Modifier.clickable { onConfirm(digitsToTime(digits, ampm)) },
                        )
                        hasDigits -> Unit // blank — matches RN: no button while mid-entry
                        else -> LightIcon(
                            icon = LightIcons.CLOSE,
                            size = 2.2f,
                            modifier = Modifier.clickable { onDismiss() },
                        )
                    }
                }
                NumBtn("0") { tapDigit('0') }
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .padding(vertical = 0.2f.gridUnitsAsDp()),
                    contentAlignment = Alignment.Center,
                ) {
                    if (hasDigits) {
                        LightIcon(
                            icon = LightIcons.BACK,
                            size = 2.4f,
                            modifier = Modifier.clickable { backspace() },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun NumRow(content: @Composable RowScope.() -> Unit) {
    // CenterVertically matters on the bottom row, where the small SAVE text and the
    // much taller "0" digit would otherwise misalign under Row's default Top alignment.
    Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, content = content)
}

@Composable
private fun RowScope.NumBtn(digit: String, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .weight(1f)
            .clickable(onClick = onClick)
            .padding(vertical = 0.2f.gridUnitsAsDp()),
        contentAlignment = Alignment.Center,
    ) {
        SdkScaledText(text = digit, fontSizeDesignPx = 48f)
    }
}

@Composable
private fun RowScope.AmPmSlot(value: String, selected: String, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .width(60.dp)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            LightText(text = value, variant = LightTextVariant.Copy)
            Box(
                modifier = Modifier
                    .padding(top = 0.15f.gridUnitsAsDp())
                    .width(32.dp)
                    .height(3.dp)
                    .background(if (selected == value) LightThemeTokens.colors.content else Color.Transparent),
            )
        }
    }
}
