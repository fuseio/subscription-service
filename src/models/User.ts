import mongoose, { Schema, Document } from 'mongoose'

const userSchema = new Schema({
  address: {
    type: String,
    required: true
  },
  subscriptions: [{
    type: Schema.Types.ObjectId,
    ref: 'UserSubscription'
  }]
}, {
  timestamps: true
})

export interface UserDoc extends Document {
  address: string;
  subscriptions: Array<string>;
}

export default mongoose.model<UserDoc>('User', userSchema)
