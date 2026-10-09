package com.zacksimpson.nourish.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
enum class SignalRating {
    @SerialName("on track") ON_TRACK,
    @SerialName("roughly") ROUGHLY,
    @SerialName("off track") OFF_TRACK,
}

@Serializable
data class Entry(
    val date: String, // "YYYY-MM-DD"
    val breakfast: String = "",
    val lunch: String = "",
    val dinner: String = "",
    val snacks: String = "",
    val signals: Map<String, SignalRating> = emptyMap(),
    val tags: List<String> = emptyList(),
    val note: String = "",
    val savedAt: Long = 0L,
)

data class SignalOption(val id: String, val label: String)

val SIGNAL_OPTIONS = listOf(
    SignalOption("calories", "calories"),
    SignalOption("protein", "protein"),
    SignalOption("carbs", "carbs"),
    SignalOption("fat", "fat"),
    SignalOption("fiber", "fiber"),
    SignalOption("added-sugar", "added sugar"),
    SignalOption("sodium", "sodium"),
    SignalOption("water", "water"),
    SignalOption("caffeine", "caffeine"),
)

val DEFAULT_SIGNALS = listOf("calories", "protein")
