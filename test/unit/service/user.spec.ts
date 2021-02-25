import '../../utils/setup'
import UserRepoService from '../../../src/services/userRepo'

describe('UserRepoService', () => {
  describe('createUser', () => {
    test('should create user', async () => {
      const service = new UserRepoService()
      const address = '0x5670d7076E7b3604ceb07c003ff0920490756587'

      const user: any = await service.createUser(address)

      expect(user.address).toBe(address)
    })
  })

  describe('getUser', () => {
    test('should return user', async () => {
      const service = new UserRepoService()
      const address = '0x5670d7076E7b3604ceb07c003ff0920490756587'

      await service.createUser(address)
      const user: any = await service.getUser(address)

      expect(user.address).toBe(address)
    })
  })
})
