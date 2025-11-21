<template>
  <VDialog
    v-if="showDialog"
    v-model="showDialog"
    scrollable
    eager
    persistent
    width="70%"
  >
    <VCard
      height="70vh"
      width="100%"
    >
      <VToolbar color="primary">
        <VToolbarTitle class="white--text">
          미리보기
        </VToolbarTitle>
        <VSpacer />
        <VBtn
          icon
          color="white"
          @click="showDialog = false"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VCardText class="pa-5 pt-9 pb-8">
        <div
          id="ck-preview"
          class="ck ck-content"
          v-html="data"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch, nextTick, getCurrentInstance } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'

const props = defineProps({
  toggle: {
    type: Boolean,
    default: false,
  },
  data: {
    type: String,
    default: '',
  },
})

const vm = getCurrentInstance().proxy

const showDialog = ref(false)

watch(() => props.toggle, newValue => {
  if (newValue !== null) {
    if (props.data.length === 0) {
      vm.$swal('작성된 내용이 없습니다.')
      
      return
    }
    
    showDialog.value = true

    nextTick(() => {
      if (props.data.length > 0) {
        const el = document.getElementById('ck-preview')

        el.querySelectorAll('pre code').forEach(el => {
          Prism.highlightElement(el)
        })
      }
    })
  }
})
</script>