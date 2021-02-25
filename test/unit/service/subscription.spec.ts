import SubscriptionService from '../../../src/services/subscription'
import RedisService from '../../../src/services/redis'
import { promisify } from 'util'

describe('SubscriptionService', () => {
    let redisService: RedisService

    beforeEach(() => {
        redisService = new RedisService()
    })

    afterEach(async () => {
        const flush = promisify(redisService.client.flushdb)
            .bind(redisService.client)
        await flush()
    })

    afterAll(() => {
        redisService.client.end(true)    
    })

    describe('subscribe', () => {
        test('should add subscription', async () => {
            const service = new SubscriptionService(redisService)
            const eventName = 'event.action'
            const user = '0x0'

            await service.subscribe(eventName, user)

            expect(await redisService.get(user)).toEqual("[\"event.action\"]")
        })

        test('should handle multiple subscriptions', async () => {
            const service = new SubscriptionService(redisService)
            const eventName = 'event.action'
            const eventName2 = 'event.action2'
            const eventName3 = 'event.action3'
            const user = '0x0'

            await service.subscribe(eventName, user)
            await service.subscribe(eventName2, user)
            await service.subscribe(eventName3, user)

            expect(
                await redisService.get(user)
            ).toEqual("[\"event.action\",\"event.action2\",\"event.action3\"]")
        })

        test('should handle multiple users with multiple subscriptions', async () => {
            const service = new SubscriptionService(redisService)
            const eventName = 'event.action'
            const eventName2 = 'event.action2'
            const eventName3 = 'event.action3'
            const user = '0x0'
            const user2 = '0x1'

            await service.subscribe(eventName3, user)
            await service.subscribe(eventName, user)
            await service.subscribe(eventName2, user)

            await service.subscribe(eventName, user2)
            await service.subscribe(eventName3, user2)
            await service.subscribe(eventName2, user2)

            expect(
                await redisService.get(user)
            ).toEqual("[\"event.action3\",\"event.action\",\"event.action2\"]")
            
            expect(
                await redisService.get(user2)
            ).toEqual("[\"event.action\",\"event.action3\",\"event.action2\"]")
        })

        test('should handle empty subscriptions array', async () => {
            const service = new SubscriptionService(redisService)
            const eventName = 'event.action'
            const user = '0x0'

            await service.subscribe(eventName, user)
            await service.unsubscribe(eventName, user)
            await service.subscribe(eventName, user)

            expect(await redisService.get(user)).toEqual("[\"event.action\"]")
        })
    })

    describe('unsubscribe', () => {
        test('should remove subscription', async () => {
            const service = new SubscriptionService(redisService)
            const eventName = 'event.action'
            const user = '0x0'

            await service.subscribe(eventName, user)

            await service.unsubscribe(eventName, user)

            expect(
                await redisService.get(user)
            ).toEqual("[]")
        })

        test('should remove subscription from multiple subscriptions', async () => {
            const service = new SubscriptionService(redisService)
            const eventName = 'event.action'
            const eventName2 = 'event.action2'
            const eventName3 = 'event.action3'
            const user = '0x0'

            await service.subscribe(eventName, user)
            await service.subscribe(eventName2, user)
            await service.subscribe(eventName3, user)

            await service.unsubscribe(eventName2, user)

            expect(
                await redisService.get(user)
            ).toEqual("[\"event.action\",\"event.action3\"]")
        })
    })

    describe('isSubscribed', () => {
        test('should return true if subscribed', async () => {
            const service = new SubscriptionService(redisService)
            const eventName = 'event.action'
            const user = '0x0'

            await service.subscribe(eventName, user)

            expect(await service.isSubscribed(eventName, user)).toBeTruthy()
        })

        test('should return false if not subscribed', async () => {
            const service = new SubscriptionService(redisService)
            const eventName = 'event.action'
            const user = '0x0'

            expect(await service.isSubscribed(eventName, user)).toBeFalsy()
        })
    })
})
