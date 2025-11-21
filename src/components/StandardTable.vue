<template>
  <div class="legend-card">
    <div class="legend-title">
      콤프실 압력(<span class="unit-small">Kg/cm²</span>) 기준
    </div>
    <table class="legend-table">
      <tr v-for="(item, idx) in pressureLevels" :key="idx">
        <td>
          <div class="legend-color-box" :style="{ backgroundColor: item.color }"></div>
        </td>
        <td class="label">{{ item.label }}</td>
        <td class="range">({{ item.range }})</td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSSEStore } from '@/stores/sseStore'
import { storeToRefs } from 'pinia'

const { expectedValue1C } = storeToRefs(useSSEStore())


const pressureLevels = computed(() => [
  {
    label: '정상',
    range: `${expectedValue1C.value} 이상 Kg/cm²`,
    color: '#ffffff',
  },
  {
    label: '저압',
    range: `${expectedValue1C.value} 이하 Kg/cm²`,
    color: '#0066cc',
  },
])
</script>

<style scoped>
.legend-card {
  background-color: #222242;
  color: white;
  width: 250px;
  //border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.legend-title {
  font-weight: bold;
  margin-bottom: 12px;
  font-size: 20px;
  text-align: center;
}

.legend-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #454675;
  //border-radius: 4px;
  overflow: hidden;
}

.legend-table td {
  padding: 2px 5px;
}

.legend-color-box {
  width: 16px;
  height: 16px;
  display: inline-block;
  //border-radius: 2px;
  margin-right: 8px;
}

.label {
  font-size: 18px;
  font-weight: bold;
}

.range {
  font-size: 14px;
  color: white;
}

.unit-small {
  font-size: 14px;
  vertical-align: baseline;
}
</style>
