package com.zacksimpson.nourish.data

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.MutablePreferences
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.KSerializer
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer

/** Snapshot of everything the app persists. */
data class AppData(
    val entries: Map<String, Entry>,
    val signals: List<String>,
    val targets: Map<String, Int>,
)

/** Stored value exists but can't be parsed; left on disk untouched, not reset. */
class DataCorruptionException(key: String, cause: Throwable) :
    Exception("Stored data for '$key' is unreadable; it was preserved, not overwritten.", cause)

/**
 * Single source of truth for persisted data, backed by the SDK's shared DataStore.
 * No in-memory cache — every mutation is one atomic edit(). A corrupt key throws
 * before any write, so bad data is never overwritten.
 */
class NourishRepository(private val dataStore: DataStore<Preferences>) {

    private val entriesSerializer = MapSerializer(String.serializer(), Entry.serializer())
    private val signalsSerializer = ListSerializer(String.serializer())
    private val targetsSerializer = MapSerializer(String.serializer(), Int.serializer())

    val appData: Flow<AppData> = dataStore.data.map { it.toAppData() }

    private fun Preferences.toAppData() = AppData(
        entries = readEntries(),
        signals = readSignals(),
        targets = readTargets(),
    )

    private fun Preferences.readEntries(): Map<String, Entry> =
        decode(this[ENTRIES_KEY], ENTRIES_KEY, entriesSerializer) ?: emptyMap()

    private fun Preferences.readSignals(): List<String> =
        decode(this[SIGNALS_KEY], SIGNALS_KEY, signalsSerializer) ?: DEFAULT_SIGNALS

    private fun Preferences.readTargets(): Map<String, Int> =
        decode(this[TARGETS_KEY], TARGETS_KEY, targetsSerializer) ?: emptyMap()

    /** Absent key → null (caller applies a default); present but unparseable → throw. */
    private fun <T> decode(raw: String?, key: Preferences.Key<String>, serializer: KSerializer<T>): T? {
        if (raw == null) return null
        return try {
            appJson.decodeFromString(serializer, raw)
        } catch (e: Exception) {
            throw DataCorruptionException(key.name, e)
        }
    }

    private fun MutablePreferences.writeEntries(v: Map<String, Entry>) {
        this[ENTRIES_KEY] = appJson.encodeToString(entriesSerializer, v)
    }

    private fun MutablePreferences.writeSignals(v: List<String>) {
        this[SIGNALS_KEY] = appJson.encodeToString(signalsSerializer, v)
    }

    private fun MutablePreferences.writeTargets(v: Map<String, Int>) {
        this[TARGETS_KEY] = appJson.encodeToString(targetsSerializer, v)
    }

    suspend fun saveEntry(entry: Entry) {
        dataStore.edit { p -> p.writeEntries(p.readEntries() + (entry.date to entry)) }
    }

    suspend fun saveSignals(signals: List<String>) {
        dataStore.edit { p -> p.writeSignals(signals) }
    }

    suspend fun saveTargets(targets: Map<String, Int>) {
        dataStore.edit { p -> p.writeTargets(targets) }
    }

    private companion object {
        val ENTRIES_KEY = stringPreferencesKey("nourish:entries")
        val SIGNALS_KEY = stringPreferencesKey("nourish:signals")
        val TARGETS_KEY = stringPreferencesKey("nourish:targets")
    }
}
