<template>
  <div>
    <v-card-title class="pb-2 d-flex align-center">
      <v-autocomplete
        v-model="selectedEmployees"
        :items="employeeItems"
        item-title="title"
        item-value="value"
        label="Поиск по сотрудникам"
        placeholder="Выберите одного или нескольких сотрудников"
        clearable
        chips
        multiple
        density="compact"
        hide-details
        variant="outlined"
        return-object
        @update:model-value="filterByEmployees"
        class="flex-grow-1"
      >
        <template v-slot:prepend-inner>
          <v-icon>mdi-account-search</v-icon>
        </template>
      </v-autocomplete>

      <v-btn
        v-if="selectedEmployees.length > 1"
        class="ml-2"
        size="small"
        variant="text"
        density="compact"
        @click="clearEmployeeFilter"
      >
        Очистить все
      </v-btn>
    </v-card-title>

    <div class="table-responsive">
      <v-table class="employee-stats-table elevation-1">
        <thead>
          <tr>
            <th rowspan="2" class="text-start employee-column">Сотрудник</th>
            <th colspan="3" class="text-center">Кол-во компаний, закрепленных за сотрудником</th>
            <th colspan="3" class="text-center">Кол-во сделок по закрепленным компаниям</th>
            <th colspan="3" class="text-center">Кол-во компаний без сделок</th>
          </tr>
          <tr>
            <th class="text-center period-column">Пред. период</th>
            <th class="text-center period-column">Текущий период</th>
            <th class="text-center period-column">Динамика</th>
            <th class="text-center period-column">Пред. период</th>
            <th class="text-center period-column">Текущий период</th>
            <th class="text-center period-column">Динамика</th>
            <th class="text-center period-column">Пред. период</th>
            <th class="text-center period-column">Текущий период</th>
            <th class="text-center period-column">Динамика</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in filteredItems"
            :key="item.userId"
            :class="{ 'total-row': item.userId === 'total' }"
          >
            <td class="employee-column">{{ item.userName }}</td>

            <!-- Компании -->
            <td class="text-center">{{ item.prevCompanyCount }}</td>
            <td class="text-center">{{ item.companyCount }}</td>
            <td class="text-center" :class="getDynamicClass(item.companyCountDiff)">
              {{ formatDynamicValue(item.companyCountDiff) }}
            </td>

            <!-- Сделки -->
            <td class="text-center">{{ item.prevDealCount }}</td>
            <td class="text-center">{{ item.dealCount }}</td>
            <td class="text-center" :class="getDynamicClass(item.dealCountDiff)">
              {{ formatDynamicValue(item.dealCountDiff) }}
            </td>

            <!-- Компании без сделок -->
            <td class="text-center">{{ item.prevCompaniesWithoutDeals }}</td>
            <td class="text-center">{{ item.companiesWithoutDeals }}</td>
            <td class="text-center" :class="getDynamicClass(item.companiesWithoutDealsDiff, true)">
              {{ formatDynamicValue(item.companiesWithoutDealsDiff) }}
            </td>
          </tr>
          <tr v-if="filteredItems.length === 0 && !loading">
            <td colspan="10" class="text-center pa-5">Нет данных для отображения</td>
          </tr>
          <tr v-if="loading">
            <td colspan="10" class="text-center pa-5">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              Загрузка данных...
            </td>
          </tr>
        </tbody>
        <tfoot v-if="showTotalRow && totalRow">
          <tr class="total-row">
            <td class="employee-column">ИТОГО</td>
            <td class="text-center">{{ totalRow?.prevCompanyCount }}</td>
            <td class="text-center">{{ totalRow?.companyCount }}</td>
            <td class="text-center" :class="getDynamicClass(totalRow?.companyCountDiff || 0)">
              {{ formatDynamicValue(totalRow?.companyCountDiff || 0) }}
            </td>
            <td class="text-center">{{ totalRow?.prevDealCount }}</td>
            <td class="text-center">{{ totalRow?.dealCount }}</td>
            <td class="text-center" :class="getDynamicClass(totalRow?.dealCountDiff || 0)">
              {{ formatDynamicValue(totalRow?.dealCountDiff || 0) }}
            </td>
            <td class="text-center">{{ totalRow?.prevCompaniesWithoutDeals }}</td>
            <td class="text-center">{{ totalRow?.companiesWithoutDeals }}</td>
            <td
              class="text-center"
              :class="getDynamicClass(totalRow?.companiesWithoutDealsDiff || 0, true)"
            >
              {{ formatDynamicValue(totalRow?.companiesWithoutDealsDiff || 0) }}
            </td>
          </tr>
        </tfoot>
      </v-table>
    </div>

    <div class="d-flex justify-end mt-3">
      <v-btn
        color="success"
        variant="outlined"
        prepend-icon="mdi-file-excel"
        @click="exportToExcel"
        :disabled="!hasSomeData"
      >
        Экспорт в Excel
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEmployeeStatsStore } from '@/stores/employeeStats'
import { computed, ref, watch } from 'vue'

// Определяем интерфейсы
interface EmployeeItem {
  title: string
  value: string
}

