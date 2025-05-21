<template>
  <v-icon v-if="value !== 0" :color="indicatorColor" size="small" class="ml-1">
    {{ indicatorIcon }}
  </v-icon>
  <span v-if="value !== 0" :class="['ml-1', 'trend-value', indicatorColor + '--text']">
    {{ Math.abs(value) }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  inverse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  inverse: false,
})

// Определяем иконку в зависимости от значения и флага inverse
const indicatorIcon = computed(() => {
  // Если inverse=true, то положительная динамика отрицательна (и наоборот)
  // Например, рост числа компаний без сделок - отрицательная тенденция
  const isPositive = props.inverse ? props.value < 0 : props.value > 0

  return isPositive ? 'mdi-arrow-up' : 'mdi-arrow-down'
})

// Определяем цвет в зависимости от значения и флага inverse
const indicatorColor = computed(() => {
  const isPositive = props.inverse ? props.value < 0 : props.value > 0

  return isPositive ? 'success' : 'error'
})
</script>

<style scoped>
.trend-value {
  font-size: 0.75rem;
}
</style>
