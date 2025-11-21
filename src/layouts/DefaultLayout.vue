<template>
  <v-app>
    <!-- 좌측 네비게이션 드로어 -->
    <v-navigation-drawer
        v-model="drawer"
        :style="`background: url('/images/sidebar.png') no-repeat center center; background-size: cover;`"
        app
    >
      <div class="overlay" />

      <!-- 로고 영역 -->
      <v-list-item style="background-color: white; height: 63px">
        <v-list-item class="d-flex justify-center">
          <router-link to="/main">
            <v-img
                :src="logoHd"
                width="165px"
                style="cursor: pointer"
            />
          </router-link>
        </v-list-item>
      </v-list-item>

      <v-divider />

      <!-- 메뉴 리스트 -->
      <v-list class="text-white">
        <v-list-item
            v-for="item in items"
            :key="item.title"
            :to="item.to"
            active-class="bg_color03"
            link
        >
          <template #prepend>
            <v-icon class="ma-3">{{ item.icon }}</v-icon>
            <v-list-item-title class="text-h7">{{ item.title }}</v-list-item-title>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar v-if="drawer" app color="bg_color01">
      <div class="text-h5 ml-5" style="font-weight: bold">압축 에어 제어 시스템</div>
      <v-spacer />

      <div class="d-flex align-center">
        <v-tooltip text="전체 화면" location="bottom" content-class="custom-tooltip">
          <template #activator="{ props }">
            <v-app-bar-nav-icon v-bind="props" icon="mdi-fullscreen" @click="onToggleDrawer" />
          </template>
        </v-tooltip>

        <span class="ml-2 mr-2 text-subtitle-1 font-weight-bold">{{ userNm }}({{ userId }})</span>

        <v-tooltip text="로그아웃" location="bottom" content-class="custom-tooltip">
          <template #activator="{ props }">
            <v-app-bar-nav-icon v-bind="props" icon="mdi-logout-variant" class="mr-5" @click="logout" />
          </template>
        </v-tooltip>
      </div>
    </v-app-bar>

    <!-- nav-icon 버튼만: drawer 닫힘일 때 -->
    <v-app-bar-nav-icon
        v-else
        class="icon-only-btn"
        icon="mdi-fullscreen-exit"
        @click="onToggleDrawer"
    />

    <!-- 메인 컨텐츠 -->
    <v-main>
      <v-container fluid class="pa-1">
        <router-view :drawer-open="drawer" />
      </v-container>
    </v-main>

    <AlarmMessage />
  </v-app>
</template>

<script>
import { emitter } from '@/plugins/eventBus'
import { useAuthStore } from '@/stores/authStore'
import { useSSEStore } from '@/stores/sseStore'
import { useSSE } from '@/composables/useSSE'
import { useUserStore } from '@/stores/user'

import logoHd from '@/assets/logo-hd.png'
import WeatherCard from '@/components/WeatherCard.vue'
import AlarmMessage from '@/components/AlarmMessage.vue'

export default {
  name: 'DefaultLayout',
  components: { WeatherCard, AlarmMessage },
  data() {
    return {
      drawer: true,
      userInfo: false,
      logoHd,
      items: [
        { title: '3D 모니터링', icon: 'mdi-rotate-3d', to: '/main' },
        { title: '밸브 제어 현황', icon: 'mdi-calendar-month', to: '/daily-valve-control' },
        { title: '공장별 가동 현황', icon: 'mdi-air-purifier', to: '/air-status' },
        { title: '공장별 압력/온도 추이', icon: 'mdi-chart-bar', to: '/trend-graph' },
        { title: '경보내역', icon: 'mdi-alarm-light-outline', to: '/alarm-history' },
        { title: 'SSE DATA 확인', icon: 'mdi-alarm-light-outline', to: '/sse-data-check' },
      ],
    }
  },
  computed: {
    userId() {
      const auth = useUserStore()
      return auth.userId || ''
    },
    userNm() {
      const auth = useUserStore()
      return decodeURIComponent(auth.userNm || '')
    }
  },
  methods: {
    onToggleDrawer() {
      this.drawer = !this.drawer

      if (!this.drawer) {
        // 닫힐 때 전체화면 진입
        document.documentElement.requestFullscreen?.().catch(() => {})
      } else {
        // 열릴 때 전체화면 해제
        document.exitFullscreen?.().catch(() => {})
      }

      emitter.emit('drawer-toggled', this.drawer)
    },

    // 로그아웃
    logout() {
      const userStore = useUserStore()
      const auth = useAuthStore()
      const sse = useSSE()
      const sseStore = useSSEStore()

      sse.disconnect()
      userStore.clearUser()
      auth.logout()
      sseStore.$reset()

      // this.$router.push('/')
      window.location.href = 'https://gate.hd.com/login'
    },
  },
}
</script>

<style scoped>
.overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.7);
}

.bg_color03 {
  background-color: #454675 !important;
  color: white     !important;
}

/* drawer 닫힘 시 보이는 nav-icon 버튼만 (원형 + 절대 위치) */
.icon-only-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 48px;
  height: 48px;
  min-width: 0;
  padding: 0;
  border-radius: 50%;
  background-color: #222242;
  color: white !important;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.nav-icon-btn .v-icon {
  margin: 0 !important;
}

/* tool tip */
::v-deep .custom-tooltip {
  background-color: #222242 !important;
  color: #ffffff     !important;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.user-info-icon {
  color: white;
  background-color: #7F80A8;  /* 원하는 배경색 */
  cursor: pointer;            /* 손가락 커서 */
  border-radius: 4px;         /* 모서리 둥글게 (선택) */
  padding: 4px;               /* 아이콘 주변 여백 (선택) */
}
</style>
