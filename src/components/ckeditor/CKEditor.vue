<template>
  <div>
    <div :id="id" />
    <Preview
      :toggle="previewDialog"
      :data="previewData"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import '@/styles/ckEditorStyles.scss'
import defaultToolbar from './defaultToolbar'
import Preview from './Preview.vue'
import ImageUpload from './imageUpload'

const props = defineProps({
  id: {
    type: String,
    default: 'ck-editor',
  },
  height: {
    type: String,
    default: '200px',
  },
  initialValue: {
    type: String,
    default: '',
  },
  lang: {
    type: String,
    default: 'ko',
  },
  toolbar: {
    type: Array,
    default() {
      return defaultToolbar
    },
  },
})

const emit = defineEmits(['change'])

// Preview
const previewData = ref(null)
const previewDialog = ref(false)

// Editor
let ckEditor = null
const ckEditorData = ref(props.initialValue)

watch(() => props.initialValue, newValue => {
  if (newValue) {
    ckEditorData.value = newValue
    if (ckEditor) {
      setContent(ckEditorData.value)
    }
  }
})

onMounted(() => {
  // Create Editor
  /* eslint-disable */
    ClassicEditor.create(document.getElementById(props.id), {
      initialData: ckEditorData.value,
      language: props.lang,
      toolbar: {
        items: props.toolbar,
      },
      removePlugins: ['Markdown', 'MediaEmbedToolbar', 'Title'],
      ui: {
        poweredBy: {
          position: 'inside',
        },
      },
      allowedContent: true,
      placeholder: '내용을 입력하세요.',
      fontSize: {
        options: [ 10, 12, 14, 'default', 18, 20, 22 ],
        supportAllValues: true
      },
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
          { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
          { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
          { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
        ]
      },
      htmlSupport: {
        allow: [
          {
            name: /.*/,
            attributes: true,
            classes: true,
            styles: true
          }
        ]
      },
    })
      .then((editor) => {
        editor.model.document.on('change:data', (evt, propertyName) => {
          if (propertyName.isUndoable) {
            emit('change')
          }
        })
        ckEditor = editor
      })
      .catch((error) => console.error(error))
      .finally(() => {
        const span = document.createElement('span')
        span.className = 'ck ck-toolbar__separator'

        // 미리보기 버튼 생성
        const previewBtn = document.createElement('span')
        // const previewBtn = document.createElement('button')
        previewBtn.className = 'ck ck-button'
        previewBtn.setAttribute('data-cke-tooltip-text', 'Preview')
        previewBtn.insertAdjacentHTML(
          'afterbegin',
          `<svg class="ck ck-icon ck-icon_inherit-color ck-button__icon" viewBox="1.3 1 22 22"><path d="M8.29 10.28L11.53 7.03L12.59 8.09L9.35 11.34L8.29 10.28M8.7 14.61L14.36 8.95L15.42 10L9.76 15.67L8.7 14.61M14.17 3L18 6.83V17.17L14.17 21H9.83L6 17.17V6.83L9.83 3H14.17M15 1H9L4 6V18L9 23H15L20 18V6L15 1Z" /></svg>`
        )

        previewBtn.addEventListener('click', () => {
          showPreview()
        })

        // 툴바에 버튼 추가
        const toolbarEl = ckEditor.ui.view.toolbar.element.childNodes[0]
        toolbarEl.appendChild(span)
        toolbarEl.appendChild(previewBtn)

        // Editor 높이 설정
        ckEditor.editing.view.change((writer) => {
          const getRoot = ckEditor.editing.view.document.getRoot()
          writer.setStyle('height', props.height, getRoot)
        })

        // HTML Mode 일때 Editor 높이 설정
        // const getHtmlModeButton =
        //   ckEditor.ui.view.element.getElementsByClassName(
        //     'ck-source-editing-button'
        //   )[0]
        // getHtmlModeButton.addEventListener('click', () => {
        //   const htmlEl = ckEditor.ui.view.element.getElementsByClassName(
        //     'ck-source-editing-area'
        //   )[0]
        //   if (htmlEl) htmlEl.style.height = props.height
        // })

        // Image Upload
        ckEditor.plugins.get('FileRepository').createUploadAdapter = (
          loader
        ) => {
          return new ImageUpload(loader)
        }
      })
})

// Method
const getText = () => {
  // GET Plain Text
  const editorEl = ckEditor.ui.view.editable.element
  
  return editorEl.innerText
}

const getContent = () => {
  // GET HTML
  return ckEditor.getData()
}

const setContent = data => {
  // SET Text
  ckEditor.setData(data)
}

const showPreview = () => {
  previewData.value = ckEditor.getData()
  previewDialog.value = !previewDialog.value
}

defineExpose({
  getText,
  getContent,
  setContent,
  showPreview
})
</script>