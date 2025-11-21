import { defineStore } from 'pinia'

const url = import.meta.env.VITE_BASE_CONTEXT_PATH

export const useUrlStore = defineStore('url', {
  state: () => ({
    contextPath: url,
  }),
  actions: {
  },
})
