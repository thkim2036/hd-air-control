<template>
  <svg class="pipe-svg">
    <!-- 🟡 메인 고정 회색 배관 -->
    <path d="M 573 140 H 1070" class="pipe-base" />
    <path d="M 1255 140 H 1070" class="pipe-base" />
    <path d="M 1070 145 V 680" class="pipe-base" />

    <!-- 🟡 메인 흐름 애니메이션 (얇은 흐름 효과만) -->
    <path d="M 575 140 H 1070" class="flow-anim" />
    <path d="M 1255 140 H 1070" class="flow-anim" />
    <path d="M 1070 150 V 675" class="flow-anim" />

    <!-- 🔵 1B 가지 배관: 항상 고정 회색 -->
    <path d="M 1078 355 H 1221" class="branch-base" />

    <!-- 🔵 1B 흐름 애니메이션: 조건부 -->
    <path
        v-if="valve1b === 'ON'"
        d="M 1078 355 H 1221"
        class="branch-flow"
    />

    <!-- 🔵 2B 가지 배관: 항상 고정 회색 -->
    <path d="M 1078 674 H 1220" class="branch-base" />

    <!-- 🔵 2B 흐름 애니메이션: 조건부 -->
    <path
        v-if="valve2b === 'ON'"
        d="M 1078 674 H 1220"
        class="branch-flow"
    />
  </svg>
</template>


<script setup>
import { computed } from 'vue'
import { useSSEStore } from '@/stores/sseStore'
import { storeToRefs } from 'pinia'

const { valveStatus } = storeToRefs(useSSEStore())
const valve1b = computed(() => valveStatus.value['1B'] ?? '-')
const valve2b = computed(() => valveStatus.value['2B'] ?? '-')

</script>

<style scoped>
.pipe-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* 🟫 고정된 파이프 (메인) */
.pipe-base {
  fill: none;
  stroke: #37385F;
  stroke-width: 12;
}

/* 🔵 흐름 애니메이션 (메인용) */
.flow-anim {
  fill: none;
  stroke: #A8A6DB;
  stroke-width: 5;
  stroke-dasharray: 12;
  animation: flowAnim 1s linear infinite;
  stroke-linecap: round;
}

/* 🔘 가지 배관 (고정 회색) */
.branch-base {
  fill: none;
  stroke: #37385F;
  stroke-width: 12;
  stroke-linecap: round;
}

/* 🔵 가지 흐름 (조건부) */
.branch-flow {
  fill: none;
  stroke: #A8A6DB;
  stroke-width: 5;
  stroke-dasharray: 12;
  animation: flowAnim 1s linear infinite;
  stroke-linecap: round;
}

/* 애니메이션 키프레임 */
@keyframes flowAnim {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -20; }
}

</style>
