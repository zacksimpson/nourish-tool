package com.zacksimpson.nourish.data

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.client.request.headers
import io.ktor.client.statement.HttpResponse
import io.ktor.http.HttpStatusCode
import io.ktor.http.isSuccess
import io.ktor.serialization.kotlinx.json.json
import java.net.URLEncoder
import kotlin.text.Charsets.UTF_8
import kotlinx.coroutines.delay
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

private const val BASE = "https://us.openfoodfacts.org"
private const val SEARCH_FIELDS = "code,product_name,brands,serving_size,serving_quantity"
private const val DETAIL_FIELDS = "product_name,brands,nutriments,serving_size,serving_quantity"

// OFF requires a descriptive User-Agent to avoid rate-limiting.
private const val USER_AGENT = "Nourish/1.0 (Android; github.com/zacksimpson/nourish-tool)"
private val RETRY_DELAYS_MS = listOf(500L, 1000L, 1500L)

@Serializable
data class FoodResult(
    val code: String,
    @SerialName("product_name") val productName: String? = null,
    val brands: String? = null,
)

@Serializable
private data class SearchResponse(val products: List<FoodResult> = emptyList())

@Serializable
data class Nutriments(
    @SerialName("energy-kcal_100g") val energyKcal100g: Double? = null,
    @SerialName("proteins_100g") val proteins100g: Double? = null,
    @SerialName("carbohydrates_100g") val carbohydrates100g: Double? = null,
    @SerialName("fat_100g") val fat100g: Double? = null,
    @SerialName("fiber_100g") val fiber100g: Double? = null,
    @SerialName("sugars-added_100g") val sugarsAdded100g: Double? = null,
    // OFF stores sodium and caffeine in g/100g; display wants mg.
    @SerialName("sodium_100g") val sodium100g: Double? = null,
    @SerialName("water_100g") val water100g: Double? = null,
    @SerialName("caffeine_100g") val caffeine100g: Double? = null,
)

@Serializable
data class FoodDetail(
    @SerialName("product_name") val productName: String? = null,
    val brands: String? = null,
    val nutriments: Nutriments = Nutriments(),
    @SerialName("serving_size") val servingSize: String? = null,
    @SerialName("serving_quantity") val servingQuantity: Double? = null,
)

@Serializable
private data class DetailResponse(val status: Int = 0, val product: FoodDetail? = null)

class OffApi {
    private val json = Json { ignoreUnknownKeys = true }
    private val client = HttpClient(OkHttp) {
        install(ContentNegotiation) { json(json) }
    }

    suspend fun search(query: String): Result<List<FoodResult>> = runCatching {
        val encoded = URLEncoder.encode(query, UTF_8.name())
        val url = "$BASE/cgi/search.pl?search_terms=$encoded&json=1&page_size=25" +
            "&fields=$SEARCH_FIELDS&sort_by=unique_scans_n&lc=en"
        val response = getWithRetry(url)
        if (!response.status.isSuccess()) throw IllegalStateException("search HTTP ${response.status.value}")
        val body: SearchResponse = response.body()
        dedupeByName(body.products)
    }

    suspend fun fetchDetail(id: String): Result<FoodDetail> = runCatching {
        val url = "$BASE/api/v2/product/$id.json?fields=$DETAIL_FIELDS"
        val response = getWithRetry(url)
        if (!response.status.isSuccess()) throw IllegalStateException("detail HTTP ${response.status.value}")
        val body: DetailResponse = response.body()
        if (body.status != 1 || body.product == null) throw IllegalStateException("not found")
        body.product
    }

    private suspend fun getWithRetry(url: String): HttpResponse {
        var response = client.get(url) { headers { append("User-Agent", USER_AGENT) } }
        for (delayMs in RETRY_DELAYS_MS) {
            if (response.status != HttpStatusCode.ServiceUnavailable) break
            delay(delayMs)
            response = client.get(url) { headers { append("User-Agent", USER_AGENT) } }
        }
        return response
    }

    fun close() = client.close()
}

private fun dedupeByName(products: List<FoodResult>): List<FoodResult> {
    val seen = HashSet<String>()
    return products.filter { p ->
        val name = p.productName?.trim()
        if (name.isNullOrEmpty()) return@filter false
        if (!seen.add(name.lowercase())) return@filter false
        true
    }
}
