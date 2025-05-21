<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h4">О приложении</v-card-title>
          <v-card-text>
            <p class="text-body-1 mb-4">
              Приложение "Статистика сотрудников Bitrix24" показывает статистику по компаниям и
              сделкам сотрудников в системе Bitrix24.
            </p>

            <h2 class="text-h5 mb-3">Основные возможности:</h2>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title
                  >Отображение количества компаний, закреплённых за сотрудником</v-list-item-title
                >
              </v-list-item>
              <v-list-item>
                <v-list-item-title
                  >Отображение количества сделок по компаниям сотрудника</v-list-item-title
                >
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Отображение количества компаний без сделок</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title
                  >Расчёт динамики по всем показателям в сравнении с предыдущим
                  периодом</v-list-item-title
                >
              </v-list-item>
              <v-list-item>
                <v-list-item-title
                  >Фильтрация по периоду (месяц или произвольный период)</v-list-item-title
                >
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Суммарная статистика по всем сотрудникам</v-list-item-title>
              </v-list-item>
            </v-list>

            <h2 class="text-h5 mb-3 mt-4">Подключение к Bitrix24:</h2>
            <p class="text-body-1 mb-2">
              Для работы приложения необходимо указать webhook URL Bitrix24, который можно получить
              в настройках вашего портала:
            </p>
            <ol class="ml-6 mb-4">
              <li>Зайдите в Bitrix24</li>
              <li>Откройте "Настройки" > "Интеграции" > "REST API"</li>
              <li>
                Создайте новый исходящий webhook и дайте ему необходимые права доступа:
                <ul class="ml-6">
                  <li>crm</li>
                  <li>user</li>
                </ul>
              </li>
              <li>Скопируйте полученный URL в поле "Webhook URL" в настройках приложения</li>
            </ol>

            <p class="text-body-1">
              Версия: 1.0.0<br />
              © {{ new Date().getFullYear() }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
