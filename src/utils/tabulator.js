// -- 다국어
import i18n from '@/plugins/i18n'
import '@/styles/tabulatorStyles.scss'

import dayjs from 'dayjs'

// -- 달력
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'

import { find, forEach, filter } from 'lodash-es'
import { TabulatorFull as Tabulator } from 'tabulator-tables'
import 'tabulator-tables/dist/css/tabulator_midnight.min.css'

// -- Clipboard
import { useClipboard } from '@vueuse/core'
import { useCommonStore } from '@hiway/stores/common'

import { computed } from 'vue'

// XLSX
import * as XLSX from 'xlsx/xlsx.mjs'

window.XLSX = XLSX

// eslint-disable-next-line sonarjs/cognitive-complexity
const TabulatorFactory = (container, gridOption) => {
  const commonStore = useCommonStore()

  const {
    rowHeaders,
    gridColumns,
    gridColumnAlign,
    gridHeight,
    gridRowHeight,
    gridColumnLayout,
    gridData,
    gridSelectable,
    contextMenu,
    tooltipColumn,
    gridResizable,
  } = gridOption

  // 기본 Header
  const defaultRowHeaders = [
    {
      name: 'rowNum',
      field: 'rowNum',
      title: 'No.',
      formatter: 'rownum',
      headerHozAlign: 'center',
      hozAlign: 'center',
      headerSort: false,
      resizable: false,
      frozen: true,
      print: false,
      clipboard: false,
      width: 40,
    },
    {
      name: 'checkbox',
      field: 'checkbox',
      formatter: 'rowSelection',
      titleFormatter: 'rowSelection',
      titleFormatterParams: {
        rowRange: 'active',
      },
      headerHozAlign: 'center',
      hozAlign: 'center',
      headerSort: false,
      resizable: false,
      frozen: true,
      print: false,
      clipboard: false,
      width: 40,
    },
  ]

  const radioRowHeaders = {
    field: 'radio',
    formatter: formatterRadio,
    headerHozAlign: 'center',
    hozAlign: 'center',
    headerSort: false,
    resizable: false,
    frozen: true,
    print: false,
    clipboard: false,
    width: 40,
  }

  const setRowHeaders = []
  if (rowHeaders) {
    rowHeaders.forEach(item => {
      if (item === 'none') {
        setRowHeaders.push({ visible: false })
      } else if (item === 'radio') {
        setRowHeaders.push(radioRowHeaders)
      } else setRowHeaders.push(find(defaultRowHeaders, { name: item }))
    })
  }

  // 행 움직이기 활성화 시 컬럼 맨 앞에 핸들 추가
  if (gridOption.movableRows) {
    setRowHeaders.unshift({
      field: 'rowHandle',
      rowHandle: true,
      formatter: 'handle',
      headerSort: false,
      resizable: false,
      frozen: true,
      print: false,
      clipboard: false,
      width: 30,
      minWidth: 30,
    })
  }
  
  // Tabulator 그리드의 Index 전용 컬럼 생성
  // row.getIndex() 사용하기 위한 변수
  let idCount = 0
  setRowHeaders.unshift({
    title: 'ID',
    field: 'id',
    frozen: true,
    visible: false,
    print: false,
    clipboard: false,
    formatter: function (cell) {
      const row = cell.getRow()
      const rowData = row.getData()
      
      if (rowData.createRow) {
        const rowEl = row.getElement()

        rowEl.classList.add('tabulator-row-created')
      }
    },
    mutatorData: function () {
      return idCount++
    }, 
  })

  const setAlign = gridColumnAlign ?? 'center'

  const setSubColumns = items => {
    forEach(items, subColumn => {
      subColumn.hozAlign = subColumn.hozAlign ?? setAlign
      subColumn.headerHozAlign = subColumn.headerHozAlign ?? setAlign
      subColumn.headerSort = subColumn.headerSort ?? false
      subColumn.headerSortTristate = true
      if (gridResizable === false) {
        subColumn.resizable = subColumn.resizable ?? false
      }
      if (subColumn.columns !== []) {
        setSubColumns(subColumn.columns)
      }
    })
  }
  
  // Column 정렬
  setSubColumns(gridColumns)

  // 복사
  const copyAction = (value, element) => {
    let copyData = ''
    if (element) {
      copyData = element.textContent
    } else {
      copyData = value
    }

    const { copy, isSupported } = useClipboard({ source: computed(() => value) })

    if (!isSupported.value) {
      if (window.navigator?.clipboard && window.isSecureContext) {
        window.navigator.clipboard.writeText(copyData).then(() => {
          console.log('복사 완료')
        })
      } else {
        const getSelectedIconEl = document.getElementById('input_copy_content')

        let tempEl = ''
  
        if (!getSelectedIconEl) {
          const el = document.createElement('textarea')
  
          el.id = 'input_copy_content'
          el.style.position = "absolute"
          el.style.left = "-999999px"
  
          document.body.prepend(el)
  
          tempEl = el
        } else {
          tempEl = getSelectedIconEl
        }
  
        tempEl.value = copyData

        tempEl.select()

        document.execCommand('copy')
        console.log('복사 완료')
      }

      // window.navigator.clipboard.writeText(copyData).then(() => {
      //   console.log('복사 완료')
      // })
    } else {
      copy(value).then(() => {
        console.log('복사 완료')
      })
    }
  }

  // 붙여넣기
  const pasteAction = cell => {
    window.navigator.clipboard.readText().then(res => {
      cell.setValue(res)
    })
  }

  // 그리드 기본 옵션
  const defaultOptions = {
    debugDeprecation: false,
    debugInitialization: false,
    debugInvalidComponentFuncs: false,
    debugInvalidOptions: false,
    height: gridHeight ?? 'inherit',
    minHeight: '100px',
    maxHeight: '100%',
    clipboard: true,
    clipboardCopyStyled: false,
    clipboardCopyConfig: {
      columnHeaders: true,
      columnGroups: true,
      rowGroups: true,
      columnCalcs: true,
      dataTree: true,
      formatCells: false,
    },
    rowHeight: gridRowHeight !== undefined ? gridRowHeight : 30,
    layout: gridColumnLayout ?? 'fitColumns',
    columns: [...(setRowHeaders === [] ? defaultRowHeaders : setRowHeaders), ...gridColumns],
    layoutColumnsOnNewData: true,
    headerSortClickElement: 'icon',
    data: gridData ?? [],
    selectable: gridSelectable ?? 'highlight',
    validationMode: 'highlight', // 기본 값 blocking = esc 하지 않으면 다른 셀로 포커스 이동 되지 않음, highlight = 표시만
    history: true,
    groupToggleElement: 'header',
    printAsHtml: true,
    printStyled: true,
    printRowRange: 'visible',
    printHeader: '<h1>Table Header<h1>',
    printFooter: '<h2>Table Footer<h2>',
    printConfig: {
      columnHeaders: true, // 인쇄 테이블에 열 헤더를 포함
      columnGroups: true,  // 인쇄 테이블의 열 헤더에 열 그룹을 포함
      rowGroups: true,     // 인쇄 테이블에 행 그룹을 포함
      columnCalcs: true,   // 인쇄 테이블에 열 계산을 포함
      dataTree: true,      // 인쇄 테이블에 데이터 트리를 포함
      formatCells: false,   // 인쇄 테이블의 셀 값을 포매터로 표시
    },
    columnDefaults: {
      debugDeprecation: false,
      debugInitialization: false,
      debugInvalidComponentFuncs: false,
      debugInvalidOptions: false,

      // tooltip: function (e, cell, onRendered) {
      //   if (tooltipColumn) {
      //     if (cell.getColumn().getField() === tooltipColumn) {
      //       const el = document.createElement('div')

      //       el.innerHTML = cell.getValue()
            
      //       return el
      //     }
      //   }
      // },
    },
    rowContextMenu: contextMenu ?? [
      {
        label: 'Copy',
        action: function() {
          // 해당 셀 복사
          copyAction(resultGridData.currentCell.getValue(), resultGridData.currentCell.getElement())
        },
      },
      {
        label: 'Copy Columns',
        action: function(e, row) {
          // 해당 열 복사
          const currentCells = resultGridData.currentCell.getColumn().getCells()
          let cellData = ''
          for (let i = 0; i < currentCells.length; i++) {
            if (!currentCells[i].getValue()) {
              cellData += ``
              continue
            }
            cellData += `
${currentCells[i].getValue()}`
          }

          copyAction(cellData)
        },
      },
      {
        label: 'Copy Row',
        action: function(e, row) {
          // 해당 행 복사
          const currentCells = filter(row.getCells(), item => {
            switch (item.getColumn().getField()) {
            // 기본 헤더 컬럼 제외
            case 'rowNum':
            case 'checkbox':
            case 'radio':
            case 'rowHandle':
            case 'id': 
              break
            default: {
              return item
            }
            }
          })

          let rowData = ''
          for (let i = 0; i < currentCells.length; i++) {
            if (!currentCells[i].getValue()) {
              rowData += `	`
              continue
            }
            rowData += `${currentCells[i].getValue()}	`
          }

          copyAction(rowData)
        },
      },
      {
        label: 'Paste',
        action: function(e, row) {
          // 해당 셀이 편집 가능한지 확인
          const getColumn = resultGridData.currentCell.getColumn().getDefinition()
          if (getColumn.editor) {
            pasteAction(resultGridData.currentCell)
          } else {
            console.log('수정할 수 없는 컬럼 입니다.')
          }
        },
      },
      {
        label: 'Export',
        menu: [
          {
            label: function() {
              menuContainerInsert()
              
              return 'Excel Export'
            },
            action: function(e, row) {
              row.getTable().download('xlsx', 'grid-export.xlsx', { compress: false })
            },
          },
        ],
      },
    ],
    langs: {
      'ko-kr': {
        data: {
          loading: '로딩 중',
          error: '오류',
        },
        pagination: {
          page_size: '페이지 갯수',
          page_title: '페이지',
          first: '<<',
          first_title: '처음 페이지',
          last: '>>',
          last_title: '마지막 페이지',
          prev: '<',
          prev_title: '이전 페이지',
          next: '>',
          next_title: '다음 페이지',
          all: '모두',
        },
      },
    },
    rowFormatter: function (row) {
      const el = row.getElement()
      
      el.classList.add('tabulator-row-click')
    },
  }

  Object.assign(defaultOptions, gridOption)

  if (defaultOptions.dataTree) {
    if (typeof defaultOptions.selectable === 'number') {
      defaultOptions.dataTreeSelectPropagate = false
    } 
      
    defaultOptions.dataTreeSort = true
  } 

  const grid = new Tabulator(container, defaultOptions)

  const changeLanguage = () => {  
    const { t } = i18n.global

    forEach(gridColumns, item => {
      if (item.columns) {
        forEach(item.columns, subColumn => {
          if (!subColumn.i18n) subColumn.i18n = subColumn.title

          subColumn.title = t(subColumn.i18n)
        })
      }

      if (!item.i18n) item.i18n = item.title

      item.title = t(item.i18n)

      if (item?.headerFilterPlaceholder) {
        if (!item.i18nHeaderPlaceholder) item.i18nHeaderPlaceholder = item.headerFilterPlaceholder
        item.headerFilterPlaceholder = t(item.i18nHeaderPlaceholder)
      }
    })

    // if (i18n.locale === 'ko') {
    //   grid.setLocale('ko-kr')
    // } else {
    //   grid.setLocale('')
    // }

    grid.setColumns([...(setRowHeaders === [] ? defaultRowHeaders : setRowHeaders), ...gridColumns])
  }

  window.addEventListener('changeLocale', () => {
    changeLanguage()
  })

  const addClickCss = (current, previous, className) => {
    const currentEl = current.getElement()
    if (previous) {
      const previousEl = previous.getElement()
      if(previousEl && currentEl !== previousEl) {        
        previousEl.classList.remove(className)        
      }
    }

    currentEl.classList.add(className)
    
    resultGridData.currentCell = current
  }

  const menuContainerInsert = () => {
    setTimeout(() => {
      const body = document.getElementById(commonStore.systemCode)
      const el = body.getElementsByClassName('v-application')[0]

      const getList = document.getElementsByClassName('tabulator-popup-container')
      
      forEach(getList, item => {
        if (el) el.appendChild(item)
        else body.appendChild(item)
      })
    }, 0)
  }

  // Event
  const resultGridData = {
    selectedData: '',
    currentRow: '',
    previousScroll: '',
    currentCell: '',
  }

  grid.on('tableBuilt', () => {
    // 그리드 언어 설정
    changeLanguage()

    resultGridData.previousScroll = ''

    if (typeof defaultOptions.selectable === 'number') {
      const checkboxEl = find(grid.columnManager.columns, { field: 'checkbox' })
      
      if (checkboxEl) {
        const findInput = checkboxEl.element.getElementsByTagName('input')[0]

        findInput.style.visibility = 'hidden'
      }
    } 

    const headerFilters = document.getElementsByClassName('tabulator-header-filter')
    for (let i = 0; i < headerFilters.length; i++) {
      headerFilters[i].childNodes[0].addEventListener('click', () => {
        menuContainerInsert()
      })
    }
  })
  grid.on('cellClick', (event, cell) => {
    const rowEl = cell.getRow().getElement()
    if (rowEl.classList.contains('tabulator-selectable')) {
      // 이전 셀이 있다면 배경색 삭제
      addClickCss(cell, resultGridData.currentCell, 'tabulator-cell-current-selected')    
    }
  })
  grid.on('rowClick', (event, row) => {
    const rowEl = row.getElement()

    if (rowEl.classList.contains('tabulator-selectable')) {
      const temp = resultGridData.selectedData
      const currentData = row

      resultGridData.currentRow = currentData

      // 이전 행이 있다면 배경색 삭제
      if (temp) {
        if (temp.getIndex() !== currentData.getIndex()) {
          if (temp.getElement()) temp.getElement().classList.remove('tabulator-row-current-selected')
        }
      }

      // 행 선택시 해당 행 배경색 변경
      currentData.getElement().classList.add('tabulator-row-current-selected')
      resultGridData.selectedData = currentData


      // 헤더에 라디오 버튼이 있는 경우
      const radio = row.getCell('radio')
      if (radio) {
        radio.setValue(true, false)
      }
    }
  })
  grid.on('cellContext', (event, cell) => {
    // 셀 오른쪽 버튼 클릭
    addClickCss(cell, resultGridData.currentCell, 'tabulator-cell-current-selected')        
  })
  grid.on('rowContext', (event, row) => {
    // 행 오른쪽 버튼 클릭
    row.getElement().click()
    menuContainerInsert()
  })
  grid.on('cellEditing', cell => {
    // 이전 셀이 있다면 배경색 삭제
    addClickCss(cell, resultGridData.currentCell, 'tabulator-cell-current-selected')    

    const getCellColumn = cell.getColumn()

    // Editor 가 List 인 경우 해당 Element 수정 작업
    if (getCellColumn.getDefinition().editor === 'list') {
      menuContainerInsert()
    }
  })
  grid.on('cellEdited', cell => {
    const row = cell.getRow()

    if (cell.getField() === 'radio') {
      // 헤더에 라디오 버튼이 있는 경우 해당 셀은 수정되지 않음
      grid.clearCellEdited([cell])
      
      return
    }
    const checkData = cell.getValue() // 수정 값
    const getOldData = cell.getOldValue() // 이전 값
    const rowData = row.getData() // 생성 행 체크

    if (getOldData !== checkData && !rowData.createRow) {
      if (checkData === '' && (getOldData === null || getOldData === undefined)) {
        // 이전 값이 null 인 경우 Cell 클릭 시 값이 빈 문자열('')로 바뀌어 수정으로 인식되므로 분기 처리
        return
      }
      rowData.updateRow = true


      // Data 변경 시 해당 행 배경색 변경
      const el = row.getElement()

      el.classList.add('tabulator-row-updated')
    } else {
      grid.clearCellEdited([cell])
    }

    row.select() // 기본 값 = 수정 시 해당 row 체크
  })
  let gridDeletedData = []

  grid.on('rowDeleted', row => {
    const rowData = row.getData()
    if (!rowData.createRow) {
      gridDeletedData.push(rowData)
    }

    // 삭제된 행이 현재 행인 경우 초기화
    if (resultGridData.currentRow !== '') {
      if (rowData.id === resultGridData.currentRow.getData().id) {
        resultGridData.currentRow = ''
      }
    }
  })
  grid.on('headerClick', function(e, column){
    const el = column.getTable().element
    const columnName = column.getField()

    const getCheckboxEl = el.getElementsByClassName(`my-checkbox-all-check-${columnName}-disabled-false`)

    // 전체 체크, 체크 해제
    if (getCheckboxEl.length > 0) {
      const getRows = grid.getRows()

      let treeGetRows = undefined
      if(grid.options.dataTree) {
        const resultGridRows = []

        if (getRows !== []) {
          const findChild = child => {
            forEach(child, childRow => {
              const child = childRow.getTreeChildren()

              resultGridRows.push(childRow)

              if (child.length > 0) {
                findChild(child)
              }
            })
          }
          
          findChild(getRows)
        }

        treeGetRows = resultGridRows
      }

      const includesChecked = find(treeGetRows ?? getRows, item => {
        const rowData = item.getData()
        if (rowData[columnName] === 'Y') return item
      })

      Object.keys(getCheckboxEl).forEach(index => {
        if (!includesChecked) {
          getCheckboxEl[index].checked = false
        } else {
          getCheckboxEl[index].checked = true
        }
      })

      const setCheckboxValue = rows => {
        const value = includesChecked ? 'N' : 'Y'

        rows.forEach(row => {
          row.getCell(columnName).setValue(value, true)
        })
      }

      setCheckboxValue(treeGetRows ?? getRows)
    }
  })
  grid.on('rowSelected', function (row) {
    const treeCheck = grid.options.dataTree

    const disableRowDeselect = row => {
      const rowEl = row.getElement()
      const rowClassList = rowEl.classList

      if (rowClassList.contains('row-select-disabled')) {
        if (row.isSelected()) {
          row.deselect()
        }

        // 그리드 트리 인 경우 자식 행 까지 확인
        if (treeCheck) {
          const rowChild = row.getTreeChildren()

          if (rowChild.length > 0) {
            rowChild.forEach(item => {
              disableRowDeselect(item)
            })
          }
        }
      }
    }

    disableRowDeselect(row)
  })
  let gridResizeFlag = false

  // 그리드 컬럼 resize
  grid.on('columnResized', function () {
    gridResizeFlag = true
  })

  // 그리드 초기화
  grid.on('dataLoaded', function (data) {
    resultGridData.selectedData = ''
    resultGridData.currentRow = ''
    resultGridData.currentCell = ''
    gridDeletedData = []
    gridResizeFlag = false
    if (data.length > 0) idCount = 0
    const gridEl = grid.element
    const gridColumns = grid.columnManager.columns
    
    // header cursor
    gridColumns.forEach(column => {
      const columnName = column.getField()
      
      setTimeout(() => {
        const getCheckboxEl = gridEl.getElementsByClassName(`my-checkbox-all-check-${columnName}-disabled-false`)

        if (getCheckboxEl.length > 0) {
          const columnEl = column.getElement()

          columnEl.style.cursor = 'pointer'
        }
      }, 100)
    })
  })

  grid.on('cellEditCancelled', function (cell) {
    cell.validate()
  })

  // Function
  return {
    // 그리드
    g() {
      return grid
    },

    // 그리드 이벤트
    on(name, func) {
      return grid.on(name, func)
    },

    // 그리드 옵션 가져오기
    getOption() {
      return grid.options
    },

    // 그리드 컬럼 값 가져오기
    getColumns() {
      return grid.getColumns()
    },

    // 그리드 컬럼 고정
    setFrozenColumn(columnField) {
      const getColumn = find(grid.getColumns(), column => {
        if (column.getField() === columnField) return column
      })

      getColumn.updateDefinition(
        {
          frozen: true,
        },
      )
    },

    // 그리드 행 고정
    setFrozenRow(row) {
      row.freeze()
    },

    // 그리드 행 고정 해제
    setUnFrozenRow(row) {
      if (row.isFrozen()) row.unfreeze()
    },

    // 그리드 컬럼 숨김
    hideColumn(column) {
      column.hide()
    },

    // 셀 validator 확인
    requireCheck() {
      return grid.getInvalidCells()
    },

    // 그리드 데이터 매핑
    resetData(value) {
      if (gridResizeFlag) {
        // 그리드 컬럼 resize 초기화
        grid.setColumns([...(setRowHeaders === [] ? defaultRowHeaders : setRowHeaders), ...gridColumns])
      }

      grid.setData(value)
    },
    replaceData(value) {
      grid.replaceData(value)
    },

    // 그리드 데이터 초기화
    clear() {
      if (gridResizeFlag) {
        // 그리드 컬럼 resize 초기화
        grid.setColumns([...(setRowHeaders === [] ? defaultRowHeaders : setRowHeaders), ...gridColumns])
      }
      
      grid.setData([])
    },

    // 그리드 데이터 가져오기
    getData() {
      return grid.getData()
    },

    // 그리드 행 가져오기
    getRows() {
      const getRows = grid.getRows()

      const treeCheck = grid.options.dataTree
      if (!treeCheck) {
        return getRows
      } else {
        // 그리드 트리인 경우 자식 행 까지 모두 가져오기
        const resultGridRows = []

        if (getRows !== []) {
          const findChild = child => {
            forEach(child, childRow => {
              const child = childRow.getTreeChildren()

              resultGridRows.push(childRow)

              if (child.length > 0) {
                findChild(child)
              }
            })
          }
          
          findChild(getRows)
        }

        return resultGridRows
      }
    },

    // 그리드 데이터 개수
    getRowCount() {
      return grid.getData().length
    },

    // 그리드 컬럼 재설정
    setColumns(columns) {
      grid.setColumns([...(setRowHeaders ?? defaultRowHeaders), ...columns])
    },

    // 그리드 높이
    setHeight(height) {
      grid.setHeight(height)
    },

    // 그리드 스크롤을 해당 rowKey로 이동
    scrollToRow(rowKey) {
      grid.scrollToRow(rowKey)
    },

    // 그리드 행 추가
    appendRow(value, rowKey, scrollBottom, select, focus) {
      const newId = this.getRowCount() + 1

      const data = Object.assign(value, { createRow: true })

      // 뒤
      grid.addRow({ id: newId, ...data }, false, rowKey)

      const currentId = this.getRowCount() - 1

      // 추가 행으로 스크롤 이동
      if (scrollBottom) {
        // Scroll Bottom
        grid.scrollToRow(grid.getData()[currentId].id)
      }

      // 추가 행 선택
      if (select) {
        grid.getRow(grid.getData()[currentId].id).select()
      }

      // 추가 행 포커스
      if (focus) {
        grid.getRow(grid.getData()[currentId].id).getElement().click()
      }

      if (grid.options.dataTree) {
        this.expandAll()
      }

      return grid.getRow(grid.getData()[currentId].id)
    },

    // 그리드 행 추가
    prependRow(value, rowKey, scrollTop, select) {
      const newId = this.getRowCount() + 1

      const data = Object.assign(value, { createRow: true })

      // 앞
      grid.addRow({ id: newId, ...data }, true, rowKey)

      const currentId = 0

      // 추가 행으로 스크롤 이동
      if (scrollTop) {
        // Scroll Top
        grid.scrollToRow(grid.getData()[currentId].id)
      }

      // 추가 행 선택
      if (select) {
        grid.getRow(grid.getData()[currentId].id).select()
      }

      if (grid.options.dataTree) {
        this.expandAll()
      }

      return grid.getRow(grid.getData()[currentId].id)
    },

    // 행 삭제
    removeRow(rowKey) {
      if (typeof rowKey === 'number') {
        // 행 index 값
        grid.deleteRow(rowKey)
      } else {
        // 행 전체 값
        rowKey.delete()
      }
    },

    // 행 복사
    copyRow(row, value) {
      const newId = this.getRowCount() + 1

      // 선택 Row 밑에 추가
      grid.addRow({ id: newId, createRow: true, ...value }, false, row.getIndex())
    },

    // 그리드 트리 자식 행 가져오기
    getChildRows(row) {
      return row.getTreeChildren()
    },

    // 그리드 트리 부모 행 가져오기
    getParentRow(row) {
      return row.getTreeParent()
    },

    // 그리드 트리 행 추가
    appendTreeRow(row, value) {
      const newId = this.getRowCount() + 1

      const data = Object.assign(value, { createRow: true })

      row.addTreeChild({ id: newId, ...data }, false)
    },

    // 그리드 트리 행 삭제
    removeTreeRow(row) {
      row.delete()
    },

    // 그리드 트리 전체 확장
    expandAll() {
      const gridAllData = grid.getRows()

      const childrenExpand = rowComponents => {
        for(let i = 0; i < rowComponents.length; i++) {
          const childRows = rowComponents[i].getTreeChildren()
          
          if (childRows.length > 0) {
            rowComponents[i].treeExpand()

            childrenExpand(childRows)
          }
        }
      }

      childrenExpand(gridAllData)
    },

    // 그리드 트리 전체 축소
    collapseAll() {
      const gridAllData = grid.getRows()
      
      const childrenCollapse = rowComponents => {
        for(let i = 0; i < rowComponents.length; i++) {
          const childRows = rowComponents[i].getTreeChildren()
          
          if (childRows.length > 0) {
            rowComponents[i].treeCollapse()

            childrenCollapse(childRows)
          }
        }
      }

      childrenCollapse(gridAllData)
    },

    // 선택 행 가져오기
    getCheckedRows() {
      return grid.getSelectedRows()
    },

    // 선택 행 데이터 가져오기
    getCheckedData() {
      return grid.getSelectedData()
    },

    // 모든 행 선택
    checkAll() {
      const rows = this.getRows()

      rows.forEach(item => {
        item.select()
      })
    },

    // 모든 행 선택 해제
    uncheckAll() {
      const rows = this.getRows()

      rows.forEach(item => {
        item.deselect()
      })
    },

    // 모든 행 사용 금지
    disable() {
      const test = grid.element.getElementsByClassName('tabulator-row')
      for (let i = 0; i < test.length; i++) {
        test[i].classList.add('tabulator-disable-row')
      }
    },

    // 해당 컬럼 사용 금지
    disableColumn(columnName) {

    },

    // 해당 행 선택 금지
    disableRowCheck(row) {
      this.addClassName(row, 'row-select-disabled')

      row.update({ checkDisabled: true })
    },

    // 모든 행 사용 금지 해제
    enable() {

    },

    // 해당 컬럼 사용 금지 해제
    enableColumn(columnName) {

    },

    // 해당 행 선택 금지 해제
    enableRowCheck(row) {
      const rowEl = row.getElement()

      rowEl.classList.remove('row-select-disabled')

      row.update({ checkDisabled: false })
    },
    checkBetween(startRowKey, endRowKey) {
      for (let i = startRowKey; i <= endRowKey; i++) {
        const getRow = grid.getRow(i)

        getRow.select()
      }
    },
    uncheckBetween(startRowKey, endRowKey) {
      for (let i = startRowKey; i <= endRowKey; i++) {
        grid.deselectRow(i)
      }
    },

    // 행 선택
    check(rowKey) {
      const getRow = grid.getRow(rowKey)

      getRow.select()
    },

    // 행 선택 해제
    unCheck(rowKey) {
      grid.deselectRow(rowKey)
    },
    getCreatedData() {
      const gridAllData = this.getRows()
      const createdData = []

      gridAllData.forEach(item => {
        const rowData = item.getData()
        if (rowData.createRow) {
          createdData.push(rowData)
        }
      })
      
      return createdData
    },
    getUpdatedData() {
      const gridAllData = this.getRows()
      const updatedData = []

      gridAllData.forEach(item => {
        const rowData = item.getData()
        if (rowData.updateRow) {
          updatedData.push(rowData)
        }
      })
      
      return updatedData
    },

    // 추가, 수정, 삭제 행 가져오기
    getSaveDataSet() {
      return {
        created: this.getCreatedData(),
        updated: this.getUpdatedData(),
        deleted: gridDeletedData,
      }
    },

    // 데이터 검증
    getValidation() {
      return grid.validate()
    },

    // 셀 편집 종료
    finishEditing() {
      forEach(grid.getRows(), row => {
        forEach(row.getCells(), cell => {
          if (cell.isEdited()) cell.cancelEdit()
        })
      })
    },

    // 특정 행 focus
    focus(rowKey) {
      const row = grid.getRow(rowKey)
      const temp = resultGridData.selectedData
      const currentData = row

      resultGridData.currentRow = currentData

      // 이전 행이 있다면 배경색 삭제
      if (temp) {
        if (temp.getIndex() !== currentData.getIndex()) {
          if (temp.getElement()) {
            temp.getElement().classList.remove('tabulator-row-current-selected')
          }
        }
      }

      // 행 선택시 해당 행 배경색 변경
      currentData.getElement().classList.add('tabulator-row-current-selected')
      resultGridData.selectedData = currentData


      // 헤더에 라디오 버튼이 있는 경우
      const radio = row.getCell('radio')
      if (radio) {
        radio.setValue(true, false)
      }
    },

    // focus 된 행 가져오기
    getFocusedRow() {
      return resultGridData.currentRow
    },

    // focus 된 셀 가져오기
    getFocusedCell() {
      return resultGridData.currentCell
    },

    // 특정 셀 값 가져오기
    setValue(rowKey, columnName, data) {
      const getRow = grid.getRow(rowKey)

      if (!getRow) {
        const getRows = this.getRows()

        const findRow = getRows.find(item => {
          if(item.getIndex() === rowKey) return item
        })

        findRow.getCell(columnName).setValue(data, true)
      } else {
        getRow.getCell(columnName).setValue(data, true)
      }
    },

    // 데이터를 트리 형식으로 변경
    changeTreeData(data, treeOptions) {
      const getData = data
      let treeData = []
      getData.forEach(element => {
        const a = filter(getData, {
          [treeOptions.parent]: element[treeOptions.id],
        })

        if (a.length !== 0) {
          // eslint-disable-next-line no-param-reassign
          element._children = a
        }
      })

      const root = filter(getData, {
        [treeOptions.parent]: treeOptions.root,
      })

      if (treeData.length !== 1) {
        treeData = root
      } else {
        treeData.push(root)
      }

      return treeData
    },
    setTreeDetailData(addData, row) {
      for(let i = 0; i < addData.length; i++){
        addData[i]._children = [{
          asgn_cd: 'emptyRow',
          asgn_full_nm: '',
          asgn_shrt_nm: '',
          bsns_cd: '',
          clss_cd: '',
          company: '',
          dept_cd: '',
          level: '',
          prnt_cd: '',
        }]
        row.addTreeChild(addData[i])
      }
      const children = row.getTreeChildren()
    
      const emptyRow = find(children, item =>{
        const rowData = item.getData()
    
        if(rowData.asgn_cd === 'emptyRow'){
          return item
        }
      })
    
      if(emptyRow !== undefined){
        emptyRow.delete()
      }
    },
    setTreeTopData(data) {
      let getData = data

      getData[0]._children = []
      getData[0]._children.push({
        asgn_cd: 'emptyRow',
        asgn_full_nm: '',
        asgn_shrt_nm: '',
        bsns_cd: '',
        clss_cd: '',
        company: '',
        dept_cd: '',
        level: '',
        prnt_cd: '',
      })
    
      return getData
    },

    // 그리드 없애기
    destroy() {
      grid.destroy()
    },

    // 엑셀 download
    export(option) {
      grid.download('xlsx', option.fileName + '.xlsx', option ?? { compress: false })
    },

    // 현재 스크롤 가져오기
    getGridScroll() {
      // 전 스크롤 값
      const getTable = document.getElementsByClassName('tabulator-tableholder')[0]
      if (getTable) {
        resultGridData.previousScroll = getTable.scrollTop
      }
    },

    // 스크롤 이동
    changeGridScroll() {
      // 전 스크롤 값으로 이동
      const getTable = document.getElementsByClassName('tabulator-tableholder')[0]
      if (getTable) {
        getTable.scrollTop = resultGridData.previousScroll
      }
    },

    // 전체 페이지 사이즈 가져오기
    getPageSize() {
      return grid.getPageSize()
    },

    // 현재 페이지 가져오기
    getCurrentPage() {
      return grid.getPage()
    },

    // 인쇄
    print() {
      grid.print(false, true)
    },

    // 실행 취소
    undo() {
      grid.undo()
    },

    // 실행 되돌리기
    redo() {
      grid.redo()
    },

    // 클래스 추가
    addClassName(component, className) {
      // addColumnClassName
      // addCellClassName
      // addRowClassName
      const componentEl = component.getElement()

      componentEl.classList.add(className)
    },
  }
}

