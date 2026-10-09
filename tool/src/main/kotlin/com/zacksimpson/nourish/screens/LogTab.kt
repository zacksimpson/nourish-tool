package com.zacksimpson.nourish.screens

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.thelightphone.sdk.ui.LightBarButton
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightScrollView
import com.thelightphone.sdk.ui.LightTopBar
import com.thelightphone.sdk.ui.LightTopBarCenter
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.zacksimpson.nourish.data.SignalRating
import com.zacksimpson.nourish.ui.EntryForm

/** today's entry with a save button. */
@Composable
fun LogTab(
    dateLabel: String,
    enabledSignals: List<String>,
    breakfast: String,
    lunch: String,
    dinner: String,
    snacks: String,
    note: String,
    signalRatings: Map<String, SignalRating>,
    tags: List<String>,
    onEditBreakfast: () -> Unit,
    onEditLunch: () -> Unit,
    onEditDinner: () -> Unit,
    onEditSnacks: () -> Unit,
    onEditNote: () -> Unit,
    onToggleSignal: (String, SignalRating) -> Unit,
    onEditContext: () -> Unit,
    onSave: () -> Unit,
) {
    Column(modifier = Modifier.fillMaxSize()) {
        LightTopBar(
            center = LightTopBarCenter.Text(dateLabel),
            // the accept icon is drawn edge to edge, so shrink it to match back
            rightButton = LightBarButton.LightIcon(LightIcons.ACCEPT, onClick = onSave, sizeUnits = 1.5f),
            modifier = Modifier.padding(bottom = 1f.gridUnitsAsDp()),
        )
        LightScrollView(
            modifier = Modifier.fillMaxSize(),
        ) {
            EntryForm(
                breakfast = breakfast,
                lunch = lunch,
                dinner = dinner,
                snacks = snacks,
                note = note,
                enabledSignals = enabledSignals,
                signalRatings = signalRatings,
                tags = tags,
                onEditBreakfast = onEditBreakfast,
                onEditLunch = onEditLunch,
                onEditDinner = onEditDinner,
                onEditSnacks = onEditSnacks,
                onEditNote = onEditNote,
                onToggleSignal = onToggleSignal,
                onEditContext = onEditContext,
            )
        }
    }
}
