package com.zacksimpson.nourish.data

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.Serializable

@Serializable
data class NotificationsSettings(
    val enabled: Boolean = false,
    val reminderEnabled: Boolean = false,
    val reminderTime: String = "09:00",
)

class NotificationsRepository(private val dataStore: DataStore<Preferences>) {

    val settings: Flow<NotificationsSettings> = dataStore.data.map { it.readSettings() }

    private fun Preferences.readSettings(): NotificationsSettings {
        val raw = this[SETTINGS_KEY] ?: return NotificationsSettings()
        return try {
            appJson.decodeFromString(NotificationsSettings.serializer(), raw)
        } catch (e: Exception) {
            NotificationsSettings()
        }
    }

    suspend fun update(transform: (NotificationsSettings) -> NotificationsSettings) {
        dataStore.edit { p ->
            val next = transform(p.readSettings())
            p[SETTINGS_KEY] = appJson.encodeToString(NotificationsSettings.serializer(), next)
        }
    }

    private companion object {
        val SETTINGS_KEY = stringPreferencesKey("notifications:settings")
    }
}