// Custom Editor

// 달력
export const editorDatePicker = (cell, onRendered, success, cancel, editorParams) => {
  const commonStore = useCommonStore()

  const { format, range, minDate, maxDate } = editorParams

  const picker = document.createElement('input')

  picker.type = 'text'
  picker.id = 'my-date-picker'
  picker.readOnly = true
  picker.style.width = '100%'
  picker.style.height = 'inherit'
  picker.style.textAlign = 'center'
  picker.style.fontWeight = 'bold'

  const defaultFormat = format ?? 'Y-m-d'
  const valueFormat = defaultFormat === 'Y-m-d' ? 'YYYY-MM-DD' : 'YYYYMMDD'

  if (cell.getValue()) {
    if (cell.getValue().length < 0) {
      picker.value = ''
    } else picker.value = dayjs(cell.getValue()).format(valueFormat)
  }

  const calendar = flatpickr(picker, {
    mode: range ?? 'single',
    minDate: minDate ?? null,
    maxDate: maxDate ?? null,
    monthSelectorType: 'static',
    dateFormat: defaultFormat,
    onOpen: () => {},
    onClose: (selectedDates, dateStr, instance) => {
      if (dateStr === 'Invalid Date') {
        success(cell.getValue())
      } else {
        // if (range) 2022-10-13 to 2022-10-11 replace
        console.log(dateStr)
        success(dateStr)
      }
      calendar.destroy()
    },
  })

  const el = document.getElementById(commonStore.systemCode)
  const getList = document.getElementsByClassName('flatpickr-calendar')[0]

  calendar.calendarContainer.classList.add(`v-theme--${ localStorage.getItem('grid-theme') }`)

  el.appendChild(getList)

  onRendered(() => {
    picker.focus()
  })

  return picker
}

