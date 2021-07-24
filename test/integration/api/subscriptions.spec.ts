import '../../utils/setup'
import request from 'supertest'
import app from '../../../src/app'

describe('/subscribe', () => {
  describe('POST /subscribe/transfers-to', () => {
    test('given address, webhookUrl returns 200 and message', async () => {
      const { status, body } = await request(app)
        .post('/api/v1/subscribe/transfers-to')
        .send({
          address: '0x5670d7076E7b3604ceb07c003ff0920490756587',
          webhookUrl: 'http://xyz.com/webhooks'
        })

      expect(status).toEqual(200)
      expect(body).toBeDefined()
    })

    test('given no address, webhookUrl returns 400', async () => {
      const { status } = await request(app)
        .post('/api/v1/subscribe/transfers-to')
        .send({
          address: '',
          webhookUrl: ''
        })

      expect(status).toEqual(400)
    })

    test('given unsupported event, returns 400', async () => {
      const { status } = await request(app)
        .post('/api/v1/subscribe/erc20')
        .send({
          address: '0x5670d7076E7b3604ceb07c003ff0920490756587',
          webhookUrl: 'http://xyz.com/webhooks'
        })

      expect(status).toEqual(400)
    })
  })
})

describe('/unsubcribe', () => {
  describe('POST /unsubscribe/transfers-to', () => {
    test('given address returns 200 and message', async () => {
      await request(app)
        .post('/api/v1/subscribe/transfers-to')
        .send({
          address: '0x5670d7076E7b3604ceb07c003ff0920490756587',
          webhookUrl: 'http://xyz.com/webhooks'
        })

      const { status, body } = await request(app)
        .post('/api/v1/unsubscribe/transfers-to')
        .send({
          address: '0x5670d7076E7b3604ceb07c003ff0920490756587'
        })

      expect(status).toEqual(200)
      expect(body).toBeDefined()
    })

    test('given no address returns 400', async () => {
      await request(app)
        .post('/api/v1/subscribe/transfers-to')
        .send({
          address: '0x5670d7076E7b3604ceb07c003ff0920490756587',
          webhookUrl: 'http://xyz.com/webhooks'
        })

      const { status } = await request(app)
        .post('/api/v1/unsubscribe/transfers-to')
        .send({
          address: ''
        })

      expect(status).toEqual(400)
    })

    test('given unsupported event, returns 400', async () => {
      const { status } = await request(app)
        .post('/api/v1/unsubscribe/erc20')
        .send({
          address: '0x5670d7076E7b3604ceb07c003ff0920490756587'
        })

      expect(status).toEqual(400)
    })
  })
})
