<template>

  <v-snackbar
      v-model="show"
      :timeout="5000"
      location="bottom right"
      color="red"
      elevation="6"
      @click="handleAlertClick"
  >
    ⚠️ {{ alarmText }}

    <template #actions >
      <v-btn icon @click.stop="show = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>

  <!-- 예시: 버튼 클릭 시 알림 표시 -->
  <v-btn
      @click="triggerAlert"
      style="position: fixed; bottom: 10px; right: 10px; width: 100px;"
      elevation="2"
  >
    알람 테스트
  </v-btn>
</template>

<script setup>
import {computed, ref} from 'vue'
import { useSSEStore } from '@/stores/sseStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const sseStore = useSSEStore()
const show = ref(false)
const alarmText = ref('')

const alarmMessages = [
  'LEAK 발생',
  '밸브 오작동',
  '현장 수동 밸브 확인'
]

// 액션 실행 전후를 훅으로 감지
sseStore.$onAction(({ name, after, onError }) => {

  if (name === 'updateAlarmData') {
    after(() => {
      const storeAlarm = sseStore.updateAlarmData || []
      triggerAlert(storeAlarm)
    })
    onError((err) => {
      console.error('❌ setweather 실행 중 오류:', err)
    })
  }
})


const alertSound = new Audio('/sounds/sound-02.mp3')

function triggerAlert(storeAlarm) {
  const idx = Math.floor(Math.random() * alarmMessages.length)
  alarmText.value = alarmMessages[idx]

  show.value = true
  alertSound.play().catch(err => {
    console.warn('🔇 소리 재생 실패:', err)
  })

  // 5초 후 자동 닫기
  setTimeout(() => {
    show.value = false
  }, 5000)
}

function handleAlertClick() {
  router.push('/alarm-history')
}
</script>
