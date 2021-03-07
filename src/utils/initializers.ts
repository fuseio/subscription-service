import config from 'config'
import Container from 'typedi'
import mongoose from 'mongoose'
import EventService from '@services/event'

export const initDb = () => {
  mongoose.set('debug', config.get('mongo.debug'))
  mongoose.set('useFindAndModify', false)
  mongoose.set('useCreateIndex', true)

  mongoose.connect(config.get('mongo.uri')).catch((error: any) => {
    console.error(error)
    process.exit(1)
  })
}

export const initServices = async () => {
  const eventService = Container.get(EventService)

  eventService.addHandlers()
  eventService.addEvents()
}
