<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCurrentInstance } from 'vue'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import notify from '@hiway/utils/notify'
import { getTodayNoticeList } from '@/api/notice'
import CKViewer from '@/components/ckeditor/CKViewer.vue'

defineOptions({
  name: 'notice',
})

const today = dayjs().format('YYYY-MM-DD')
const emit = defineEmits(['retrieve'])
const sysCode = import.meta.env.VITE_SYSTEM_CODE
const { t } = useI18n()
const vm = getCurrentInstance().proxy

// 각 공지사항 모달 열림 여부 (index 기준)
const noticeModal = ref([])
// 각 공지사항에 대해 '오늘 하루 보지 않기' 체크 여부 (id 기반 Map)
const hiddenNotice = ref(new Map())
const noticeData = ref({})

// 오늘 날짜 키
function getTodayKey() {
  return `HIDDEN_NOTICES_${today}`
}

function getHiddenNoticeIds() {
  const data = JSON.parse(localStorage.getItem(getTodayKey()))
  return data?.value || []
}

function setHiddenNoticeIds(ids) {
  localStorage.setItem(getTodayKey(), JSON.stringify({ value: ids, expires: today }))
}

function fn_getTodayNoticeList() {
  getTodayNoticeList(sysCode).then(res => {
    const hiddenNoticeIds = getHiddenNoticeIds()
    noticeData.value = res.filter(n => !hiddenNoticeIds.includes(n.seq_no))
    noticeData.value = noticeData.value.map(item => {
      item.period = item.start_date + ' ~ ' + item.end_date
      item.content = item.content.replaceAll('xrc', 'src')
      item.content = item.content.replaceAll('&lt;', '<')
      item.content = item.content.replaceAll('&gt;', '>')

      return item
    })
    noticeModal.value = noticeData.value.map(() => true)
  })
}

// 모달 닫기
function closeNotice(index, seqNo) {
  if (hiddenNotice.value.get(seqNo)) {
    const current = getHiddenNoticeIds()
    if (!current.includes(seqNo)) {
      current.push(seqNo)
      setHiddenNoticeIds(current)
    }
  }
  noticeModal.value[index] = false
}

onMounted(async () => {
  fn_getTodayNoticeList()
})
</script>

<template>  
  <v-dialog
    v-for="(data, index) in noticeData"
    :key="index"
    v-model="noticeModal[index]"
    persistent
    scrollable
    width="70%"
  >
    <v-card>
      <v-toolbar color="primary">
        <v-toolbar-title class="white--text">
          {{ data.title }}
        </v-toolbar-title>
        <v-spacer />
        <v-checkbox
          label="오늘 하루 보지 않기"
          color="warning"
          @update:model-value="val => hiddenNotice.set(data.seq_no, val)"
          hide-details
        />
        <v-btn
          icon
          color="white"
          @click="closeNotice(index, data.seq_no)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-form ref="form">
          <v-row>
            <!-- 내용 -->
            <v-col cols="12">
              <CKViewer
                ref="editor"
                :initial-value="data.content"
                height="700px"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <!-- 닫기 -->
        <v-btn
          variant="outlined"
          @click="closeNotice(index, data.seq_no)"
        >
          {{ $t("닫기") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<route lang="yaml">
meta:    
  noAuth: true
</route>
