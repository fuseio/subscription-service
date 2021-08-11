import * as Sentry from '@sentry/node'
import config from 'config'

Sentry.init(config.get('errors.sentry'))

export default Sentry
