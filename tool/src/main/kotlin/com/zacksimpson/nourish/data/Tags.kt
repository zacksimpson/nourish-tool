package com.zacksimpson.nourish.data

data class Tag(val id: String, val label: String)

val POSITIVE_TAGS = listOf(
    Tag("stayed-hydrated", "stayed hydrated"),
    Tag("ate-on-time", "ate on time"),
    Tag("slept-well", "slept well"),
    Tag("exercised", "exercised"),
    Tag("peaceful", "peaceful"),
    Tag("low-stress", "low stress"),
    Tag("well-rested", "well rested"),
    Tag("good-energy", "good energy"),
)

val CONTEXT_TAGS = listOf(
    Tag("tired", "tired"),
    Tag("sick", "sick"),
    Tag("sore", "sore"),
    Tag("restless", "restless"),
    Tag("stressed", "stressed"),
    Tag("anxious", "anxious"),
    Tag("low-mood", "low mood"),
    Tag("overwhelmed", "overwhelmed"),
    Tag("social-eating", "social eating"),
    Tag("traveling", "traveling"),
    Tag("busy-day", "busy day"),
    Tag("worked-late", "worked late"),
    Tag("ate-out", "ate out"),
    Tag("skipped-meal", "skipped a meal"),
    Tag("ate-fast", "ate fast"),
    Tag("late-night-eating", "late night eating"),
)

val ALL_TAGS = POSITIVE_TAGS + CONTEXT_TAGS

fun getTagLabel(id: String): String = ALL_TAGS.firstOrNull { it.id == id }?.label ?: id