interface EmployeeStatsItem {
  userId: string
  userName: string
  companyCount: number
  dealCount: number
  companiesWithoutDeals: number
  companyCountDiff: number
  dealCountDiff: number
  companiesWithoutDealsDiff: number
  prevCompanyCount: number
  prevDealCount: number
  prevCompaniesWithoutDeals: number
}

// Стор статистики
const store = useEmployeeStatsStore()

// Реактивные свойства
const selectedEmployees = ref<EmployeeItem[]>([])

// Вычисляемые свойства
const loading = computed(() => store.loading)

const hasSomeData = computed(() => store.stats.length > 0)

// Формируем список сотрудников для выпадающего списка
const employeeItems = computed(() => {
  // Формируем список сотрудников из статистики
  const items: EmployeeItem[] = []

  if (store.stats.length > 0) {
    store.stats.forEach((employee) => {
      // Исключаем возможные дубликаты
      if (!items.some((item) => item.value === employee.userId)) {
        items.push({
          title: employee.userName,
          value: employee.userId,
        })
      }
    })
  }

  return items
})

// Данные таблицы с расчетом предыдущих периодов
const tableItems = computed(() => {
  const items = [...store.stats].map((employee) => {
    // Вычисляем значения для предыдущего периода на основе текущих данных и разницы
    return {
      ...employee,
      prevCompanyCount: employee.companyCount - employee.companyCountDiff,
      prevDealCount: employee.dealCount - employee.dealCountDiff,
      prevCompaniesWithoutDeals:
        employee.companiesWithoutDeals - employee.companiesWithoutDealsDiff,
    } as EmployeeStatsItem
  })

  return items
})

// Вычисление итоговой строки
const totalRow = computed(() => {
  if (!store.totalStats) return null

  return {
    userId: 'total',
    userName: 'ИТОГО',
    ...store.totalStats,
    prevCompanyCount: store.totalStats.companyCount - store.totalStats.companyCountDiff,
    prevDealCount: store.totalStats.dealCount - store.totalStats.dealCountDiff,
    prevCompaniesWithoutDeals:
      store.totalStats.companiesWithoutDeals - store.totalStats.companiesWithoutDealsDiff,
  } as EmployeeStatsItem
})

// Показывать ли итоговую строку
const showTotalRow = computed(() => {
  return (
    store.totalStats !== null &&
    filteredItems.value.length > 0 &&
    !filteredItems.value.some((item) => item.userId === 'total')
  )
})

// Фильтрованные данные таблицы
const filteredItems = computed(() => {
  if (selectedEmployees.value.length === 0) {
    return tableItems.value
  }

  // Фильтрация по выбранным сотрудникам
  const selectedIds = selectedEmployees.value.map((employee) => employee.value)
  return tableItems.value.filter((employee) => selectedIds.includes(employee.userId))
})

// Функции
function filterByEmployees() {
  // Фильтрация происходит автоматически через computed свойство
  console.log('Выбраны сотрудники:', selectedEmployees.value)
}

function removeEmployee(employee: EmployeeItem) {
  selectedEmployees.value = selectedEmployees.value.filter((item) => item.value !== employee.value)
}

function clearEmployeeFilter() {
  selectedEmployees.value = []
}

function exportToExcel() {
  // В реальном проекте здесь будет логика экспорта в Excel
  console.log('Экспорт в Excel: ', filteredItems.value)

  // Можно использовать библиотеки как exceljs, xlsx или другие
  alert('Функция экспорта будет реализована в будущих версиях')
}

// Форматирование значения динамики
function formatDynamicValue(value: number): string {
  if (value === 0) return '0'
  return value > 0 ? `+${value}` : `${value}`
}

// Получение класса для ячейки динамики
function getDynamicClass(value: number, inverse: boolean = false): string {
  if (value === 0) return ''

  const isPositive = value > 0
  // Для обратных показателей (например, компании без сделок)
  // положительная динамика - это плохо
  if (inverse) {
    return isPositive ? 'negative-dynamic' : 'positive-dynamic'
  }

  return isPositive ? 'positive-dynamic' : 'negative-dynamic'
}

// Сброс фильтра при изменении списка сотрудников
watch(
  () => store.stats.length,
  () => {
    if (selectedEmployees.value.length > 0) {
      // Проверяем каждого выбранного сотрудника и удаляем тех, кого больше нет в списке
      selectedEmployees.value = selectedEmployees.value.filter((selected) =>
        store.stats.some((emp) => emp.userId === selected.value),
      )
    }
  },
)
</script>

<style scoped>
.table-responsive {
  width: 100%;
  overflow-x: hidden;
}

.employee-stats-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  table-layout: fixed;
}

.employee-stats-table th,
.employee-stats-table td {
  padding: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.employee-column {
  width: 15%;
}

.period-column {
  width: 9.44%; /* (100% - 15%) / 9 */
}

.employee-stats-table thead th {
  font-weight: 500;
  background-color: #f5f5f5;
}

.total-row {
  font-weight: 700;
  background-color: rgba(0, 0, 0, 0.03);
}

.positive-dynamic {
  color: #4caf50;
  font-weight: 600;
}

.negative-dynamic {
  color: #f44336;
  font-weight: 600;
}
</style>
