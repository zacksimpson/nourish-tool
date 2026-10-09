package com.zacksimpson.nourish.data

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import com.zacksimpson.nourish.DataState
import com.zacksimpson.nourish.dataStateIn
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.StateFlow

/**
 * Repositories and their live state, built once and reused for the app's whole
 * process lifetime. Each screen used to build its own repository and StateFlow on
 * every push, so every fresh navigation started cold and flashed blank for a frame
 * before its data arrived — sharing one already-warm instance means only the very
 * first screen ever sees that gap.
 */
object AppDataStore {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    private var nourishRepo: NourishRepository? = null
    private var nourishState: StateFlow<DataState>? = null

    fun nourishRepository(dataStore: DataStore<Preferences>): NourishRepository =
        nourishRepo ?: NourishRepository(dataStore).also { nourishRepo = it }

    fun nourishState(dataStore: DataStore<Preferences>): StateFlow<DataState> =
        nourishState ?: nourishRepository(dataStore).dataStateIn(scope).also { nourishState = it }
}
