<template>
  <v-table class="custom-table" density="compact" >
    <tbody>
    <tr>
      <td class="label-cell text-subtitle-1 text-white"><strong>공장</strong></td>
      <td class="value-cell text-left text-h6 font-weight-bold text-white">{{ factoryId }}</td>
    </tr>

    <tr>
      <td class="label-cell text-subtitle-1 text-white"><strong>운전 모드</strong></td>
      <td class="value-cell text-left text-h6 font-weight-bold text-white">{{ driveMode[factoryId] }}</td>
    </tr>

<!--    <tr>
      <td class="label-cell text-subtitle-1 text-white"><strong>작업 스케줄</strong></td>
      <td class="value-cell">
        <div class="d-flex justify-space-between align-center btn-group" style="width: 100%;">
          <span class="text-left text-h6 font-weight-bold text-red">{{ scheduleMode[factoryId] }}</span>
          <div class="d-flex align-center" style="gap: 4px;">
            <v-btn color="green" variant="flat" size="x-small" @click="scheduleMode[factoryId]='사용'">사용</v-btn>
            <v-btn color="grey lighten-1" size="x-small" @click="scheduleMode[factoryId]='미사용'">미사용</v-btn>
          </div>
        </div>
      </td>
    </tr>-->

    <tr>
      <td class="label-cell text-subtitle-1 text-white"><strong>밸브 상태</strong></td>
      <td class="value-cell">
        <div class="d-flex justify-space-between align-center btn-group" style="width: 100%;">
          <span class="text-left text-h6 font-weight-bold text-white">{{ valveStatus[factoryId] }}</span>
          <div class="d-flex align-center" style="gap: 4px;">
            <v-btn
                v-if="isManager"
                :color="valveStatus[factoryId] === 'ON' ? 'green' : 'grey'
                + (isLoading ? ' lighten-1' : '')"
                variant="flat"
                size="x-small"
                :loading="isLoading"
                :disabled="isLoading"
                @click="openDialog('ON')"
            >ON</v-btn>

            <v-btn
                v-if="isManager"
                :color="valveStatus[factoryId] === 'OFF' ? 'green' : 'grey'
                + (isLoading ? ' lighten-1' : '')"
                variant="flat"
                size="x-small"
                :loading="isLoading"
                :disabled="isLoading"
                @click="openDialog('OFF')"
            >OFF</v-btn>
          </div>
        </div>
        <v-progress-linear
            v-if="isLoading"
            indeterminate
            height="2"
            class="mt-2"
            color="white"
        />
      </td>
    </tr>

    <tr>
      <td class="label-cell text-subtitle-1 text-white"><strong>전단 압력<br><small>(Kg/cm²)</small></strong></td>
      <td class="value-cell text-left text-h6 font-weight-bold text-white">{{ frontPressure[factoryId] ?? '-' }}</td>
    </tr>
    <tr>
      <td class="label-cell text-subtitle-1 text-white"><strong>후단 압력<br><small>(Kg/cm²)</small></strong></td>
      <td class="value-cell text-left text-h6 font-weight-bold text-white">{{ backPressure[factoryId] ?? '-' }}</td>
    </tr>

    <tr>
      <td class="label-cell text-subtitle-1 text-white"><strong>압력 차이<br><small>(Kg/cm²)</small></strong></td>
      <td class="value-cell text-left text-h6 font-weight-bold" style="color: #A8A6DB">
        {{
          frontPressure[factoryId] !== undefined
          && backPressure[factoryId] !== undefined
              ? (frontPressure[factoryId] - backPressure[factoryId]).toFixed(2)
              : '-'
        }}
      </td>
    </tr>

    <tr>
      <td class="label-cell text-subtitle-1 text-white"><strong>온도<small>(℃)</small></strong></td>
      <td class="value-cell text-left text-h6 font-weight-bold text-white">{{ temperature[factoryId] ?? '-' }}</td>
    </tr>
    </tbody>

  </v-table>

  <!-- ✅ v-dialog -->
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        ✅ 밸브 제어 확인
      </v-card-title>
      <v-card-text>
        {{ factoryId }} 공장 밸브를 {{ dialogStatus }} 하시겠습니까?
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text @click="dialog = false">취소</v-btn>
        <v-btn color="primary" text @click="confirmToggle(dialogStatus)">확인</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ✅ 결과 메시지용 v-dialog -->
  <v-dialog v-model="resultDialog" max-width="300" persistent>
    <v-card class="pa-4 text-center">
      <v-card-text class="text-body-1 font-weight-bold">
        {{ resultMessage }}
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSSEStore } from '@/stores/sseStore'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { baseURL } from '@/config/apiConfig'

const userStore = useUserStore()
// const isManager = ref('ture')
const isManager = computed(() =>
    userStore.userAuth === 'true' || userStore.userAuth === true
)

const isLoading = ref(false)

const props = defineProps({
  factoryId: {
    type: String,
    required: true,
  },
})

const sseStore = useSSEStore()
const {
  driveMode,
  valveStatus,
  frontPressure,
  backPressure,
  temperature,
} = storeToRefs(sseStore)

const dialog = ref(false)
const dialogStatus = ref('')
const resultDialog = ref(false)
const resultMessage = ref('')

function openDialog(status) {
  if (valveStatus.value[props.factoryId] === status || isLoading.value) return
  dialogStatus.value = status
  dialog.value = true
}

function showResultDialog(message) {
  resultMessage.value = message
  resultDialog.value = true
  setTimeout(() => {
    resultDialog.value = false
  }, 1500)
}

async function confirmToggle(status) {
  dialog.value = false

  if (valveStatus.value[props.factoryId] === status || isLoading.value) return

  const cmdId = status === 'ON'
      ? sseStore.writeCommands[props.factoryId]?.onWrite
      : sseStore.writeCommands[props.factoryId]?.offWrite

  // console.log(`✅ force-command 요청 전송: ${cmdId}`)

  try {
    isLoading.value = true
    await axios.get(`${baseURL}/api/commands/force/${cmdId}`)

    // ✅ Polling 방식: 일정 간격으로 SSE 상태 확인
    const maxWait = 10000 // 최대 대기 시간 (ms)
    const interval = 1000 // 확인 주기
    const start = Date.now()

    const waitForUpdate = new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (valveStatus.value[props.factoryId] === status) {
          clearInterval(timer)
          resolve()
        } else if (Date.now() - start > maxWait) {
          clearInterval(timer)
          reject(new Error('⏰ 상태 변경 시간 초과'))
        }
      }, interval)
    })

    await waitForUpdate
    showResultDialog(`✅ ${props.factoryId} 밸브 ${status} 완료`)
    console.log(`✅ 밸브 상태 업데이트 확인 완료: ${valveStatus.value[props.factoryId]}`)
  } catch (err) {
    showResultDialog(`❌ ${props.factoryId} 밸브 ${status} 실패`)
    console.error('❌ 밸브 제어 실패 또는 타임아웃:', err.message)
  } finally {
    isLoading.value = false
  }
}

</script>

<style scoped>
.custom-table td {
  background-color: #454675;
  padding: 5px 5px !important;
  vertical-align: middle;
}

.btn-group {
  gap: 3px;
  height: 40px;
}

.btn-group :deep(.v-btn) {
  font-size: 13px;
  min-width: 42px;
}

.label-cell {
  width: 40%;
  white-space: nowrap;
}

.value-cell {
  width: 60%;
}

</style>
