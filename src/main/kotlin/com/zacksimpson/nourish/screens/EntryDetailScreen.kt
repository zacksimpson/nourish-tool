package com.zacksimpson.nourish.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.lifecycle.viewModelScope
import com.thelightphone.sdk.LightScreen
import com.thelightphone.sdk.LightViewModel
import com.thelightphone.sdk.SealedLightActivity
import com.thelightphone.sdk.ui.LightBarButton
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightScrollView
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.LightTopBar
import com.thelightphone.sdk.ui.LightTopBarCenter
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.zacksimpson.nourish.DataState
import com.zacksimpson.nourish.data.DEFAULT_SIGNALS
import com.zacksimpson.nourish.data.Entry
import com.zacksimpson.nourish.data.NourishRepository
import com.zacksimpson.nourish.data.SIGNAL_OPTIONS
import com.zacksimpson.nourish.data.SignalRating
import com.zacksimpson.nourish.data.formatDateShort
import com.zacksimpson.nourish.data.getTagLabel
import com.zacksimpson.nourish.data.todayDateString
import com.zacksimpson.nourish.dataStateIn
import com.zacksimpson.nourish.ui.DesignText
import com.zacksimpson.nourish.ui.EntryForm
import com.zacksimpson.nourish.ui.NourishTheme
import com.zacksimpson.nourish.ui.TextEditorRequest
import com.zacksimpson.nourish.ui.TextEditorScreen
import com.zacksimpson.nourish.ui.ToastScreen
import com.zacksimpson.nourish.ui.designPxToDp
import com.zacksimpson.nourish.ui.ratingLabel
import java.time.LocalDate
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

class EntryDetailViewModel(
    private val repo: NourishRepository,
    initialDate: String,
) : LightViewModel<Unit>() {
    val state = repo.dataStateIn(viewModelScope)
    val currentDate = MutableStateFlow(initialDate)
    val isEditing = MutableStateFlow(false)

    val breakfast = MutableStateFlow("")
    val lunch = MutableStateFlow("")
    val dinner = MutableStateFlow("")
    val snacks = MutableStateFlow("")
    val note = MutableStateFlow("")
    val signalRatings = MutableStateFlow<Map<String, SignalRating>>(emptyMap())
    val tags = MutableStateFlow<List<String>>(emptyList())

    fun setBreakfast(v: String) { breakfast.value = v }
    fun setLunch(v: String) { lunch.value = v }
    fun setDinner(v: String) { dinner.value = v }
    fun setSnacks(v: String) { snacks.value = v }
    fun setNote(v: String) { note.value = v }
    fun setTags(v: List<String>) { tags.value = v }

    fun toggleSignal(id: String, rating: SignalRating) {
        val current = signalRatings.value[id]
        signalRatings.value = if (current == rating) {
            signalRatings.value - id
        } else {
            signalRatings.value + (id to rating)
        }
    }

    fun swipeDay(delta: Int) {
        if (isEditing.value) return
        val today = todayDateString()
        val next = LocalDate.parse(currentDate.value).plusDays(delta.toLong()).toString()
        if (delta > 0 && next > today) return
        currentDate.value = next
    }

    fun startEdit(entry: Entry?) {
        breakfast.value = entry?.breakfast ?: ""
        lunch.value = entry?.lunch ?: ""
        dinner.value = entry?.dinner ?: ""
        snacks.value = entry?.snacks ?: ""
        note.value = entry?.note ?: ""
        signalRatings.value = entry?.signals ?: emptyMap()
        tags.value = entry?.tags ?: emptyList()
        isEditing.value = true
    }

    fun cancelEdit() {
        isEditing.value = false
    }

    fun save(existing: Entry?, onSaved: () -> Unit) {
        val hasContent = breakfast.value.isNotBlank() || lunch.value.isNotBlank() ||
            dinner.value.isNotBlank() || snacks.value.isNotBlank() || note.value.isNotBlank() ||
            tags.value.isNotEmpty() || signalRatings.value.isNotEmpty()
        if (!hasContent) return

        val hasChanged = existing == null ||
            breakfast.value != existing.breakfast ||
            lunch.value != existing.lunch ||
            dinner.value != existing.dinner ||
            snacks.value != existing.snacks ||
            note.value != existing.note ||
            tags.value.toSet() != existing.tags.toSet() ||
            signalRatings.value != existing.signals

        if (!hasChanged) {
            isEditing.value = false
            return
        }

        viewModelScope.launch {
            repo.saveEntry(
                Entry(
                    date = currentDate.value,
                    breakfast = breakfast.value,
                    lunch = lunch.value,
                    dinner = dinner.value,
                    snacks = snacks.value,
                    signals = signalRatings.value,
                    tags = tags.value,
                    note = note.value,
                    savedAt = System.currentTimeMillis(),
                ),
            )
            onSaved()
        }
    }
}

