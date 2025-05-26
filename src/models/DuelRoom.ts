import mongoose from 'mongoose';

const duelRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  maxPlayers: {
    type: Number,
    default: 2
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'finished'],
    default: 'waiting'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: function() {
      return this.isPrivate;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.DuelRoom || mongoose.model('DuelRoom', duelRoomSchema); 