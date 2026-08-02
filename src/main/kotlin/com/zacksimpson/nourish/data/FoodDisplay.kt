package com.zacksimpson.nourish.data

import kotlin.math.round

fun roundTo1(v: Double): Double = round(v * 10) / 10.0

/** Matches JS's `String(number)` for a rounded value — "1" not "1.0", "1.5" as-is. */
fun formatRound1(v: Double): String {
    val rounded = roundTo1(v)
    val whole = rounded.toLong()
    return if (rounded == whole.toDouble()) whole.toString() else rounded.toString()
}

private val COMMA_DECIMAL = Regex("(\\d),(\\d)")
private val DECIMAL_NUMBER = Regex("\\d+\\.\\d+")

fun cleanServingLabel(raw: String): String {
    val commaFixed = raw.lowercase().replace(COMMA_DECIMAL) { m -> "${m.groupValues[1]}.${m.groupValues[2]}" }
    return DECIMAL_NUMBER.replace(commaFixed) { m -> formatRound1(m.value.toDouble()) }
}

data class ServingInfo(val scale: Double, val label: String)

fun resolveServing(detail: FoodDetail): ServingInfo {
    val qty = detail.servingQuantity
    if (qty != null && qty > 0) {
        val label = detail.servingSize?.let { cleanServingLabel(it) } ?: "${formatRound1(qty)}g"
        return ServingInfo(scale = qty / 100.0, label = label)
    }
    return ServingInfo(scale = 1.0, label = "100g")
}
