import '../../utils/setup'
import SubscriptionService from '../../../src/services/subscription'
import UserService from '../../../src/services/user'

describe('SubscriptionService', () => {
    let userService: UserService
    let service: SubscriptionService

    beforeEach((done) => {
        userService = new UserService()
        service = new SubscriptionService(userService)

        service.client.flushdb(done)
    })

    describe('subscribe', () => {
        test('should subcribe given address to event', async () => {
           const service = new SubscriptionService(userService)

           const user = await userService.createUser('0x0')
           const eventName = 'event'
           const webhookUrl = 'http://xyz.com/webhooks'
           
           const subscription = await service.subscribe(user, eventName, webhookUrl)
           
           expect(subscription?.user).toBe(user)
           expect(subscription?.eventName).toBe(eventName)
           expect(subscription?.webhookUrl).toBe(webhookUrl)
        })
    })

    describe('unsubscribe', () => {
        test('should unsubcribe given address from event', async () => {
            const service = new SubscriptionService(userService)
            
            const user = await userService.createUser('0x0')
            const eventName = 'event'
            const webhookUrl = 'http://xyz.com/webhooks'

            await service.subscribe(user, eventName, webhookUrl)

            await service.unsubscribe(user, eventName)

            const subscription = await service.getSubscription(eventName, user.address)

            expect(subscription).toBeNull()
        })
    })

    describe('isSubscribed', () => {
        test('should return true if address is subscribed to event', async () => {
            const service = new SubscriptionService(userService)
            
            const user = await userService.createUser('0x0')
            const eventName = 'event'
            const webhookUrl = 'http://xyz.com/webhooks'

            await service.subscribe(user, eventName, webhookUrl)

            expect(
                await service.isSubscribed(eventName, user.address)
            ).toBe(true)
        })

        test('should return false if address is not subscribed to event', async () => {
            const service = new SubscriptionService(userService)
            
            const user = await userService.createUser('0x0')
            const eventName = 'event'
            
            expect(
                await service.isSubscribed(eventName, user.address)
            ).toBe(false)
        })
    })

    describe('getSubscription', () => {
        test('should return subscription if subscribed', async () => {
            const service = new SubscriptionService(userService)
            
            const user = await userService.createUser('0x0')
            const eventName = 'event'
            const webhookUrl = 'http://xyz.com/webhooks'

            await service.subscribe(user, eventName, webhookUrl)

            const subscription = await service.getSubscription(
                eventName, 
                user.address
            )

            expect(subscription?.webhookUrl).toBe(webhookUrl)
            expect(subscription?.user).toStrictEqual(user._id)
        })
    })
})
