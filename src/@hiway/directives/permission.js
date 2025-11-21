import { useLogsStore } from "@hiway/stores/logs"
import { useUserStore } from "@hiway/stores/user"
import { find } from "lodash-es"
import EventHandler from "@hiway/utils/eventHandler"
import router from '@/router'
import { getToken } from "../utils/token"


export default {  
  // called when the bound element's parent component
  // and all its children are mounted.
  // eslint-disable-next-line sonarjs/cognitive-complexity
  mounted(el, binding)
  {
    if(getToken()) {
      EventHandler.once(checkPermission, 'loaded-menu', 'loaded-permission')
    }else {
      checkPermission()
    }    
    function checkPermission() {
      const logsStore = useLogsStore()
      const userStore = useUserStore()
      const { value } = binding          

      const target = find(userStore.buttonPermission, {
        menu_id: logsStore.menuId,
      })

      const permissions = target ? target.actions : []
            
      if(value && value instanceof Array && value.length > 0) {
        if(!permissions.some(role => value.includes(role))) el.parentNode && el.parentNode.removeChild(el)
      } else {
        if(value instanceof Array) return
        throw new Error(
          '버튼 퍼미션 설정이 필요합니다. ! ex: v-permission="[\'btnUpdate\',\'btnDelete\']"',
        )
      }
    }
  },
}

