import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Work', 'Personal', 'Health', 'Education', 'Shopping', 'Finance', 'Travel', 'Other'],
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  completedAt: {
    type: Date,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
  }],
}, {
  timestamps: true,
});

// Index for better query performance
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ status: 1, dueDate: 1 });

export default mongoose.model('Task', taskSchema);