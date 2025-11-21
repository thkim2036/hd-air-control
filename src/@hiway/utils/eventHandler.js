import EventBus from './eventBus'
import { random } from 'lodash-es'
import logger from '@hiway/utils/log'

const flags = {}

const handler = (function () {
  return {
    init(event) {
      flags[event] = false
    },
    emit(event) {
      flags[event] = true
      EventBus.$emit(event)
    },
    once(callback, ...events) {
      const eventId = random(0, 5000)
      if (events.length === 0 || typeof callback !== 'function') {
        logger.info(`[EH:END:${eventId}]`, 'event handler parameter failed...')

        return
      }
      if (this.eventCalledCheck(events)) {
        logger.info(`[EH:END:${eventId}]`, 'event handler Events Called...', events)
        callback()
      }
      events.forEach(event => {
        if (flags[event]) return
        EventBus.$once(event, () => {
          logger.info(`[EH:${eventId}]`, 'event handler Events Recieve', event, JSON.stringify(flags))

          // 모든 이벤트가 로드 되면, callback을 실행
          if (this.eventCalledCheck(events)) {
            logger.info(`[EH:END:${eventId}]`, 'event handler Events All Recieved')
            callback()
          }
        })
      })
    },
    eventCalledCheck(events) {
      return events.every(event => flags[event])
    },
  }
}())

export default handler
