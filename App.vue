<!-- App.vue -->
<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup>
import { onBeforeUnmount, watch, computed } from 'vue'
import { useSSE } from '@/composables/useSSE'
import { useAuthStore } from '@/stores/authStore'
import { useRoute } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const { connect, disconnect } = useSSE()
const auth = useAuthStore()
const route = useRoute()
const isMock = import.meta.env.VITE_USE_MOCK === 'true'

// SSO 로그인 성공 여부에 따라 SSE 연결/해제
watch(
    () => auth.isAuthenticated,
    (loggedIn) => {
      if (loggedIn) {
        console.log('✅ SSO 로그인 성공 → SSE 연결')
        connect()
      } else {
        // console.log('🔒 인증 없음 → SSE 연결 종료')
        // disconnect()

        console.log('🔒 인증 없이... → SSE 연결')
        connect()

        if(isMock){
          connect()
        }
      }
    },
    { immediate: true }
)

// 로그인 및 콜백 페이지 접근 시 세션 초기화 및 SSE 연결 해제
watch(
    () => route.meta.layout,
    (layoutMeta) => {
      if (layoutMeta === 'none') {
        console.log('🔁 로그인/콜백 페이지 접근 → 세션 초기화')
        auth.logout()
        disconnect()
      }
    },
    { immediate: true }
)

// ✅ 컴포넌트 해제 시 SSE 연결 종료
onBeforeUnmount(() => {
  disconnect()
})

const layout = computed(() =>
    route.meta.layout === 'none' ? 'div' : DefaultLayout
)
</script>
