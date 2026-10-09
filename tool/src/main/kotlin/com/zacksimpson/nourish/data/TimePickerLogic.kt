package com.zacksimpson.nourish.data

/**
 * Digit-entry validation for the time-picker numpad.
 *
 * Display slots (right-to-left fill):
 * 1 digit  "6"    -> "  : 6"
 * 2 digits "63"   -> "  :63"
 * 3 digits "630"  -> "6:30"
 * 4 digits "1230" -> "12:30"
 */
object TimePickerLogic {

    fun isValidNextDigit(current: String, next: Char): Boolean {
        val proposed = current + next
        return when (proposed.length) {
            1 -> true
            2 -> {
                val b = proposed[1].digitToInt()
                if (proposed[0] == '0') b in 1..9 else b <= 5
            }
            3 -> {
                val firstDigit = proposed[0].digitToInt()
                if (firstDigit == 0) {
                    val hourOnes = proposed[1].digitToInt()
                    val minTens = proposed[2].digitToInt()
                    hourOnes in 1..9 && minTens in 0..5
                } else {
                    val m = proposed.substring(1).toInt()
                    firstDigit in 1..9 && m in 0..59
                }
            }
            4 -> {
                val h = proposed.substring(0, 2).toInt()
                val m = proposed.substring(2).toInt()
                h in 1..12 && m in 0..59
            }
            else -> false
        }
    }

    fun buildDisplay(digits: String): String = when (digits.length) {
        0 -> "  :  "
        1 -> "  : ${digits[0]}"
        2 -> "  :$digits"
        3 -> "${digits[0]}:${digits.substring(1)}"
        4 -> "${digits.substring(0, 2)}:${digits.substring(2)}"
        else -> "  :  "
    }
}
