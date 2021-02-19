import UserService from '../../../src/services/user'
import UserSubscriptionService from '../../../src/services/userSubscription'
import '../../utils/setup'

describe('UserSubscriptionService', () => {
  describe('createSubsription', () => {
    test('should create subscription', async () => {
      const userService = new UserService()
      const service = new UserSubscriptionService(userService)
      const eventName = 'event'
      const webhookUrl = 'http://xyz.com'

      const user = await userService.createUser('0x5670d7076E7b3604ceb07c003ff0920490756587')
      const sub: any = await service.createSubscription(eventName, webhookUrl, user)

      expect(sub.eventName).toBe(eventName)
      expect(sub.webhookUrl).toBe(webhookUrl)
      expect(sub.user).toBe(user)
    })

    test('when already subscribed should not create subscription', async () => {
      const userService = new UserService()
      const service = new UserSubscriptionService(userService)
      const eventName = 'event'
      const webhookUrl = 'http://xyz.com'

      const user = await userService.createUser('0x5670d7076E7b3604ceb07c003ff0920490756587')
      await service.createSubscription(eventName, webhookUrl, user)

      await expect(async () => {
        await service.createSubscription(eventName, webhookUrl, user)
      }).rejects.toThrow()
    })
  })

  describe('hasSubscription', () => {
    test('if subscribed should return true', async () => {
      const userService = new UserService()
      const service = new UserSubscriptionService(userService)
      const eventName = 'event'
      const webhookUrl = 'http://xyz.com'

      const user = await userService.createUser('0x5670d7076E7b3604ceb07c003ff0920490756587')
      await service.createSubscription(eventName, webhookUrl, user)

      expect(await service.hasSubscription(eventName, user)).toBeTruthy()
    })

    test('if not subscribed should return false', async () => {
      const userService = new UserService()
      const service = new UserSubscriptionService(userService)
      const eventName = 'event'

      const user = await userService.createUser('0x5670d7076E7b3604ceb07c003ff0920490756587')

      expect(await service.hasSubscription(eventName, user)).toBeFalsy()
    })
  })

  describe('removeSubscription', () => {
    test('given eventName, user should remove subscription if subscribed', async () => {
      const userService = new UserService()
      const service = new UserSubscriptionService(userService)
      const eventName = 'event'
      const webhookUrl = 'http://xyz.com'

      const user = await userService.createUser('0x5670d7076E7b3604ceb07c003ff0920490756587')
      await service.createSubscription(eventName, webhookUrl, user)

      await service.removeSubscription(eventName, user)

      expect(await service.hasSubscription(eventName, user)).toBeFalsy()
    })

    test('given eventName, user should not error if not subscribed ', async () => {
      const userService = new UserService()
      const service = new UserSubscriptionService(userService)
      const eventName = 'event'

      const user = await userService.createUser('0x5670d7076E7b3604ceb07c003ff0920490756587')

      await service.removeSubscription(eventName, user)
    })
  })

  describe('getSubscriptions', () => {
    test('should return all subscriptions', async () => {
      const userService = new UserService()
      const service = new UserSubscriptionService(userService)
      const eventName = 'event'
      const eventName2 = 'event2'
      const eventName3 = 'event3'
      const webhookUrl = 'http://xyz.com'

      const user = await userService.createUser('0x5670d7076E7b3604ceb07c003ff0920490756587')
      await service.createSubscription(eventName, webhookUrl, user)
      await service.createSubscription(eventName2, webhookUrl, user)
      await service.createSubscription(eventName3, webhookUrl, user)

      const subs = await service.getSubscriptions()

      expect(subs.length).toBe(3)
    })
  })

  describe('getSubscription', () => {
    test('if subscription should return subscription', async () => {
      const userService = new UserService()
      const service = new UserSubscriptionService(userService)
      const eventName = 'event'
      const webhookUrl = 'http://xyz.com'

      const user = await userService.createUser('0x5670d7076E7b3604ceb07c003ff0920490756587')
      await service.createSubscription(eventName, webhookUrl, user)

      const sub: any = await service.getSubscription(eventName, '0x5670d7076E7b3604ceb07c003ff0920490756587')

      expect(sub.eventName).toBe(eventName)
      expect(sub.user).toEqual(user._id)
    })
  })
})
