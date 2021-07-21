import { Filter } from '@ethersproject/providers'

export default interface IEventFilter {
  type: string;
  filter: Filter;
  abi: any;
}
