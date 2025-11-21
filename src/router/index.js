// import { createRouter, createWebHistory } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    redirect: '/main',
  },
  // {
  //   path: '/',
  //   redirect: '/sso',
  // },
  {
    path: '/sso',
    name: 'sso',
    component: () => import('@/views/sso.vue'),
    meta: { layout: 'none' },  // 콜백 페이지도 예외 처리
  },
  {
    path: '/',
    children: [
      {
        path: 'main',
        name: 'main',
        component: () => import('@/views/Main.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'daily-valve-control',
        name: 'DailyValveControl',
        component: () => import('@/views/DailyValveControl.vue'),
      },
      {
        path: 'air-status',
        name: 'AirStatus',
        component: () => import('@/views/AirStatus.vue'),
      },
      {
        path: 'trend-graph',
        name: 'TrendGraph',
        component: () => import('@/views/TrendGraph.vue'),
      },
      {
        path: 'alarm-history',
        name: 'AlarmHistory',
        component: () => import('@/views/AlarmHistory.vue'),
      },
      {
        path: 'sse-data-check',
        name: 'SseDataCheck',
        component: () => import('@/views/SseDataCheck.vue'),
      },
    ],
  },
]

const router = createRouter({
  // history: createWebHistory(),  // 히스토리 모드
  history: createWebHashHistory(), // 해시 모드로 변경
  routes,
})

// 전역 가드 설정
// router.beforeEach((to, from, next) => {
//   // console.log('##### router.beforeEach 진입 > ', to, from, next)
//
//   const authStore = useAuthStore()
//
//   // 로그인/콜백 페이지는 그냥 통과
//   if (to.meta.layout === 'none') {
//     return next()
//   }
//
//   if (!authStore.isAuthenticated) {
//     window.location.href = 'https://gate.hd.com/login'
//   } else {
//     next()
//   }
// })

export default router
