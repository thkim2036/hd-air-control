<template>
  <v-container class="pa-4" fluid>
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
                <!--<v-icon size="28" color="white">mdi-magnify</v-icon>-->
                조회
              </v-btn>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card>

    <!-- 그리드 -->
    <div ref="gridContainer"></div>

    <!-- 📌 Vuetify Dialog -->
    <v-dialog
        v-model="dialogVisible"
        max-width="650px"
        max-height="850px"
        content-class="dialog-centered"
    >
      <v-card
          style="
          max-height:850px;
          display:flex;
          flex-direction:column;
          padding: 0 24px 24px 24px;
          border-radius: 12px;
          background-color:#fff;
          box-shadow:0 4px 16px rgba(0,0,0,0.15);
        "
      >
        <!-- 제목 + X 닫기 버튼 -->
        <v-card-title
            class="text-h6 font-weight-bold d-flex justify-space-between align-center"
            style="
              position: sticky;
              top: 0;
              background-color: white;
              z-index: 10;
              padding: 16px 0;
              color:#222242;
            "
        >
          <!-- 🧩 왼쪽 아이콘 + 제목 -->
          <div class="d-flex align-center">
            <v-icon class="me-2" color="#454675">mdi-file-eye-outline</v-icon>
            <span>{{ dialogTitle }}</span>
          </div>

          <!-- 🧩 오른쪽 X 버튼 -->
          <v-btn
              icon="mdi-close"
              variant="text"
              color="#454675"
              @click="dialogVisible = false"
              size="small"
          />
        </v-card-title>

        <v-divider style="position: sticky; top: 56px; z-index: 9; border-color:#c9c9d6;" />

        <!-- 📋 본문 테이블 -->
        <v-card-text style="overflow-y: auto; flex: 1; padding: 0;">
          <v-simple-table class="custom-table">
            <thead>
            <tr
                style="
                background-color:#222242;
                color:white;
                height: 40px;
                font-size: 16px;
                position: sticky;
                top: 0;
                z-index: 8;
              "
            >
              <th style="width:60px;">순서</th>
              <th style="width:100px;">공장</th>
              <th style="width:120px;">호선</th>
              <th style="width:120px;">블록</th>
              <th style="width:120px;">작업내용</th>
            </tr>
            </thead>

            <tbody>
            <tr v-for="row in dialogContent" :key="row.order" >
              <td>{{ row.order }}</td>
              <td>{{ row.factory }}</td>
              <td>{{ row.ship }}</td>
              <td>{{ row.block }}</td>
              <td>{{ row.work }}</td>
            </tr>
            </tbody>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount,computed } from 'vue'
import axios from 'axios'
import { baseURL } from '@/config/apiConfig'
import { useSSEStore } from '@/stores/sseStore'
import { storeToRefs } from 'pinia'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import { format, addDays } from 'date-fns'
import '@/styles/tabulator/tabulator.darkgreen.css'
import { emitter } from '@/plugins/eventBus'

const sseStore = useSSEStore()
const {
  driveMode,     // 운전모드
  valveStatus,   // 밸브상태
  frontPressure, // 전단압력
  backPressure,  // 후단압력
  temperature,   // 온도
} = storeToRefs(sseStore)

// ====================================
// 🗓️ 날짜 관련 변수 및 함수
// ====================================
const today = new Date()
const todayStr = format(today, 'yyyy-MM-dd')
const tomorrow = addDays(today, 1)
const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd')

// 날짜 picker용 (v-date-picker는 배열 형태 필요)
const startDate = ref([today])
const endDate = ref([tomorrow])
const startMenu = ref(false)
const endMenu = ref(false)

// 화면 표시용 날짜 (YYYY-MM-DD 형식)
const startDateDisplay = ref(todayStr)
const endDateDisplay = ref(tomorrowStr)

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

// ● 공장 셀렉트
const factories = ['전체', '1B', '2B']
const selectedFactory = ref('전체')

