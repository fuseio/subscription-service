import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  address: {
    type: String,
    required: true
  },
  subscriptions: [{
    type: Schema.Types.ObjectId,
    ref: 'UserSubscription'
  }]
})

export default mongoose.model('User', userSchema)
