// src/config/apiConfig.js
const apiHost = import.meta.env.VITE_API_HOST
const contextPath = import.meta.env.VITE_SYSTEM_CONTEXT

export const baseURL = `${apiHost}${contextPath}`