// ● Tabulator 그리드
const gridContainer = ref(null)
let table = null

// ● drawer 높이 조정 이벤트 핸들러
let isDrawerOpen = false
let gridHeight = ref(window.innerHeight * 0.7)
function onDrawerToggle(open) {
  isDrawerOpen = open
  gridHeight.value = open
      ? window.innerHeight * 0.65
      : window.innerHeight * 0.9

  if (table) {
    table.setHeight(gridHeight.value)
    table.redraw(true)
  }
}

// 📌 Dialog 상태
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogContent = ref([])

// ● Tabulator 세팅
function initTable() {
  table = new Tabulator(gridContainer.value, {
    height: gridHeight.value,
    layout: 'fitColumns',
    data: [],
    groupBy: 'workDate',
    groupHeader: (value) => `<span style='color: white; font-weight: bold;'>${value}</span>`,
    pagination: "local",
    paginationSize: 20,
    paginationSizeSelector: [5, 10, 15, 20],
    movableColumns: true,
    paginationCounter: false,
    // paginationCounter:"rows",
    // -------------------------------------------------------
    // 🧩 같은 값 '셀 병합처럼 보이기' 처리
    // -------------------------------------------------------
    rowFormatter: function (row) {
      const rowData = row.getData();
      const prevRow = row.getPrevRow();

      // 첫 행이면 이전 행 없음 → 병합 불가
      if (!prevRow) return;

      const prevData = prevRow.getData();

      // 공장(blaCell)이 다르면 병합 금지
      if (rowData.blaCell !== prevData.blaCell) return;

      // 병합 대상 필드들
      const mergeFields = [
        "blaCell", "shipNoList", "blockList", "workList",
        "driveMode", "valveStatus", "frontPressure", "backPressure", "temperature",
        "stTime", "edTime", "workDateStSchedule", "workDateEdSchedule"
      ];

      mergeFields.forEach((field) => {
        const cell = row.getCell(field);
        const prevCell = prevRow.getCell(field);

        if (!cell || !prevCell) return;

        // 같은 값일 때만 병합처럼 보이기
        if (rowData[field] === prevData[field]) {
          const el = cell.getElement();
          el.style.color = "transparent"; // 텍스트 숨김
          el.style.borderTop = "none"; // 위쪽 border 제거(시각적으로 병합처럼 보이게)
          el.classList.add("merged-center"); // ⭐ 병합 중앙정렬 class 추가
        }
      });
    },
    columns: [
      {
        title: '공장',
        field: 'blaCell',
        hozAlign: 'center',
        vertAlign: 'middle',
        width: 120,
        titleFormatter: () => `<div style="margin-top: 30px; font-size: 18px;">공장</div>`,
      },
      {
        title: '호선',
        field: 'shipNoList',
        // formatter: function(cell){
        //   let val = cell.getValue();
        //   if(!val) return "";
        //   // return val.split(",").join("<br>");
        //   const arr = val.split(",")
        //   return arr.length > 4 ? arr.slice(0, 4).join("<br>") + "<br>..." : arr.join("<br>")
        // },
        // cellClick: (e, cell) => showRowDetail(cell.getRow().getData()), // 🧩 공통 함수 호출
        hozAlign: 'center',
        vertAlign: 'middle',
        titleFormatter: () => `<div style="margin-top: 30px; font-size: 18px;">호선</div>`,
      },
      {
        title: '블록',
        field: 'blockList',
        // formatter: function(cell){
        //   let val = cell.getValue();
        //   if(!val) return "";
        //   // return val.split(",").join("<br>");
        //   const arr = val.split(",")
        //   return arr.length > 4 ? arr.slice(0, 4).join("<br>") + "<br>..." : arr.join("<br>")
        // },
        // cellClick: (e, cell) => showRowDetail(cell.getRow().getData()), // 🧩 공통 함수 호출
        hozAlign: 'center',
        vertAlign: 'middle',
        titleFormatter: () => `<div style="margin-top: 30px; font-size: 18px;">블록</div>`,
      },
      {
        title: '작업내용',
        field: 'workList',
        // formatter: function(cell){
        //   let val = cell.getValue();
        //   if(!val) return "";
        //   // return val.split(",").join("<br>");
        //   const arr = val.split(",")
        //   return arr.length > 4 ? arr.slice(0, 4).join("<br>") + "<br>..." : arr.join("<br>")
        // },
        // cellClick: (e, cell) => showRowDetail(cell.getRow().getData()), // 🧩 공통 함수 호출
        hozAlign: 'center',
        vertAlign: 'middle',
        titleFormatter: () => `<div style="margin-top: 30px; font-size: 18px;">작업내용</div>`,
      },
      {
        titleFormatter: () => `<div style="height: 18px; line-height: 15px; text-align: center;">장비상태</div>`,
        columns: [
          { title: '운전모드', field: 'driveMode', hozAlign: 'center', vertAlign: 'middle', width: 110 }, /*SSE*/
          { title: '밸브상태', field: 'valveStatus', hozAlign: 'center', vertAlign: 'middle', width: 110 }, /*SSE*/
          {
            titleFormatter: () => `<div style="height: 15px; line-height: 15px; text-align: center;">압력</div>`,
            columns: [
              {
                field: 'frontPressure',  // 전단압력(SSE)
                titleFormatter: () => `<div style="height: 17px; line-height: 17px; text-align: center;">전단(Kg/cm²)</div>`,
                hozAlign: 'center',
                vertAlign: 'middle',
                width: 150,
              },
              {
                field: 'backPressure', // 후단압력(SSE)
                titleFormatter: () => `<div style="height: 17px; line-height: 17px; text-align: center;">후단(Kg/cm²)</div>`,
                hozAlign: 'center',
                vertAlign: 'middle',
                width: 150,
              },
            ],
          },
          { title: '온도(°C)', field: 'temperature', hozAlign: 'center', vertAlign: 'middle', width: 120 }, //SSE
        ],
      },
      {
        titleFormatter: () => `<div style="height: 18px; line-height: 18px; text-align: center;">디지털 작업지시 일정</div>`,
        columns: [
          { title: '시작', field: 'stTime', hozAlign: 'center', vertAlign: 'middle', width: 120 },
          { title: '종료', field: 'edTime', hozAlign: 'center', vertAlign: 'middle', width: 120 },
          {
            field: 'workDateStSchedule',
            titleFormatter: () => `<div style="height: 39px; line-height: 20px; text-align: center;">스케줄 시작 <br><span style="font-size:11px; color:gray;">(30분 전)</span></div>`,
            hozAlign: 'center',
            vertAlign: 'middle',
            width: 120
          },
          {
            field: 'workDateEdSchedule',
            titleFormatter: () => `<div style="height: 39px; line-height: 20px; text-align: center;">스케줄 종료 <br><span style="font-size:11px; color:gray;">(30분 후)</span></div>`,
            hozAlign: 'center',
            vertAlign: 'middle',
            width: 120
          },
        ],
      },
    ],
  })
}

