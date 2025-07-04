import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Task from '../models/Task.js';
import AuditLog from '../models/AuditLog.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, role } = req.query;
    
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, userId } = req.query;
    
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    const tasks = await Task.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Task.countDocuments(query);
    
    res.json({
      success: true,
      tasks: tasks.map(task => ({
        ...task.toObject(),
        user: task.userId
      })),
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

// Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { page = 1, limit = 10, action, resource, userId } = req.query;
    
    const query = {};
    
    if (action && action !== 'all') {
      query.action = action;
    }
    
    if (resource && resource !== 'all') {
      query.resource = resource;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await AuditLog.countDocuments(query);
    
    res.json({
      success: true,
      logs: logs.map(log => ({
        ...log.toObject(),
        user: log.userId
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, activeUsers, inactiveUsers, totalTasks, completedTasks, pendingTasks] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'inactive' }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: 'pending' })
    ]);
    
    res.json({
      success: true,
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalTasks,
      completedTasks,
      pendingTasks
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user status
router.put('/users/:id/status', [
  body('status').isIn(['active', 'inactive']).withMessage('Invalid status'),
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

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify your own account status'
      });
    }

    user.status = req.body.status;
    await user.save();

    res.json({
      success: true,
      message: 'User status updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user's tasks
    await Task.deleteMany({ userId: user._id });
    
    // Delete user
    await User.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update user role
router.put('/users/:id/role', [
  body('role').isIn(['user', 'admin']).withMessage('Invalid role'),
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

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = req.body.role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;