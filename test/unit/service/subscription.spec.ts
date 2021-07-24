import '../../utils/setup'
import SubscriptionService from '../../../src/services/subscription'
import UserService from '../../../src/services/user'

describe('SubscriptionService', () => {
    let userService: UserService
    let service: SubscriptionService

    beforeEach(() => {
        userService = new UserService()
        service = new SubscriptionService(userService)
    })

    describe('subscribe', () => {
        test('should subcribe given address to event', async () => {
           service = new SubscriptionService(userService)

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
            service = new SubscriptionService(userService)
            
            const user = await userService.createUser('0x0')
            const eventName = 'event'
            const webhookUrl = 'http://xyz.com/webhooks'

            await service.subscribe(user, eventName, webhookUrl)

            await service.unsubscribe(user, eventName)

            const subscription = await service.getSubscription(eventName, user.address)

            expect(subscription).toBeNull()
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
