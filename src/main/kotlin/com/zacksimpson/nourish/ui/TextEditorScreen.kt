package com.zacksimpson.nourish.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.thelightphone.sdk.SealedLightActivity
import com.thelightphone.sdk.SimpleLightScreen
import com.thelightphone.sdk.rememberKeyboardOptions
import com.thelightphone.sdk.ui.LightTextInputEditor
import com.thelightphone.sdk.ui.LightThemeTokens

data class TextEditorRequest(val title: String, val initialValue: String = "")

/**
 * Full-screen text entry backed by the LightOS keyboard. Returns the entered text as
 * the screen result on submit, or nothing if the user backs out.
 */
class TextEditorScreen(
    sealedActivity: SealedLightActivity,
    private val request: TextEditorRequest,
) : SimpleLightScreen<String>(sealedActivity) {

    @Composable
    override fun Content() {
        val textState = rememberTextFieldState(request.initialValue)
        val keyboardOptions = rememberKeyboardOptions()
        NourishTheme {
            LightTextInputEditor(
                title = request.title,
                state = textState,
                keyboardOptionsFlow = keyboardOptions,
                onSubmit = { goBack(it.toString()) },
                onBack = { goBack(null) },
                submitLabel = "DONE",
                editorKey = this@TextEditorScreen,
                modifier = Modifier.background(LightThemeTokens.colors.background),
            )
        }
    }
}
