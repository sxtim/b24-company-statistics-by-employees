import Bitrix24Api, { type IEmployeeStats, type IStatPeriod } from '@/services/bitrix24Api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useEmployeeStatsStore = defineStore('employeeStats', () => {
  // Состояние
  const stats = ref<IEmployeeStats[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPeriod = ref<IStatPeriod>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Первый день текущего месяца
    end: new Date(),
  })
  const previousPeriod = ref<IStatPeriod | null>(null)
  const bitrixWebhook = ref<string>('')

  // Геттеры
  const totalStats = computed(() => {
    if (!stats.value.length) return null

    // Суммируем значения по всем сотрудникам
    return stats.value.reduce(
      (total, employee) => {
        return {
          companyCount: total.companyCount + employee.companyCount,
          dealCount: total.dealCount + employee.dealCount,
          companiesWithoutDeals: total.companiesWithoutDeals + employee.companiesWithoutDeals,
          companyCountDiff: total.companyCountDiff + employee.companyCountDiff,
          dealCountDiff: total.dealCountDiff + employee.dealCountDiff,
          companiesWithoutDealsDiff:
            total.companiesWithoutDealsDiff + employee.companiesWithoutDealsDiff,
        }
      },
      {
        companyCount: 0,
        dealCount: 0,
        companiesWithoutDeals: 0,
        companyCountDiff: 0,
        dealCountDiff: 0,
        companiesWithoutDealsDiff: 0,
      },
    )
  })

  // Действия
  async function fetchEmployeeStats() {
    if (!bitrixWebhook.value) {
      error.value = 'Webhook Bitrix24 не настроен'
      return
    }

    loading.value = true
    error.value = null

    try {
      const api = new Bitrix24Api(bitrixWebhook.value)

      // Если установлен предыдущий период, то вычисляем динамику
      stats.value = await api.getEmployeeStatistics(
        currentPeriod.value,
        previousPeriod.value || undefined,
      )
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err)
      error.value = err instanceof Error ? err.message : 'Произошла ошибка'
    } finally {
      loading.value = false
    }
  }

  function setWebhook(webhook: string) {
    bitrixWebhook.value = webhook
  }

  function setPeriod(period: IStatPeriod, shouldCalcPrevPeriod: boolean = true) {
    currentPeriod.value = period

    if (shouldCalcPrevPeriod) {
      // Рассчитываем предыдущий период такой же длительности
      const duration = period.end.getTime() - period.start.getTime()
      const prevEnd = new Date(period.start.getTime() - 1) // день до начала текущего периода
      const prevStart = new Date(prevEnd.getTime() - duration)

      previousPeriod.value = {
        start: prevStart,
        end: prevEnd,
      }
    } else {
      previousPeriod.value = null
    }
  }

  return {
    stats,
    loading,
    error,
    currentPeriod,
    previousPeriod,
    bitrixWebhook,
    totalStats,
    fetchEmployeeStats,
    setWebhook,
    setPeriod,
  }
})
