package com.zacksimpson.nourish

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.thelightphone.sdk.InitialScreen
import com.thelightphone.sdk.SealedLightActivity
import com.thelightphone.sdk.SimpleLightScreen
import com.thelightphone.sdk.ui.LightText
import com.thelightphone.sdk.ui.LightTextVariant
import com.thelightphone.sdk.ui.LightThemeTokens
import com.zacksimpson.nourish.ui.NourishTheme

/** Scaffold placeholder — proves the module builds and wires into light-sdk. Replace
 *  with the real tab host (Log / History) per LIGHT_SDK_MIGRATION.md §7 step 1. */
@InitialScreen
class MainScreen(sealedActivity: SealedLightActivity) : SimpleLightScreen<Unit>(sealedActivity) {

    @Composable
    override fun Content() {
        NourishTheme {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(LightThemeTokens.colors.background),
                contentAlignment = Alignment.Center,
            ) {
                LightText(text = "Nourish", variant = LightTextVariant.Heading)
            }
        }
    }
}