export const editorInputCaseSensitive = (cell, onRendered, success, cancel, editorParams) => {
  const { type, disableKor, disableNum, disableSpecial } = editorParams

  const text = document.createElement('input')

  text.type = 'text'
  text.style.width = '100%'
  text.style.height = 'inherit'

  const cellValue = cell.getValue()

  if (cellValue) {
    text.value = cellValue
  }

  text.addEventListener('input', () => {
    const kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g
    const num = /[0-9]/g
    const special = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"\s]/g

    let textValue = text.value

    if (disableKor) {
      textValue = textValue.replace(kor, '')
    }
    if (disableSpecial) {
      textValue = textValue.replace(special, '')
    }
    if (disableNum) {
      textValue = textValue.replace(num, '')
    }

    if (type === 'upper') text.value = textValue.toUpperCase()
    if (type === 'lower') text.value = textValue.toLowerCase()
  })

  text.addEventListener('blur', () => {
    success(text.value)
  })

  onRendered(() => {
    text.focus()
  })

  return text
}

// Custom Formatter

export const formatterHighlightOnlyOne = (cell, formatterParams, onRendered) => {
  const { iconSvg, value, otherFormatter } = formatterParams

  const div = document.createElement('div')

  div.style.display = 'text-center'

  // 강조
  const el = document.createElement('button')
  const iconEl = document.createElement('div')

  iconEl.innerHTML = iconSvg

  el.appendChild(iconEl)

  // 기본
  const span = document.createElement('span')
  if (otherFormatter) {
    const rowData = cell.getRow().getData()
    if (rowData.code_type) {
      span.textContent = rowData.code_type
    } else {
      const { changeValue } = otherFormatter
      if (changeValue) {
        const findData = find(changeValue.list, {
          [changeValue.findKey]: cell.getValue(),
        })

        if (findData) {
          span.textContent = findData[changeValue.changeKey]
        } else {
          span.textContent = cell.getValue()
        }
      }
    }
  } else {
    span.textContent = cell.getValue()
  }

  span.style.width = '100%'

  if (cell.getValue() === value) {
    div.appendChild(el)
  } else {
    div.appendChild(span)
  }

  return div
}

