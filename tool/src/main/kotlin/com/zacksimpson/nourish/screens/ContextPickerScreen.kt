package com.zacksimpson.nourish.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.thelightphone.sdk.SealedLightActivity
import com.thelightphone.sdk.SimpleLightScreen
import com.thelightphone.sdk.ui.LightBarButton
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightScrollView
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.LightTopBar
import com.thelightphone.sdk.ui.LightTopBarCenter
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.thelightphone.sdk.ui.lightClickable
import com.zacksimpson.nourish.data.ALL_TAGS
import com.zacksimpson.nourish.ui.DesignText
import com.zacksimpson.nourish.ui.NourishTheme
import com.zacksimpson.nourish.ui.designPxToDp

private const val TAG_SIZE_PX = 22f
private const val LIST_HORIZONTAL_PADDING_PX = 22f
private const val LIST_TOP_PADDING_PX = 4f
private const val TAG_ROW_VERTICAL_PADDING_PX = 10f
private const val BOTTOM_PAD_PX = 40f

/** Multi-select context tags. Tap the back button to return the current selection. */
class ContextPickerScreen(
    sealedActivity: SealedLightActivity,
    private val initialTags: List<String>,
) : SimpleLightScreen<List<String>>(sealedActivity) {

    @Composable
    override fun Content() {
        NourishTheme {
            var selected by remember { mutableStateOf(initialTags.toSet()) }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(LightThemeTokens.colors.background),
            ) {
                LightTopBar(
                    leftButton = LightBarButton.LightIcon(LightIcons.BACK, onClick = { goBack(selected.toList()) }),
                    center = LightTopBarCenter.Text("context tags"),
                    modifier = Modifier.padding(bottom = 1f.gridUnitsAsDp()),
                )
                LightScrollView(
                    modifier = Modifier.fillMaxSize(),
                ) {
                    Spacer(modifier = Modifier.height(LIST_TOP_PADDING_PX.designPxToDp()))
                    ALL_TAGS.forEach { tag ->
                        DesignText(
                            text = tag.label,
                            fontSizeDesignPx = TAG_SIZE_PX,
                            underline = tag.id in selected,
                            modifier = Modifier
                                .fillMaxWidth()
                                .lightClickable(onClick = {
                                    selected = if (tag.id in selected) selected - tag.id else selected + tag.id
                                })
                                .padding(
                                    horizontal = LIST_HORIZONTAL_PADDING_PX.designPxToDp(),
                                    vertical = TAG_ROW_VERTICAL_PADDING_PX.designPxToDp(),
                                ),
                        )
                    }
                    Spacer(modifier = Modifier.height(BOTTOM_PAD_PX.designPxToDp()))
                }
            }
        }
    }
}
