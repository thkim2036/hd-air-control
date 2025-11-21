<template>
  <div />
</template>

<script setup>
import { loginSso } from '@/api/sso'
import { getToken } from '@/utils/token'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/authStore'
import { onMounted } from 'vue'

const router = useRouter()
const route = useRoute()
// const userStore = useUserStore()
const authStore = useAuthStore()

onMounted(() => {
  loginSso().then(() => {
    let token = getToken()
    if (!token) {
      console.log('❌ token 없음 → SSO 게이트 리다이렉트')
      window.location.href = 'https://gate.hd.com/login'
      return
    }

    // ✅ 사용자 인증 상태 갱신
    authStore.setAuthenticated(true)

    // ✅ 사용자 정보 호출
    // userStore.setUserInfo()

    // console.log('✅ 메인 화면으로 이동: /main')
    router.replace('/main')

    // if (route.query.return_url) {
    //   console.log('##### sso.vue > route.query.return_url ', route.query.return_url)
    //   router.replace(route.query.return_url)
    //   // route.query.return_url = null
    // } else {
    //   router.replace('/')
    // }

  }).catch(reject => {
    console.log(`##### SSO 통합인증 API Error : ${reject}`)
    alert('SSO 서버와의 통신이 실패했습니다. 관리자에게 문의해주세요.')
    router.replace('/')
  })
})
</script>
<!--<route lang="yaml">-->
<!--  meta:-->
<!--    noAuth: true-->
<!--</route>-->
