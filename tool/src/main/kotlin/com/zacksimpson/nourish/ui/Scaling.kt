package com.zacksimpson.nourish.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Renders a design-pixel number at the same physical size the RN app's own scaling
// util targets (fixed reference density, independent of the running device's actual
// density) — so a size ported straight from the RN source lands at the same size here.
private const val REFERENCE_DENSITY = 2.55f

@Composable
fun Float.designPxToSp(): TextUnit {
    val density = LocalDensity.current.density
    return (this * REFERENCE_DENSITY / density).sp
}

@Composable
fun Float.designPxToDp(): Dp {
    val density = LocalDensity.current.density
    return (this * REFERENCE_DENSITY / density).dp
}
