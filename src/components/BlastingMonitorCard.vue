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
    <v-card class="pa-2 blasting-monitor-card" >
      <div class="text-center text-h6 font-weight-bold text-white">{{ item.title }}</div>

      <!-- ✅ 로딩바 -->
      <v-progress-linear
          v-if="isLoading"
          indeterminate
          height="2"
          color="white"
          class="mb-2"
      />

      <v-table class="mt-2" density="compact">
        <tbody>
        <tr>
          <td class="label-cell text-subtitle-2"><strong>운전모드</strong></td>
          <td class="value-cell text-left text-body-1 font-weight-bold">{{ driveModeValue }}</td>
        </tr>
<!--        <tr>
          <td class="label-cell text-subtitle-2"><strong>작업 스케줄</strong></td>
          <td class="value-cell">
            <div class="d-flex justify-space-between align-center btn-group" style="width: 100%;">
              <span class="text-left text-body-1 font-weight-bold text-red">{{ scheduleModeValue }}</span>

              &lt;!&ndash; 버튼 그룹 (툴팁 포함) &ndash;&gt;
              <div class="d-flex align-right">
                <v-tooltip text="사용">
                  <template #activator="{ props }">
                    <v-btn
                        icon
                        variant="text"
                        color="#27ae60"
                        size="x-small"
                        v-bind="props"
                        @click="setScheduleMode('사용')"
                    >
                      <v-icon size="25">mdi-check-circle</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip text="미사용">
                  <template #activator="{ props }">
                    <v-btn
                        icon
                        variant="text"
                        color="#27ae60"
                        size="x-small"
                        v-bind="props"
                        @click="setScheduleMode('미사용')"
                    >
                      <v-icon size="25">mdi-cancel</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>

            </div>
          </td>
        </tr>-->

        <tr>
          <td class="label-cell text-subtitle-2"><strong>밸브상태</strong></td>
          <td class="value-cell">
            <div class="d-flex justify-space-between align-center btn-group" style="width: 100%;">
              <span class="text-left text-body-1 font-weight-bold text-white">{{ valveStatusValue }}</span>

              <!-- 버튼 그룹 (툴팁 포함) -->
              <div class="d-flex align-right">
                <v-tooltip text="ON" location="bottom" content-class="custom-tooltip">
                  <template #activator="{ props }">
                    <v-btn
                        v-if="isManager"
                        icon
                        variant="text"
                        :color="valveStatusValue === 'ON' ? 'green' : 'grey'"
                        size="x-small"
                        v-bind="props"
                        @click="openDialog('ON')"
                    >
                      <v-icon size="25">mdi-check-circle</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>

                <v-tooltip text="OFF" location="bottom" content-class="custom-tooltip">
                  <template #activator="{ props }">
                    <v-btn
                        v-if="isManager"
                        icon
                        variant="text"
                        :color="valveStatusValue === 'OFF' ? 'green' : 'grey'"
                        size="x-small"
                        v-bind="props"
                        @click="openDialog('OFF')"
                    >
                      <v-icon size="25">mdi-cancel</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td class="label-cell text-subtitle-2"><strong>전단압력(Kg/cm²)</strong></td>
          <td class="value-cell font-weight-bold">
            <div class="d-flex justify-space-between align-center" style="width: 100%;">
              <span class="text-h6 font-weight-bold">{{ frontPressureValue }}</span>
              <!--<span class="text-subtitle-2">(Kg/cm²)</span>-->
            </div>
          </td>
        </tr>
        <tr>
          <td class="label-cell text-subtitle-2"><strong>후단압력(Kg/cm²)</strong></td>
          <td class="value-cell font-weight-bold">
            <div class="d-flex justify-space-between align-center" style="width: 100%;">
              <span class="text-h6 font-weight-bold">{{ backPressureValue }}</span>
            </div>
          </td>
        </tr>
        <tr>
          <td class="label-cell text-subtitle-2"><strong>압력차이(Kg/cm²)</strong></td>
          <td class="value-cell font-weight-bold">
            <div class="d-flex justify-space-between align-center" style="width: 100%;">
              <span class="text-h6 font-weight-bold" style="color: #A8A6DB">{{ pressureDifference }}</span>
            </div>
          </td>
        </tr>
        <tr>
          <td class="label-cell text-subtitle-2"><strong>온도(℃)</strong></td>
          <td class="value-cell text-left text-h6 font-weight-bold">
            <div class="d-flex justify-space-between align-center" style="width: 100%;">
              <span class="text-h6 font-weight-bold">{{ temperatureValue }}</span>
              <!--<span class="text-subtitle-2">(℃)</span>-->
            </div>
          </td>

        </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- ✅ 밸브 제어 확인 다이얼로그 -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">✅ 밸브 제어 확인</v-card-title>
        <v-card-text>
          {{ key }} 공장 밸브를 {{ dialogStatus }} 하시겠습니까?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="dialog = false">취소</v-btn>
          <v-btn color="primary" text @click="confirmToggle(dialogStatus)">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ✅ 결과 메시지 다이얼로그 -->
    <v-dialog v-model="resultDialog" max-width="300" persistent>
      <v-card class="pa-4 text-center">
        <v-card-text class="text-body-1 font-weight-bold">
          {{ resultMessage }}
        </v-card-text>
      </v-card>
    </v-dialog>
  </vue-draggable-resizable>
