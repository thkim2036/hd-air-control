// src/stores/authStore.js
import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/token'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: !!getToken(),
    }),
    actions: {
        setAuthenticated(value) {
            // console.log('##### useAuthStore > actions > setAuthenticated(value)......', value)
            this.isAuthenticated = value
        },
        logout() {
            removeToken()
            this.setAuthenticated(false)
        },
    },
})
