<template>
  <v-container class="pa-4" fluid>
    <!-- 검색 조건 카드 -->
    <v-card flat class="pa-4 mb-16" style="height: 80px; border-left: 10px solid #222242; background-color: #454675;">
      <v-row dense align="center" justify="start" style="color: white">
        <!-- 시작일 -->
        <v-col cols="12" sm="6" md="3">
          <v-menu
              v-model="startMenu"
              :close-on-content-click="false"
              location="bottom"
          >
            <template #activator="{ props }">
              <v-text-field
                  v-model="startDateDisplay"
                  label="시작일"
                  append-inner-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                  variant="outlined"
                  density="comfortable"
                  @click:append-inner="startMenu = true"
              />
            </template>
            <v-date-picker
                v-model="startDate"
                @update:model-value="onStartDateSelected"
                hide-header
                hide-actions
            />
          </v-menu>
        </v-col>

        <!-- 종료일 -->
        <v-col cols="12" sm="6" md="3">
          <v-menu
              v-model="endMenu"
              :close-on-content-click="false"
              location="bottom"
          >
            <template #activator="{ props }">
              <v-text-field
                  v-model="endDateDisplay"
                  label="종료일"
                  append-inner-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                  variant="outlined"
                  density="comfortable"
                  @click:append-inner="endMenu = true"
              />
            </template>
            <v-date-picker
                v-model="endDate"
                :min="startDateForPicker"
                @update:model-value="onEndDateSelected"
                hide-header
                hide-actions
            />
          </v-menu>
        </v-col>

        <!-- 공장 -->
        <v-col cols="12" sm="6" md="2">
          <v-select
              :model-value="selectedFactory"
              @update:modelValue="val => selectedFactory = val"
              :items="factories"
              item-title="title"
              item-value="value"
              label="공장"
              variant="outlined"
              density="comfortable"
          />
        </v-col>

        <v-spacer />

        <!-- 조회 버튼 -->
        <v-col cols="12" sm="6" md="1" class="mb-6 d-flex justify-end">
          <v-tooltip text="조회" content-class="custom-tooltip" location="bottom">
            <template #activator="{ props }">
              <v-btn
                  v-bind="props"
                  @click="loadData"
                  color="#222242"
                  size="large"
                  variant="flat"
                  class="rounded-lg text-subtitle-1 font-weight-bold"
                  elevation="2"
              >
                조회
              </v-btn>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card>

    <!-- 데이터 테이블 그리드 -->
    <div ref="gridContainer"></div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import axios from 'axios'
import { baseURL } from '@/config/apiConfig'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { format } from 'date-fns'
import '@/styles/tabulator/tabulator.darkgreen.css'
import { emitter } from '@/plugins/eventBus'

// ====================================
// 🗓️ 날짜 관련 변수 및 함수
// ====================================
const today = new Date()
const todayStr = format(today, 'yyyy-MM-dd')

// 날짜 picker용 (v-date-picker는 배열 형태 필요)
const startDate = ref([today])
const endDate = ref([today])
const startMenu = ref(false)
const endMenu = ref(false)

// 화면 표시용 날짜 (YYYY-MM-DD 형식)
const startDateDisplay = ref(todayStr)
const endDateDisplay = ref(todayStr)

// 종료일 최소값 제한 (시작일 이후부터 선택 가능)
const startDateForPicker = computed(() => {
  return startDate.value && startDate.value.length > 0 ? startDate.value[0] : null
})

// 시작일 선택 핸들러
const onStartDateSelected = (val) => {
  if (val && val.length > 0) {
    startDate.value = val
    startDateDisplay.value = format(val[0], 'yyyy-MM-dd')
    startMenu.value = false
  }
}

// 종료일 선택 핸들러
const onEndDateSelected = (val) => {
  if (val && val.length > 0) {
    endDate.value = val
    endDateDisplay.value = format(val[0], 'yyyy-MM-dd')
    endMenu.value = false
  }
}

