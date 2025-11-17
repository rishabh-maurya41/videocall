const Meeting = require('../models/Meeting');

// Create a new meeting room
exports.createMeeting = async (req, res) => {
  try {
    const { appointmentId, doctorId, patientId, scheduledTime } = req.body;

    if (!appointmentId || !doctorId || !patientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Check if meeting already exists
    const existingMeeting = await Meeting.findOne({ appointmentId });
    if (existingMeeting) {
      return res.status(200).json({
        success: true,
        data: existingMeeting
      });
    }

    // Generate unique room ID
    const roomId = `room-${appointmentId}`;

    const meeting = await Meeting.create({
      appointmentId,
      roomId,
      doctorId,
      patientId,
      scheduledTime: scheduledTime || new Date(),
      status: 'scheduled'
    });

    res.status(201).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create meeting',
      error: error.message
    });
  }
};

// Get meeting by room ID
exports.getMeeting = async (req, res) => {
  try {
    const { roomId } = req.params;

    const meeting = await Meeting.findOne({ roomId });
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve meeting',
      error: error.message
    });
  }
};

// Update meeting status
exports.updateMeetingStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status, startTime, endTime } = req.body;

    const updateData = { status };
    if (startTime) updateData.startTime = startTime;
    if (endTime) {
      updateData.endTime = endTime;
      // Calculate duration if both times exist
      const meeting = await Meeting.findOne({ roomId });
      if (meeting && meeting.startTime) {
        updateData.duration = Math.floor((new Date(endTime) - new Date(meeting.startTime)) / 1000);
      }
    }

    const meeting = await Meeting.findOneAndUpdate(
      { roomId },
      updateData,
      { new: true }
    );

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meeting',
      error: error.message
    });
  }
};

// Add participant to meeting
exports.addParticipant = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, userType } = req.body;

    const meeting = await Meeting.findOneAndUpdate(
      { roomId },
      {
        $push: {
          participants: {
            userId,
            userType,
            joinedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add participant',
      error: error.message
    });
  }
};
