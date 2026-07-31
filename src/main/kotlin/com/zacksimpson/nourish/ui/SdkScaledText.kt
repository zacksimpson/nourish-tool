package com.zacksimpson.nourish.ui

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.designVerticalPxToSp

/**
 * Text at a literal design-pixel size scaled through the SDK's own screen-height
 * baseline — for sizes copied from an SDK-native precedent rather than the RN app
 * (that case is DesignText/ui/Scaling.kt instead; the two aren't interchangeable).
 */
@Composable
fun SdkScaledText(
    text: String,
    fontSizeDesignPx: Float,
    modifier: Modifier = Modifier,
    fontWeight: FontWeight = FontWeight.Normal,
    align: TextAlign? = null,
) {
    Text(
        text = text,
        modifier = modifier,
        style = TextStyle(
            color = LightThemeTokens.colors.content,
            fontFamily = LightThemeTokens.typography.copy.fontFamily,
            fontWeight = fontWeight,
            fontSize = fontSizeDesignPx.designVerticalPxToSp(),
            textAlign = align ?: TextAlign.Unspecified,
        ),
    )
}
