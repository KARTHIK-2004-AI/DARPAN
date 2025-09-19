const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, enum: ['Science', 'Technology', 'Engineering', 'Mathematics'], required: true },
  gradeLevel: { type: Number, required: true },
  difficulty: { type: String, enum: ['Basic', 'Intermediate', 'Advanced'], required: true },
  description: String,
  mechanics: String,
  maxScore: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
