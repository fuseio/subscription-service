import { Service } from 'typedi'
import User from '@models/User'

@Service()
export default class UserRepoService {
  async getUser (address: string) {
    const user = await User.findOne({ address })
    return user
  }

  async createUser (address: string) {
    const user = await User.create({ address })
    return user
  }
}
