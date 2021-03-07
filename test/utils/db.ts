import mongoose from 'mongoose'

export const setupDb = async () => {
  await mongoose.connect('mongodb://localhost/test')
}

export const teardownDb = async () => {
  await mongoose.connection.db.dropDatabase()
}

export const closeDb = async () => {
  await mongoose.disconnect()
}
