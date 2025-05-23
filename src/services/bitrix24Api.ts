import type { AxiosInstance } from 'axios'
import axios from 'axios'

export interface IBitrixUser {
  ID: string
  NAME: string
  LAST_NAME: string
  SECOND_NAME?: string
  PERSONAL_PHOTO?: string
  PERSONAL_DEPARTMENT?: number[]
  EMAIL?: string
}

export interface IBitrixCompany {
  ID: string
  TITLE: string
  ASSIGNED_BY_ID: string
}

export interface IBitrixDeal {
  ID: string
  TITLE: string
  COMPANY_ID: string
  ASSIGNED_BY_ID: string
}

export interface IStatPeriod {
  start: Date
  end: Date
}

export interface IEmployeeStats {
  userId: string
  userName: string
  companyCount: number
  dealCount: number
  companiesWithoutDeals: number
  companyCountDiff: number
  dealCountDiff: number
  companiesWithoutDealsDiff: number
}

class Bitrix24Api {
  private axios: AxiosInstance
  private webhook: string

  constructor(webhook: string) {
    this.webhook = webhook
    this.axios = axios.create({
      baseURL: webhook,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async getEmployees(): Promise<IBitrixUser[]> {
    try {
      console.log('Отправка запроса user.get на URL:', this.webhook + 'user.get')
      const response = await this.axios.get('user.get')
      console.log('Ответ от API:', response.data)
      return response.data.result
    } catch (error) {
      console.error('Ошибка при получении сотрудников:', error)
      throw error
    }
  }

  async getCompanies(period: IStatPeriod): Promise<IBitrixCompany[]> {
    try {
      const filter = {
        '>=DATE_CREATE': this.formatDate(period.start),
        '<=DATE_CREATE': this.formatDate(period.end),
      }

      const response = await this.axios.post('crm.company.list', {
        filter,
        select: ['ID', 'TITLE', 'ASSIGNED_BY_ID'],
      })
      return response.data.result
    } catch (error) {
      console.error('Ошибка при получении компаний:', error)
      throw error
    }
  }

  async getDeals(period: IStatPeriod): Promise<IBitrixDeal[]> {
    try {
      const filter = {
        '>=DATE_CREATE': this.formatDate(period.start),
        '<=DATE_CREATE': this.formatDate(period.end),
      }

      const response = await this.axios.post('crm.deal.list', {
        filter,
        select: ['ID', 'TITLE', 'COMPANY_ID', 'ASSIGNED_BY_ID'],
      })
      return response.data.result
    } catch (error) {
      console.error('Ошибка при получении сделок:', error)
      throw error
    }
  }

  async getEmployeeStatistics(
    currentPeriod: IStatPeriod,
    prevPeriod?: IStatPeriod,
  ): Promise<IEmployeeStats[]> {
    try {
      const employees = await this.getEmployees()
      console.log('Получен список сотрудников:', employees)

      if (employees.length === 0) {
        console.warn('Внимание: Получен пустой список сотрудников!')
      }

      const currentCompanies = await this.getCompanies(currentPeriod)
      console.log('Получен список компаний:', currentCompanies)

      const currentDeals = await this.getDeals(currentPeriod)
      console.log('Получен список сделок:', currentDeals)

      let prevCompanies: IBitrixCompany[] = []
      let prevDeals: IBitrixDeal[] = []

      if (prevPeriod) {
        prevCompanies = await this.getCompanies(prevPeriod)
        prevDeals = await this.getDeals(prevPeriod)
      }

      const stats = employees.map((employee) => {
        const employeeCompanies = currentCompanies.filter(
          (company) => company.ASSIGNED_BY_ID === employee.ID,
        )

        const employeeCompanyIds = employeeCompanies.map((company) => company.ID)

        const companyDeals = currentDeals.filter((deal) =>
          employeeCompanyIds.includes(deal.COMPANY_ID),
        )

        const companiesWithoutDeals = employeeCompanies.filter(
          (company) => !currentDeals.some((deal) => deal.COMPANY_ID === company.ID),
        )

        const prevEmployeeCompanies = prevPeriod
          ? prevCompanies.filter((company) => company.ASSIGNED_BY_ID === employee.ID)
          : []

        const prevEmployeeCompanyIds = prevEmployeeCompanies.map((company) => company.ID)

        const prevCompanyDeals = prevPeriod
          ? prevDeals.filter((deal) => prevEmployeeCompanyIds.includes(deal.COMPANY_ID))
          : []

        const prevCompaniesWithoutDeals = prevPeriod
          ? prevEmployeeCompanies.filter(
              (company) => !prevDeals.some((deal) => deal.COMPANY_ID === company.ID),
            )
          : []

        return {
          userId: employee.ID,
          userName: this.getEmployeeName(employee),
          companyCount: employeeCompanies.length,
          dealCount: companyDeals.length,
          companiesWithoutDeals: companiesWithoutDeals.length,
          companyCountDiff: prevPeriod
            ? employeeCompanies.length - prevEmployeeCompanies.length
            : 0,
          dealCountDiff: prevPeriod ? companyDeals.length - prevCompanyDeals.length : 0,
          companiesWithoutDealsDiff: prevPeriod
            ? companiesWithoutDeals.length - prevCompaniesWithoutDeals.length
            : 0,
        }
      })

      return stats
    } catch (error) {
      console.error('Ошибка при получении статистики:', error)
      throw error
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  private getEmployeeName(employee: IBitrixUser): string {
    const lastName = employee.LAST_NAME || ''
    const firstName = employee.NAME || ''

    if (lastName && firstName) {
      return `${lastName} ${firstName}`
    }

    if (lastName || firstName) {
      return lastName || firstName
    }

    if (employee.EMAIL) {
      return employee.EMAIL
    }

    return `Сотрудник ID:${employee.ID}`
  }
}

export default Bitrix24Api
