<template>
  <v-card class="weather-card" flat border>
    <v-row no-gutters align="center" class="weather-row">
      <!-- 아이콘 -->
      <v-col cols="auto" class="weather-icon">
        <v-avatar class="weather-avatar" size="50" rounded="0">
          <img
              :src="weatherList[0]?.iconUrl"
              alt="weather icon"
              class="weather-img"
          />
        </v-avatar>
      </v-col>

      <!-- 날짜 / 상태 -->
      <v-col class="weather-info">
        <div class="weather-date">
          {{ weatherList[0]?.date }}
        </div>
        <div class="weather-condition">
          {{ weatherList[0]?.condition }}
        </div>
      </v-col>

      <!-- 온도 -->
      <v-col cols="auto" class="weather-temp">
        <div>
          {{ weatherList[0]?.temperature }}
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSSEStore } from '@/stores/sseStore'

const sseStore = useSSEStore()
const weatherList = ref([])

const dummyData = [
  { tm: '20250730', day_of_week: '수', condition: '맑음', low: 25, high: 38, icon: 'images/weather-sun.png' },
  { tm: '20250627', day_of_week: '금', condition: '맑음', low: 18, high: 26, icon: 'images/weather-sun.png' },
  { tm: '20250628', day_of_week: '토', condition: '맑음', low: 22, high: 27, icon: 'images/weather-sun.png' },
]

watch(
    () => sseStore.weather?.weather?.forecast_conditions ?? [],
    (newVal) => {
      if (Array.isArray(newVal) && newVal.length) {
        updateWeatherData(newVal)
      } else {
        updateWeatherData(dummyData)
      }
    },
    { immediate: true }
)

function updateWeatherData(weather){
  console.log('☀️ 날씨가 스토어에 저장되었습니다:', weather)
  const source = Array.isArray(weather) && weather.length
      ? weather
      : dummyData

  weatherList.value = source.map(item => {
    // 원래 내려오는 아이콘 주소
    const originalIcon = item.icon

    // 1) http://10.100.29.223 → https://weather.hhi.co.kr 로 치환
    const fixedIcon = originalIcon.replace(
        /^http:\/\/10\.100\.29\.223/,
        'https://weather.hhi.co.kr'
    )

    // 2) 혹시 아이콘 파일명이 다르게 와도 확장자만 붙여 사용 가능 (옵션)
    // const fileName = originalIcon.split('/').pop() // w51.png
    // const fixedIcon = `https://weather.hhi.co.kr/share/images/w_icon/${fileName}`

    return {
      date: item.tm.slice(0, 4) + '.' + item.tm.slice(4, 6) + '.' + item.tm.slice(6, 8) + ' (' + item.day_of_week + ')',
      condition: item.condition,
      temperature: item.low + '°C ~ ' + item.high + '°C',
      iconUrl: fixedIcon,
    }
  })
}
</script>

<style scoped>
.weather-card {
  background-color: #222242;
  min-width: 320px;   /* 카드 더 크게 */
  height: 80px;       /* 카드 높이 */
  color: white;       /* 모든 텍스트 흰색 */
  display: flex;
  align-items: center;
  border-radius: 0 !important;
}

/* v-row 커스텀 */
.weather-row {
  height: 100%;
  padding: 10px;
}

/* 아이콘 */
.weather-icon {
  display: flex;
  align-items: center;
}
.weather-avatar {
  width: 50px;
  height: 50px;
  margin-right: 12px;
  background-color: #454675; /* blue-lighten-4 대체 */
}
.weather-img {
  width: 48px;
  height: 48px;
}

/* 텍스트 영역 */
.weather-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.weather-date {
  font-size: 16px; /* text-subtitle-1 크기 */
  font-weight: bold;
}
.weather-condition {
  font-size: 16px; /* text-body-1 크기 */
  font-weight: 500;
}

/* 온도 */
.weather-temp {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 18px; /* text-h6 크기 */
  font-weight: 900;
}

</style>
