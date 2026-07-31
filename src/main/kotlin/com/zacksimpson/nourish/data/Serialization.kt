package com.zacksimpson.nourish.data

import kotlinx.serialization.json.Json

internal val appJson: Json = Json {
    ignoreUnknownKeys = true
    encodeDefaults = true
    coerceInputValues = true
}
