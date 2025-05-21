<template>
  <v-card class="mb-6">
    <v-card-title>Настройки подключения к Bitrix24</v-card-title>
    <v-card-text>
      <v-text-field
        v-model="webhook"
        label="Webhook URL Bitrix24"
        placeholder="https://your-domain.bitrix24.ru/rest/1/your-webhook-code/"
        hint="Получите вебхук в настройках Bitrix24 (Приложения > Вебхуки)"
        persistent-hint
        :error-messages="errorMessages"
      ></v-text-field>

      <v-alert v-if="store.error" type="error" class="mt-3" closable>
        {{ store.error }}
      </v-alert>

      <v-alert v-if="connectionStatus === 'success'" type="success" class="mt-3" closable>
        Соединение успешно установлено!
      </v-alert>

      <v-alert v-if="connectionStatus === 'error'" type="error" class="mt-3" closable>
        Ошибка соединения с Bitrix24 API. Проверьте webhook URL и права доступа.
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-btn
        color="info"
        variant="outlined"
        @click="testConnection"
        :loading="testingConnection"
        class="mr-2"
      >
        Проверить соединение
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="saveWebhook" :loading="loading"> Сохранить </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import Bitrix24Api from '@/services/bitrix24Api'
import { useEmployeeStatsStore } from '@/stores/employeeStats'
import { onMounted, ref } from 'vue'

const store = useEmployeeStatsStore()

// Реактивные свойства
const webhook = ref('https://b24-o2r3b5.bitrix24.ru/rest/1/izgq0xiwpc2x7ogj/')
const loading = ref(false)
const errorMessages = ref<string[]>([])
const connectionStatus = ref<'idle' | 'success' | 'error'>('idle')
const testingConnection = ref(false)

// Функции
function validateWebhook(url: string): boolean {
  // Базовая валидация URL
  if (!url) {
    errorMessages.value = ['Webhook URL обязателен']
    return false
  }

  try {
    const urlObj = new URL(url)
    if (!urlObj.pathname.includes('/rest/')) {
      errorMessages.value = ['URL должен содержать путь /rest/']
      return false
    }

    // Проверка на наличие кода вебхука
    const pathParts = urlObj.pathname.split('/')
    if (pathParts.length < 4 || !pathParts[3]) {
      errorMessages.value = ['URL должен содержать код вебхука']
      return false
    }

    // Проверка на корректный домен Bitrix24
    if (!urlObj.hostname.includes('bitrix24')) {
      errorMessages.value = ['URL должен относиться к домену Bitrix24']
      return false
    }

    errorMessages.value = []
    return true
  } catch (e) {
    errorMessages.value = ['Неверный формат URL']
    return false
  }
}

async function testConnection() {
  try {
    testingConnection.value = true
    connectionStatus.value = 'idle'
    errorMessages.value = []

    if (!validateWebhook(webhook.value)) {
      testingConnection.value = false
      return
    }

    // Создаем экземпляр API и пробуем получить сотрудников
    const api = new Bitrix24Api(webhook.value)
    const employees = await api.getEmployees()

    // Если запрос выполнен успешно, устанавливаем статус успеха
    connectionStatus.value = 'success'
    console.log('Соединение успешно! Получено сотрудников:', employees.length)
  } catch (error) {
    console.error('Ошибка при проверке соединения:', error)
    connectionStatus.value = 'error'
  } finally {
    testingConnection.value = false
  }
}

async function saveWebhook() {
  try {
    loading.value = true
    errorMessages.value = []

    if (!validateWebhook(webhook.value)) {
      return
    }

    // Сохраняем webhook в хранилище
    store.setWebhook(webhook.value)

    // Сохраняем webhook в localStorage
    localStorage.setItem('bitrix24_webhook', webhook.value)

    // Пробуем получить статистику для проверки соединения
    await store.fetchEmployeeStats()

    // Если нет ошибок, выводим сообщение об успехе
    if (!store.error) {
      alert('Настройки сохранены успешно')
    }
  } catch (error) {
    console.error('Ошибка при сохранении webhook:', error)
  } finally {
    loading.value = false
  }
}

// Загрузка webhook из localStorage при монтировании
onMounted(() => {
  const savedWebhook = localStorage.getItem('bitrix24_webhook')
  if (savedWebhook) {
    webhook.value = savedWebhook
  }
})
</script>
