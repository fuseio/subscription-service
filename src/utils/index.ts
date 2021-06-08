import config from 'config'

export const isProduction = process.env.NODE_ENV === 'production'

export const isStudioUrl = (url: string): boolean => {
  const studioBaseUrl: string = config.get('studio.baseUrl')
  const regex = new RegExp(studioBaseUrl)
  return regex.test(url)
}
