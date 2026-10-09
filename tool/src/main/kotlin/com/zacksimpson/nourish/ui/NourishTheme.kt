package com.zacksimpson.nourish.ui

import androidx.compose.runtime.Composable
import com.thelightphone.sdk.ui.LightTheme
import com.thelightphone.sdk.ui.LightThemeColors

/** white on black theme. wrap each screen in this. */
@Composable
fun NourishTheme(content: @Composable () -> Unit) {
    LightTheme(colors = LightThemeColors.Dark, content = content)
}
