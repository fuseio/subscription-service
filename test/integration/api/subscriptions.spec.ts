import 'reflect-metadata'
import request from 'supertest'
import app from '../../../src/app'
import '../../utils/setup'

describe('/subscribe', () => {
  describe('POST /wallet/transfers-to', () => {
    test('given address, webhookUrl returns 200 and message', async () => {
      const { status, body } = await request(app)
        .post('/api/v1/subscribe/wallet/transfers-to')
        .send({
          address: '0x5670d7076E7b3604ceb07c003ff0920490756587',
          webhookUrl: 'http://xyz.com/webhooks'
        })

      expect(status).toEqual(200)
      expect(body).toBeDefined()
    })

    test('given no address, webhookUrl returns 400', async () => {
      const { status } = await request(app)
        .post('/api/v1/subscribe/wallet/transfers-to')
        .send({
          address: '',
          webhookUrl: ''
        })

      expect(status).toEqual(400)
    })
  })
})

describe('/unsubcribe', () => {
  describe('POST /wallet/transfers-to', () => {
    test('given address returns 200 and message', async () => {
      await request(app)
        .post('/api/v1/subscribe/wallet/transfers-to')
        .send({
          address: '0x5670d7076E7b3604ceb07c003ff0920490756587',
          webhookUrl: 'http://xyz.com/webhooks'
        })

      const { status, body } = await request(app)
        .post('/api/v1/unsubscribe/wallet/transfers-to')
        .send({
          address: '0x5670d7076E7b3604ceb07c003ff0920490756587'
        })

      expect(status).toEqual(200)
      expect(body).toBeDefined()
    })

    test('given no address returns 400', async () => {
      await request(app)
        .post('/api/v1/subscribe/wallet/transfers-to')
        .send({
          address: '0x5670d7076E7b3604ceb07c003ff0920490756587',
          webhookUrl: 'http://xyz.com/webhooks'
        })

      const { status } = await request(app)
        .post('/api/v1/unsubscribe/wallet/transfers-to')
        .send({
          address: ''
        })

      expect(status).toEqual(400)
    })
  })
})