export const formatterTextButton = (cell, formatterParams, onRendered) => {
  const { type, showComponent, buttonText, iconSvg, onlyCreated } = formatterParams

  const div = document.createElement('div')

  div.classList.add('text-center')
  div.style.display = 'flex'
  div.style.justifyContent = 'space-between'

  const span = document.createElement('span')

  span.className = 'ps-2 my-formatter-text-button'
  span.textContent = cell.getValue()
  span.style.overflow = 'hidden'
  span.style.textOverflow = 'ellipsis'

  const el = document.createElement('button')

  if (type === 'icon') {
    const iconEl = document.createElement('div')

    iconEl.innerHTML = iconSvg

    el.appendChild(iconEl)
  } else {
    el.className = 'tabulator-cell-button'
    el.innerText = buttonText ?? 'Button'
    el.style.fontSize = '1em'
    el.style.padding = '0px 5px 0px 5px'
    el.style.borderRadius = '2px'
    el.style.marginRight = '3px'
  }

  if (showComponent) {
    // 팝업 사용
    el.addEventListener('click', num => {
      // 버튼만 클릭했을 경우에 동작
      if (num.target.nodeName === 'BUTTON'  || num.target.nodeName === 'path' || num.target.nodeName === 'svg') showComponent(cell.getRow())
    })
  }

  div.appendChild(span)

  if (onlyCreated) {
    if (cell.getData().createRow) {
      div.appendChild(el)
    }
  } else {
    div.appendChild(el)
  }

  return div
}

