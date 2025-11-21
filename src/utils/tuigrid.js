import '@/styles/tuigridSubStyles.scss'
import '@/styles/tuigridPaginationStyles.scss'
import { find, filter } from 'lodash-es'
import Grid from 'tui-grid'
import 'tui-grid/dist/tui-grid.css'

let isDark = false

function applyTheme() {
  if (!isDark) {
    // light
    Grid.applyTheme('striped', {
      frozenBorder: {
        border: '',
      },
      outline: {
        border: '#e5daeb',
        showVerticalBorder: true,
      },
      selection: {
        background: '#ca78f6',
        border: '#e5daeb',
      },
      scrollbar: {
        border: '#e5daeb',
        background: '#ffffff',
        emptySpace: '#fcf9ff',
        thumb: '#e4e3e6',
        active: '#e4e3e6',
      },
      area: {
        header: {
          background: '#fcf9ff',
          border: '#e5daeb',
        },
        body: {
          background: '#ffffff',
        },
      },
      row: {
        odd: {
          background: '#ffffff',
        },
        even: {
          background: '#fcf9ff',
        },
        hover: {
          background: '#F5F0FA !important',
        },
      },
      cell: {
        normal: {
          border: '#e4e3e6',
          text: '#736C7C',
          showVerticalBorder: true,
          showHorizontalBorder: true,
        },
        header: {
          background: '#f1e8f6',
          border: '#e5daeb',
          text: '#736C7C',
          showVerticalBorder: true,
          showHorizontalBorder: true,
        },
        rowHeader: {
          background: '#f1e8f6',
          border: '#e5daeb',
          text: '#736C7C',
          showVerticalBorder: true,
          showHorizontalBorder: true,
        },
        selectedRowHeader: {
          background: '#ca78f61a',
        },
        selectedHeader: {
          background: '#ca78f61a',
        },
        focused: {
          border: '#9155fd',
        },
      },
    })
  } else {
    // dark
    Grid.applyTheme('striped', {
      frozenBorder: {
        border: '',
      },
      outline: {
        border: '#5c577c',
      },
      selection: {
        background: '#fcf9ff',
        border: '#fcf9ff',
      },
      scrollbar: {
        border: '#5c577c',
        background: '#343050',
        emptySpace: '#3b355a',
        thumb: '#5c577c',
        active: '#5c577c',
      },
      area: {
        header: {
          background: '#312d4b',
          border: '#5c577c',
        },
        body: {
          background: '#312d4b',
        },
      },
      row: {
        odd: {
          background: '#312d4b',
        },
        even: {
          background: '#343050',
        },
        hover: {
          background: '#3a3657 !important',
        },
      },
      cell: {
        normal: {
          border: '#474360',
          text: '#ADA8C3',
          showVerticalBorder: true,
          showHorizontalBorder: true,
        },
        header: {
          background: '#3b355a',
          border: '#5c577c',
          text: '#CECAE4',
          showVerticalBorder: true,
          showHorizontalBorder: true,
        },
        rowHeader: {
          background: '#3b355a',
          border: '#474360',
          text: '#CECAE4',
          showVerticalBorder: true,
          showHorizontalBorder: true,
        },
        selectedRowHeader: {
          background: '#5a537a83',
        },
        selectedHeader: {
          background: '#5a537a83',
        },
        focused: {
          border: '#9155fd',
        },
      },
    })
  }
}

