package com.zacksimpson.nourish.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import com.thelightphone.sdk.ui.LightIcon
import com.thelightphone.sdk.ui.LightIcons
import com.thelightphone.sdk.ui.LightText
import com.thelightphone.sdk.ui.LightTextVariant
import com.thelightphone.sdk.ui.LightThemeTokens
import com.thelightphone.sdk.ui.gridUnitsAsDp
import com.thelightphone.sdk.ui.lightClickable
import java.time.LocalDate
import java.time.YearMonth

private const val MARKER_WIDTH = 0.9f
private const val MARKER_DOT = 0.25f
private const val TODAY_BAR = 0.13f

private val MONTH_NAMES = listOf(
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
)
private val DAY_HEADERS = listOf("S", "M", "T", "W", "T", "F", "S")

/** month calendar. today is underlined and logged days have a dot. */
@Composable
fun HistoryTab(
    year: Int,
    month: Int,
    today: String,
    isDateLogged: (String) -> Boolean,
    onPrevMonth: () -> Unit,
    onNextMonth: () -> Unit,
    onSelectDate: (String) -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 1f.gridUnitsAsDp()),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(
                    top = 0.65f.gridUnitsAsDp(),
                    bottom = 1f.gridUnitsAsDp(),
                ),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            LightIcon(
                icon = LightIcons.BACK,
                size = 2f,
                modifier = Modifier.lightClickable { onPrevMonth() },
            )
            LightText(text = "${MONTH_NAMES[month - 1]} $year", variant = LightTextVariant.Paragraph)
            LightIcon(
                icon = LightIcons.ARROW_RIGHT,
                size = 2f,
                modifier = Modifier.lightClickable { onNextMonth() },
            )
        }

        Row(modifier = Modifier.fillMaxWidth()) {
            DAY_HEADERS.forEach { d ->
                Box(
                    modifier = Modifier.weight(1f).padding(vertical = 0.5f.gridUnitsAsDp()),
                    contentAlignment = Alignment.Center,
                ) {
                    LightText(text = d, variant = LightTextVariant.Button)
                }
            }
        }

        val firstDayOfWeek = LocalDate.of(year, month, 1).dayOfWeek.value % 7
        val daysInMonth = YearMonth.of(year, month).lengthOfMonth()
        val cells = buildList {
            repeat(firstDayOfWeek) { add(null) }
            for (d in 1..daysInMonth) add(d)
        }
        val rows = cells.chunked(7).map { row -> (row + List(7) { null }).take(7) }

        Column {
            rows.forEach { row ->
                // intrinsic height keeps empty cells as tall as day cells
                Row(modifier = Modifier.fillMaxWidth().height(IntrinsicSize.Min)) {
                    row.forEach { day ->
                        val dateStr = day?.let { "%04d-%02d-%02d".format(year, month, it) }
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .padding(vertical = 0.45f.gridUnitsAsDp())
                                .let { m -> if (dateStr != null) m.lightClickable { onSelectDate(dateStr) } else m },
                            contentAlignment = Alignment.Center,
                        ) {
                            if (day != null && dateStr != null) {
                                val isToday = dateStr == today
                                val isLogged = isDateLogged(dateStr)
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    LightText(text = day.toString(), variant = LightTextVariant.Subheading)
                                    // marker slot is always reserved so rows keep the same height
                                    Box(
                                        modifier = Modifier
                                            .padding(top = 0.12f.gridUnitsAsDp())
                                            .width(MARKER_WIDTH.gridUnitsAsDp())
                                            .height(MARKER_DOT.gridUnitsAsDp()),
                                        contentAlignment = Alignment.Center,
                                    ) {
                                        when {
                                            isToday -> Box(
                                                modifier = Modifier
                                                    .width(MARKER_WIDTH.gridUnitsAsDp())
                                                    .height(TODAY_BAR.gridUnitsAsDp())
                                                    .background(LightThemeTokens.colors.content),
                                            )

                                            isLogged -> Box(
                                                modifier = Modifier
                                                    .size(MARKER_DOT.gridUnitsAsDp())
                                                    .clip(CircleShape)
                                                    .background(LightThemeTokens.colors.content),
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

