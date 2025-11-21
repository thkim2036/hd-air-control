<template>
  <div class="chart-wrapper">
    <!-- 압력기준 / 콤프실 / 공장 상태 -->
    <div class="top-left-row" >
      <StandardTable />
      <CompressorStatus />
      <FactoryStatus />
    </div>

    <div style="height: 17%"></div>

    <!-- 압력 차트 -->
    <div ref="pressureChartRef" class="chart1" />

    <!-- 온도 차트 -->
    <div ref="temperatureChartRef" class="chart2" />
  </div>
</template>

<script setup>
import {ref, watchEffect, onMounted, onBeforeUnmount} from 'vue'
import * as echarts from 'echarts'
import {useSSEStore} from '@/stores/sseStore'
import {storeToRefs} from 'pinia'
import StandardTable from '@/components/StandardTable.vue'
import CompressorStatus from '@/components/CompressorStatus.vue'
import FactoryStatus from '@/components/FactoryStatus.vue'

const pressureChartRef = ref(null)
const temperatureChartRef = ref(null)
const {chartData} = storeToRefs(useSSEStore())

let pressureChart = null
let temperatureChart = null
let resizeObserver = null

// chartData 변경 시 두 차트를 모두 업데이트
watchEffect(() => {
  if (!pressureChartRef.value || !temperatureChartRef.value) return
  if (chartData.value.length === 0) return

  renderPressureChart()
  renderTemperatureChart()
})

function renderPressureChart() {
  const labels = chartData.value.map(item => item.time)
  const map = {
    '1콤프 압력': {type: 'PRESSURE', factory: '1C', color: '#1E90FF'},
    '3콤프 압력': {type: 'PRESSURE', factory: '3C', color: '#4169E1'},
    '1B 전단압력': {type: 'UPSTREAM_PRESSURE', factory: '1B', color: '#FF6347'},
    '1B 후단압력': {type: 'DOWNSTREAM_PRESSURE', factory: '1B', color: '#FF7F50'},
    '2B 전단압력': {type: 'UPSTREAM_PRESSURE', factory: '2B', color: '#3CB371'},
    '2B 후단압력': {type: 'DOWNSTREAM_PRESSURE', factory: '2B', color: '#2E8B57'},
  }

  const series = Object.entries(map).map(([name, {type, factory, color}]) => ({
    name,
    type: 'line',
    smooth: false,
    data: chartData.value.map(item => parseFloat(item[`${type}_${factory}`]) || null),
    lineStyle: {width: 2, color},
    itemStyle: {color},
    label: {show: true, position: 'top', color, fontSize: 14},
  }))

  const totalCount = labels.length
  const showCount = 15   // ✅ 한 번에 보여줄 데이터 개수
  const start = totalCount > showCount ? ((totalCount - showCount) / totalCount) * 100 : 0
  const end = 100  // 항상 끝쪽이 최신 데이터

  const baseOption = {
    tooltip: {trigger: 'axis'},
    legend: {
      bottom: 20,
      icon: 'rect',   // 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'none' | path 문자열
      data: Object.keys(map),
      textStyle: {
        color: '#000000',   // ✅ 글자 색상
        fontSize: 14,       // ✅ 글자 크기
        fontWeight: 'bold', // ✅ 글자 굵기
      }
    },
    grid: {top: 60, left: 60, right: 40, bottom: 80},
    // xAxis: { type: 'category', data: labels },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        color: '#000000',   // ✅ 글자 색상
        fontSize: 12,       // ✅ 글자 크기
        fontWeight: ''      // ✅ 글자 두께
      },
      name: '',         // ✅ X축 이름
      nameLocation: '', // start | middle | end
      nameGap: 0,       // 축과 제목 사이 간격
      offset: 0,
      nameTextStyle: {
        color: '#000000',   // ✅ 축 제목 색상
        fontSize: 14,       // ✅ 축 제목 크기
        fontWeight: '',
        align: ''
      }
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: value => `${value}`,
        color: '#3EADFA',   // ✅ 글자 색상
        fontSize: 14,       // ✅ 글자 크기
        fontWeight: 'bold'  // ✅ (선택) 굵게
      },
      name: '압력(Kg/cm²)',  // 축 이름
      nameLocation: 'end',  // start | middle | end
      nameGap: 20,          // 숫자 키우면 위쪽으로 이동
      offset: 0,
      nameTextStyle: {
        color: '#3EADFA',   // 축 제목 색상
        fontSize: 15,       // 축 제목 크기
        fontWeight: 'bold',
        align: 'center'
      }
    },
    series,
    graphic: [
      {
        type: 'text',
        left: '3%',   // ← 첫 번째 tick 위치에 맞게 조정
        top: '86%',   // ← X축 라벨 아래쪽
        style: {
          text: '(시간)',
          fill: '#000000',
          fontSize: 13,
          fontWeight: 'bold'
        }
      }
    ],
    // ✅ dataZoom 추가: 기본 15개만 보이고, 스크롤하면 이전 데이터 볼 수 있음
    dataZoom: [
      {
        type: 'slider',
        show: false,
        start: start,   // 전체 대비 시작 %
        end: end,       // 전체 대비 끝 %
        realtime: true,
        bottom: 10,
        height: 20
      },
      {
        type: 'inside', // 마우스 휠/드래그
        start: start,
        end: end
      }
    ]
  }

  if (!pressureChart) {
    pressureChart = echarts.init(pressureChartRef.value)
    pressureChart.setOption(baseOption)

    // ✅ 차트 위에 마우스 올리면 grab 커서
    pressureChart.getDom().style.cursor = 'grab'
    // ✅ 드래그할 때 grabbing으로 변경
    pressureChart.getZr().on('mousedown', () => {
      pressureChart.getDom().style.cursor = 'grabbing'
    })
    pressureChart.getZr().on('mouseup', () => {
      pressureChart.getDom().style.cursor = 'grab'
    })

    // 최초 한 번만 숨김 처리
    const initialHidden = ['1콤프 압력', '3콤프 압력']
    initialHidden.forEach(name => {
      pressureChart.dispatchAction({ type: 'legendUnSelect', name })
    })
  } else {
    pressureChart.setOption({
      series: baseOption.series,
      xAxis: baseOption.xAxis,
      yAxis: baseOption.yAxis,
      tooltip: baseOption.tooltip,
      grid: baseOption.grid,
    })
  }
}

