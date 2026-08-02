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
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.LightTopBar
import com.thelightphone.sdk.ui.LightTopBarCenter
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.thelightphone.sdk.ui.lightClickable
import com.zacksimpson.nourish.data.FoodResult
import com.zacksimpson.nourish.data.OffApi
import com.zacksimpson.nourish.ui.DesignText
import com.zacksimpson.nourish.ui.NourishTheme
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

sealed interface SearchStatus {
    data object Loading : SearchStatus
    data class Success(val results: List<FoodResult>) : SearchStatus
    data object Empty : SearchStatus
    data object Error : SearchStatus
}

class SearchResultsViewModel(private val api: OffApi, private val query: String) : LightViewModel<Unit>() {
    val status = MutableStateFlow<SearchStatus>(SearchStatus.Loading)

    init {
        viewModelScope.launch {
            val result = api.search(query)
            status.value = result.fold(
                onSuccess = { list -> if (list.isEmpty()) SearchStatus.Empty else SearchStatus.Success(list) },
                onFailure = { SearchStatus.Error },
            )
        }
    }

    override fun onCleared() {
        super.onCleared()
        api.close()
    }
}

class SearchResultsScreen(sealedActivity: SealedLightActivity, private val query: String) :
    LightScreen<Unit, SearchResultsViewModel>(sealedActivity) {

    override val viewModelClass: Class<SearchResultsViewModel>
        get() = SearchResultsViewModel::class.java

    override fun createViewModel() = SearchResultsViewModel(OffApi(), query)

    @Composable
    override fun Content() {
        NourishTheme {
            val status by viewModel.status.collectAsState()

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(LightThemeTokens.colors.background),
            ) {
                LightTopBar(
                    leftButton = LightBarButton.LightIcon(LightIcons.BACK, onClick = { goBack(Unit) }),
                    center = LightTopBarCenter.Text(query),
                    modifier = Modifier.padding(bottom = 1f.gridUnitsAsDp()),
                )

                when (val s = status) {
                    SearchStatus.Loading -> StateMessage("searching...")
                    SearchStatus.Error -> StateMessage("something went wrong")
                    SearchStatus.Empty -> StateMessage("no results")
                    is SearchStatus.Success -> LightScrollView(modifier = Modifier.fillMaxSize()) {
                        s.results.forEach { food ->
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .lightClickable(
                                        onClick = {
                                            navigateTo(
                                                screenFactory = {
                                                    FoodDetailScreen(
                                                        it,
                                                        food.code,
                                                        food.productName.orEmpty(),
                                                        food.brands.orEmpty(),
                                                    )
                                                },
                                            )
                                        },
                                    )
                                    .padding(horizontal = 1.5f.gridUnitsAsDp(), vertical = 1f.gridUnitsAsDp()),
                            ) {
                                DesignText(text = food.productName.orEmpty(), fontSizeDesignPx = 22f)
                                if (!food.brands.isNullOrBlank()) {
                                    DesignText(text = food.brands, fontSizeDesignPx = 16f)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun StateMessage(text: String) {
    Column(modifier = Modifier.padding(horizontal = 1.5f.gridUnitsAsDp(), vertical = 1.5f.gridUnitsAsDp())) {
        DesignText(text = text, fontSizeDesignPx = 22f)
    }
}
