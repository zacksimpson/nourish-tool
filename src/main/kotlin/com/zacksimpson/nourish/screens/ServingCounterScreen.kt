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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import com.thelightphone.sdk.SealedLightActivity
import com.thelightphone.sdk.SimpleLightScreen
import com.thelightphone.sdk.ui.LightBarButton
import com.thelightphone.sdk.ui.LightBottomBar
import com.thelightphone.sdk.ui.LightIcon
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.lightClickable
import com.zacksimpson.nourish.ui.DesignText
import com.zacksimpson.nourish.ui.NourishTheme
import com.zacksimpson.nourish.ui.designPxToDp

/** How many servings of the looked-up food were eaten. Back returns no change. */
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
                DesignText(
                    text = "Servings",
                    fontSizeDesignPx = 26f,
                    align = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 60f.designPxToDp(), bottom = 20f.designPxToDp()),
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 10f.designPxToDp()),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    LightIcon(
                        icon = LightIcons.DOWN,
                        size = 2f,
                        modifier = Modifier
                            .lightClickable(onClick = { count = maxOf(1, count - 1) })
                            .padding(horizontal = 32f.designPxToDp(), vertical = 16f.designPxToDp()),
                    )
                    DesignText(
                        text = count.toString(),
                        fontSizeDesignPx = 100f,
                        fontWeight = FontWeight.Light,
                        align = TextAlign.Center,
                        modifier = Modifier.width(120f.designPxToDp()),
                    )
                    LightIcon(
                        icon = LightIcons.UP,
                        size = 2f,
                        modifier = Modifier
                            .lightClickable(onClick = { count += 1 })
                            .padding(horizontal = 32f.designPxToDp(), vertical = 16f.designPxToDp()),
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
