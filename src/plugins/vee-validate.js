import {
    Field,
    Form,
    ErrorMessage,
    defineRule,
    configure,
} from 'vee-validate'

import {
    required,
    email,
    min,
    max,
    confirmed,
    numeric,
} from '@vee-validate/rules'

import { localize } from '@vee-validate/i18n'

// ✅ 유효성 검사 규칙 등록
defineRule('required', required)
defineRule('email', email)
defineRule('min', min)
defineRule('max', max)
defineRule('confirmed', confirmed)
defineRule('numeric', numeric)

// ✅ 메시지 설정
configure({
    generateMessage: localize('ko', {
        messages: {
            required: '{field}를 입력해주세요.',
            email: '유효한 이메일을 입력하세요.',
            min: '{field}는 최소 {min}자 이상이어야 합니다.',
            max: '{field}는 최대 {max}자까지 입력 가능합니다.',
            confirmed: '비밀번호가 일치하지 않습니다.',
            numeric: '{field}는 숫자만 입력 가능합니다.',
        },
    }),
    validateOnInput: true,
})

// ✅ 컴포넌트 export (main.js에서 전역 등록하거나 직접 import)
export { Field, Form, ErrorMessage }