export const formatterButton = (cell, formatterParams, onRendered) => {
  const { type, showComponent, buttonText, iconSvg, showEmpty, returnData, switchFlag, trueValue, falseValue } = formatterParams

  const div = document.createElement('div')

  div.style.className = 'text-center'

  const el = document.createElement('button')
  
  if (type === 'icon') {
    const iconEl = document.createElement('div')

    if (switchFlag) {
      const value = cell.getValue()

      if (value === trueValue) {
        iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="height: 30px; width: 30px; fill: rgb(var(--v-theme-success));"><title>toggle-switch</title><path d="M17,7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7M17,15A3,3 0 0,1 14,12A3,3 0 0,1 17,9A3,3 0 0,1 20,12A3,3 0 0,1 17,15Z" /></svg>'
      }
      else if (value === falseValue) {
        iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="height: 28px; width: 28px; fill: rgb(var(--v-theme-secondary));"><title>toggle-switch-off-outline</title><path d="M17 6H7c-3.31 0-6 2.69-6 6s2.69 6 6 6h10c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 10H7c-2.21 0-4-1.79-4-4s1.79-4 4-4h10c2.21 0 4 1.79 4 4s-1.79 4-4 4zM7 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>'
      }
    } else {
      iconEl.innerHTML = iconSvg
    }

    el.appendChild(iconEl)
  } else {
    el.className = 'tabulator-cell-button'
    el.innerText = buttonText ?? 'Button'
    el.style.fontSize = '1em'
    el.style.padding = '0px 5px 0px 5px'
    el.style.borderRadius = '2px'
    el.style.marginRight = '3px'
  }

  el.style.verticalAlign = 'middle'
  el.style.paddingBottom = '2px'
  el.classList.add('text-right')

  if (!showEmpty) {
    if (cell.getValue() !== 'Y') {
      el.style.display = 'none'
    }
  }

  if (showComponent) {
    // 팝업 사용
    el.addEventListener('click', value => {
      // 버튼만 클릭했을 경우에 동작
      if (value.target.nodeName === 'BUTTON' || value.target.nodeName === 'path' || value.target.nodeName === 'svg') showComponent(returnData ? cell.getRow().getData() : cell.getRow())
    })
  }

  div.appendChild(el)

  return div
}

