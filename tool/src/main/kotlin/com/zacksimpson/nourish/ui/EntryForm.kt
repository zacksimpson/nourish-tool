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

private const val FORM_TOP_PADDING_PX = 12f
private const val BOTTOM_PAD_PX = 40f
private const val SIGNAL_LABEL_SIZE_PX = 16f
private const val SIGNAL_LABEL_GAP_PX = 10f
private const val SIGNAL_OPTION_SIZE_PX = 22f
private const val SIGNAL_OPTION_GAP_PX = 24f
private const val FIELD_HORIZONTAL_PADDING_PX = 28f
private const val FIELD_VERTICAL_PADDING_PX = 13f

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
    Column(modifier = modifier.fillMaxWidth().padding(top = FORM_TOP_PADDING_PX.designPxToDp())) {
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

        Spacer(modifier = Modifier.height(BOTTOM_PAD_PX.designPxToDp()))
    }
}

@Composable
private fun SignalRow(label: String, current: SignalRating?, onSelect: (SignalRating) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(
                horizontal = FIELD_HORIZONTAL_PADDING_PX.designPxToDp(),
                vertical = FIELD_VERTICAL_PADDING_PX.designPxToDp(),
            ),
    ) {
        DesignText(text = "$label:", fontSizeDesignPx = SIGNAL_LABEL_SIZE_PX)
        Spacer(modifier = Modifier.height(SIGNAL_LABEL_GAP_PX.designPxToDp()))
        Row(horizontalArrangement = Arrangement.spacedBy(SIGNAL_OPTION_GAP_PX.designPxToDp())) {
            RATING_ORDER.forEach { rating ->
                DesignText(
                    text = ratingLabel(rating),
                    fontSizeDesignPx = SIGNAL_OPTION_SIZE_PX,
                    underline = current == rating,
                    modifier = Modifier.lightClickable(onClick = { onSelect(rating) }),
                )
            }
        }
    }
}
