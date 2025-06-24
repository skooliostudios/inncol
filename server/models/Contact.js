const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  responses: [{
    message: {
      type: String,
      required: true
    },
    sentBy: {
      type: String,
      required: true // 'admin' or 'customer'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'  // Reference to admin who sent the response
    },
    gmailMessageId: {
      type: String  // Gmail message ID for tracking processed emails
    }
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  isResponded: {
    type: Boolean,
    default: false
  },
  responseDate: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ isRead: 1 });
contactSchema.index({ isResponded: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema); 