export const formatterCheckBox = (cell, formatterParams, onRendered) => {
  const { type, trueVisible, falseVisible, trueValue, falseValue, disable } = formatterParams  

  const div = document.createElement('div')

  const rowKey = cell.getRow().getIndex()

  const columnName = cell.getColumn().getField()

  div.className = `text-center my-checkbox-${rowKey}-is-${columnName} my-checkbox-all-check-${columnName}-disabled-${disable ?? false}`

  const getValue = cell.getData()[cell.getField()]

  let el = ''

  if (type === 'icon') {
    el = document.createElement('div')
    el.style.className = 'text-center'

    if (getValue === 'Y' || getValue === true || getValue === trueValue) {
      if (trueVisible !== undefined && !trueVisible) {
        el.innerHTML = ''
      } else el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="height: 20px; width: 20px;"><title>check-bold</title><path style="fill: rgb(var(--v-theme-primary));" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" /></svg>'
    } else {
      if (falseVisible !== undefined && !falseVisible) {
        el.innerHTML = ''
      } else el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="height: 20px; width: 20px;"><title>close-thick</title><path style="fill: rgb(var(--v-theme-primary));" d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z" /></svg>'
    }
  } else {
    // editor: 'tickCross' 와 함께 쓰지 않아야 함
    el = document.createElement('input')
    el.type = 'checkbox'

    if (getValue === 'Y' || getValue === true || getValue === trueValue) {
      el.checked = true
    } else {
      el.checked = false
    }

    onRendered(() => {
      el.addEventListener('change', () => {
        if (el.checked) {
          cell.setValue(trueValue ?? true)
        } else {
          cell.setValue(falseValue ?? false)
        }
      })
    })
    
    if(disable) {
      el.disabled = true
    }
  }

  el.style.verticalAlign = 'middle'

  div.appendChild(el)

  return div
}

