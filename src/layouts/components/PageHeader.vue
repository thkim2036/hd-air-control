<template>
  <VContainer fluid>
    <div class="d-flex">
      <h2>
        {{ $t(title) }}
      </h2>
      <VSpacer />      
      <VBtn 
        v-for="btn in buttonList"
        :key="`btn_${btn.id}`"
        v-permission="usePermission ? [btn.id] : []"
        :prepend-icon="btn.icon"
        class="ms-1"
        @click="clickButton(btn)"
      >
        {{ $t(btn.text) }}
      </VBtn>                  
    </div>
  </VContainer>
</template>

<script>
import { ref } from 'vue'
import { find } from 'lodash-es'
import { useI18n } from 'vue-i18n'
import { VBtn, VContainer } from 'vuetify/lib/components/index.mjs'

export default {
  components: { VBtn, VContainer },
  props: {
    type: {
      type: String,
      default: "white-list",
    },
    title: {
      type: String,
      default: "",
    },
    useList: {
      type: Array,
      default: () => [],
    },
    usePermission: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n()

    const buttonList = ref([
      { id: "btnSearch", text: "$management.label.retrieve", icon: "mdi-magnify" },
      { id: "btnCreate", text: "$management.label.save", icon: "mdi-check" },
      { id: "btnUpdate", text: "$management.label.update", icon: "mdi-pencil-outline" },
      { id: "btnDelete", text: "$management.label.delete", icon: "mdi-minus" },
      { id: "btnPrint", text: "$management.label.print", icon: "mdi-printer" },
      { id: "btnRegister", text: "$management.label.registration", icon: "mdi-plus" },
    ])

    const objectButtons = []

    const contrastIds = props.useList.map(use => {
      if (typeof use === "string")
        return use
      else if (typeof use === "object" && use.id) {
        objectButtons.push(use)
        
        return use.id
      }
    })

    const manfList = buttonList.value.filter(btn => {
      if (props.type === "black-list") {
        return !contrastIds.includes(btn.id)
      }
      if (props.type === "white-list") {
        return contrastIds.includes(btn.id)
      }
      
      return false
    })

    objectButtons.forEach(btn => {
      Object.assign(find(manfList, { id: btn.id }), btn)
    })

    const printSet = []

    contrastIds.forEach(id => {
      printSet.push(find(manfList, { id }))
    })
    buttonList.value = printSet

    const clickButton = targetButton => {
      emit(targetButton.id)
    }

    return {
      buttonList,
      clickButton,
    }
  },
}
</script>
