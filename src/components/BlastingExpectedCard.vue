<template>
  <vue-draggable-resizable
      :x="item.x"
      :y="item.y"
      :w="307"
      :h="274"
      :parent="true"
      :active="false"
      :draggable="false"
      :resizable="false"
      @dragstop="e => $emit('dragstop', e)"
  >
    <v-card class="pa-2 blasting-monitor-card">
      <div class="text-center text-h6 font-weight-bold text-white">{{ item.title }}</div>
      <v-table class="mt-2" density="compact">
        <tbody>
        <tr>
          <td class="label-cell text-subtitle-2"><strong>운전모드</strong></td>
          <td class="value-cell text-left text-body-1 font-weight-bold"></td>
        </tr>
<!--        <tr>
          <td class="label-cell text-subtitle-2"><strong>작업 스케줄</strong></td>
          <td class="value-cell">
            <div class="d-flex justify-space-between align-center btn-group" style="width: 100%;">
              <span class="text-left text-body-1 font-weight-bold text-red"></span>
                            <div class="d-flex align-center" style="gap: 4px;">
                              <v-btn color="grey lighten-1" size="x-small" @click="$emit('update:remoteMode', '미사용')">미사용</v-btn>
                              <v-btn color="green" variant="flat" size="x-small" @click="$emit('update:remoteMode', '사용')">사용</v-btn>
                            </div>
            </div>
          </td>
        </tr>-->
        <tr>
          <td class="label-cell text-subtitle-2"><strong>밸브상태</strong></td>
          <td class="value-cell">
            <div class="d-flex justify-space-between align-center btn-group" style="width: 100%;">
              <span class="text-left text-body-1 font-weight-bold text-red"></span>
              <!--              <div class="d-flex align-right" style="gap: 4px;">
                              <v-btn color="grey" variant="flat" size="x-small" >OFF</v-btn>
                              <v-btn color="green" variant="flat" size="x-small" >ON</v-btn>
                            </div>-->
            </div>
          </td>
        </tr>
        <tr>
          <td class="label-cell text-subtitle-2"><strong>전단압력(Kg/cm²)</strong></td>
          <td class="value-cell font-weight-bold">
            <div class="d-flex justify-space-between align-center" style="width: 100%;">
              <span class="text-h6 font-weight-bold" >0.0</span>
            </div>
          </td>
        </tr>

        <tr>
          <td class="label-cell text-subtitle-2"><strong>후단압력(Kg/cm²)</strong></td>
          <td class="value-cell font-weight-bold">
            <div class="d-flex justify-space-between align-center" style="width: 100%;">
              <span class="text-h6 font-weight-bold" >0.0</span>
            </div>
          </td>
        </tr>
        <tr>
          <td class="label-cell text-subtitle-2"><strong>압력차이(Kg/cm²)</strong></td>
          <td class="value-cell font-weight-bold">
            <div class="d-flex justify-space-between align-center" style="width: 100%;">
              <span class="text-h6 font-weight-bold">0.0</span>
            </div>
          </td>
        </tr>
        <tr>
          <td class="label-cell text-subtitle-2"><strong>온도(℃)</strong></td>
          <td class="value-cell text-left text-h6 font-weight-bold ">0.0</td>
        </tr>
        </tbody>
      </v-table>
    </v-card>
  </vue-draggable-resizable>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import VueDraggableResizable from 'vue3-draggable-resizable'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

const props = defineProps({
  item: Object,
  driveMode: String,
  remoteMode: String,
  valve: String,
})
const emit = defineEmits(['dragstop', 'update:remoteMode', 'update:valve'])
</script>

<style scoped>
.blasting-monitor-card {
  background-color: #263838;
  color: #ECEFF1;
  opacity: 0.95;
  border-radius: 6px;
  box-shadow: 0 0 8px rgba(0,0,0,0.3);
}

.label-cell {
  width: 53%;
  text-align: center;
  border: 1px solid #455A64;
  background-color: #37474F;
  color: #CFD8DC;
}

.value-cell {
  width: 47%;
  border: 1px solid #455A64;
  background-color: #546E7A;
  color: #ECEFF1;
}
</style>