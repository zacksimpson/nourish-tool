package com.zacksimpson.nourish.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.thelightphone.sdk.ui.LightText
import com.thelightphone.sdk.ui.LightTextVariant
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.thelightphone.sdk.ui.lightClickable
import com.zacksimpson.nourish.data.SIGNAL_OPTIONS
import com.zacksimpson.nourish.data.SignalRating
import com.zacksimpson.nourish.data.getTagLabel

private val RATING_ORDER = listOf(SignalRating.ON_TRACK, SignalRating.ROUGHLY, SignalRating.OFF_TRACK)

fun ratingLabel(rating: SignalRating): String = when (rating) {
    SignalRating.ON_TRACK -> "on track"
    SignalRating.ROUGHLY -> "roughly"
    SignalRating.OFF_TRACK -> "off track"
}

private const val FORM_TOP_PADDING = 0.75f
private const val BOTTOM_PAD = 2.5f
private const val SIGNAL_LABEL_GAP = 0.65f
private const val SIGNAL_OPTION_GAP = 1.5f
private const val FIELD_HORIZONTAL_PADDING = 1.75f
private const val FIELD_VERTICAL_PADDING = 0.8f

/** Shared meal-entry form — used by both the Log tab and entry detail's edit mode. */
@Composable
fun EntryForm(
    breakfast: String,
    lunch: String,
    dinner: String,
    snacks: String,
    note: String,
    enabledSignals: List<String>,
    signalRatings: Map<String, SignalRating>,
    tags: List<String>,
    onEditBreakfast: () -> Unit,
    onEditLunch: () -> Unit,
    onEditDinner: () -> Unit,
    onEditSnacks: () -> Unit,
    onEditNote: () -> Unit,
    onToggleSignal: (String, SignalRating) -> Unit,
    onEditContext: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier = modifier.fillMaxWidth().padding(top = FORM_TOP_PADDING.gridUnitsAsDp())) {
        UnderlinedField(label = "breakfast:", value = breakfast, placeholder = "Add breakfast", onClick = onEditBreakfast)
        UnderlinedField(label = "lunch:", value = lunch, placeholder = "Add lunch", onClick = onEditLunch)
        UnderlinedField(label = "dinner:", value = dinner, placeholder = "Add dinner", onClick = onEditDinner)
        UnderlinedField(label = "snacks:", value = snacks, placeholder = "Add snacks", onClick = onEditSnacks)

        enabledSignals.forEach { signalId ->
            val label = SIGNAL_OPTIONS.firstOrNull { it.id == signalId }?.label ?: signalId
            SignalRow(
                label = label,
                current = signalRatings[signalId],
                onSelect = { rating -> onToggleSignal(signalId, rating) },
            )
        }

        UnderlinedField(
            label = "context:",
            value = tags.joinToString(", ") { getTagLabel(it) },
            placeholder = "Add context tags",
            onClick = onEditContext,
        )

        UnderlinedField(label = "notes:", value = note, placeholder = "Add notes", onClick = onEditNote)

        Spacer(modifier = Modifier.height(BOTTOM_PAD.gridUnitsAsDp()))
    }
}

@Composable
private fun SignalRow(label: String, current: SignalRating?, onSelect: (SignalRating) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(
                horizontal = FIELD_HORIZONTAL_PADDING.gridUnitsAsDp(),
                vertical = FIELD_VERTICAL_PADDING.gridUnitsAsDp(),
            ),
    ) {
        LightText(text = "$label:", variant = LightTextVariant.Detail)
        Spacer(modifier = Modifier.height(SIGNAL_LABEL_GAP.gridUnitsAsDp()))
        Row(horizontalArrangement = Arrangement.spacedBy(SIGNAL_OPTION_GAP.gridUnitsAsDp())) {
            RATING_ORDER.forEach { rating ->
                LightText(
                    text = ratingLabel(rating),
                    variant = LightTextVariant.Paragraph,
                    underline = current == rating,
                    modifier = Modifier.lightClickable(onClick = { onSelect(rating) }),
                )
            }
        }
    }
}
