import type { IStatPeriod } from '../services/bitrix24Api'
import Bitrix24Api from '../services/bitrix24Api'

// Функция для тестирования соединения с Bitrix24
async function testBitrixConnection() {
  try {
    const webhookUrl = 'https://b24-o2r3b5.bitrix24.ru/rest/1/izgq0xiwpc2x7ogj/'
    console.log('Тестирование соединения с Bitrix24 API')
    console.log('Webhook URL:', webhookUrl)

    const api = new Bitrix24Api(webhookUrl)

    // Тестируем получение сотрудников
    console.log('Получение списка сотрудников (user.get)...')
    const employees = await api.getEmployees()
    console.log('Сотрудники получены:', employees.length)
    employees.forEach((emp) => {
      console.log(`- ${emp.LAST_NAME} ${emp.NAME} (ID: ${emp.ID})`)
    })

    // Тестируем получение компаний
    console.log('\nПолучение списка компаний (crm.company.list)...')
    const currentPeriod: IStatPeriod = {
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Первый день текущего месяца
      end: new Date(),
    }

    try {
      const companies = await api.getCompanies(currentPeriod)
      console.log('Компании получены:', companies.length)
      if (companies.length > 0) {
        console.log('Пример компании:', companies[0])
      }
    } catch (error) {
      console.error('Ошибка при получении компаний:', error)
      console.log('Возможно, у вашего webhook нет прав доступа к crm или crm_company')
    }

    // Тестируем получение сделок
    console.log('\nПолучение списка сделок (crm.deal.list)...')
    try {
      const deals = await api.getDeals(currentPeriod)
      console.log('Сделки получены:', deals.length)
      if (deals.length > 0) {
        console.log('Пример сделки:', deals[0])
      }
    } catch (error) {
      console.error('Ошибка при получении сделок:', error)
      console.log('Возможно, у вашего webhook нет прав доступа к crm или crm_deal')
    }

    console.log('\nТестирование API завершено!')
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
