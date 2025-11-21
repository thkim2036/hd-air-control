<script setup>
import { getCurrentInstance } from 'vue'
import pageHeader from '@/layouts/components/PageHeader.vue'
import tabulator, { formatterButton } from '@/utils/tabulator'
import { fitHeightOfElement } from '@/utils/useSizeUtils'
import AppDateTimePicker from '@core/components/AppDateTimePicker.vue'
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'
import notify from '@hiway/utils/notify'
import { requiredValidator } from '@core/utils/validators'
import { getNoticeList, createNoticeData, updateNoticeData, deleteNoticeData } from '@/api/notice'
import CKEditor from '@/components/ckeditor/CKEditor.vue'

defineOptions({
  name: 'notice-management',
})

const sysCode = import.meta.env.VITE_SYSTEM_CODE

const vm = getCurrentInstance().proxy

const { t } = useI18n()

const validators = {
  requiredValidator,
}

const noticeModal = ref(false)
const period = ref('')

// 수정 format
const editNotice = data => {
  noticeData.value = Object.assign({}, data)
  period.value = data.start_date + ' to ' + data.end_date
  noticeModal.value = true
}

// 그리드 정보
const gridObj = reactive({
  grid: null, // container
  gridData: [],
  gridColumns: [
    {
      field: 'title',
      title: '제목',
      hozAlign: 'left',
    },
    {
      field: 'period',
      title: '공지기간',
      width: 250,
    },
    {
      field: 'editNoticeIcon',
      title: '수정',
      width: 60,
      formatter: formatterButton,
      formatterParams: {
        type: 'icon',
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30" style="height: 25px; width: 25px; fill: rgb(var(--v-theme-info));"><title>pencil</title><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" /></svg>',
        showEmpty: true,
        showComponent: editNotice,
        returnData: true,
      },
    },
    {
      field: 'reg_hname',
      title: '작성자',
      width: 100,
      hozAlign: 'center',
    },
    {
      field: 'reg_date',
      title: '작성일자',
      formatter: function (cell) {
        const value = cell.getValue()
        if (value === null)
          return ''

        return dayjs(value).format('YYYY-MM-DD HH:mm')
      },
      width: 150,
    },
    {
      field: 'upd_hname',
      title: '수정자',
      width: 100,
      hozAlign: 'center',
    },
    {
      field: 'upd_date',
      title: '수정일자',
      formatter: function (cell) {
        const value = cell.getValue()
        if (value === null)
          return ''

        return dayjs(value).format('YYYY-MM-DD HH:mm')
      },
      width: 150,
    },
  ],
})

// 그리드 설정
const initGrid = () => {
  const noticeGrid = document.getElementById('noticeGrid')
  const gridHeight = fitHeightOfElement(noticeGrid, 300, 150)

  getNoticeList(sysCode).then(res => {
    gridObj.gridData = res.map(item => {
      item.period = item.start_date + ' ~ ' + item.end_date
      item.content = item.content.replaceAll('xrc', 'src')
      item.content = item.content.replaceAll('&lt;', '<')
      item.content = item.content.replaceAll('&gt;', '>')

      return item
    })

    const gridOption = {
      gridData: gridObj.gridData,
      gridColumns: gridObj.gridColumns,
      gridHeight: `${gridHeight}px`,
      rowHeaders: ['rowNum'],
    }

    gridObj.grid = tabulator(noticeGrid, gridOption)
  })
}

// 조회
const searchNoticeList = () => {
  getNoticeList(sysCode).then(res => {
    gridObj.gridData = res.map(item => {
      item.period = item.start_date + ' ~ ' + item.end_date
      item.content = item.content.replaceAll('xrc', 'src')
      item.content = item.content.replaceAll('&lt;', '<')
      item.content = item.content.replaceAll('&gt;', '>')

      return item
    })
    gridObj.grid.resetData(gridObj.gridData)
  })
}

watch(() => period.value, newValue => {
  const str = newValue.split('to')

  if (str.length > 1) {
    if (dayjs(str[0]).isBefore(dayjs(str[1]))) {
      noticeData.value.start_date = str[0]
      noticeData.value.end_date = str[1]
    } else {
      noticeData.value.start_date = str[1]
      noticeData.value.end_date = str[0]
    }
  } else {
    noticeData.value.end_date = str[0]
    noticeData.value.start_date = str[0]
  }
})

