import { Service } from 'typedi'
import FilterStatus from '@models/FilterStatus'

@Service()
export default class FilterStatusService {
  async getFilterStatus (filter: string) {
    const filterStatus = await FilterStatus.findOne({
      filter
    })

    if (filterStatus) {
      return filterStatus
    }

    const newFilterStatus = await FilterStatus.create({
      filter
    })
    return newFilterStatus
  }

  async updateBlockNumber (filter: string, blockNumber: number) {
    const filterStatus = await this.getFilterStatus(filter)
    await filterStatus.update({ blockNumber })
  }
}
