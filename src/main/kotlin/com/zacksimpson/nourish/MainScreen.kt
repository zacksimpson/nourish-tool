package com.zacksimpson.nourish

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewModelScope
import com.thelightphone.sdk.InitialScreen
import com.thelightphone.sdk.LightScreen
import com.thelightphone.sdk.LightViewModel
import com.thelightphone.sdk.SealedLightActivity
import com.thelightphone.sdk.ui.LightBarButton
import com.thelightphone.sdk.ui.LightBottomBar
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightThemeTokens
import com.zacksimpson.nourish.data.AppDataStore
import com.zacksimpson.nourish.data.DEFAULT_SIGNALS
import com.zacksimpson.nourish.data.Entry
import com.zacksimpson.nourish.data.NourishRepository
import com.zacksimpson.nourish.data.SignalRating
import com.zacksimpson.nourish.data.formatDateShort
import com.zacksimpson.nourish.data.todayDateString
import com.zacksimpson.nourish.screens.ContextPickerScreen
import com.zacksimpson.nourish.screens.EntryDetailScreen
import com.zacksimpson.nourish.screens.HistoryTab
import com.zacksimpson.nourish.screens.LogTab
import com.zacksimpson.nourish.screens.SearchScreen
import com.zacksimpson.nourish.screens.SettingsScreen
import com.zacksimpson.nourish.ui.NourishTheme
import com.zacksimpson.nourish.ui.TextEditorRequest
import com.zacksimpson.nourish.ui.TextEditorScreen
import com.zacksimpson.nourish.ui.ToastScreen
import java.time.YearMonth
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

enum class Tab { LOG, HISTORY }

class MainViewModel(
    private val repo: NourishRepository,
    val state: StateFlow<DataState>,
) : LightViewModel<Unit>() {
    val selectedTab = MutableStateFlow(Tab.LOG)

    val today: String = todayDateString()

    val breakfast = MutableStateFlow("")
    val lunch = MutableStateFlow("")
    val dinner = MutableStateFlow("")
    val snacks = MutableStateFlow("")
    val note = MutableStateFlow("")
    val signalRatings = MutableStateFlow<Map<String, SignalRating>>(emptyMap())
    val tags = MutableStateFlow<List<String>>(emptyList())

    val viewYearMonth = MutableStateFlow(YearMonth.now())

    private var loadedFromEntry = false
    private var loadedEntry: Entry? = null

    fun select(tab: Tab) {
        selectedTab.value = tab
    }

    fun shiftMonth(delta: Long) {
        viewYearMonth.value = viewYearMonth.value.plusMonths(delta)
    }

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

    /** Seeds today's fields from a previously saved entry, once, the first time it loads. */
    fun loadTodayEntryIfNeeded(entry: Entry?) {
        if (loadedFromEntry || entry == null) return
        loadedFromEntry = true
        loadedEntry = entry
        breakfast.value = entry.breakfast
        lunch.value = entry.lunch
        dinner.value = entry.dinner
        snacks.value = entry.snacks
        note.value = entry.note
        signalRatings.value = entry.signals
        tags.value = entry.tags
    }

    fun saveTodayEntry(enabledSignals: List<String>, onSaved: () -> Unit, onUnchanged: () -> Unit) {
        val hasContent = breakfast.value.isNotBlank() || lunch.value.isNotBlank() ||
            dinner.value.isNotBlank() || snacks.value.isNotBlank() || note.value.isNotBlank() ||
            tags.value.isNotEmpty() || signalRatings.value.isNotEmpty()
        if (!hasContent) return

        val existing = loadedEntry
        val hasChanged = existing == null ||
            breakfast.value != existing.breakfast ||
            lunch.value != existing.lunch ||
            dinner.value != existing.dinner ||
            snacks.value != existing.snacks ||
            note.value != existing.note ||
            tags.value.toSet() != existing.tags.toSet() ||
            enabledSignals.any { id -> signalRatings.value[id] != existing.signals[id] }
        if (!hasChanged) {
            onUnchanged()
            return
        }

        val entry = Entry(
            date = today,
            breakfast = breakfast.value,
            lunch = lunch.value,
            dinner = dinner.value,
            snacks = snacks.value,
            signals = signalRatings.value,
            tags = tags.value,
            note = note.value,
            savedAt = System.currentTimeMillis(),
        )
        viewModelScope.launch {
            repo.saveEntry(entry)
            loadedEntry = entry
            onSaved()
        }
    }
}