export const formatterRadio = (cell, formatterParams, onRendered) => {
  const { trueValue, falseValue } = formatterParams

  const getValue = cell.getValue()
  
  const div = document.createElement('div')

  div.classList.add('text-center')  

  const el = document.createElement('input')

  el.type = 'radio'
  el.name = 'my-radio'
  el.checked = getValue ?? false

  onRendered(() => {
    el.addEventListener('change', () => {
      if (el.checked) {
        cell.setValue(trueValue ?? true)
      } else {
        cell.setValue(falseValue ?? false)
      }
    })
  })

  div.appendChild(el)

  return div
}

export const formatterList = (cell, formatterParams, onRendered) => {
  const {
    formatFindList,
    formatFindValue,
    formatValue,
    isUpperCase,
    isYn,
    trueVisible,
    formatTrueValue,
    falseVisible,
    formatFalseValue,
    isArray,
    editOnlyVisible,
    align,
  } = formatterParams

  const div = document.createElement('div')

  div.classList.add('text-center')
  div.style.display = 'flex'
  div.style.justifyContent = 'space-between'

  const span = document.createElement('span')

  span.style.justifyContent = align ?? 'center'

  span.className = 'pl-1 pr-1'

  if (!isYn) {
    // 해당 셀의 데이터를 바꿔서 보여줄 경우
    let getFiendList = formatFindList

    if (typeof formatFindList === 'function') {
      getFiendList = formatFindList()
    }

    if (getFiendList && formatFindValue && formatValue) {
      const findValue = find(getFiendList, item => {
        if (cell.getValue() !== null) {
          if (item[formatFindValue]?.toUpperCase() === cell.getValue()?.toUpperCase()) {
            return item
          }
        }
      })

      if (findValue) {
        span.textContent = findValue[formatValue]
      } else {
        span.textContent = cell.getValue()
      }
    } else {
      span.textContent = cell.getValue()
    }
  } else {
    if (cell.getValue() === 'Y') {
      if (trueVisible !== undefined && !trueVisible) {
        span.textContent = ''
      } else span.textContent = formatTrueValue ?? cell.getValue()
    } else {
      if (falseVisible !== undefined && !falseVisible) {
        span.textContent = ''
      } else span.textContent = formatFalseValue ?? cell.getValue()
    }
  }

  span.style.overflow = 'hidden'
  span.style.textOverflow = 'ellipsis'

  div.appendChild(span)

  const el = document.createElement('div')

  el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>menu-down</title><path d="M7,10L12,15L17,10H7Z" /></svg>`
  el.style.fill = localStorage.getItem('grid-theme') === 'dark' ? '#ada8c3' : '#736c7c'
  el.style.width = '28px'

  if (!editOnlyVisible) {
    div.appendChild(el)
  } else {
    const createRow = cell.getRow().getData().createRow

    if (createRow) {
      div.appendChild(el)
    }
  }

  return div
}

export const formatterText = (cell, formatterParams, onRendered) => {
  const { color, textAlign, returnValueFunction } = formatterParams

  const div = document.createElement('div')

  div.classList.add('text-center')

  const span = document.createElement('span')

  let value = ''
  if (cell.getValue()) {
    if (returnValueFunction) {
      value = returnValueFunction(cell.getRow().getData())
    } else {
      value = cell.getValue()
    }
  }

  span.innerText = value
  span.style.color = color

  if (textAlign) {
    span.style.justifyContent = textAlign
    span.classList.add('ms-2')
  }

  div.appendChild(span)

  return div
}

export const formatterImage = (cell, formatterParams, onRendered) => {
  const { showComponent } = formatterParams

  const div = document.createElement('div')

  div.style.marginTop = '2px'
  div.style.width = '25px'
  div.style.height = '25px'
  div.classList.add('text-center')

  const value = cell.getValue()

  if (value) {
    const el = document.createElement('img')

    el.style.width = 'inherit'
    el.style.height = 'inherit'
    el.style.backgroundSize = 'cover'
    el.src = value

    if (showComponent) {
      // 팝업 사용
      el.addEventListener('click', num => {
        // 버튼만 클릭했을 경우에 동작
        if (num.target.nodeName === 'IMG') showComponent(cell.getRow())
      })
    }

    div.appendChild(el)
  }

  return div
}

export const formatterIconSVG = (cell, formatterParams, onRendered) => {
  const { trueSvg, falseSvg, compareValue } = formatterParams

  const div = document.createElement('div')

  const value = cell.getValue()

  if (value === compareValue) {
    div.innerHTML = trueSvg
  } else {
    div.innerHTML = falseSvg
  }

  div.classList.add('text-center')

  return div
}

export const formatterImageFileText = (cell, formatterParams, onRendered) => {
  const { contextPath, imageColumn, noImage, badge, badgeFn } = formatterParams

  const div = document.createElement('div')

  div.classList.add('text-center')
  div.style.display = 'flex'
  div.style.justifyContent = 'flex-start'

  const img = document.createElement('img')
  const imageValue = cell.getRow().getData()[imageColumn]

  img.src = imageValue ? contextPath + '/file/view/' + imageValue : noImage
  img.classList.add('ms-2')
  img.style.width = '28px'
  img.style.height = '28px'
  img.style.border = '1px solid rgba(var(--v-border-color), 0.38);'
  img.style.cursor = 'default'

  const span = document.createElement('span')

  span.className = 'ps-2 my-formatter-text-button'
  span.textContent = cell.getValue()
  span.style.overflow = 'hidden'
  span.style.textOverflow = 'ellipsis'

  const parentDiv = document.createElement('div')

  parentDiv.style = 'display: contents !important; position: relative; width: 100px;'
  parentDiv.appendChild(img)

  if (badge) {
    const badgeIcon = document.createElement('div')

    badgeIcon.style.width = 'inherit'
    badgeIcon.style.position = 'absolute'
    badgeIcon.style.left = '-20px'
    badgeIcon.style.top = '-11.5px'

    const getStatusData = cell.getRow().getData()?.status
    const findStatusValue = badgeFn(getStatusData)

    badgeIcon.innerHTML = `<svg stroke="rgb(var(--v-theme-surface))" stroke-width="3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="height: 1em; width: 1em; margin-left: 10px; fill: rgb(var(--v-theme-${findStatusValue?.color ?? 'secondary'}));"><title>circle</title><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>`

    if (getStatusData !== 'D') {
      parentDiv.appendChild(badgeIcon)
    }
  }

  div.appendChild(parentDiv)
  div.appendChild(span)

  return div
}

