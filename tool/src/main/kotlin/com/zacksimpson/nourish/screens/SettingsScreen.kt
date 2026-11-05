package com.zacksimpson.nourish.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
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
import com.thelightphone.sdk.ui.designVerticalPxToSp
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.thelightphone.sdk.ui.lightClickable
import com.zacksimpson.nourish.DataState
import com.zacksimpson.nourish.R
import com.zacksimpson.nourish.data.AppDataStore
import com.zacksimpson.nourish.data.NourishRepository
import com.zacksimpson.nourish.ui.NourishTheme
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

private const val MAX_SIGNALS = 3

/** settings pages are modes of one screen, so switching doesn't reload data. */
sealed interface SettingsMode {
    data object Home : SettingsMode
    data object Signals : SettingsMode
    data object Attribution : SettingsMode
}

class SettingsViewModel(
    private val nourishRepo: NourishRepository,
    val nourishState: StateFlow<DataState>,
) : LightViewModel<Unit>() {
    val mode = MutableStateFlow<SettingsMode>(SettingsMode.Home)

    fun openSignals() {
        mode.value = SettingsMode.Signals
    }

    fun openAttribution() {
        mode.value = SettingsMode.Attribution
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
                    onOpenAttribution = { viewModel.openAttribution() },
                )

                SettingsMode.Attribution -> AttributionContent(onBack = { viewModel.backToHome() })

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
    onOpenAttribution: () -> Unit,
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

        LightScrollView(modifier = Modifier.weight(1f).fillMaxWidth()) {
            SettingsRow(label = "Nutrition Focus", onClick = onOpenSignals)
        }

        AttributionFooter(onClick = onOpenAttribution)
    }
}

/** a label row that opens another page. */
@Composable
private fun SettingsRow(label: String, onClick: () -> Unit) {
    LightText(
        text = label,
        variant = LightTextVariant.Heading,
        modifier = Modifier
            .fillMaxWidth()
            .lightClickable(onClick = onClick)
            .padding(start = 1.5f.gridUnitsAsDp(), top = 1f.gridUnitsAsDp(), bottom = 1f.gridUnitsAsDp()),
    )
}

@Composable
private fun AttributionFooter(onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(4f.gridUnitsAsDp())
            .lightClickable(onClick = onClick)
            .padding(horizontal = 1f.gridUnitsAsDp()),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = buildAnnotatedString {
                append("Food data provided by ")
                withStyle(SpanStyle(textDecoration = TextDecoration.Underline)) {
                    append("Open Food Facts")
                }
                append(".")
            },
            style = compactFineStyle(),
            color = LightThemeTokens.colors.content,
            textAlign = TextAlign.Center,
        )
    }
}

@Composable
private fun AttributionContent(onBack: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize()) {
        LightTopBar(
            leftButton = LightBarButton.LightIcon(LightIcons.BACK, onClick = onBack),
            center = LightTopBarCenter.Text("Open Food Facts"),
            modifier = Modifier.padding(bottom = 1f.gridUnitsAsDp()),
        )

        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 2f.gridUnitsAsDp()),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Image(
                painter = painterResource(R.drawable.openfoodfacts),
                contentDescription = "Open Food Facts QR code",
                modifier = Modifier
                    .padding(top = 2f.gridUnitsAsDp())
                    .size(12f.gridUnitsAsDp()),
            )
            Text(
                text = "Open Food Facts is an open database of food products\n\n" +
                    "Scan the QR code or visit:\n" +
                    "https://world.openfoodfacts.org to learn more.\n\n" +
                    "Nutrition lookup sends your searches to Open Food Facts. " +
                    "Your logs stay on this phone.",
                style = compactFineStyle(),
                color = LightThemeTokens.colors.content,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 2f.gridUnitsAsDp()),
            )
        }
    }
}

@Composable
private fun compactFineStyle(): TextStyle {
    val base = LightThemeTokens.typography.fine
    return base.copy(
        fontSize = base.fontSize.value.designVerticalPxToSp(),
        lineHeight = (base.fontSize.value * 1.2f).designVerticalPxToSp(),
    )
}
