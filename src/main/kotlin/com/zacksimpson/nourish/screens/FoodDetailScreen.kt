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
import com.thelightphone.sdk.ui.LightBottomBar
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightScrollView
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.LightTopBar
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.zacksimpson.nourish.data.FoodDetail
import com.zacksimpson.nourish.data.OffApi
import com.zacksimpson.nourish.data.formatRound1
import com.zacksimpson.nourish.data.resolveServing
import com.zacksimpson.nourish.ui.DesignText
import com.zacksimpson.nourish.ui.NourishTheme
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

sealed interface DetailStatus {
    data object Loading : DetailStatus
    data class Success(val detail: FoodDetail) : DetailStatus
    data object Error : DetailStatus
}

class FoodDetailViewModel(private val api: OffApi, private val id: String) : LightViewModel<Unit>() {
    val status = MutableStateFlow<DetailStatus>(DetailStatus.Loading)
    val servingCount = MutableStateFlow(1)

    init {
        viewModelScope.launch {
            status.value = api.fetchDetail(id).fold(
                onSuccess = { DetailStatus.Success(it) },
                onFailure = { DetailStatus.Error },
            )
        }
    }

    fun setServingCount(v: Int) {
        servingCount.value = v
    }

    override fun onCleared() {
        super.onCleared()
        api.close()
    }
}

class FoodDetailScreen(
    sealedActivity: SealedLightActivity,
    private val id: String,
    private val name: String,
    private val category: String,
) : LightScreen<Unit, FoodDetailViewModel>(sealedActivity) {

    override val viewModelClass: Class<FoodDetailViewModel>
        get() = FoodDetailViewModel::class.java

    override fun createViewModel() = FoodDetailViewModel(OffApi(), id)

    @Composable
    override fun Content() {
        NourishTheme {
            val status by viewModel.status.collectAsState()
            val servingCount by viewModel.servingCount.collectAsState()

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(LightThemeTokens.colors.background),
            ) {
                LightTopBar(
                    leftButton = LightBarButton.LightIcon(LightIcons.BACK, onClick = { goBack(Unit) }),
                    modifier = Modifier.padding(bottom = 1f.gridUnitsAsDp()),
                )

                when (val s = status) {
                    DetailStatus.Loading -> StateMessage("loading...")
                    DetailStatus.Error -> StateMessage("something went wrong")
                    is DetailStatus.Success -> {
                        val serving = resolveServing(s.detail)
                        LightScrollView(modifier = Modifier.weight(1f).fillMaxWidth()) {
                            Column(
                                modifier = Modifier.padding(horizontal = 1.1f.gridUnitsAsDp()),
                            ) {
                                DesignText(text = name, fontSizeDesignPx = 28f)
                                if (category.isNotBlank()) {
                                    DesignText(text = category, fontSizeDesignPx = 18f)
                                }
                                DesignText(
                                    text = "$servingCount ${if (servingCount == 1) "serving" else "servings"} · ${serving.label} each",
                                    fontSizeDesignPx = 22f,
                                    modifier = Modifier.padding(top = 0.4f.gridUnitsAsDp(), bottom = 0.4f.gridUnitsAsDp()),
                                )
                                nutrientLines(s.detail).forEach { (label, amount, unit, mult) ->
                                    DesignText(
                                        text = "$label – ${formatRound1(amount * serving.scale * servingCount * mult)} $unit",
                                        fontSizeDesignPx = 22f,
                                        modifier = Modifier.padding(bottom = 0.4f.gridUnitsAsDp()),
                                    )
                                }
                            }
                        }

                        LightBottomBar(
                            items = listOf(
                                LightBarButton.Text(
                                    text = "SERVINGS",
                                    onClick = {
                                        navigateTo(
                                            screenFactory = { ServingCounterScreen(it, servingCount) },
                                            resultCallback = { count -> if (count != null) viewModel.setServingCount(count) },
                                        )
                                    },
                                ),
                            ),
                        )
                    }
                }
            }
        }
    }
}

private fun nutrientLines(detail: FoodDetail): List<NutrientLine> {
    val n = detail.nutriments
    return listOfNotNull(
        n.energyKcal100g?.let { NutrientLine("Calories", it, "kcal", 1.0) },
        n.proteins100g?.let { NutrientLine("Protein", it, "g", 1.0) },
        n.carbohydrates100g?.let { NutrientLine("Carbs", it, "g", 1.0) },
        n.fat100g?.let { NutrientLine("Fat", it, "g", 1.0) },
        n.fiber100g?.let { NutrientLine("Fiber", it, "g", 1.0) },
        n.sugarsAdded100g?.let { NutrientLine("Added Sugar", it, "g", 1.0) },
        n.sodium100g?.let { NutrientLine("Sodium", it, "mg", 1000.0) },
        n.water100g?.let { NutrientLine("Water", it, "g", 1.0) },
        n.caffeine100g?.let { NutrientLine("Caffeine", it, "mg", 1000.0) },
    )
}

private data class NutrientLine(val label: String, val amount: Double, val unit: String, val mult: Double)

@Composable
private fun StateMessage(text: String) {
    Column(modifier = Modifier.padding(horizontal = 1.1f.gridUnitsAsDp(), vertical = 1.5f.gridUnitsAsDp())) {
        DesignText(text = text, fontSizeDesignPx = 22f)
    }
}
