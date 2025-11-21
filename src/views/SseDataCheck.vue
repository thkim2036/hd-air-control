<template>
  <v-card class="pa-4">
    <v-card-title>SSE 디버그 데이터</v-card-title>
    <v-card-text>
      <v-simple-table dense>
        <thead>
        <tr>
          <th>키</th>
          <th>값</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(value, key) in sseData" :key="key">
          <td>{{ key }}</td>
          <td>{{ value }}</td>
        </tr>
        </tbody>
      </v-simple-table>
    </v-card-text>
    <v-divider />
    <v-card-title>RAW JSON (chartData 제외)</v-card-title>
    <v-card-text>
      <pre>{{ rawData }}</pre>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSSEStore } from '@/stores/sseStore'

// Pinia 스토어에서 모든 ref를 가져옴
const sseStore = useSSEStore()
const refs = storeToRefs(sseStore)

// chartData 키를 제외하고 정리
const sseData = computed(() => {
  const result = {}
  Object.keys(refs)
      .filter(key => key !== 'chartData')
      .filter(key => key !== 'timestamp')
      .filter(key => key !== 'expectedValue1C')
      .filter(key => key !== 'expectedValue3C')
      .forEach(key => {
        result[key] = refs[key].value
      })
  return result
})

// RAW JSON 표시용 (chartData 제외)
const rawData = computed(() => JSON.stringify(sseData.value, null, 2))
</script>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 13px;
}
</style>