function renderTemperatureChart() {
  const labels = chartData.value.map(item => item.time)
  const map = {
    '1B 온도': {type: 'TEMPERATURE', factory: '1B', color: '#FF4500'},
    '2B 온도': {type: 'TEMPERATURE', factory: '2B', color: '#228B22'},
  }
  const series = Object.entries(map).map(([name, {type, factory, color}]) => ({
    name,
    type: 'line',
    smooth: false,
    data: chartData.value.map(item => parseFloat(item[`${type}_${factory}`]) || null),
    lineStyle: {width: 3, color},
    itemStyle: {color},
    label: {show: true, position: 'top', color, fontSize: 14},
  }))

  const totalCount = labels.length
  const showCount = 15   // ✅ 한 번에 보여줄 데이터 개수
  const start = totalCount > showCount ? ((totalCount - showCount) / totalCount) * 100 : 0
  const end = 100  // 항상 끝쪽이 최신 데이터

  const baseOption = {
    tooltip: {trigger: 'axis'},
    legend: {
      bottom: 20,
      icon: 'rect',   // 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'none' | path 문자열
      data: Object.keys(map),
      textStyle: {
        color: '#000000',   // ✅ 글자 색상
        fontSize: 14,       // ✅ 글자 크기
        fontWeight: 'bold', // ✅ 글자 굵기
      }
    },
    grid: {top: 60, left: 60, right: 40, bottom: 80},
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        color: '#000000',   // ✅ 글자 색상
        fontSize: 12,       // ✅ 글자 크기
        fontWeight: ''      // ✅ 글자 두께
      },
      name: '',         // ✅ X축 이름
      nameLocation: '', // start | middle | end
      nameGap: 0,       // 축과 제목 사이 간격
      offset: 0,
      nameTextStyle: {
        color: '#000000',   // ✅ 축 제목 색상
        fontSize: 14,       // ✅ 축 제목 크기
        fontWeight: '',
        align: ''
      }
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: value => `${value}`,
        color: '#FF3969',   // ✅ 글자 색상
        fontSize: 14,       // ✅ 글자 크기
        fontWeight: 'bold'  // ✅ (선택) 굵게
      },
      name: '온도(℃)',  // 축 이름
      nameLocation: 'end',  // start | middle | end
      nameGap: 20,          // 숫자 키우면 위쪽으로 이동
      offset: 0,
      nameTextStyle: {
        color: '#FF3969',   // 축 제목 색상
        fontSize: 15,       // 축 제목 크기
        fontWeight: 'bold',
        align: 'center'
      }
    },
    series,
    graphic: [
      {
        type: 'text',
        left: '3%',   // ← 첫 번째 tick 위치에 맞게 조정
        top: '85%',   // ← X축 라벨 아래쪽
        style: {
          text: '(시간)',
          fill: '#000000',
          fontSize: 13,
          fontWeight: 'bold'
        }
      }
    ],
    // ✅ dataZoom 추가: 기본 15개만 보이고, 스크롤하면 이전 데이터 볼 수 있음
    dataZoom: [
      {
        type: 'slider',
        show: false,
        start: start,   // 전체 대비 시작 %
        end: end,       // 전체 대비 끝 %
        realtime: true,
        bottom: 10,
        height: 20
      },
      {
        type: 'inside', // 마우스 휠/드래그
        start: start,
        end: end
      }
    ]
  }

  if (!temperatureChart) {
    temperatureChart = echarts.init(temperatureChartRef.value)
    temperatureChart.setOption(baseOption)
  } else {
    temperatureChart.setOption({
      series: baseOption.series,
      xAxis: baseOption.xAxis,
      yAxis: baseOption.yAxis,
      tooltip: baseOption.tooltip,
      grid: baseOption.grid,
    })
  }
}

onMounted(() => {
  // 뷰포트 크기 변경 시 자동 리사이즈
  resizeObserver = new ResizeObserver(() => {
    pressureChart?.resize()
    temperatureChart?.resize()
  })
  const container = document.querySelector('.v-main')
  container && resizeObserver.observe(container)
})

onBeforeUnmount(() => {
  pressureChart?.dispose()
  temperatureChart?.dispose()
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 90vh;
}

/* 상단 컴포넌트 영역 */
.top-left-row {
  position: absolute;
  top: 5px;
  left: 30px;
  display: flex;
  gap: 12px;
  z-index: 10;
}

.chart1 {
  width: 100%;
  height: 40vh;
}

/* pressureChart 전용 (scoped 안에서 deep 사용) */
:deep(.chart1 canvas) {
  cursor: grab !important;
}

:deep(.chart1 canvas:active) {
  cursor: grabbing !important;
}

.chart2 {
  width: 100%;
  height: 35vh;
}

/* temperatureChart 전용 */
:deep(.chart2 canvas) {
  cursor: grab !important; /* 기본 손가락 모양 👆 */
}
:deep(.chart2 canvas:active) {
  cursor: grabbing !important; /* 드래그 중 ✊ */
}
</style>
