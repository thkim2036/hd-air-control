import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHashHistory  } from 'vue-router'
import { useLogsStore } from '@hiway/stores/logs'
import { authCheck } from './utils'

import routes from '~pages'
import { getToken, removeToken, getIsBeforeRemoveToken, removeIsBeforeRemoveToken } from '@hiway/utils/token'
import EventHandler from '@hiway/utils/eventHandler'

let isMfeLoaded = false

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: to => {       
        // Example         
      //  return { name: 'example', query: to.query }
        if (getToken()) return { name: 'index' }
        
        return { name: 'login', query: to.query }
      },
    },    
    ...setupLayouts(routes),
  ],
})

// eslint-disable-next-line sonarjs/cognitive-complexity
router.beforeEach((to, from, next) => {
  if(isMfeLoaded) {
    authCheck(to, from, next)  
  } else {
    EventHandler.once(() => {
      isMfeLoaded = true
      next({ path: to.path, query: to.query })
    }, 'mfeLoaded')
  }
})

router.afterEach((to, from) => {  
  const logStore = useLogsStore()

  logStore.setCurrentRoute(to)  
})

// Management MFE
const remoteCall = () => import('remote_app/managerList')

// MFE timeout 설정 기본
const timeOut = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject("대기시간 초과")    
  }, 2000)
})  

Promise.race([remoteCall(), timeOut]).then(res => {  
  [...setupLayouts(res.default)].forEach(mfeRoute => {
    router.addRoute(mfeRoute)    
  })    
}).catch(e => {
  console.error('Micro Frontend Error: 관리 페이지를 로드하는데 문제가 있습니다. HDxBuilder Web 운영팀에 문의하세요.')
  console.log(e)
}).finally(() => {
  EventHandler.emit('mfeLoaded')  
})

// router.addRoute(...setupLayouts([{}]))

export default router
