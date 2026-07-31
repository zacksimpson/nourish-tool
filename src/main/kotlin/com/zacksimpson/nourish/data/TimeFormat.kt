package com.zacksimpson.nourish.data

/** "HH:MM" 24h -> "h:mm AM/PM" */
fun formatTime(time24: String): String {
    val (hStr, mStr) = time24.split(":")
    val h = hStr.toInt()
    val ampm = if (h >= 12) "PM" else "AM"
    val h12 = if (h % 12 == 0) 12 else h % 12
    return "$h12:$mStr $ampm"
}

/** TimePicker digits + ampm -> "HH:MM" 24h for storage. */
fun digitsToTime(digits: String, ampm: String): String {
    val h: Int
    val m: String
    if (digits.length == 3) {
        h = digits[0].digitToInt()
        m = digits.substring(1)
    } else {
        h = digits.substring(0, 2).toInt()
        m = digits.substring(2, 4)
    }
    var hour = h
    if (ampm == "PM" && hour != 12) hour += 12
    if (ampm == "AM" && hour == 12) hour = 0
    return "%02d:%s".format(hour, m)
}

data class TimeDisplayParts(val digits: String, val ampm: String)

/** "HH:MM" 24h -> TimePicker { digits, ampm }. */
fun timeToDisplayParts(time24: String): TimeDisplayParts {
    val (hStr, mStr) = time24.split(":")
    var h = hStr.toInt()
    val ampm = if (h >= 12) "PM" else "AM"
    if (h > 12) h -= 12
    if (h == 0) h = 12
    return TimeDisplayParts("%02d%s".format(h, mStr), ampm)
}
