package com.zacksimpson.nourish.screens

import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.runtime.Composable
import com.thelightphone.sdk.SealedLightActivity
import com.thelightphone.sdk.SimpleLightScreen
import com.thelightphone.sdk.rememberKeyboardOptions
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightTextInputEditor
import com.zacksimpson.nourish.ui.NourishTheme

/** Nutrition lookup entry point — a single full-screen search field. */
class SearchScreen(sealedActivity: SealedLightActivity) : SimpleLightScreen<Unit>(sealedActivity) {

    @Composable
    override fun Content() {
        NourishTheme {
            val textState = rememberTextFieldState("")
            val keyboardOptions = rememberKeyboardOptions()

            LightTextInputEditor(
                title = "Nutrition Lookup",
                state = textState,
                keyboardOptionsFlow = keyboardOptions,
                onSubmit = { text ->
                    val query = text.toString().trim()
                    if (query.isNotEmpty()) {
                        navigateTo(screenFactory = { SearchResultsScreen(it, query) })
                    }
                },
                onBack = { goBack(Unit) },
                submitIcon = LightIcons.SEARCH,
                editorKey = this,
            )
        }
    }
}
