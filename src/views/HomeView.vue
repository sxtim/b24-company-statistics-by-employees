<script setup lang="ts">
import BitrixSettings from '@/components/BitrixSettings.vue'
import EmployeeStatsTable from '@/components/EmployeeStatsTable.vue'
import PeriodSelector from '@/components/PeriodSelector.vue'
import { useEmployeeStatsStore } from '@/stores/employeeStats'
import { format } from 'date-fns'
import { onMounted } from 'vue'

// Хранилище
const store = useEmployeeStatsStore()

// Форматирование диапазона дат
function formatDateRange(start: Date, end: Date): string {
  return `${format(start, 'dd.MM.yyyy')} - ${format(end, 'dd.MM.yyyy')}`
}

// При монтировании компонента проверяем локальное хранилище на наличие настроек
onMounted(() => {
  const savedWebhook = localStorage.getItem('bitrix24_webhook')
  if (savedWebhook) {
    store.setWebhook(savedWebhook)
  }
})
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Статистика сотрудников по компаниям и сделкам</h1>
      </v-col>
    </v-row>

    <!-- Настройки Bitrix24 -->
    <v-row>
      <v-col cols="12">
        <bitrix-settings />
      </v-col>
    </v-row>

    <!-- Выбор периода -->
    <v-row>
      <v-col cols="12">
        <period-selector />
      </v-col>
    </v-row>

    <!-- Информация о текущем периоде -->
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

    <!-- Таблица статистики -->
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

    <!-- Заглушка - инструкции при пустой статистике -->
    <v-row v-if="store.stats.length === 0 && !store.loading">
      <v-col cols="12">
        <v-card class="text-center pa-4">
          <v-card-text>
            <v-icon size="64" color="info" class="mb-4">mdi-information-outline</v-icon>
            <h2 class="text-h5 mb-2">Нет данных для отображения</h2>
            <p>Для начала работы:</p>
            <ol class="text-left pl-4">
              <li>Введите Webhook URL в настройках подключения к Bitrix24</li>
              <li>Выберите период для анализа</li>
              <li>Нажмите "Применить фильтр" для загрузки данных</li>
            </ol>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
