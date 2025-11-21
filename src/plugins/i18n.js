import { createI18n } from 'vue-i18n'

const messages = {
  en: { message: { hello: 'Hello Air Control' } },
  ko: { message: { hello: '안녕하세요 에어컨트롤' } },
}

const i18n = createI18n({
  locale: 'ko',
  fallbackLocale: 'en',
  messages,
})

export default i18n
