package com.zacksimpson.nourish.data

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

fun todayDateString(): String = LocalDate.now().toString()

private val SHORT_DATE_FORMATTER = DateTimeFormatter.ofPattern("EEE MMM d", Locale.US)

/** "Wed Jul 31" from a "YYYY-MM-DD" string. */
fun formatDateShort(dateStr: String): String =
    LocalDate.parse(dateStr).format(SHORT_DATE_FORMATTER)
