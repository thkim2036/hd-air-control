<template>
  <div>
    <v-snackbar
        v-for="(alert, index) in alerts"
        :key="alert.id"
        v-model="alert.show"
        location="bottom right"
        color="red"
        elevation="6"
        :timeout="500000"
        @click="handleAlertClick"
        :style="{
          position: 'fixed',
          right: '16px',
          bottom: `${16 + index * 60}px`,
          opacity: 1 - index * 0.15
        }"
    >
      ⚠️ [{{ alert.sn }}]  {{ alert.text }}

      <template #actions>
        <v-btn icon @click.stop="removeAlert(alert.id)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>


<script setup>
import { reactive, watch } from 'vue'
import { useSSEStore } from '@/stores/sseStore'
import { useRouter } from 'vue-router'

const sseStore = useSSEStore()
const router = useRouter()

// 최대 5개의 알람 관리용 배열
const alerts = reactive([])

// 알람 종류별 메시지 매핑
const alarmMessages = {
  byPassOpenAlarm: '현장 수동밸브 확인',
  valveFaultAlarm: '밸브 오작동',
  leakAlarm: 'LEAK 발생',
  compAlarm: '콤프실 저압',
}

// 'push' 상태가 하나라도 감지되면 알림 추가
watch(
    () => sseStore.byPassOpenAlarm,
    val => {
      Object.entries(val)
          .filter(([, status]) => status === 'push')
          .forEach(([factory]) => {
            addAlert(`${factory} 공장 - ${alarmMessages.byPassOpenAlarm}`)
          })
    },
    { deep: true }
)
watch(
    () => sseStore.valveFaultAlarm,
    val => {
      Object.entries(val)
          .filter(([, status]) => status === 'push')
          .forEach(([factory]) => {
            addAlert(`${factory} 공장 - ${alarmMessages.valveFaultAlarm}`)
          })
    },
    { deep: true }
)
watch(
    () => sseStore.leakAlarm,
    val => {
      Object.entries(val)
          .filter(([, status]) => status === 'push')
          .forEach(([factory]) => {
            addAlert(`${factory} 공장 - ${alarmMessages.leakAlarm}`)
          })
    },
    { deep: true }
)
watch(
    () => sseStore.compAlarm,
    val => {
      Object.entries(val)
          .filter(([, status]) => status === 'push')
          .forEach(([factory]) => {
            addAlert(`${factory} 콤프실 - ${alarmMessages.compAlarm}`)
          })
    },
    { deep: true }
)

let cnt = 0
function addAlert(message) {
  cnt += 1
  const alert = {
    sn : `${cnt}`,
    id: `${Date.now()}-${cnt}`,
    text: message,
    show: true
  }
  alerts.unshift(alert)

  if (alerts.length > 5) {
    alerts.pop()
  }

  // 소리 재생
  const alertSound = new Audio('/sounds/sound-02.mp3')
  alertSound.play().catch(err => console.warn('🔇 소리 재생 실패:', err))
}

function removeAlert(id) {
  const idx = alerts.findIndex(a => a.id === id)
  if (idx !== -1) {
    alerts.splice(idx, 1)
  }
}

// 스낵바 클릭 시 알람 히스토리 페이지로 이동
function handleAlertClick() {
  alerts.forEach(alert => alert.show = false)
  router.push({name: 'AlarmHistory'})
}
</script>
