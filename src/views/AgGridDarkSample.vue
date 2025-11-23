<template>
  <v-container class="pa-4" fluid>
    <h2 style="color: white; margin-bottom: 16px;">AG Grid Quartz Dark Test</h2>

    <div
        class="ag-theme-quartz-dark"
        style="height: 600px; width: 100%; border-radius: 8px;"
    >
      <ag-grid-vue
          :columnDefs="columnDefs"
          :rowData="rowData"
          :defaultColDef="defaultColDef"
          :animateRows="true"
      />
    </div>
  </v-container>
</template>

<script setup>
import { ref } from "vue";

/* ✔ 필수 AG Grid 모듈 등록 */
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

/* ✔ 컴포넌트 */
import { AgGridVue } from "ag-grid-vue3";

/* ✔ 컬럼 정의 */
const columnDefs = ref([
  { field: "factory", headerName: "공장", width: 120 },
  { field: "ship", headerName: "호선", width: 120 },
  { field: "block", headerName: "블록", width: 120 },
  { field: "work", headerName: "작업내용", width: 150 },
]);

/* ✔ 샘플 데이터 */
const rowData = ref([
  { factory: "1B", ship: "842506", block: "1B14", work: "1ND" },
  { factory: "1B", ship: "842506", block: "1B14", work: "2ND" },
  { factory: "1B", ship: "842506", block: "1B14", work: "3ND" },
  { factory: "2B", ship: "291507", block: "2N22", work: "수거" },
]);

/* ✔ 기본 설정 */
const defaultColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  cellStyle: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
};
</script>

<style scoped>
/* Quartz Dark 테마 커스터마이징 */
.ag-theme-quartz-dark {
  --ag-background-color: #1e1f2a;
  --ag-header-background-color: #2a2b38;
  --ag-foreground-color: #e0e0e0;
  --ag-header-foreground-color: #ffffff;
  --ag-row-hover-color: #2f3041;
  --ag-border-color: #3c3d4b;

  font-size: 14px;
}

.ag-theme-quartz-dark .ag-cell {
  display: flex !important;
  justify-content: center;
  align-items: center;
  color: white;
}

.ag-theme-quartz-dark .ag-header-cell-label {
  justify-content: center;
  color: white;
  font-weight: bold;
}
</style>
