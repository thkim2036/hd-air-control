import { fetchSSEMeta } from "@/api/sseMeta"
import { useSSEStore } from "@/stores/sseStore"
import { fetchWeatherAPI } from "@/api/weatherAPI";
import { generateMockSSEData } from '@/mocks/mockData'
import { baseURL } from '@/config/apiConfig'

// 환경 변수로 mock 모드 판별
const isMock = import.meta.env.VITE_USE_MOCK === 'true'

// SSE 관련 전역 변수
let isMetaFetched = false
let isWeatherFetched = false
let eventSource = null      // SSE 연결
let eventWeather = null     // SSE 날씨
let eventAlarm = null       // SSE 알람
let retryInterval = null    // 재시도 타이머
let mockInterval = null
let mockIndex = 0

export function useSSE() {
    const store = useSSEStore()

    // ✅ SSE 연결 함수
    const connect = async () => {

        // 중복 연결 방지
        if (eventSource) return

        try {
            // mock 모드이면 실제 SSE 대신 mock 실행
            if (isMock) {
                console.log('🧪 Mock 모드 → mock 데이터 연결 시작')
                startMock()
                return
            }

            // 1️⃣ 서버 명세 조회
            if (!isMetaFetched) {
                console.log('1️⃣ 명세 API 호출')
                const res = await fetchSSEMeta()
                store.setMeta(res.data)
                isMetaFetched = true
            }

            // 2️⃣ 날씨 API 호출
            if (!isWeatherFetched) {
                console.log('☀️ 날씨 API 호출')
                const res = await fetchWeatherAPI()
                store.setWeather(res.data)
                isWeatherFetched = true
            }

            // 6자리 랜덤 숫자 생성
            const clientId = Math.floor(100000 + Math.random() * 900000)

            // 3️⃣ SSE 스트림 연결 (modify paths as needed)
            eventSource = new EventSource(`${baseURL}/modbus/stream?clientId=${clientId}`)
            // eventWeather = new EventSource('/weather/stream/subscribe')
            // console.log('🔌 SSE 연결 시도...', eventSource)


            // 📥 SSE 정상 데이터 수신
            eventSource.addEventListener("modbus-event-success", e => {
                const data = JSON.parse(e.data)
                store.updateData(data)
                //console.log('📥 SSE 정상 데이터 수신 modbus-event-success', data)
            })
            // ⚠️ SSE 오류 데이터 수신
            eventSource.addEventListener("modbus-event-error", e => {
                const data = JSON.parse(e.data)
                store.updateData(data)
                // console.warn('⚠️ SSE 오류 데이터 수신 modbus-event-error', data)
            })

            // 📥 밸브 ON/OFF 정상 데이터 수신
            // commandType(ON_WRITE - 0 켜짐 / 1 꺼짐)
            // commandType(OFF_WRITE - 1 꺼짐 / 0 켜짐)
            eventSource.addEventListener("force-event-success", e => {
                const data = JSON.parse(e.data)
                store.updateData(data)
                console.log('📥 밸브 ON/OFF force-event-success', data)
            })
            // ⚠️ 밸브 ON/OFF 오류 데이터 수신
            eventSource.addEventListener("force-event-error", e => {
                const data = JSON.parse(e.data)
                store.updateData(data)
                console.log('📥 밸브 ON/OFF force-event-errors', data)
            })

            // ⚠️ 알람
            eventSource.addEventListener("modbus-alarm-event", e => {
                const data = JSON.parse(e.data)
                store.updateAlarmData(data)
                console.warn('⚠️ 알람 메세지 modbus-alarm-event', data)
            })

            // ☀️ 날씨 데이터 수신
            // eventWeather.addEventListener("weather-update", e => {
            //     const data = JSON.parse(e.data)
            //     store.updateWeatherData(data)
            //     console.warn('☀️ weather-update', data)
            // })

            // ❌ SSE 연결 오류 발생
            eventSource.onerror = (e) => {
                console.error('❌ SSE 연결 오류 발생', e)
                stopSSE()
                scheduleRetry()
            }
        }
        catch (err) {
            console.error('❗ 연결 중 오류 발생', err)
            stopSSE()
            scheduleRetry()
        }
    }

    /**
     * mock 데이터 시작
     */
    const startMock = () => {
        if (mockInterval) return
        mockIndex = 0
        mockInterval = setInterval(() => {
            const packet = generateMockSSEData(mockIndex++)
            store.updateData(packet.data[0])
        }, 300)
    }

    // ⛔ 연결 해제 (컴포넌트 언마운트 시 호출)
    const disconnect = () => {
        stopSSE()
        stopMock()
        stopRetry()
    }

    // ✂️ SSE 스트림 개별 종료
    const stopSSE = () => {
        if (eventSource) {
            eventSource.close()
            eventSource = null
            console.log('🛑 SSE 연결 종료')
        }
        if (eventWeather) {
            eventWeather.close()
            eventWeather = null
        }
        if (eventAlarm) {
            eventAlarm.close()
            eventAlarm = null
        }
    }

    /**
     * mock 종료
     */
    const stopMock = () => {
        if (mockInterval) {
            clearInterval(mockInterval)
            mockInterval = null
            console.log('🛑 Mock 종료')
        }
    }

    // 🔁 재시도 예약 (10초 간격)
    const scheduleRetry = () => {
        if (retryInterval) return
        retryInterval = setInterval(() => {
            connect()
        }, 10000)
    }

    // 📴 재시도 예약 해제
    const stopRetry = () => {
        if (retryInterval) {
            clearInterval(retryInterval)
            retryInterval = null
        }
    }
    return {
        connect,
        disconnect
    }
}