</template>

<script setup>
import {defineProps, computed, ref} from 'vue'
import { useSSEStore } from '@/stores/sseStore'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { baseURL } from '@/config/apiConfig'
import VueDraggableResizable from 'vue3-draggable-resizable'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

const userStore = useUserStore()

// const isManager = ref('true')
const isManager = computed(() =>
    userStore.userAuth === 'true' || userStore.userAuth === true
)

const props = defineProps({ item: Object })

const sseStore = useSSEStore()
const {
  driveMode,
  scheduleMode,
  valveStatus,
  frontPressure,
  backPressure,
  temperature,
} = storeToRefs(sseStore)

const isLoading = ref(false)              // ✅ 로딩 상태
const resultDialog = ref(false)           // ✅ 결과 메시지 다이얼로그
const resultMessage = ref('')             // ✅ 결과 메시지
const dialog = ref(false)           // ✅ 확인 다이얼로그
const dialogStatus = ref('')        // ✅ ON / OFF 값 저장
const key = computed(() => props.item.title) // item.title → 예: '1B', '2B'

// 각 항목에 대한 매핑 값 computed
const driveModeValue = computed(() => driveMode.value[key.value] ?? '-')
const scheduleModeValue = computed(() => scheduleMode.value[key.value] ?? '-')
const valveStatusValue = computed(() => valveStatus.value[key.value] ?? '-')
const frontPressureValue = computed(() => frontPressure.value[key.value] ?? '-')
const backPressureValue = computed(() => backPressure.value[key.value] ?? '-')
const temperatureValue = computed(() => temperature.value[key.value] ?? '-')

// 전/후단 압력차
const pressureDifference = computed(() => {
  const front = parseFloat(frontPressureValue.value)
  const back = parseFloat(backPressureValue.value)

  if (isNaN(front) || isNaN(back)) return '-'
  return (front - back).toFixed(2)
})


const { writeCommands } = sseStore

function openDialog(status) {      // ✅ 버튼 클릭 시 다이얼로그 열기
  if (valveStatus.value[key.value] === status || isLoading.value) return
  dialogStatus.value = status
  dialog.value = true
}

async function confirmToggle(status) {
  dialog.value = false
  const cmdId = status === 'ON'
      ? writeCommands[key.value]?.onWrite
      : writeCommands[key.value]?.offWrite

  if (!cmdId) {
    console.warn('⚠️ commandId가 없습니다:', cmdId, status)
    return
  }

  try {
    isLoading.value = true
    await axios.get(`${baseURL}/api/commands/force/${cmdId}`)

    const maxWait = 10000
    const interval = 1000
    const start = Date.now()

    const waitForUpdate = new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (valveStatus.value[key.value] === status) {
          clearInterval(timer)
          resolve()
        } else if (Date.now() - start > maxWait) {
          clearInterval(timer)
          reject(new Error('⏰ 상태 변경 시간 초과'))
        }
      }, interval)
    })

    await waitForUpdate
    showResultDialog(`✅ ${key.value} 밸브 ${status} 완료`)
  } catch (err) {
    showResultDialog(`❌ ${key.value} 밸브 ${status} 실패`)
    console.error('❌ 밸브 제어 실패 또는 타임아웃:', err.message)
  } finally {
    isLoading.value = false
  }
}

// ✅ 추가: 결과 메시지 다이얼로그 호출 함수
function showResultDialog(message) {
  resultMessage.value = message
  resultDialog.value = true
  setTimeout(() => {
    resultDialog.value = false
  }, 1500)
}

</script>

<style scoped>
.blasting-monitor-card {
  background-color: #222242;
  color: #4E342E;
  border-radius: 6px;
  box-shadow: 0 0 6px rgba(0,0,0,0.2);
}

.label-cell {
  width: 53%;
  text-align: center;
  border: 1px solid #222242;
  background-color: #37385F;
  color: #ffffff;
}

.value-cell {
  width: 47%;
  border: 1px solid #222242;
  background-color: #7F80A8;
  color: #ffffff;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

/* tool tip */
::v-deep .custom-tooltip {
  background-color: #222242 !important;
  color: #ffffff     !important;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}
</style>