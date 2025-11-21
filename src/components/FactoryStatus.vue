<template>
  <div class="table-factory">
    <v-table density="compact" class="elevation-1" style="background-color: #454675">
      <thead>
      <tr>
        <th class="text-center text-subtitle-1 font-weight-bold text-white">공장</th>
        <th class="text-center text-subtitle-2 font-weight-bold text-white">밸브 상태</th>
        <th class="text-center text-subtitle-2 font-weight-bold text-white" style="line-height: 1.1;">전단 압력<br><small>(Kg/cm²)</small></th>
        <th class="text-center text-subtitle-2 font-weight-bold text-white" style="line-height: 1.1;">후단 압력<br><small>(Kg/cm²)</small></th>
        <th class="text-center text-subtitle-2 font-weight-bold text-white" style="line-height: 1.1;">압력 차이<br><small>(Kg/cm²)</small></th>
        <th class="text-center text-subtitle-2 font-weight-bold text-white" style="line-height: 1.1;">온도<br><small>(℃)</small></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="id in ['1B', '2B']" :key="id">
        <td class="text-center text-body-1 font-weight-bold text-white">{{ id }}</td>
        <td class="text-center text-body-1 font-weight-bold text-white">{{ valveStatus[id] || '-' }}</td>
        <td class="text-center text-body-1 font-weight-bold text-white">{{ frontPressure[id] ?? '-' }}</td>
        <td class="text-center text-body-1 font-weight-bold text-white">{{ backPressure[id] ?? '-' }}</td>
        <td class="text-center text-body-1 font-weight-bold" style="color: #A8A6DB">
          {{
            frontPressure[id] !== undefined
            && backPressure[id] !== undefined
                ? (frontPressure[id] - backPressure[id]).toFixed(2)
                : '-'
          }}
        </td>
        <td class="text-center text-body-1 font-weight-bold text-white">{{ temperature[id] ?? '-' }}</td>
      </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup>
import { useSSEStore } from '@/stores/sseStore'
import { storeToRefs } from 'pinia'
import {computed} from "vue";

// Pinia 상태 가져오기
const {
  valveStatus,
  frontPressure,
  backPressure,
  temperature,
} = storeToRefs(useSSEStore())

</script>

<style scoped>
.table-factory {
  max-width: 600px;
  margin: auto;
  background-color: #222242;
  //border-radius: 8px;
  overflow: hidden;
  padding: 8px;
  margin-top: 0px;
}
</style>