// ● 데이터 조회 함수
async function loadData() {

  // 날짜 배열에서 첫 번째 값을 문자열로 변환
  const start = startDate.value && startDate.value.length > 0
      ? formatDateYYYYMMDD(startDate.value[0])
      : startDateDisplay.value
  const end = endDate.value && endDate.value.length > 0
      ? formatDateYYYYMMDD(endDate.value[0])
      : endDateDisplay.value

  const params = {
    workStartDateFrom: start,
    workEndDateTo: end,
    deviceName: selectedFactory.value === '전체' ? null : selectedFactory.value,
  }

  try {
    const res = await axios.get(
        `${baseURL}/api/work-order-summaries`,
        { params }
    )
    const raw = res.data.data || res.data;

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    const now = new Date() // 현재 시각

    const data = raw.map(item => {

      const workDate = item.workDate.split(' ')[0]

      // 시작시간·종료시간: "0800" → "08:00", "2000" → "20:00"
      const formatHHmm = str =>
          str && str.length === 4
              ? `${str.slice(0, 2)}:${str.slice(2)}`
              : str;

      const stTime = formatHHmm(item.stTime);
      const edTime = formatHHmm(item.edTime);
      const workDateStSchedule = item.workDateStSchedule.split(' ')[1].slice(0, 5);
      const workDateEdSchedule = item.workDateEdSchedule.split(' ')[1].slice(0, 5);

      const factory = item.blaCell
      const isToday = item.workDate.split(' ')[0] === todayStr
      const isTargetFactory = ['1B', '2B'].includes(factory)

      const useSSE = isToday && isTargetFactory
      const driveModeVal = useSSE ? driveMode.value[factory] : '-'
      const valveStatusVal = useSSE ? valveStatus.value[factory] : '-'
      const frontPressureVal = useSSE ? frontPressure.value[factory] : '-'
      const backPressureVal = useSSE ? backPressure.value[factory] : '-'
      const temperatureVal = useSSE ? temperature.value[factory] : '-'

      return {
        ...item,
        stTime,
        edTime,
        workDateStSchedule,
        workDateEdSchedule,
        driveMode: driveModeVal,
        valveStatus: valveStatusVal,
        frontPressure: frontPressureVal,
        backPressure: backPressureVal,
        temperature: temperatureVal
      };
    });

    table.replaceData(data)

  } catch (err) {
    console.error('❌ 데이터 조회 실패:', err)
    loadMockData()
  }
}

