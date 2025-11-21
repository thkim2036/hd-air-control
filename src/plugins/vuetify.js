// Styles
import '@mdi/font/css/materialdesignicons.css' // 머터리얼 아이콘
import 'vuetify/styles'                        // Vuetify 기본 스타일
import '@/styles/fonts.scss'                  // 커스텀 폰트

// Vuetify Core
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VDatePicker } from 'vuetify/labs/VDatePicker'
import DateFnsAdapter from '@date-io/date-fns' // ✅ 어댑터 import
import { ko } from 'date-fns/locale'
const dateAdapter = new DateFnsAdapter({ locale: ko })

export default createVuetify({
    components: {
        ...components,
        VDatePicker, // labs 컴포넌트 등록
    },
    directives,
    date: {
        adapter: dateAdapter, // ✅ 직접 어댑터 객체 전달
    },
    theme: {
        themes: {
            light: {
                dark: false,
                colors: {
                    bg_color01: '#222242',
                    bg_color02: '#37385F',
                    bg_color03: '#454675',
                    bg_color04: '#7F80A8',
                    bg_color05: '#A8A6DB',
                    // 필요 시 date-picker용 색상 추가 지정 가능
                },
            },
        },
    },
    defaults: {
        global: {
            style: {
                fontFamily: `'HD', 'Noto Sans KR', 'Roboto', sans-serif`,
            },
        },
    },
    display: {
        mobileBreakpoint: 'sm',
        thresholds: {
            xs: 600,
            sm: 960,
            md: 1280,
            lg: 1920,
            xl: 2560,
        },
    },
})
