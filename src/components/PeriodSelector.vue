<template>
  <v-card class="mb-6">
    <v-card-title>Выбор периода</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="periodType"
            label="Тип периода"
            :items="periodTypes"
            item-title="text"
            item-value="value"
            @update:model-value="updatePeriodType"
          ></v-select>
        </v-col>

        <v-col cols="12" sm="6" v-if="periodType === 'custom'">
          <v-switch
            v-model="compareToPrevious"
            label="Сравнивать с предыдущим периодом"
            color="primary"
            hide-details
          ></v-switch>
        </v-col>
      </v-row>

      <v-row v-if="periodType === 'month'">
        <v-col cols="12" sm="6">
          <v-select
            v-model="selectedMonth"
            label="Месяц"
            :items="months"
            @update:model-value="updatePeriod"
          ></v-select>
        </v-col>
        <v-col cols="12" sm="6">
          <v-select
            v-model="selectedYear"
            label="Год"
            :items="years"
            @update:model-value="updatePeriod"
          ></v-select>
        </v-col>
      </v-row>

      <v-row v-if="periodType === 'custom'">
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="startDate"
            label="Начало периода"
            type="date"
            @update:model-value="updatePeriod"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="endDate"
            label="Конец периода"
            type="date"
            @update:model-value="updatePeriod"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="applyFilter" :loading="loading"> Применить фильтр </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { IStatPeriod } from '@/services/bitrix24Api'
import { useEmployeeStatsStore } from '@/stores/employeeStats'
import { endOfMonth, format, parse, startOfMonth } from 'date-fns'
import { onMounted, ref } from 'vue'

const store = useEmployeeStatsStore()

// Реактивные свойства
const periodType = ref('month')
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())
const startDate = ref(format(new Date(), 'yyyy-MM-dd'))
const endDate = ref(format(new Date(), 'yyyy-MM-dd'))
const compareToPrevious = ref(true)
const loading = ref(false)

// Периоды
const periodTypes = [
  { text: 'Месяц', value: 'month' },
  { text: 'Произвольный период', value: 'custom' },
]

// Генерация месяцев
const months = [
  { title: 'Январь', value: 1 },
  { title: 'Февраль', value: 2 },
  { title: 'Март', value: 3 },
  { title: 'Апрель', value: 4 },
  { title: 'Май', value: 5 },
  { title: 'Июнь', value: 6 },
  { title: 'Июль', value: 7 },
  { title: 'Август', value: 8 },
  { title: 'Сентябрь', value: 9 },
  { title: 'Октябрь', value: 10 },
  { title: 'Ноябрь', value: 11 },
  { title: 'Декабрь', value: 12 },
]

// Генерация лет
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

// Функции
function updatePeriodType() {
  if (periodType.value === 'month') {
    // Устанавливаем текущий месяц по умолчанию
    const now = new Date()
    selectedMonth.value = now.getMonth() + 1
    selectedYear.value = now.getFullYear()
    updatePeriod()
  }
}

function updatePeriod() {
  if (periodType.value === 'month') {
    const date = new Date(selectedYear.value, selectedMonth.value - 1, 1)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    startDate.value = format(start, 'yyyy-MM-dd')
    endDate.value = format(end, 'yyyy-MM-dd')
  }
}

async function applyFilter() {
  try {
    loading.value = true

    const period: IStatPeriod = {
      start: parse(startDate.value, 'yyyy-MM-dd', new Date()),
      end: parse(endDate.value, 'yyyy-MM-dd', new Date()),
    }

    // Устанавливаем период в хранилище и определяем, нужно ли сравнивать с предыдущим
    store.setPeriod(period, compareToPrevious.value)

    // Загружаем статистику
    await store.fetchEmployeeStats()
  } catch (error) {
    console.error('Ошибка при применении фильтра периода:', error)
  } finally {
    loading.value = false
  }
}

// Инициализация
onMounted(() => {
  updatePeriod()
})
</script>
