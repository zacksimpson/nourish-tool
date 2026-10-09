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
 * one shared repository and state for the whole process, so new screens
 * open with data already loaded instead of flashing blank.
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
