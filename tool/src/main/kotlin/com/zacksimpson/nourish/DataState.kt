package com.zacksimpson.nourish

import com.zacksimpson.nourish.data.AppData
import com.zacksimpson.nourish.data.NourishRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn

/** loading, ready, or unreadable data. */
sealed interface DataState {
    data object Loading : DataState
    data class Ready(val data: AppData) : DataState
    data class Corrupt(val message: String) : DataState
}

/** exposes the repository as a [DataState], mapping a corruption error to [DataState.Corrupt]. */
fun NourishRepository.dataStateIn(scope: CoroutineScope): StateFlow<DataState> =
    appData
        .map<AppData, DataState> { DataState.Ready(it) }
        .catch { e -> emit(DataState.Corrupt(e.message ?: "Data is unreadable")) }
        .stateIn(scope, SharingStarted.WhileSubscribed(5_000), DataState.Loading)
