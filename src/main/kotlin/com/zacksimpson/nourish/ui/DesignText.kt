package com.zacksimpson.nourish.ui

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.TextUnit
import com.thelightphone.sdk.ui.LightThemeTokens

/**
 * Text at a literal design-pixel size, for the spots the fixed LightTextVariant table
 * doesn't cover — same scaling convention every LightText size uses under the hood.
 */
@Composable
fun DesignText(
    text: String,
    fontSizeDesignPx: Float,
    modifier: Modifier = Modifier,
    fontWeight: FontWeight = FontWeight.Normal,
    underline: Boolean = false,
    align: TextAlign? = null,
    letterSpacingDesignPx: Float = 0f,
) {
    Text(
        text = text,
        modifier = modifier,
        style = TextStyle(
            color = LightThemeTokens.colors.content,
            fontFamily = LightThemeTokens.typography.copy.fontFamily,
            fontWeight = fontWeight,
            fontSize = fontSizeDesignPx.designPxToSp(),
            textDecoration = if (underline) TextDecoration.Underline else null,
            textAlign = align ?: TextAlign.Unspecified,
            letterSpacing = if (letterSpacingDesignPx != 0f) letterSpacingDesignPx.designPxToSp() else TextUnit.Unspecified,
        ),
    )
}
