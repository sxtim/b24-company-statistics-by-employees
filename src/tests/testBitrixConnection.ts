import Bitrix24Api from '../services/bitrix24Api'

// Функция для тестирования соединения с Bitrix24
async function testBitrixConnection() {
  try {
    const webhookUrl = 'https://b24-o2r3b5.bitrix24.ru/rest/1/izgq0xiwpc2x7ogj/'
    console.log('Тестирование соединения с Bitrix24 API')
    console.log('Webhook URL:', webhookUrl)

    const api = new Bitrix24Api(webhookUrl)

    // Тестируем получение сотрудников
    console.log('Получение списка сотрудников...')
    const employees = await api.getEmployees()
    console.log('Сотрудники получены:', employees.length)
    employees.forEach((emp) => {
      console.log(`- ${emp.LAST_NAME} ${emp.NAME} (ID: ${emp.ID})`)
    })

    console.log('Соединение с Bitrix24 API работает корректно!')
    return true
  } catch (error) {
    console.error('Ошибка соединения с Bitrix24 API:', error)
    return false
  }
}

// Экспортируем функцию для использования в других файлах
export default testBitrixConnection

// Если файл запущен напрямую (не импортирован), выполняем тест
if (typeof require !== 'undefined' && require.main === module) {
  testBitrixConnection()
}
