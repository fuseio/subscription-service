module.exports = {
  api: {
    allowCors: true,
    secret: 'secret',
    tokenExpiresIn: '7d',
    port: 3000
  },
  mongo: {
    debug: true,
    uri: 'mongodb://localhost/test'
  },
  redis: {},
  mail: {
    sendgrid: {
      templates: {}
    }
  },
  rpcUrl: 'https://rpc.fuse.io',
  studio: {
    baseUrl: 'https://studio.fuse.io',
    jwt: ''
  },
  errors: {
    sentry: {
      dsn: '',
      tracesSampleRate: 1.0
    }
  },
  timeoutInterval: 1000
}
