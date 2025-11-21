// src/stores/user.js
import { defineStore } from 'pinia'
import localStore from '@/utils/localstore'   // ✅ util import

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStore.get('token') || null,
    userId: localStore.get('userId') || null,
    userNm: localStore.get('userNm') || null,
    userAuth: localStore.get('userAuth') || null,
  }),
  actions: {
    setUserToken(token) {
      this.token = token
      localStore.set('token', token)   // ✅ localStorage 동기화
    },
    setUserId(id) {
      this.userId = id
      localStore.set('userId', id)     // ✅ localStorage 동기화
    },
    setUserNm(nm) {
      this.userNm = nm
      localStore.set('userNm', nm)     // ✅ localStorage 동기화
    },
    setUserAuth(auth) {
      this.userAuth = auth
      localStore.set('userAuth', auth) // ✅ localStorage 동기화
    },
    clearUser() {
      this.token = null
      this.userId = null
      this.userNm = null
      this.userAuth = null
      localStorage.clear()                // ✅ 전체 삭제
    },
  },
})
