const mongoose = require('mongoose');

// Student Profile Schema
const studentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  grade: { type: Number, required: true, min: 6, max: 12 },
  
  // Learning Profile
  learningStyle: {
    visual: { type: Number, default: 0.5 },
    auditory: { type: Number, default: 0.5 },
    kinesthetic: { type: Number, default: 0.5 },
    logical: { type: Number, default: 0.5 }
  },
  
  currentDifficultyLevel: { type: Number, default: 0.5, min: 0, max: 1 },
  preferredGameTypes: [{ type: String }],
  
  // Progress Tracking
  totalXP: { type: Number, default: 0 },
  subjectProgress: {
    mathematics: { xp: { type: Number, default: 0 }, level: { type: Number, default: 1 } },
    physics: { xp: { type: Number, default: 0 }, level: { type: Number, default: 1 } },
    chemistry: { xp: { type: Number, default: 0 }, level: { type: Number, default: 1 } },
    biology: { xp: { type: Number, default: 0 }, level: { type: Number, default: 1 } },
    computerScience: { xp: { type: Number, default: 0 }, level: { type: Number, default: 1 } },
    socialScience: { xp: { type: Number, default: 0 }, level: { type: Number, default: 1 } },
    english: { xp: { type: Number, default: 0 }, level: { type: Number, default: 1 } }
  },
  
  // Achievements
  badges: [{
    type: { type: String },
    name: { type: String },
    description: { type: String },
    earnedAt: { type: Date, default: Date.now },
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'] }
  }],
  
  streakDays: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  
  // Personalization Data
  motivationalPreferences: {
    competitiveLevel: { type: Number, default: 0.5 },
    collaborationPreference: { type: Number, default: 0.5 },
    challengeSeekingLevel: { type: Number, default: 0.5 }
  },
  
  accessibilitySettings: {
    fontSize: { type: String, default: 'medium' },
    colorBlindSupport: { type: Boolean, default: false },
    audioSupport: { type: Boolean, default: false },
    reducedMotion: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Game Session Schema
const gameSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  
  // Session Details
  subject: { type: String, required: true },
  concept: { type: String, required: true },
  gameType: { type: String, required: true },
  
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number }, // in seconds
  
  // Learning Loop Progress
  currentStage: { 
    type: String, 
    enum: ['discovery', 'mechanics', 'practice', 'mastery', 'assessment', 'rewards', 'completed'],
    default: 'discovery'
  },
  
  completedStages: [{
    stage: { type: String },
    results: {
      accuracy: { type: Number },
      timeSpent: { type: Number },
      hintsUsed: { type: Number },
      attemptsCount: { type: Number },
      uniqueApproaches: { type: Number }
    },
    completedAt: { type: Date, default: Date.now }
  }],
  
  // Performance Tracking
  performance: {
    interactions: [{
      timestamp: { type: Date, default: Date.now },
      type: { type: String }, // 'click', 'drag', 'drop', 'answer', 'hint_request'
      data: { type: mongoose.Schema.Types.Mixed }
    }],
    
    overallAccuracy: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    hintsUsed: { type: Number, default: 0 },
    frustrationsDetected: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0.5 }
  },
  
  // AI Adaptations Applied
  adaptations: [{
    timestamp: { type: Date, default: Date.now },
    type: { type: String }, // 'difficulty_adjustment', 'hint_provided', 'game_modification'
    details: { type: mongoose.Schema.Types.Mixed },
    effectiveness: { type: Number } // measured post-adaptation
  }],
  
  // Final Results
  finalResults: {
    xpEarned: { type: Number, default: 0 },
    badgesEarned: [{ type: String }],
    conceptMastery: { type: Number, min: 0, max: 1 },
    nextRecommendations: [{ type: String }]
  }
}, {
  timestamps: true
});

// Concept Progress Schema
const conceptProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  concept: { type: String, required: true },
  
  // Mastery Tracking
  masteryLevel: { type: Number, default: 0, min: 0, max: 1 },
  attemptsCount: { type: Number, default: 0 },
  successfulCompletions: { type: Number, default: 0 },
  
  // Learning Analytics
  averageAccuracy: { type: Number, default: 0 },
  averageTimeToComplete: { type: Number, default: 0 },
  preferredGameTypes: [{ type: String }],
  
  // Difficulty Progression
  currentDifficulty: { type: Number, default: 0.3 },
  optimalDifficulty: { type: Number, default: 0.5 },
  
  // Timestamps
  firstAttempt: { type: Date },
  lastAttempt: { type: Date },
  masteredAt: { type: Date },
  
  // Prerequisites and Dependencies
  prerequisites: [{ type: String }],
  unlocks: [{ type: String }]
}, {
  timestamps: true
});

// Learning Analytics Schema
const learningAnalyticsSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, default: Date.now },
  
  // Daily Metrics
  dailyMetrics: {
    sessionsCompleted: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 },
    conceptsAttempted: { type: Number, default: 0 },
    conceptsMastered: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    averageEngagement: { type: Number, default: 0 }
  },
  
  // Learning Patterns
  patterns: {
    peakPerformanceHours: [{ type: Number }],
    preferredSessionLength: { type: Number },
    optimalDifficultyRange: {
      min: { type: Number },
      max: { type: Number }
    },
    learningVelocity: { type: Number },
    retentionRate: { type: Number }
  },
  
  // Emotional Learning States
  emotionalStates: [{
    timestamp: { type: Date },
    state: { type: String }, // 'engaged', 'frustrated', 'bored', 'excited', 'confident'
    intensity: { type: Number, min: 0, max: 1 },
    context: { type: String }
  }],
  
  // Predictions and Recommendations
  predictions: {
    nextOptimalConcepts: [{ type: String }],
    estimatedMasteryTime: { type: Number },
    riskOfDisengagement: { type: Number, min: 0, max: 1 },
    recommendedInterventions: [{ type: String }]
  }
}, {
  timestamps: true
});

// Achievement Schema
const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['mastery', 'persistence', 'creativity', 'collaboration', 'speed', 'consistency'],
    required: true 
  },
  
  // Achievement Criteria
  criteria: {
    type: { type: String }, // 'concept_mastery', 'streak_days', 'creative_solutions', etc.
    threshold: { type: Number },
    timeframe: { type: String }, // 'daily', 'weekly', 'monthly', 'all_time'
    subjects: [{ type: String }] // empty array means all subjects
  },
  
  // Reward Details
  rewards: {
    xp: { type: Number, default: 0 },
    badge: {
      icon: { type: String },
      color: { type: String },
      rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'] }
    },
    unlockedContent: [{ type: String }]
  },
  
  // Metadata
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, default: 'system' }
}, {
  timestamps: true
});

// Create Models
const Student = mongoose.model('Student', studentSchema);
const GameSession = mongoose.model('GameSession', gameSessionSchema);
const ConceptProgress = mongoose.model('ConceptProgress', conceptProgressSchema);
const LearningAnalytics = mongoose.model('LearningAnalytics', learningAnalyticsSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = {
  Student,
  GameSession,
  ConceptProgress,
  LearningAnalytics,
  Achievement
};