const resetData = () => {
  period.value = ''

  return {
    sys_code: sysCode,
    seq_no: '',
    title: '',
    content: '',
    start_date: '',
    end_date: '',
  }
}

const noticeData = ref(resetData())

const form = ref(null)
const editor = ref(null)

// 등록
const addNotice = () => {
  noticeData.value = resetData()
  noticeModal.value = true
}

// 저장 , 수정
const saveNotice = () => {
  if (noticeData.value.fromDate === '' || noticeData.value.toDate === '') {
    period.value = ''
  }

  form.value.validate().then(e => {
    if (e.valid) {
      vm.$swal({
        title: t("msg.question-save"),
        showCancelButton: true,
      }).then(res => {
        if (res.isConfirmed) {
          noticeData.value.content = editor.value.getContent().replaceAll('src', 'xrc')

          if (noticeData.value.seq_no == null || noticeData.value.seq_no === '') {
            createNoticeData(noticeData.value).then(() => {
              notify.success(t("msg.save"))

              searchNoticeList()
              noticeModal.value = false
            })
          } else {
            updateNoticeData(noticeData.value).then(() => {
              notify.success(t("msg.save"))

              searchNoticeList()
              noticeModal.value = false
            })
          }
        }
      })
    }
  })
}

// 삭제
const deleteNotice = () => {
  vm.$swal({
    title: t("msg.question-delete"),
    showCancelButton: true,
  }).then(res => {
    if(res.isConfirmed) {
      deleteNoticeData(noticeData.value.sys_code, noticeData.value.seq_no).then(() => {
        notify.success(t("msg.delete"))

        searchNoticeList()
        noticeModal.value = false

        noticeData.value = resetData()
      })
    }
  })
}

onMounted(() => {
  initGrid();
})
</script>

<template>
  <v-container fluid>
    <page-header
      title="공지사항 관리"
      :use-list="['btnSearch', 'btnRegister']"
      @btn-register="addNotice"
      @btn-search="searchNoticeList"
    />
    <v-row>
      <v-col>
        <div id="noticeGrid" />
      </v-col>
    </v-row>
    <!-- 공지 사항 등록/수정 팝업 -->
    <v-dialog
      v-model="noticeModal"
      persistent
      scrollable
      width="70%"
      height="100%"
    >
      <v-card>
        <v-toolbar color="primary">
          <v-toolbar-title class="white--text">
            {{ $t('공지사항') }} {{ (noticeData.seq_no != null && noticeData.seq_no !== '') ? $t("수정") : $t("등록") }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            icon
            color="white"
            @click="noticeModal = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row>
              <!-- 제목 -->
              <v-col cols="9">
                <v-text-field
                  v-model="noticeData.title"
                  :label="$t('제목')"
                  :rules="[validators.requiredValidator]"
                />
              </v-col>
              <!-- 공지 기간 -->
              <v-col cols="12">
                <app-date-time-picker
                  v-model="period"
                  :label="$t('공지기간')"
                  :config="{ mode: 'range' }"
                  prepend-icon="mdi-calendar"
                  :rules="[validators.requiredValidator]"
                />
              </v-col>
              <!-- 내용 -->
              <v-col cols="12">
                <CKEditor
                  ref="editor"
                  :initial-value="noticeData.content"
                  height="500px"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <!-- 저장/등록 -->
          <v-btn
            variant="outlined"
            @click="saveNotice"
          >
            {{ (noticeData.seq_no != null && noticeData.seq_no !== '') ? $t("수정") : $t("등록") }}
          </v-btn>
          <!-- 삭제 -->
          <v-btn
            v-if="noticeData.seq_no != null && noticeData.seq_no !== ''"
            variant="outlined"
            @click="deleteNotice"
          >
            {{ $t("삭제") }}
          </v-btn>
          <!-- 취소 -->
          <v-btn
            variant="outlined"
            @click="noticeModal = false"
          >
            {{ $t("취소") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<route lang="yaml">
meta:    
  noAuth: true
</route>