<template>
  <div class="table-compressor">
    <v-table density="compact" style="background-color: #454675">
      <thead>
      <tr>
        <th class="text-center text-h6 font-weight-bold text-white">콤프실</th>
        <th class="text-center text-h6 font-weight-bold text-white">압력 (Kg/cm²)</th>
      </tr>
      </thead>
      <tbody>
      <tr>
        <td class="text-center text-subtitle-1 font-weight-bold text-white">1콤프실</td>
        <td
            class="text-center text-h5 font-weight-black"
            :class="getPressureColor(compPressure['1C'])"
        >
          {{ status1C }} <span class="ms-2 font-weight-bold">{{ pressure1C }}</span>
        </td>
      </tr>
      <tr>
        <td class="text-center text-subtitle-1 font-weight-bold text-white">3콤프실</td>
        <td
            class="text-center text-h5 font-weight-black"
            :class="getPressureColor(compPressure['3C'])"
        >
          {{ status3C }} <span class="ms-2 font-weight-bold">{{ pressure3C }}</span>
        </td>
      </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useSSEStore } from '@/stores/sseStore'
import { storeToRefs } from 'pinia'

const {
  compPressure,
  expectedValue1C,
  expectedValue3C,
} = storeToRefs(useSSEStore())

const pressure1C = computed(() => compPressure.value['1C'] ?? '-')
const pressure3C = computed(() => compPressure.value['3C'] ?? '-')

const status1C = computed(() => {
  const value = compPressure.value['1C']
  if (value === undefined) return ''
  return value <= expectedValue1C.value ? '저압' : '정상'
})

const status3C = computed(() => {
  const value = compPressure.value['3C']
  if (value === undefined) return ''
  return value <= expectedValue3C.value ? '저압' : '정상'
})

// 압력 값에 따른 색상변경
function getPressureColor(value) {
  if (value <= expectedValue1C.value) return 'text-blue'
  return 'text-white'
}

</script>

<style scoped>
.table-compressor {
  max-width: 400px;
  margin: auto;
  background-color: #222242;
  //border-radius: 8px;
  overflow: hidden;
  padding: 8px;
  margin-top: 0px;
}
</style>
