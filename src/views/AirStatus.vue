<template>
  <v-container fluid class="bg-map"
               :style="containerStyle">

    <div class="componentsDiv" >
      <!-- 콤프실-->
      <CompMonitorCard
          v-for="item in compCards"
          :key="item.id"
          :item="item"
          :drag-enabled="dragEnabled"
          :resizable="resizable"
          @dragstop="e => onDragStop(item, e)"
          :style="cardStyle"
      />

      <!-- 공장(1B,2B) -->
      <BlastingMonitorCard
          v-for="item in blastCards"
          :key="item.id"
          :item="item"
          :drag-enabled="dragEnabled"
          :resizable="resizable"
          @dragstop="e => onDragStop(item, e)"
          :style="cardStyle"
      />

      <!-- 공장(3B,4B,5B,6B) -->
      <BlastingExpectedCard
          v-for="item in blast"
          :key="item.id"
          :item="item"
          @dragstop="e => onDragStop(item, e)"
          :style="cardStyle"
      />

      <AirPipeLines
          :style="cardStyle"
      />
    </div>

  </v-container>
</template>

<script setup>
import { ref, defineProps, computed, watch } from 'vue'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
import CompMonitorCard from '@/components/CompMonitorCard.vue'
import BlastingMonitorCard from '@/components/BlastingMonitorCard.vue'
import BlastingExpectedCard from '@/components/BlastingExpectedCard.vue'
import AirPipeLines from "@/components/AirPipeLines.vue";

const props = defineProps({
  item: Object,
  dragEnabled: {
    type: Boolean,
    default: true
  },
  resizable: {
    type: Boolean,
    default: true
  },
  drawerOpen: Boolean
})

// 컨테이너 높이 동적 설정
const containerStyle = computed(() => ({
  height: props.drawerOpen ? '91.2vh' : '98.1vh', // ⭐ 일반/전체화면 구분
  width: '100vw'
}))

// ⭐ margin-left, margin-top 스타일을 drawerOpen 값에 따라 계산
const cardStyle = computed(() => ({
  marginLeft: props.drawerOpen ? '30px' : '160px',
  marginTop: props.drawerOpen ? '0px' : '80px'
}))

const compCards = computed(() => [
  { id: '1C', title: '1콤프실', x: 1270, y: 100, },
  { id: '3C', title: '3콤프실', x: 370, y: 100, },
])

const blastCards = computed(() => [
  {id: '1B', title: '1B', x: 1240, y: 230,},
  {id: '2B', title: '2B', x: 1240, y: 550,},
])

const blast = ref([
  {id: '3B', title: '3B(확장예정)', x: 660, y: 420},
  {id: '4B', title: '4B(확장예정)', x: 345, y: 420},
  {id: '5B', title: '5B(확장예정)', x: 30, y: 420},
  {id: '6B', title: '6B(확장예정)', x: 30, y: 100}
])

function onDragStop(item, e) {
  item.x = e.x
  item.y = e.y
}

</script>

<style scoped>
.bg-map {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: url('/images/HD-background_02.png');
  background-size: cover; /* 화면 비율에 맞게 꽉 채움 */
  background-position: center;
  background-repeat: no-repeat; /* 반복 없음 */
  image-rendering: pixelated; /* 확대 시 픽셀 보존 */
}

</style>