export const headerFormatterFilterList = (data, titleFormatterParams, onRendered) => {
  const columnName = data.getColumn().getField()
  const currentColumnValue = data.getValue()

  const divEl = document.createElement('div')

  divEl.style.display = 'flex'
  divEl.style.justifyContent = 'center'
  
  // 컬럼 이름
  const span = document.createElement('span')

  span.innerText = currentColumnValue
  span.classList.add('pe-1')

  // 필터 버튼
  const button = document.createElement('div')

  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="height: 1em; width: 1em;" class="v-icon notranslate v-theme--${ localStorage.getItem('grid-theme') }"><title>filter</title><path style="fill: currentColor;" d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z" /></svg>`
  button.classList.add('cursor-pointer')

  const childDivEl = document.createElement('div')

  childDivEl.className = 'pb-2'
  childDivEl.style.zIndex = 9
  childDivEl.style.position = 'fixed'
  childDivEl.style.maxHeight = '30%'
  childDivEl.style.overflow = 'auto'
  childDivEl.style.display = 'none'
  childDivEl.style.background = 'rgb(var(--v-theme-background))'
  childDivEl.style.color = 'rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity))'
  childDivEl.style.boxShadow = '0px 0px 1px 0px currentColor'

  // 닫기 버튼
  const closeButton = document.createElement('div')
    
  closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="height: 1em; width: 1em; cursor: pointer;" class="v-icon notranslate v-theme--${ localStorage.getItem('grid-theme') }"><title>window-close</title><path style="fill: currentColor;" d="M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z" /></svg>`
  closeButton.className = `d-flex justify-end pa-2`

  // 닫기 버튼 클릭 이벤트
  closeButton.addEventListener('click', () => {
    const table = data.getTable()
    const tableData = table.getData()

    const duplicateArray = []

    tableData.forEach(item => {
      duplicateArray.push(item[columnName])
    })

    const set = new Set(duplicateArray)
    const filterData = [...set]

    const resultFilter = []

    filterData.forEach(item => {
      // 체크된 값 가져오기
      const getCheckbox = document.getElementById(`my-header-filter-${columnName}-checkbox-${item}`)
      
      if (getCheckbox.checked) {
        resultFilter.push(item)
      }

      // 체크박스 제거
      const getCheckboxEl = document.getElementById(`my-header-filter-${columnName}-${item}`)

      if (getCheckboxEl) getCheckboxEl.remove()
    })

    if (resultFilter.length === 0) {
      table.clearFilter()
    } else {
      table.setFilter(columnName, 'in', resultFilter)
    }

    childDivEl.style.display = 'none'
  })

  childDivEl.appendChild(closeButton)

  // hr
  const hrEl = document.createElement('hr')

  hrEl.className = `v-divider v-theme--${ localStorage.getItem('grid-theme') } pb-2`

  childDivEl.appendChild(hrEl)

  // 전체 선택
  const allCheckEl = document.createElement('div')
  
  allCheckEl.className = 'd-flex px-3 mb-1'

  const allCheckbox = document.createElement('input')

  allCheckbox.type = 'checkbox'
  allCheckbox.className = 'me-2'
  allCheckbox.checked = true

  allCheckbox.addEventListener('click', () => {
    const checkboxs = document.getElementsByName(`${columnName}-header-filter-check`)

    checkboxs.forEach(checkbox => {
      checkbox.checked = allCheckbox.checked
    })
  })

  const allCheckSpan = document.createElement('span')

  allCheckSpan.innerText = 'All'

  allCheckEl.appendChild(allCheckbox)
  allCheckEl.appendChild(allCheckSpan)
  childDivEl.appendChild(allCheckEl)

  // 필터 버튼 클릭 이벤트
  button.addEventListener('click', e => {
    // 그리드의 전체 데이터 가져오기
    const table = data.getTable()
    const tableData = table.getData()

    if (tableData.length === 0) {
      e.stopPropagation()

      return
    }

    childDivEl.style.display = 'block'

    const duplicateArray = []

    // 해당 컬럼의 값 가져오기
    tableData.forEach(item => {
      duplicateArray.push(item[columnName])
    })

    // 가져온 전체 값 중복 체크
    const set = new Set(duplicateArray)
    const filterData = [...set]

    // 해당 컬럼의 필터 가져오기
    const getTableFilters = () => {
      const tableFilters = table.getFilters()

      const findFilter = find(tableFilters, { field: columnName })

      if (!findFilter) {
        table.addFilter(columnName, 'in', filterData)

        return getTableFilters()
      } else {
        return findFilter
      }
    }

    const findFilter = getTableFilters()

    // 체크박스 추가
    filterData.forEach(item => {
      const checkboxDivEl = document.createElement('div')

      checkboxDivEl.id = `my-header-filter-${columnName}-${item}`
      checkboxDivEl.style.display = 'flex'
      checkboxDivEl.className = 'px-3 mb-1'

      const checkbox = document.createElement('input')

      checkbox.type = 'checkbox'
      checkbox.id = `my-header-filter-${columnName}-checkbox-${item}`
      checkbox.name = `${columnName}-header-filter-check`
      checkbox.className = 'me-2'

      const getChecked = find(findFilter.value, value => value === item)

      // 필터 리스트에 있으면 체크, 없으면 체크 해제
      if (getChecked) {
        checkbox.checked = true
      } else {
        checkbox.checked = false
      }

      const checkboxText = document.createElement('span')

      checkboxText.innerText = item

      checkboxDivEl.appendChild(checkbox)
      checkboxDivEl.appendChild(checkboxText)
      childDivEl.appendChild(checkboxDivEl)
    })
  })

  divEl.appendChild(span)
  divEl.appendChild(button)
  divEl.appendChild(childDivEl)

  return divEl
}

export default TabulatorFactory