const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    unique: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  doctorId: {
    type: String,
    required: true
  },
  patientId: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  participants: [{
    userId: String,
    userType: { type: String, enum: ['doctor', 'patient'] },
    joinedAt: Date,
    leftAt: Date
  }],
  duration: {
    type: Number, // in seconds
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema);
