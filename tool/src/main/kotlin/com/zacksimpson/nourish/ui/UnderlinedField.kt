package com.zacksimpson.nourish.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.thelightphone.sdk.ui.LightText
import com.thelightphone.sdk.ui.LightTextVariant
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.thelightphone.sdk.ui.lightClickable

private const val UNDERLINE_THICKNESS = 0.2f
private const val HORIZONTAL_PADDING = 1.75f
private const val VERTICAL_PADDING = 0.8f
private const val LABEL_GAP = 0.4f
private const val VALUE_TO_UNDERLINE_GAP = 0.25f

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
            .padding(horizontal = HORIZONTAL_PADDING.gridUnitsAsDp(), vertical = VERTICAL_PADDING.gridUnitsAsDp()),
    ) {
        if (label != null) {
            LightText(text = label, variant = LightTextVariant.Detail)
            Spacer(modifier = Modifier.height(LABEL_GAP.gridUnitsAsDp()))
        }
        LightText(
            text = value.ifBlank { placeholder },
            variant = LightTextVariant.Paragraph,
        )
        Spacer(modifier = Modifier.height(VALUE_TO_UNDERLINE_GAP.gridUnitsAsDp()))
        Spacer(
            modifier = Modifier
                .fillMaxWidth()
                .height(UNDERLINE_THICKNESS.gridUnitsAsDp())
                .background(LightThemeTokens.colors.content),
        )
    }
}
