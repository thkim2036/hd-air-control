// mockData.js
import { useSSEStore } from '@/stores/sseStore'

const deviceConfig = {
    '1B': ['UPSTREAM_PRESSURE', 'DOWNSTREAM_PRESSURE', 'TEMPERATURE', 'ON_STATUS', 'OFF_STATUS', 'LOCAL_REMOTE_STATUS', 'BYPASS_OPEN_ALARM', 'VALVE_FAULT_ALARM', 'LEAK_ALARM'],
    '2B': ['UPSTREAM_PRESSURE', 'DOWNSTREAM_PRESSURE', 'TEMPERATURE', 'ON_STATUS', 'OFF_STATUS', 'LOCAL_REMOTE_STATUS', 'BYPASS_OPEN_ALARM', 'VALVE_FAULT_ALARM', 'LEAK_ALARM'],
    '1C': ['PRESSURE'],
    '3C': ['PRESSURE'],
}

// 알람 주기 5초
let alarmState = 1
setInterval(() => {
    alarmState = alarmState === 1 ? 0 : 1
}, 5000)

const mockTemplates = {
    UPSTREAM_PRESSURE: {
        commandDescription: "컨트롤밸브 전단 IA 압력",
        generate: () => Math.floor(7000 + Math.random() * 1000),
    },
    DOWNSTREAM_PRESSURE: {
        commandDescription: "컨트롤밸브 후단 IA 압력",
        generate: () => Math.floor(7000 + Math.random() * 1000),
    },
    TEMPERATURE: {
        commandDescription: "컨트롤밸브 후단(현장) IA 온도",
        generate: () => Math.floor(240 + Math.random() * (390 - 240 + 1)),
    },
    ON_STATUS: {
        commandDescription: "VALVE ON STATUS",
        generate: () => '0',
    },
    OFF_STATUS: {
        commandDescription: "VALVE OFF STATUS",
        generate: () => '0',
    },
    LOCAL_REMOTE_STATUS: {
        commandDescription: "운전모드(0:LOCAL, 1:REMOTE)",
        generate: () => '1',
    },
    PRESSURE: {
        commandDescription: "COMP실 공급 압력",
        generate: () => Math.floor(7000 + Math.random() * 1000),
    },
    BYPASS_OPEN_ALARM: {
        commandDescription: "BY PASS 무단 OPEN ALRAM (1B 현장 수동밸브 확인)",
        generate: () => alarmState,
    },
    VALVE_FAULT_ALARM: {
        commandDescription: "ON/OFF VALVE 오작동 ALRAM (1B 밸브 오작동)",
        generate: () => alarmState,
    },
    LEAK_ALARM: {
        commandDescription: "LEAK 발생 ALRAM (1B LEAK 발생)",
        generate: () => alarmState,
    },
}

const deviceNames = Object.keys(deviceConfig)  // ['1B','2B','1C','3C']

function getFormattedDate() {
    const now = new Date()
    const pad = v => String(v).padStart(2, '0')
    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ` +
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

export function generateMockSSEData(globalIndex = 0) {
    // Pinia가 활성화된 이후에 스토어를 가져와 기준값 세팅
    const sseStore = useSSEStore()
    sseStore.expectedValue1C = 7.5
    sseStore.expectedValue3C = 7.5

    // 어떤 장비, 어떤 커맨드를 보낼지 결정
    const deviceIndex  = globalIndex % deviceNames.length
    const deviceName   = deviceNames[deviceIndex]
    const validTypes   = deviceConfig[deviceName]
    const itemIndex    = Math.floor(globalIndex / deviceNames.length) % validTypes.length
    const commandType  = validTypes[itemIndex]
    const template     = mockTemplates[commandType]

    return {
        data: [
            {
                deviceName,
                commandType,
                commandDescription: `${deviceName} ${template.commandDescription}`,
                responseData:   template.generate(),
                executedAt:     getFormattedDate(),
            },
        ],
        timestamp: new Date().toISOString(),
    }
}
