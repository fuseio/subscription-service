import { setupDb, teardownDb, closeDb } from './db'

beforeAll(async () => {
  await setupDb()
})

afterEach(async () => {
  await teardownDb()
})

afterAll(async () => {
  await closeDb()
})
