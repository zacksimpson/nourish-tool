package com.zacksimpson.nourish.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.lightClickable

private const val LABEL_SIZE_PX = 16f
private const val VALUE_SIZE_PX = 23f
private const val UNDERLINE_THICKNESS_PX = 3f
private const val HORIZONTAL_PADDING_PX = 28f
private const val VERTICAL_PADDING_PX = 13f
private const val LABEL_GAP_PX = 6f
private const val VALUE_TO_UNDERLINE_GAP_PX = 6f

/** Label-over-underlined-value field row; tap opens the full-screen editor for it. */
@Composable
fun UnderlinedField(
    value: String,
    placeholder: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .lightClickable(onClick = onClick)
            .padding(horizontal = HORIZONTAL_PADDING_PX.designPxToDp(), vertical = VERTICAL_PADDING_PX.designPxToDp()),
    ) {
        if (label != null) {
            DesignText(text = label, fontSizeDesignPx = LABEL_SIZE_PX)
            Spacer(modifier = Modifier.height(LABEL_GAP_PX.designPxToDp()))
        }
        DesignText(
            text = value.ifBlank { placeholder },
            fontSizeDesignPx = VALUE_SIZE_PX,
        )
        Spacer(modifier = Modifier.height(VALUE_TO_UNDERLINE_GAP_PX.designPxToDp()))
        Spacer(
            modifier = Modifier
                .fillMaxWidth()
                .height(UNDERLINE_THICKNESS_PX.designPxToDp())
                .background(LightThemeTokens.colors.content),
        )
    }
}