const TuiGridFactory = function (container, gridObj) {
  const theme = localStorage.getItem('grid-theme')

  isDark = theme === 'dark'

  const { gridColumns } = gridObj
  const { gridData } = gridObj

  gridColumns.forEach((ev, i) => {
    // 텍스트 전체 가운데 정렬
    gridColumns[i].align = gridColumns[i].align ?? 'center'

    // 컬럼 줄였다 늘렸다 추가
    gridColumns[i].resizable = true
  })

  const defaultOptions = {
    el: container,
    data: gridData,
    columns: gridColumns,
    summary: gridObj.summary,
    treeColumnOptions:
      gridObj.treeName === undefined
        ? ''
        : {
          name: gridObj.treeName,
          useCascadingCheckbox: gridObj.treeCheck ? gridObj.treeCheck : false,
        },
    bodyHeight: gridObj.bodyHeight ? gridObj.bodyHeight : 'fitToParent',
    minRowHeight: 20,
    header: {
      height: 30,
    },
    contextMenu: gridObj.contextMenu,
    rowHeaders: gridObj.rowHeaders === undefined ? ['rowNum', 'checkbox'] : gridObj.rowHeaders,
    columnOptions:
      gridObj.frozenCount === undefined
        ? {
          minWidth: 200,
        }
        : {
          frozenCount: gridObj.frozenCount,
          frozenBorderWidth: 1,
          minWidth: 200,
        },
    pageOptions:
      gridObj.pageOptions === undefined
        ? ''
        : {
          useClient: true,
          perPage: gridObj.pageOptions,
        },
    selectionUnit: gridObj.selectionUnit === undefined ? 'cell' : gridObj.selectionUnit,
  }
  
  Object.assign(defaultOptions, gridObj)

  const grid = new Grid(defaultOptions)

  applyTheme()

  window.addEventListener('changeTheme', e => {
    isDark = e.detail.isDark
    applyTheme()
  })

  // 데이터 변경시 row 컬럼 배경색 변경
  grid.on('afterChange', () => {
    const modified = grid.getModifiedRows()
    const { updatedRows } = modified

    updatedRows.forEach(row => {
      grid.addRowClassName(row.rowKey, 'tui-grid-cell-edited')
    })
  })

  // 그리드 row 선택 시 컬럼 배경색 변경
  let oldRowKeyValue = null
  grid.on('focusChange', ev => {
    if (gridObj.selectionUnit === 'row') {
      if (gridObj.useModifyStyle) {
        grid.removeRowClassName(oldRowKeyValue, 'tui-grid-row-selected')
        oldRowKeyValue = ev.rowKey
        grid.addRowClassName(ev.rowKey, 'tui-grid-row-selected')
      }
    }
  })

  // 체크박스 렌더러 시 더블클릭 edit 삭제
  const nondblEditColumns = []

  gridColumns.forEach(column => {
    // eslint-disable-next-line no-prototype-builtins
    if (column.renderer && column.renderer.options.hasOwnProperty('trueValue')) {
      nondblEditColumns.push(column.name)
    }
  })

  grid.on('dblclick', e => {
    if (nondblEditColumns.includes(e.columnName)) {
      e.stop()
    }
  })

  const checkboxCursor = document.getElementsByClassName('tui-grid-cell-header')
  if (nondblEditColumns.length > 0) {
    Object.keys(checkboxCursor).forEach(ev => {
      nondblEditColumns.forEach(value => {
        if (checkboxCursor[ev].dataset.columnName === value) {
          checkboxCursor[ev].style.cursor = 'pointer'
        }
      })
    })
  }

  let allChecked = false

  grid.on('click', e => {
    if (e.targetType === 'columnHeader') {
      if (nondblEditColumns.includes(e.columnName)) {
        // 체크박스 disable 일 때 작동 하지 않기
        const getEditableColumnCheck = e.instance.el.getElementsByClassName(
          `my-checkbox-all-check-${e.columnName}-editable-false`,
        )

        if (getEditableColumnCheck.length > 0) {
          return
        }

        const getCheckboxColumn = e.instance.el.getElementsByClassName(
          `my-checkbox-all-check-${e.columnName}-editable-true`,
        )

        const getGridData = grid.getData()

        const includesChecked = find(getGridData, { [e.columnName]: 'Y' })
        if (includesChecked !== undefined) {
          allChecked = false
        } else allChecked = true

        Object.keys(getCheckboxColumn).forEach(index => {
          if (!allChecked) {
            getCheckboxColumn[index].checked = false
          } else {
            getCheckboxColumn[index].checked = true
          }
        })

        Object.keys(getGridData).forEach(index => {
          const flagTest = allChecked ? 'Y' : 'N'

          // eslint-disable-next-line radix
          grid.setValue(parseInt(index), e.columnName, flagTest, false)
        })
      }
    }
  })

  grid.on('keydown', e => {
    if (nondblEditColumns.includes(e.columnName)) {
      if (e.keyboardEvent.key === 'Backspace' || e.keyboardEvent.key === 'Tab') {
        e.stop()
      }

      // 체크 박스 렌더러 (체크 가능할 때만) enter, space 키 누르면 수정 가능
      if (e.keyboardEvent.key === 'Enter' || e.keyboardEvent.key === ' ') {
        const cell = grid.getFocusedCell()

        const getClass = e.instance.el.getElementsByClassName(
          `my-checkbox-${cell.rowKey}-is-${cell.columnName}-editable-true`,
        )

        if (getClass[0].checked) {
          getClass[0].checked = false
          grid.setValue(cell.rowKey, cell.columnName, 'N', false)
        } else {
          getClass[0].checked = true
          grid.setValue(cell.rowKey, cell.columnName, 'Y', false)
        }
      }
    }
  })

  grid.on('editingStart', e => {
    if (nondblEditColumns) {
      if (nondblEditColumns.includes(e.columnName)) {
        e.stop()
      }
    }
  })

  container.addEventListener('keydown', e => {
    const keyboardCheck = /[a-z]/

    // 숫자, a-z 입력 시 edit 기능 (tui-grid 는 keydown event가 enter, space, 방향키 밖에 없어서 추가함)
    // eslint-disable-next-line no-restricted-globals
    if (e.key === 'Process' || !isNaN(Number(e.key)) || e.key.search(keyboardCheck) === 0) {
      const row = grid.getFocusedCell()
      if (nondblEditColumns) {
        nondblEditColumns.forEach(index => {
          if (row.columnName !== index) {
            grid.startEditing(row.rowKey, row.columnName)
          }
        })
      }
      grid.startEditing(row.rowKey, row.columnName)
    }
  })

  return {
    resetData(data) {
      return grid.resetData(data)
    },
    g() {
      return grid
    },
    on(name, func) {
      return grid.on(name, func)
    },
    getRow(rowKey) {
      return grid.getRow(rowKey)
    },
    getFocusedCell() {
      return grid.getFocusedCell()
    },
    setValue(rowKey, columnName, value) {
      return grid.setValue(rowKey, columnName, value)
    },
    getRootNodeId() {
      return grid.getRootNodeId()
    },
    copyRow(rowKey) {
      const selectRow = grid.getRow(rowKey)

      const options = {
        at: 0,
        focus: true,
      }

      grid.appendRow(selectRow, options)
    },

    // 전체
    requireCell() {
      const requireGridColumns = filter(gridColumns, {
        requireCheck: true,
      })

      requireGridColumns.forEach(column => {
        grid.addColumnClassName(column.name, 'tui-grid-cell-require')
      })
    },

    // 부분
    requireSpecifiedCell(array) {
      const gridAllData = grid.getData()

      const requireGridColumns = filter(gridColumns, {
        requireCheck: true,
      })

      requireGridColumns.forEach(column => {
        array.forEach(item => {
          const getRequireCell = filter(
            gridAllData,
            findRow => !item.cell.includes(findRow[item.key]),
          )

          getRequireCell.forEach(list => {
            grid.addCellClassName(list.rowKey, column.name, 'tui-grid-cell-require')
          })
        })
      })
    },
    appendRow(addData, rowKey) {
      grid.appendRow(addData, {
        at: rowKey,
        focus: true,
        extendPrevRowSpan: true,
      })

      // eslint-disable-next-line no-unreachable
      const modified = grid.getModifiedRows()
      const { createdRows } = modified

      createdRows.forEach(row => {
        grid.addRowClassName(row.rowKey, 'tui-grid-cell-created')
      })
    },
    prependRow(addData) {
      grid.appendRow(addData, {
        focus: true,
      })

      // eslint-disable-next-line no-unreachable
      const modified = grid.getModifiedRows()
      const { createdRows } = modified

      createdRows.forEach(row => {
        grid.addRowClassName(row.rowKey, 'tui-grid-cell-created')
      })
    },
    appendTreeRow(addData, rowKey) {
      grid.appendTreeRow(addData, {
        parentRowKey: rowKey,
        focus: true,
      })

      // eslint-disable-next-line no-unreachable
      const modified = grid.getModifiedRows()
      const { createdRows } = modified

      createdRows.forEach(row => {
        grid.addRowClassName(row.rowKey, 'tui-grid-cell-created')
      })
    },
    removeRow(rowKey) {
      return grid.removeRow(rowKey, {
        keepRowSpanData: true,
      })
    },
    getCheckedRowKeys() {
      return grid.getCheckedRowKeys()
    },
    getCheckedRows() {
      return grid.getCheckedRows()
    },
    getSaveDataSet() {
      const gridSaveDataRows = grid.getModifiedRows()

      const gridSaveData = {
        updated: [],
        created: [],
        deleted: [],
      }

      gridSaveDataRows.createdRows.forEach(row => {
        gridSaveData.created.push(row)
      })
      gridSaveDataRows.updatedRows.forEach(row => {
        gridSaveData.updated.push(row)
      })
      gridSaveDataRows.deletedRows.forEach(row => {
        gridSaveData.deleted.push(row)
      })

      return gridSaveData
    },
    setTreeDetailData(addData, rowkey) {
      let treeData = addData
      let childRows = grid.getChildRows(rowkey)
      let emptyRow = find(childRows, { asgn_cd: 'emptyRow' })

      for (let i = 0; i < treeData.length; i++) {
        treeData[i]._children = [{
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
        grid.appendTreeRow(treeData[i], {
          parentRowKey: rowkey,

          // focus: true,
        })
      }
      if (emptyRow) {
        grid.removeRow(emptyRow.rowKey, {
          keepRowSpanData: true,
        })
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
    export(file, name) {
      const exportOptions = {
        includeHeader: true, // 헤더 포함 여부
        includeHiddenColumns: false, // 숨겨진 열 포함 여부
        onlySelected: false, // 선택한 범위만 내보낼지 여부
        onlyFiltered: true, // 필터링된 데이터만 내보낼지 여부
        useFormattedValue: false, // 지정한 값 내보낼지 원래 값 내보낼지 여부
        fileName: name, // 내보낼 파일 이름
      }

      grid.export(file, exportOptions)
    },
  }
}

// 체크 박스
export class checkBoxRenderer {
  constructor(props) {
    const div = document.createElement('div')

    div.classList.add('text-center')

    const el = document.createElement('input')

    el.className = `my-checkbox-${props.rowKey}-is-${
      props.columnInfo.name
    }-editable-${!!props.editable} my-checkbox-all-check-${props.columnInfo.name}-editable-${props.editable}`

    const { trueValue, falseValue } = props.columnInfo.renderer.options

    el.type = 'checkbox'
    if (props.value === trueValue) {
      el.checked = true
    }
    if (!props.editable) {
      el.disabled = true
    }
    el.style.verticalAlign = 'middle'

    el.addEventListener('change', () => {
      if (el.checked) {
        props.grid.setValue(props.rowKey, props.columnInfo.name, trueValue, false)
      } else {
        props.grid.setValue(props.rowKey, props.columnInfo.name, falseValue, false)
      }
    })

    div.appendChild(el)
    this.div = div
    this.el = el
    this.render(props)
  }

  getElement() {
    return this.div
  }

  render(props) {
    this.el.value = props.value
  }
}

// 아이콘
export class btnIconRenderer {
  constructor(props) {
    const div = document.createElement('div')
    let { className } = props.columnInfo.renderer.options // 적용할 mdi 아이콘 className
    className = 'v-icon mdi ' + className
    div.classList.add('text-center')

    const el = document.createElement('button')

    el.className = `my-button-${props.rowKey}-is${props.columnInfo.name}`
    el.style.verticalAlign = 'middle'

    // el.className = 'v-icon mdi mdi-cog'
    el.className = className
    el.style.fontSize = '18px'

    const { showComponent } = props.columnInfo.renderer.options

    this.showComponent = showComponent

    el.addEventListener('click', num => {
      // 버튼만 클릭했을 경우에 동작
      if (num.target.nodeName === 'BUTTON') this.showComponent()
    })

    div.appendChild(el)
    this.div = div
    this.el = el

    this.render(props)
  }

  getElement() {
    return this.div
  }

  render(props) {
    this.el.value = props.value
  }
}

export default TuiGridFactory