// Date 객체를 YYYY-MM-DD 문자열로 변환
function formatDateYYYYMMDD(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// ====================================
// 🏭 공장 선택 관련
// ====================================
const factories = [
  { title: '전체', value: '전체' },
  { title: '1콤프실', value: '1C' },
  { title: '3콤프실', value: '3C' },
  { title: '1B', value: '1B' },
  { title: '2B', value: '2B' },
]
const selectedFactory = ref('전체')

// ====================================
// 📊 Tabulator 테이블 관련
// ====================================
const gridContainer = ref(null)
let table = null
let gridHeight = ref(window.innerHeight * 0.7)

// 테이블 초기화 함수
function initTable() {
  table = new Tabulator(gridContainer.value, {
    height: gridHeight.value,
    layout: 'fitColumns',
    data: [],
    pagination: 'local',
    paginationSize: 20,
    paginationSizeSelector: [10, 20, 30, 50],
    movableColumns: true,
    columns: [
      {
        title: '발생 시각',
        field: 'alarmStartTime',
        hozAlign: 'center',
        width: 250
      },
      {
        title: '공장',
        field: 'deviceName',
        hozAlign: 'center',
        width: 200,
        formatter: (cell) => {
          const value = cell.getValue()
          const deviceNameMap = {
            '1C': '1콤프실',
            '3C': '3콤프실',
            '1B': '1B',
            '2B': '2B',
          }
          return deviceNameMap[value] || value
        }
      },
      {
        title: '내용',
        field: 'message',
        hozAlign: 'left'
      },
      {
        title: '해제 시각',
        field: 'alarmClearTime',
        hozAlign: 'center',
        width: 250
      },
      {
        title: '상태',
        field: 'alarmStatus',
        hozAlign: 'center',
        width: 120,
        formatter: (cell) => {
          const rowData = cell.getRow().getData()
          const clearTime = rowData.alarmClearTime
          return (clearTime && clearTime.trim() !== '') ? '완료' : '미완료'
        }
      },
    ],
  })
}

// ====================================
// 📡 데이터 로딩 관련
// ====================================
// 실제 API 데이터 조회
async function loadData() {
  // 날짜 배열에서 첫 번째 값을 문자열로 변환
  const start = startDate.value && startDate.value.length > 0
      ? formatDateYYYYMMDD(startDate.value[0])
      : startDateDisplay.value
  const end = endDate.value && endDate.value.length > 0
      ? formatDateYYYYMMDD(endDate.value[0])
      : endDateDisplay.value

  const params = {
    alarmStartDateFrom: start,
    alarmClearDateTo: end,
    deviceName: selectedFactory.value === '전체' ? undefined : selectedFactory.value,
  }

  try {
    const res = await axios.get(`${baseURL}/api/alarm-event-histories`, { params })
    const data = res.data.data || res.data
    table.replaceData(data)
  } catch (err) {
    console.error('❌ 데이터 조회 실패:', err)
    loadMockData() // API 실패 시 목업 데이터 로드
  }
}

// Mock 데이터 생성 (개발/테스트용)
function loadMockData() {
  const mockRows = [
    {
      alarmStartTime: '2025-07-30 15:15:00',
      deviceName: '1B',
      message: 'LEAK 발생',
      alarmClearTime: '',
    },
    {
      alarmStartTime: '2025-07-30 14:09:10',
      deviceName: '2B',
      message: '밸브 오작동',
      alarmClearTime: '2025-07-30 14:10:05',
    },
    {
      alarmStartTime: '2025-07-30 10:11:03',
      deviceName: '1C',
      message: '압력 저하 발생',
      alarmClearTime: '2025-07-30 10:27:42',
    },
    {
      alarmStartTime: '2025-07-30 09:30:07',
      deviceName: '3C',
      message: '압력 저하 발생',
      alarmClearTime: '2025-07-30 09:42:12',
    },
  ]

  // 선택된 공장에 따른 데이터 필터링
  const filteredData = mockRows.filter(row =>
      selectedFactory.value === '전체' || row.deviceName === selectedFactory.value
  )

  table.replaceData(filteredData)
}

// ====================================
// 🎨 UI 반응형 처리
// ====================================
// drawer 토글에 따른 테이블 높이 조정
function onDrawerToggle(open) {
  gridHeight.value = open ? window.innerHeight * 0.65 : window.innerHeight * 0.9

  if (table) {
    table.setHeight(gridHeight.value)
    table.redraw(true)
  }
}

// ====================================
// 🔄 라이프사이클 관리
// ====================================
onMounted(() => {
  emitter.on('drawer-toggled', onDrawerToggle)
  initTable()
  loadData()
})

onBeforeUnmount(() => {
  emitter.off('drawer-toggled', onDrawerToggle)
})
</script>
<style scoped>
.v-btn:hover {
  background-color: #7F80A8 !important;
}

/* Vuetify date-picker header 숨기기 */
::v-deep(.v-date-picker-header),
::v-deep(.v-picker-title) {
  display: none !important;
}

/* Tabulator 헤더 스타일 */
::v-deep(.tabulator .tabulator-header .tabulator-col) {
  background: #000000;
  border-right: 1px solid #333;
  text-align: center;
  height: 50px !important;
}

/* Tooltip 커스텀 */
::v-deep .custom-tooltip {
  background-color: #222242 !important;
  color: #ffffff !important;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

/* 헤더 셀 간 구분선 */
::v-deep(.tabulator .tabulator-header .tabulator-col) {
  background: #ffffff;
  border-right: 1px solid #ffffff;
  text-align: center;
}

/* 모든 헤더 컬럼 텍스트 중앙 정렬 */
::v-deep(.tabulator .tabulator-header .tabulator-col .tabulator-col-title) {
  display: flex !important;
  justify-content: center !important;
  text-align: center !important;
  height: 100% !important;
  padding-right: 0 !important;
  margin-right: 0 !important;
}

/* 아이콘 숨기기 */
::v-deep(.tabulator .tabulator-header .tabulator-col .tabulator-arrow) {
  display: none !important;
}

/* 헤더 클릭해도 정렬 안 되게 */
::v-deep(.tabulator .tabulator-header .tabulator-col) {
  pointer-events: none !important;
}

/* v-date-picker-controls 내부 첫 번째 button만 숨기기 */
::v-deep(.v-date-picker-controls > button:first-of-type) {
  display: none !important;
}
</style>