/** View or edit a single day's entry; swipe left/right to move between days. */
class EntryDetailScreen(
    sealedActivity: SealedLightActivity,
    private val initialDate: String,
) : LightScreen<Unit, EntryDetailViewModel>(sealedActivity) {

    override val viewModelClass: Class<EntryDetailViewModel>
        get() = EntryDetailViewModel::class.java

    override fun createViewModel() = EntryDetailViewModel(NourishRepository(lightContext.dataStore), initialDate)

    @Composable
    override fun Content() {
        NourishTheme {
            val currentDate by viewModel.currentDate.collectAsState()
            val isEditing by viewModel.isEditing.collectAsState()
            val dataState by viewModel.state.collectAsState()
            val breakfast by viewModel.breakfast.collectAsState()
            val lunch by viewModel.lunch.collectAsState()
            val dinner by viewModel.dinner.collectAsState()
            val snacks by viewModel.snacks.collectAsState()
            val note by viewModel.note.collectAsState()
            val signalRatings by viewModel.signalRatings.collectAsState()
            val tags by viewModel.tags.collectAsState()

            val ready = dataState as? DataState.Ready
            val currentEntry = ready?.data?.entries?.get(currentDate)
            val enabledSignals = ready?.data?.signals ?: DEFAULT_SIGNALS

            val density = LocalDensity.current
            val swipeThresholdPx = with(density) { 3f.gridUnitsAsDp().toPx() }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(LightThemeTokens.colors.background),
            ) {
                LightTopBar(
                    leftButton = LightBarButton.LightIcon(
                        LightIcons.BACK,
                        onClick = { if (isEditing) viewModel.cancelEdit() else goBack(Unit) },
                    ),
                    center = LightTopBarCenter.Text(formatDateShort(currentDate)),
                    rightButton = if (isEditing) {
                        LightBarButton.LightIcon(
                            LightIcons.ACCEPT,
                            onClick = {
                                viewModel.save(currentEntry) {
                                    navigateTo(
                                        screenFactory = { ToastScreen(it, "updated") },
                                        resultCallback = { viewModel.cancelEdit() },
                                    )
                                }
                            },
                        )
                    } else {
                        LightBarButton.LightIcon(LightIcons.PENCIL, onClick = { viewModel.startEdit(currentEntry) })
                    },
                    modifier = Modifier.padding(bottom = 1f.gridUnitsAsDp()),
                )

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .pointerInput(isEditing) {
                            if (isEditing) return@pointerInput
                            var totalDrag = 0f
                            detectHorizontalDragGestures(
                                onDragStart = { totalDrag = 0f },
                                onDragEnd = {
                                    when {
                                        totalDrag <= -swipeThresholdPx -> viewModel.swipeDay(1)
                                        totalDrag >= swipeThresholdPx -> viewModel.swipeDay(-1)
                                    }
                                },
                                onHorizontalDrag = { change, dragAmount ->
                                    totalDrag += dragAmount
                                    change.consume()
                                },
                            )
                        },
                ) {
                    when {
                        isEditing -> LightScrollView(modifier = Modifier.fillMaxSize()) {
                            EntryForm(
                                breakfast = breakfast,
                                lunch = lunch,
                                dinner = dinner,
                                snacks = snacks,
                                note = note,
                                enabledSignals = enabledSignals,
                                signalRatings = signalRatings,
                                tags = tags,
                                onEditBreakfast = {
                                    navigateTo(
                                        screenFactory = { TextEditorScreen(it, TextEditorRequest("breakfast", breakfast)) },
                                        resultCallback = { viewModel.setBreakfast(it) },
                                    )
                                },
                                onEditLunch = {
                                    navigateTo(
                                        screenFactory = { TextEditorScreen(it, TextEditorRequest("lunch", lunch)) },
                                        resultCallback = { viewModel.setLunch(it) },
                                    )
                                },
                                onEditDinner = {
                                    navigateTo(
                                        screenFactory = { TextEditorScreen(it, TextEditorRequest("dinner", dinner)) },
                                        resultCallback = { viewModel.setDinner(it) },
                                    )
                                },
                                onEditSnacks = {
                                    navigateTo(
                                        screenFactory = { TextEditorScreen(it, TextEditorRequest("snacks", snacks)) },
                                        resultCallback = { viewModel.setSnacks(it) },
                                    )
                                },
                                onEditNote = {
                                    navigateTo(
                                        screenFactory = { TextEditorScreen(it, TextEditorRequest("notes", note)) },
                                        resultCallback = { viewModel.setNote(it) },
                                    )
                                },
                                onToggleSignal = { id, rating -> viewModel.toggleSignal(id, rating) },
                                onEditContext = {
                                    navigateTo(
                                        screenFactory = { ContextPickerScreen(it, tags) },
                                        resultCallback = { viewModel.setTags(it) },
                                    )
                                },
                            )
                        }

                        currentEntry == null -> EmptyEntryState()

                        else -> LightScrollView(modifier = Modifier.fillMaxSize()) {
                            EntryReadOnlyView(entry = currentEntry)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyEntryState() {
    Column(
        modifier = Modifier.padding(start = 28f.designPxToDp(), top = 32f.designPxToDp()),
    ) {
        DesignText(text = "no entry logged", fontSizeDesignPx = 22f)
    }
}

@Composable
private fun EntryReadOnlyView(entry: Entry) {
    Column(modifier = Modifier.fillMaxWidth().padding(top = 12f.designPxToDp())) {
        ReadOnlyField("breakfast", entry.breakfast.ifBlank { "—" })
        ReadOnlyField("lunch", entry.lunch.ifBlank { "—" })
        ReadOnlyField("dinner", entry.dinner.ifBlank { "—" })
        ReadOnlyField("snacks", entry.snacks.ifBlank { "—" })

        SIGNAL_OPTIONS.filter { entry.signals.containsKey(it.id) }.forEach { signal ->
            ReadOnlyField(signal.label, ratingLabel(entry.signals.getValue(signal.id)))
        }

        if (entry.tags.isNotEmpty()) {
            ReadOnlyField("context", entry.tags.joinToString(", ") { getTagLabel(it) })
        }

        if (entry.note.isNotEmpty()) {
            ReadOnlyField("notes", entry.note)
        }

        Spacer(modifier = Modifier.height(40f.designPxToDp()))
    }
}

@Composable
private fun ReadOnlyField(label: String, value: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 28f.designPxToDp(), vertical = 13f.designPxToDp()),
    ) {
        DesignText(text = label, fontSizeDesignPx = 16f)
        Spacer(modifier = Modifier.height(6f.designPxToDp()))
        DesignText(text = value, fontSizeDesignPx = 22f)
    }
}
