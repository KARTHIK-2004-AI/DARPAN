const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a game title'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please specify game type'],
    enum: ['puzzle', 'quiz', 'strategy', 'arcade'], // Add more game types as needed
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'cancelled'],
    default: 'waiting'
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'left', 'finished'],
      default: 'active'
    }
  }],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  configuration: {
    maxPlayers: {
      type: Number,
      required: true,
      default: 2
    },
    timeLimit: {
      type: Number, // in seconds
      default: 300
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  },
  gameState: {
    type: mongoose.Schema.Types.Mixed, // Flexible field for different game types
    default: {}
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
gameSchema.index({ status: 1, type: 1 });
gameSchema.index({ 'players.user': 1 });

// Virtual field for game duration
gameSchema.virtual('duration').get(function() {
  if (!this.startedAt || !this.endedAt) return null;
  return (this.endedAt - this.startedAt) / 1000; // duration in seconds
});

// Method to check if game is full
gameSchema.methods.isFull = function() {
  return this.players.length >= this.configuration.maxPlayers;
};

// Method to add player to game
gameSchema.methods.addPlayer = function(userId) {
  if (this.isFull()) throw new Error('Game is full');
  if (this.status !== 'waiting') throw new Error('Game has already started');
  
  this.players.push({ user: userId });
  if (this.players.length === this.configuration.maxPlayers) {
    this.status = 'in-progress';
    this.startedAt = new Date();
  }
};

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;