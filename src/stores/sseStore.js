import { defineStore } from 'pinia'

export const useSSEStore = defineStore('sse', {
    state: () => ({
        driveMode: {},
        // scheduleMode: {},
        valveStatus: {},
        frontPressure: {},
        backPressure: {},
        temperature: {},
        compPressure: {},
        timestamp: null,
        chartData: [], // ⬅️ ECharts용 누적 데이터

        byPassOpenAlarm: {},
        valveFaultAlarm: {},
        leakAlarm: {},
        compAlarm: {},
        expectedValue1C: null,
        expectedValue3C: null,

        writeCommands: {},

        weatherList: {}
    }),
    actions: {

        // ✅ 명세 데이터를 저장
        setMeta(meta) {
            this.meta = meta
            console.log('📚 명세 저장 완료:', meta)

            // ✅ 공장별 ON/OFF commandId 셋팅
            const writeCmds = {}
            meta.data.content.forEach(device => {
                const { deviceName, commands } = device
                if (deviceName === '1B' || deviceName === '2B') {
                    // ON_WRITE, OFF_WRITE인 command 찾기
                    const onCmd = commands.find(c => c.commandType === 'ON_WRITE')
                    const offCmd = commands.find(c => c.commandType === 'OFF_WRITE')
                    writeCmds[deviceName] = {
                        onWrite:   onCmd  ? onCmd.commandId  : null,
                        offWrite:  offCmd ? offCmd.commandId : null
                    }
                }
            })
            this.writeCommands = writeCmds
            // console.log('📚 쓰기 커맨드 IDs:', this.writeCommands)

            // ✅ 1C, 3C 기준값 셋팅
            const expectedValue_1C = meta.data.content.find(item => item.deviceName === '1C')?.commands?.[0]?.conditions?.[0]?.expectedValue || null
            const expectedValue_3C = meta.data.content.find(item => item.deviceName === '3C')?.commands?.[0]?.conditions?.[0]?.expectedValue || null
            this.expectedValue1C = (Number(expectedValue_1C) / 1000).toFixed(2)
            this.expectedValue3C = (Number(expectedValue_3C) / 1000).toFixed(2)
            console.log('1C, 3C 기준값 셋팅 ', this.expectedValue1C, this.expectedValue3C);
        },

        // ✅ 날씨 데이터를 저장
        setWeather(data) {
            this.weather = data
            console.log('☀️ 날씨 저장 완료:', data)
        },
        // ✅ 날씨 데이터를 업데이트
        updateWeatherData(data) {
            this.weather = data
            console.log('☀️ 날씨 SSE updateWeatherData:', data)
        },

        // ✅ 알람 데이터
        updateAlarmData(data){
            /* 1(true)이면 알람 메세지
             * LEAK 발생
             * 밸브 오작동
             * 현장 수동 밸브 확인 */

            // console.log('⚠️ 알람 updateAlarmData:', data)

            const { deviceName, commandType, responseData } = data
            const factory = deviceName

            if (commandType === 'BYPASS_OPEN_ALARM') { // 알람: 현장 수동밸브 확인
                const alarm = responseData === '0' ? 'push' : ''
                this.byPassOpenAlarm = {
                    ...this.byPassOpenAlarm,
                    [factory]: alarm,
                }
                console.log('⚠️ 알람 BYPASS_OPEN_ALARM:', alarm)
            }
            else if (commandType === 'VALVE_FAULT_ALARM') { // 알람: 밸브 오작동
                const alarm = responseData === '0' ? 'push' : ''
                this.valveFaultAlarm = {
                    ...this.valveFaultAlarm,
                    [factory]: alarm,
                }
                console.log('⚠️ 알람 VALVE_FAULT_ALARM:', alarm)
            }
            else if (commandType === 'LEAK_ALARM') { // 알람: LEAK 발생
                const alarm = responseData === '0' ? 'push' : ''
                this.leakAlarm = {
                    ...this.leakAlarm,
                    [factory]: alarm,
                }
                console.log('⚠️ 알람 LEAK_ALARM:', alarm)
            }
            else if (commandType === 'PRESSURE') {
                const pressureValue = responseData / 1000
                let alarm = null;
                if(deviceName === '1C') {
                    alarm = pressureValue <= this.expectedValue1C ? 'push' : ''
                    console.log('⚠️ 알람 PRESSURE(1콤프실):', deviceName, pressureValue, this.expectedValue1C, alarm)
                } else if(deviceName === '3C') {
                    alarm = pressureValue <= this.expectedValue3C ? 'push' : ''
                    console.log('⚠️ 알람 PRESSURE(3콤프실):', deviceName, pressureValue, this.expectedValue3C, alarm)
                }

                this.compAlarm = {
                    ...this.compAlarm,
                    [factory]: alarm
                }
            }
        },

        // ✅ 모드·압력·온도 등 데이터 업데이트
        updateData(data) {

            // console.log('📈 컴프레셔 압력 변경:', data)
            const { deviceName, commandType, responseData, executedAt } = data
            let value = (responseData / 1000).toFixed(2)
            if(commandType === 'TEMPERATURE'){
                value = (responseData / 10).toFixed(1)
            }

            const factory = deviceName
            const timeKey = get5SecondKey(executedAt ?? new Date().toISOString())

            // 누적 배열에 시간별 데이터를 구성
            const existingIndex = this.chartData.findIndex(item => item.time === timeKey)
            const key = `${commandType}_${factory}`

            if (existingIndex !== -1) {
                // 기존 5초 구간에 데이터가 이미 있으면 값만 갱신
                this.chartData[existingIndex][key] = value
            } else {
                // 새 5초 구간이므로 새 row 추가
                const newRow = { time: timeKey, [key]: value }

                // 이전 값이 있다면 복사
                if (this.chartData.length > 0) {
                    const lastRow = this.chartData[this.chartData.length - 1]
                    const cloned = cloneLastRowData(lastRow)

                    // 누락된 값 복사
                    for (const k in cloned) {
                        if (!(k in newRow)) {
                            newRow[k] = cloned[k]
                        }
                    }
                }
                this.chartData.push(newRow)

                // if (this.chartData.length > 12) this.chartData.shift() // 오래된 데이터 제거 (최대 60초치 = 5초 간격 × 12개)
                if (this.chartData.length > 120) this.chartData.shift() // 오래된 데이터 제거 (최대 10분치 = 5초 간격 × 120개)
            }

            if (commandType === 'UPSTREAM_PRESSURE') { // 1B: 전단압력, 2B: 전단압력
                this.frontPressure = {
                    ...this.frontPressure,
                    [factory]: (responseData / 1000).toFixed(2),
                }
            }
            else if (commandType === 'DOWNSTREAM_PRESSURE') { // 1B: 후단압력, 2B: 후단압력
                this.backPressure = {
                    ...this.backPressure,
                    [factory]: (responseData / 1000).toFixed(2),
                }
            }
            else if (commandType === 'TEMPERATURE') { // 1B: 온도, 2B: 온도
                this.temperature = {
                    ...this.temperature,
                    [factory]: (responseData / 10).toFixed(1),
                }
            }
            else if (commandType === 'ON_STATUS' /* || command === 'OFF_STATUS' */) { // 1B: on/off, 2B: on/off
                const on_off = responseData === '0' ? 'ON' : 'OFF'
                // console.log('📈 SSE > ON_STATUS :',factory ,on_off)
                this.valveStatus = {
                    ...this.valveStatus,
                    [factory]: on_off,
                }
            }

            else if (commandType === 'PRESSURE') {
                const pressureValue = responseData / 1000
                this.compPressure = {
                    ...this.compPressure,
                    [factory]: pressureValue.toFixed(2)
                }
            }
            else if (commandType === 'LOCAL_REMOTE_STATUS') { // 운전모드
                const drivingMode = responseData === '0' ? '현장' : '원격'
                // console.log('📈 SSE > LOCAL_REMOTE_STATUS :',responseData)
                this.driveMode = {
                    ...this.driveMode,
                    [factory]: drivingMode,
                }
            }
        }
    }
})

// timeKey를 5초 단위로 그룹화
function get5SecondKey(dateStr) {
    const date = new Date(dateStr)
    const seconds = Math.floor(date.getSeconds() / 5) * 5
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    const ss = String(seconds).padStart(2, '0')
    return `${hh}:${mm}:${ss}` // 예: "17:52:00", "17:52:05"
}

// 이전 값 복사 함수
function cloneLastRowData(lastRow) {
    const cloned = { time: '', }
    for (const key in lastRow) {
        if (key !== 'time') cloned[key] = lastRow[key]
    }
    return cloned
}