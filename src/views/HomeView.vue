<script setup lang="ts">
import EmployeeStatsTable from '@/components/EmployeeStatsTable.vue'
import PeriodSelector from '@/components/PeriodSelector.vue'
import { useEmployeeStatsStore } from '@/stores/employeeStats'
import { format } from 'date-fns'

const store = useEmployeeStatsStore()

function formatDateRange(start: Date, end: Date): string {
  return `${format(start, 'dd.MM.yyyy')} - ${format(end, 'dd.MM.yyyy')}`
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Статистика сотрудников по компаниям и сделкам</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <period-selector />
      </v-col>
    </v-row>

    <v-row v-if="store.stats.length > 0">
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-text>
            <div class="text-subtitle-1">
              Статистика за период:
              {{ formatDateRange(store.currentPeriod.start, store.currentPeriod.end) }}
              <span v-if="store.previousPeriod">
                (сравнение с:
                {{ formatDateRange(store.previousPeriod.start, store.previousPeriod.end) }})
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title> Таблица статистики </v-card-title>
          <v-card-text>
            <employee-stats-table />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="store.stats.length === 0 && !store.loading">
      <v-col cols="12">
        <v-card class="text-center pa-4">
          <v-card-text>
            <v-icon size="64" color="info" class="mb-4">mdi-information-outline</v-icon>
            <h2 class="text-h5 mb-2">Нет данных для отображения</h2>
            <p>Для начала работы:</p>
            <ol class="text-left pl-4">
              <li>Выберите период для анализа</li>
              <li>Нажмите "Применить фильтр" для загрузки данных</li>
            </ol>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
