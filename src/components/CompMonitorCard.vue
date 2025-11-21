<template>
  <vue-draggable-resizable
      :x="item.x"
      :y="item.y"
      :w="220"
      :h="93"
      :parent="true"
      :active="false"
      :draggable="false"
      :resizable="false"
      @dragstop="e => $emit('dragstop', e)"
  >
    <v-card class="pa-2 comp-monitor-card">
      <div class="text-center text-h6 font-weight-bold text-white">{{ item.title }}</div>
      <v-table density="compact" class="mt-2">
        <tr>
          <td class="label-cell text-center text-subtitle-1 font-weight-bold">압력(Kg/cm²)</td>
          <td
              class="value-cell text-center text-h6 font-weight-black"
              :class="getPressureColor(compPressureValue)"
          >
            {{ compPressureValue }}
          </td>
        </tr>
      </v-table>
    </v-card>
  </vue-draggable-resizable>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { useSSEStore } from '@/stores/sseStore'
import { storeToRefs } from 'pinia'
import VueDraggableResizable from 'vue3-draggable-resizable'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

const props = defineProps({ item: Object })

const {
  compPressure,
  expectedValue1C,
  expectedValue3C,
} = storeToRefs(useSSEStore())

const compPressureValue = computed(() => {
  const key = compPressure.value[props.item.id] ?? '-'
  return key
})

// 압력 값에 따른 색상변경
function getPressureColor(value) {
  if (value <= 7.5) return 'bg-blue'
  return '#FFFFFF'
}
</script>

<style scoped>
.comp-monitor-card {
  background-color: #0D47A1;
  color: #FFFFFF;
  border-radius: 6px;
  box-shadow: 0 0 6px rgba(0,0,0,0.15);
}

.label-cell {
  width: 60%;
  height: 35px;
  border: 1px solid #1E88E5;
  background-color: #FFFFFF;
  color: #000000;
}

.value-cell {
  width: 55%;
  border: 1px solid #1E88E5;
  background-color: #FFFFFF;
  color: #000000;
  transition: background-color 0.3s ease;
}
</style>
