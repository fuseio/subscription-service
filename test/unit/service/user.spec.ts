import '../../utils/setup'
import UserService from '../../../src/services/user'

describe('UserService', () => {
  describe('createUser', () => {
    test('should create user', async () => {
      const service = new UserService()
      const address = '0x5670d7076E7b3604ceb07c003ff0920490756587'

      const user = await service.createUser(address)

      expect(user?.address).toBe(address)
    })
  })

  describe('getUser', () => {
    test('should return user', async () => {
      const service = new UserService()
      const address = '0x5670d7076E7b3604ceb07c003ff0920490756587'

      await service.createUser(address)
      const user = await service.getUser(address)

      expect(user?.address).toBe(address)
    })
  })
})