/** Boot screen: the two-tab host — Log and History — plus settings/search actions. */
@InitialScreen
class MainScreen(sealedActivity: SealedLightActivity) :
    LightScreen<Unit, MainViewModel>(sealedActivity) {

    override val viewModelClass: Class<MainViewModel>
        get() = MainViewModel::class.java

    override fun createViewModel() = MainViewModel(
        AppDataStore.nourishRepository(lightContext.dataStore),
        AppDataStore.nourishState(lightContext.dataStore),
    )

    @Composable
    override fun Content() {
        NourishTheme {
            val tab by viewModel.selectedTab.collectAsState()
            val dataState by viewModel.state.collectAsState()
            val breakfast by viewModel.breakfast.collectAsState()
            val lunch by viewModel.lunch.collectAsState()
            val dinner by viewModel.dinner.collectAsState()
            val snacks by viewModel.snacks.collectAsState()
            val note by viewModel.note.collectAsState()
            val signalRatings by viewModel.signalRatings.collectAsState()
            val tags by viewModel.tags.collectAsState()
            val viewYearMonth by viewModel.viewYearMonth.collectAsState()

            LaunchedEffect(dataState) {
                val ready = dataState as? DataState.Ready ?: return@LaunchedEffect
                viewModel.loadTodayEntryIfNeeded(ready.data.entries[viewModel.today])
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(LightThemeTokens.colors.background),
            ) {
                Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                    val enabledSignals = (dataState as? DataState.Ready)?.data?.signals ?: DEFAULT_SIGNALS
                    when (tab) {
                        Tab.LOG -> LogTab(
                            dateLabel = formatDateShort(viewModel.today),
                            enabledSignals = enabledSignals,
                            breakfast = breakfast,
                            lunch = lunch,
                            dinner = dinner,
                            snacks = snacks,
                            note = note,
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
                            onSave = {
                                viewModel.saveTodayEntry(
                                    enabledSignals = enabledSignals,
                                    onSaved = {
                                        navigateTo(
                                            screenFactory = { ToastScreen(it, "logged") },
                                            resultCallback = {
                                                navigateTo(screenFactory = { EntryDetailScreen(it, viewModel.today) })
                                            },
                                        )
                                    },
                                    onUnchanged = {
                                        navigateTo(screenFactory = { EntryDetailScreen(it, viewModel.today) })
                                    },
                                )
                            },
                        )

                        Tab.HISTORY -> HistoryTab(
                            year = viewYearMonth.year,
                            month = viewYearMonth.monthValue,
                            today = viewModel.today,
                            isDateLogged = { date -> (dataState as? DataState.Ready)?.data?.entries?.containsKey(date) == true },
                            onPrevMonth = { viewModel.shiftMonth(-1) },
                            onNextMonth = { viewModel.shiftMonth(1) },
                            onSelectDate = { date ->
                                navigateTo(screenFactory = { EntryDetailScreen(it, date) })
                            },
                        )
                    }
                }

                LightBottomBar(
                    items = listOf(
                        LightBarButton.LightIcon(
                            LightIcons.SETTINGS,
                            onClick = { navigateTo(screenFactory = { SettingsScreen(it) }) },
                        ),
                        LightBarButton.Text(
                            text = if (tab == Tab.HISTORY) "VIEW TODAY" else "VIEW LOGS",
                            onClick = {
                                viewModel.select(if (tab == Tab.HISTORY) Tab.LOG else Tab.HISTORY)
                            },
                        ),
                        LightBarButton.LightIcon(
                            LightIcons.SEARCH,
                            onClick = { navigateTo(screenFactory = { SearchScreen(it) }) },
                        ),
                    ),
                )
            }
        }
    }
}
