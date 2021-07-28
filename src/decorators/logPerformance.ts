import { performance } from 'perf_hooks'

const logPerformance = (
  logPrefix?: string
) => (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const method = descriptor.value

  descriptor.value = function (...args: any[]) {
    const start = performance.now()
    const result = method.apply(this, args)
    const finish = performance.now()
    console.log(`${logPrefix} Execution time: ${finish - start} ms`)
    return result
  }

  return descriptor
}

export default logPerformance
