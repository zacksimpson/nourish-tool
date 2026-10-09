package com.zacksimpson.nourish.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewModelScope
import com.thelightphone.sdk.LightScreen
import com.thelightphone.sdk.LightViewModel
import com.thelightphone.sdk.SealedLightActivity
import com.thelightphone.sdk.ui.LightBarButton
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightScrollView
import com.thelightphone.sdk.ui.LightText
import com.thelightphone.sdk.ui.LightTextVariant
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.LightTopBar
import com.thelightphone.sdk.ui.LightTopBarCenter
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.thelightphone.sdk.ui.lightClickable
import com.zacksimpson.nourish.DataState
import com.zacksimpson.nourish.data.AppDataStore
import com.zacksimpson.nourish.data.NourishRepository
import com.zacksimpson.nourish.ui.NourishTheme
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

private const val ROW_HORIZONTAL_PADDING = 1.4f
private const val ROW_VERTICAL_PADDING = 1f
private const val MAX_SIGNALS = 3

/** Settings pages share one screen and switch modes, so moving between them doesn't reload data. */
sealed interface SettingsMode {
    data object Home : SettingsMode
    data object Signals : SettingsMode
}

class SettingsViewModel(
    private val nourishRepo: NourishRepository,
    val nourishState: StateFlow<DataState>,
) : LightViewModel<Unit>() {
    val mode = MutableStateFlow<SettingsMode>(SettingsMode.Home)

    fun openSignals() {
        mode.value = SettingsMode.Signals
    }

    fun backToHome() {
        mode.value = SettingsMode.Home
    }

    fun toggleSignal(id: String) {
        val current = (nourishState.value as? DataState.Ready)?.data?.signals ?: return
        if (id !in current && current.size >= MAX_SIGNALS) return
        val next = if (id in current) current - id else current + id
        viewModelScope.launch { nourishRepo.saveSignals(next) }
    }
}

class SettingsScreen(sealedActivity: SealedLightActivity) :
    LightScreen<Unit, SettingsViewModel>(sealedActivity) {

    override val viewModelClass: Class<SettingsViewModel>
        get() = SettingsViewModel::class.java

    override fun createViewModel() = SettingsViewModel(
        AppDataStore.nourishRepository(lightContext.dataStore),
        AppDataStore.nourishState(lightContext.dataStore),
    )

    @Composable
    override fun Content() {
        NourishTheme {
            when (viewModel.mode.collectAsState().value) {
                SettingsMode.Home -> SettingsHomeContent(
                    onBack = { goBack(Unit) },
                    onOpenSignals = { viewModel.openSignals() },
                )

                SettingsMode.Signals -> {
                    val state by viewModel.nourishState.collectAsState()
                    val ready = state as? DataState.Ready
                    if (ready != null) {
                        SignalsContent(
                            signals = ready.data.signals,
                            onBack = { viewModel.backToHome() },
                            onToggle = { id -> viewModel.toggleSignal(id) },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SettingsHomeContent(
    onBack: () -> Unit,
    onOpenSignals: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightThemeTokens.colors.background),
    ) {
        LightTopBar(
            leftButton = LightBarButton.LightIcon(LightIcons.BACK, onClick = onBack),
            center = LightTopBarCenter.Text("Settings"),
            modifier = Modifier.padding(bottom = 1f.gridUnitsAsDp()),
        )

        LightScrollView(modifier = Modifier.fillMaxSize()) {
            SettingsRow(
                label = "Nutrition Focus",
                description = "choose up to three",
                onClick = onOpenSignals,
            )
        }
    }
}

@Composable
private fun SettingsRow(label: String, onClick: () -> Unit, description: String? = null) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .lightClickable(onClick = onClick)
            .padding(
                horizontal = ROW_HORIZONTAL_PADDING.gridUnitsAsDp(),
                vertical = ROW_VERTICAL_PADDING.gridUnitsAsDp(),
            ),
    ) {
        LightText(text = label, variant = LightTextVariant.Subheading)
        if (description != null) {
            LightText(text = description, variant = LightTextVariant.Detail)
        }
    }
}
