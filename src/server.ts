import config from 'config'
import app from './app'
import { initDb, initServices } from './utils/initializers'

initDb()

const server = app.listen(config.get('api.port') || 8080, async function () {
  const address: any = server && server.address()
  console.log('Listening on port ' + address.port)

  initServices()
})
