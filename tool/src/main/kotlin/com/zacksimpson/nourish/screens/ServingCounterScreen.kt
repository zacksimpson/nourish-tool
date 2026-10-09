package com.zacksimpson.nourish.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import com.thelightphone.sdk.SealedLightActivity
import com.thelightphone.sdk.SimpleLightScreen
import com.thelightphone.sdk.ui.LightBarButton
import com.thelightphone.sdk.ui.LightBottomBar
import com.thelightphone.sdk.ui.LightIcon
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightText
import com.thelightphone.sdk.ui.LightTextVariant
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.thelightphone.sdk.ui.lightClickable
import com.zacksimpson.nourish.ui.NourishTheme

/** picks how many servings were eaten. back keeps the old count. */
class ServingCounterScreen(
    sealedActivity: SealedLightActivity,
    private val initialCount: Int,
) : SimpleLightScreen<Int?>(sealedActivity) {

    @Composable
    override fun Content() {
        NourishTheme {
            var count by remember { mutableIntStateOf(initialCount) }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(LightThemeTokens.colors.background),
            ) {
                LightText(
                    text = "Servings",
                    variant = LightTextVariant.Subheading,
                    align = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 3.75f.gridUnitsAsDp(), bottom = 1.25f.gridUnitsAsDp()),
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 0.65f.gridUnitsAsDp()),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    LightIcon(
                        icon = LightIcons.DOWN,
                        size = 2f,
                        modifier = Modifier
                            .lightClickable(onClick = { count = maxOf(1, count - 1) })
                            .padding(horizontal = 2f.gridUnitsAsDp(), vertical = 1f.gridUnitsAsDp()),
                    )
                    LightText(
                        text = count.toString(),
                        variant = LightTextVariant.Title,
                        align = TextAlign.Center,
                        modifier = Modifier.width(7.5f.gridUnitsAsDp()),
                    )
                    LightIcon(
                        icon = LightIcons.UP,
                        size = 2f,
                        modifier = Modifier
                            .lightClickable(onClick = { count += 1 })
                            .padding(horizontal = 2f.gridUnitsAsDp(), vertical = 1f.gridUnitsAsDp()),
                    )
                }

                Box(modifier = Modifier.weight(1f))

                LightBottomBar(
                    items = listOf(
                        LightBarButton.Text(text = "SAVE", onClick = { goBack(count) }),
                    ),
                )
            }
        }
    }
}
