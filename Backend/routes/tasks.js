import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 1000, status, category, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;
    
    // Update overdue tasks first
    await Task.updateMany(
      {
        userId: req.user._id,
        dueDate: { $lt: new Date() },
        status: 'pending'
      },
      { status: 'overdue' }
    );
    
    const query = { userId: req.user._id };
    
    // Add filters
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const tasks = await Task.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Task.countDocuments(query);
    
    res.json({
      success: true,
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get task statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Update overdue tasks first
    await Task.updateMany(
      {
        userId: userId,
        dueDate: { $lt: new Date() },
        status: 'pending'
      },
      { status: 'overdue' }
    );
    
    const [total, completed, pending, overdue] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: 'completed' }),
      Task.countDocuments({ userId, status: 'pending' }),
      Task.countDocuments({ userId, status: 'overdue' })
    ]);
    
    res.json({
      success: true,
      total,
      completed,
      pending,
      overdue
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new task
router.post('/', authenticate, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').isIn(['Work', 'Personal', 'Health', 'Education', 'Shopping', 'Finance', 'Travel', 'Other']).withMessage('Invalid category'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if due date is not in the past
    const dueDate = new Date(req.body.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Due date cannot be in the past'
      });
    }

    const taskData = {
      ...req.body,
      userId: req.user._id
    };

    const task = new Task(taskData);
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update task
router.put('/:id', authenticate, [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('category').optional().isIn(['Work', 'Personal', 'Health', 'Education', 'Shopping', 'Finance', 'Travel', 'Other']).withMessage('Invalid category'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
  body('status').optional().isIn(['pending', 'completed', 'overdue']).withMessage('Invalid status'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if due date is not in the past (only if dueDate is being updated)
    if (req.body.dueDate) {
      const dueDate = new Date(req.body.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        return res.status(400).json({
          success: false,
          message: 'Due date cannot be in the past'
        });
      }
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        task[key] = req.body[key];
      }
    });

    // Set completedAt if status is completed
    if (req.body.status === 'completed' && task.status !== 'completed') {
      task.completedAt = new Date();
    } else if (req.body.status !== 'completed') {
      task.completedAt = null;
    }

    await task.save();

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await Task.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single task
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;