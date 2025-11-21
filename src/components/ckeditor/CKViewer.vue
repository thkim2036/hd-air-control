<template>
  <div
    id="ck-viewer"
    class="ck ck-content"
    :style="`height: ${height};`"
    v-html="initialValue"
  />
</template>

<script setup>
import { onMounted, nextTick } from 'vue'
import '@/styles/ckEditorStyles.scss'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'

const props = defineProps({
  height: {
    type: String,
    default: '200px',
  },
  initialValue: {
    type: String,
    default: '',
  },
})

const highlightCode = () => {
  nextTick(() => {
    const el = document.getElementById('ck-viewer')
    if (el) {
      el.querySelectorAll('pre code').forEach(el => {
        Prism.highlightElement(el)
      })
    }
  })
}

watch(() => props.initialValue, () => {
  highlightCode()
})

onMounted(() => {
  highlightCode()
})
</script>