// 🧩 공통 다이얼로그 표시 함수 (표 형식)
function showRowDetail(row) {
  const factory = row.blaCell;
  const ships = (row.shipNoList || "").split(",").filter(v => v.trim() !== "");
  const blocks = (row.blockList || "").split(",").filter(v => v.trim() !== "");
  const works = (row.workList || "").split(",").filter(v => v.trim() !== "");

  // 배열 길이에 맞게 zip 형태로 병합
  const maxLen = Math.max(ships.length, blocks.length, works.length);
  const tableData = Array.from({length: maxLen}, (_, i) => ({
    order: i + 1,
    factory,
    ship: ships[i] || "-",
    block: blocks[i] || "-",
    work: works[i] || "-",
  }));

  dialogTitle.value = "상세 정보";
  dialogContent.value = tableData;
  dialogVisible.value = true;
}


// ● 라이프사이클 훅
onMounted(() => {
  emitter.on('drawer-toggled', onDrawerToggle)
  initTable()
  loadData()
})
onBeforeUnmount(() => {
  emitter.off('drawer-toggled', onDrawerToggle)
})


// ▶ SSE 스토어 값을 이용해서 mock 데이터 생성
function loadMockData() {
  // 1B, 2B 각각 날짜를 하드코딩한 mock 행들
  const mockRows = [
    {
      workDate: '2025-07-30',
      blaCell: '1B',
      shipNoList: '842506',
      blockList: '1B14',
      workList: '1ND',
      stTime: '09:00',
      edTime: '18:00',
      workDateStSchedule: '08:30',
      workDateEdSchedule: '18:30',
      driveMode: driveMode.value['1B'] ?? '-',
      valveStatus: valveStatus.value['1B'] ?? '-',
      frontPressure: frontPressure.value['1B'] ?? '-',
      backPressure: backPressure.value['1B'] ?? '-',
      temperature: temperature.value['1B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '1B',
      shipNoList: '842506',
      blockList: '1B14',
      workList: '2ND',
      stTime: '09:00',
      edTime: '18:00',
      workDateStSchedule: '08:30',
      workDateEdSchedule: '18:30',
      driveMode: driveMode.value['1B'] ?? '-',
      valveStatus: valveStatus.value['1B'] ?? '-',
      frontPressure: frontPressure.value['1B'] ?? '-',
      backPressure: backPressure.value['1B'] ?? '-',
      temperature: temperature.value['1B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '1B',
      shipNoList: '842506',
      blockList: '1B14',
      workList: '3ND',
      stTime: '09:00',
      edTime: '18:00',
      workDateStSchedule: '08:30',
      workDateEdSchedule: '18:30',
      driveMode: driveMode.value['1B'] ?? '-',
      valveStatus: valveStatus.value['1B'] ?? '-',
      frontPressure: frontPressure.value['1B'] ?? '-',
      backPressure: backPressure.value['1B'] ?? '-',
      temperature: temperature.value['1B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '1B',
      shipNoList: '842506',
      blockList: '1B14',
      workList: '4ND',
      stTime: '09:00',
      edTime: '18:00',
      workDateStSchedule: '08:30',
      workDateEdSchedule: '18:30',
      driveMode: driveMode.value['1B'] ?? '-',
      valveStatus: valveStatus.value['1B'] ?? '-',
      frontPressure: frontPressure.value['1B'] ?? '-',
      backPressure: backPressure.value['1B'] ?? '-',
      temperature: temperature.value['1B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '1B',
      shipNoList: '842506',
      blockList: '1B14',
      workList: '5ND',
      stTime: '09:00',
      edTime: '18:00',
      workDateStSchedule: '08:30',
      workDateEdSchedule: '18:30',
      driveMode: driveMode.value['1B'] ?? '-',
      valveStatus: valveStatus.value['1B'] ?? '-',
      frontPressure: frontPressure.value['1B'] ?? '-',
      backPressure: backPressure.value['1B'] ?? '-',
      temperature: temperature.value['1B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '1B',
      shipNoList: '842506',
      blockList: '1B14',
      workList: '6ND',
      stTime: '09:00',
      edTime: '18:00',
      workDateStSchedule: '08:30',
      workDateEdSchedule: '18:30',
      driveMode: driveMode.value['1B'] ?? '-',
      valveStatus: valveStatus.value['1B'] ?? '-',
      frontPressure: frontPressure.value['1B'] ?? '-',
      backPressure: backPressure.value['1B'] ?? '-',
      temperature: temperature.value['1B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '1B',
      shipNoList: '842506',
      blockList: '1B14',
      workList: '3ND',
      stTime: '09:00',
      edTime: '18:00',
      workDateStSchedule: '08:30',
      workDateEdSchedule: '18:30',
      driveMode: driveMode.value['1B'] ?? '-',
      valveStatus: valveStatus.value['1B'] ?? '-',
      frontPressure: frontPressure.value['1B'] ?? '-',
      backPressure: backPressure.value['1B'] ?? '-',
      temperature: temperature.value['1B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '1B',
      shipNoList: '840506',
      blockList: '1B15',
      workList: 'B/L',
      stTime: '09:00',
      edTime: '18:00',
      workDateStSchedule: '08:30',
      workDateEdSchedule: '18:30',
      driveMode: driveMode.value['1B'] ?? '-',
      valveStatus: valveStatus.value['1B'] ?? '-',
      frontPressure: frontPressure.value['1B'] ?? '-',
      backPressure: backPressure.value['1B'] ?? '-',
      temperature: temperature.value['1B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '1B',
      shipNoList: '840506',
      blockList: '1B15',
      workList: '수거',
      stTime: '09:00',
      edTime: '18:00',
      workDateStSchedule: '08:30',
      workDateEdSchedule: '18:30',
      driveMode: driveMode.value['1B'] ?? '-',
      valveStatus: valveStatus.value['1B'] ?? '-',
      frontPressure: frontPressure.value['1B'] ?? '-',
      backPressure: backPressure.value['1B'] ?? '-',
      temperature: temperature.value['1B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '1B',
      shipNoList: '840506',
      blockList: '1B15',
      workList: '수거1',
      stTime: '09:00',
      edTime: '18:00',
      workDateStSchedule: '08:30',
      workDateEdSchedule: '18:30',
      driveMode: driveMode.value['1B'] ?? '-',
      valveStatus: valveStatus.value['1B'] ?? '-',
      frontPressure: frontPressure.value['1B'] ?? '-',
      backPressure: backPressure.value['1B'] ?? '-',
      temperature: temperature.value['1B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '2B',
      shipNoList: '291507',
      blockList: '2N22',
      workList: '수거2',
      stTime: '10:00',
      edTime: '19:00',
      workDateStSchedule: '09:30',
      workDateEdSchedule: '19:30',
      driveMode: driveMode.value['2B'] ?? '-',
      valveStatus: valveStatus.value['2B'] ?? '-',
      frontPressure: frontPressure.value['2B'] ?? '-',
      backPressure: backPressure.value['2B'] ?? '-',
      temperature: temperature.value['2B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '2B',
      shipNoList: '291507',
      blockList: '2N22',
      workList: '수거3',
      stTime: '10:00',
      edTime: '19:00',
      workDateStSchedule: '09:30',
      workDateEdSchedule: '19:30',
      driveMode: driveMode.value['2B'] ?? '-',
      valveStatus: valveStatus.value['2B'] ?? '-',
      frontPressure: frontPressure.value['2B'] ?? '-',
      backPressure: backPressure.value['2B'] ?? '-',
      temperature: temperature.value['2B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '2B',
      shipNoList: '291507',
      blockList: '2N22',
      workList: '수거4',
      stTime: '10:00',
      edTime: '19:00',
      workDateStSchedule: '09:30',
      workDateEdSchedule: '19:30',
      driveMode: driveMode.value['2B'] ?? '-',
      valveStatus: valveStatus.value['2B'] ?? '-',
      frontPressure: frontPressure.value['2B'] ?? '-',
      backPressure: backPressure.value['2B'] ?? '-',
      temperature: temperature.value['2B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '2B',
      shipNoList: '291507',
      blockList: '2N22',
      workList: '수거5',
      stTime: '10:00',
      edTime: '19:00',
      workDateStSchedule: '09:30',
      workDateEdSchedule: '19:30',
      driveMode: driveMode.value['2B'] ?? '-',
      valveStatus: valveStatus.value['2B'] ?? '-',
      frontPressure: frontPressure.value['2B'] ?? '-',
      backPressure: backPressure.value['2B'] ?? '-',
      temperature: temperature.value['2B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '2B',
      shipNoList: '291507',
      blockList: '2N22',
      workList: '수거6',
      stTime: '10:00',
      edTime: '19:00',
      workDateStSchedule: '09:30',
      workDateEdSchedule: '19:30',
      driveMode: driveMode.value['2B'] ?? '-',
      valveStatus: valveStatus.value['2B'] ?? '-',
      frontPressure: frontPressure.value['2B'] ?? '-',
      backPressure: backPressure.value['2B'] ?? '-',
      temperature: temperature.value['2B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '2B',
      shipNoList: '291507',
      blockList: '2N22',
      workList: '수거7',
      stTime: '10:00',
      edTime: '19:00',
      workDateStSchedule: '09:30',
      workDateEdSchedule: '19:30',
      driveMode: driveMode.value['2B'] ?? '-',
      valveStatus: valveStatus.value['2B'] ?? '-',
      frontPressure: frontPressure.value['2B'] ?? '-',
      backPressure: backPressure.value['2B'] ?? '-',
      temperature: temperature.value['2B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '2B',
      shipNoList: '291507',
      blockList: '2N22',
      workList: '수거8',
      stTime: '10:00',
      edTime: '19:00',
      workDateStSchedule: '09:30',
      workDateEdSchedule: '19:30',
      driveMode: driveMode.value['2B'] ?? '-',
      valveStatus: valveStatus.value['2B'] ?? '-',
      frontPressure: frontPressure.value['2B'] ?? '-',
      backPressure: backPressure.value['2B'] ?? '-',
      temperature: temperature.value['2B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '2B',
      shipNoList: '291507',
      blockList: '2N22',
      workList: '수거9',
      stTime: '10:00',
      edTime: '19:00',
      workDateStSchedule: '09:30',
      workDateEdSchedule: '19:30',
      driveMode: driveMode.value['2B'] ?? '-',
      valveStatus: valveStatus.value['2B'] ?? '-',
      frontPressure: frontPressure.value['2B'] ?? '-',
      backPressure: backPressure.value['2B'] ?? '-',
      temperature: temperature.value['2B'] ?? '-',
    },
    {
      workDate: '2025-07-30',
      blaCell: '2B',
      shipNoList: '291507',
      blockList: '2N22',
      workList: '수거10',
      stTime: '10:00',
      edTime: '19:00',
      workDateStSchedule: '09:30',
      workDateEdSchedule: '19:30',
      driveMode: driveMode.value['2B'] ?? '-',
      valveStatus: valveStatus.value['2B'] ?? '-',
      frontPressure: frontPressure.value['2B'] ?? '-',
      backPressure: backPressure.value['2B'] ?? '-',
      temperature: temperature.value['2B'] ?? '-',
    },
    {
      workDate: '2025-07-29',
      blaCell: '1B',
      shipNoList: '291506',
      blockList: '1N21',
      stTime: '09:00',
      edTime: '18:00',
      workDateStSchedule: '08:30',
      workDateEdSchedule: '18:30',
      driveMode: '-',
      valveStatus: '-',
      frontPressure: '-',
      backPressure: '-',
      temperature: '-',
    },
    {
      workDate: '2025-07-29',
      blaCell: '2B',
      shipNoList: '291507',
      blockList: '2N22',
      stTime: '10:00',
      edTime: '19:00',
      workDateStSchedule: '09:30',
      workDateEdSchedule: '19:30',
      driveMode: '-',
      valveStatus: '-',
      frontPressure: '-',
      backPressure: '-',
      temperature: '-',
    },
  ]

  // “전체” 혹은 선택된 공장만 보여주기
  const data = mockRows.filter(row =>
      selectedFactory.value === '전체' || row.blaCell === selectedFactory.value
  )

  table.replaceData(data)
}
</script>

<style scoped>
.v-btn:hover {
  background-color: #7F80A8 !important;
}

/* Vuetify 3.3.5 기준 헤더 숨기기 */
::v-deep(.v-date-picker-header) {
  display: none !important;
}

::v-deep(.v-picker-title) {
  display: none !important;
}

/* 헤더 셀 간 구분선 */
::v-deep(.tabulator .tabulator-header .tabulator-col) {
  background: #ffffff;
  border-right: 1px solid #ffffff;
  text-align: center;
  height: 110px !important;
}

/* tool tip */
::v-deep .custom-tooltip {
  background-color: #222242 !important;
  color: #ffffff !important;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
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

/* 병합된 셀 중앙 정렬 + darkgreen 테마 충돌 방지 */


/* v-date-picker-controls 내부 첫 번째 button만 숨기기 */
::v-deep(.v-date-picker-controls > button:first-of-type) {
  display: none !important;
}

/* 다이얼로그 화면 중앙 정렬 */
::v-deep(.dialog-centered) {
  display: flex;
  align-items: center; /* 세로 중앙 */
  justify-content: center; /* 가로 중앙 */
}

::v-deep(.custom-table tr th) {
  text-align: center;
}

::v-deep(.custom-table tr td) {
  height: 30px;
  border-bottom: 1px solid #c9c9d6;
  text-align: center;
  color: #222242;
}
</style>