// import express from 'express';
// import { body, validationResult } from 'express-validator';
// import Task from '../models/Task.js';
// import { authenticate } from '../middleware/auth.js';

// const router = express.Router();

// // Get all tasks for authenticated user
// router.get('/', authenticate, async (req, res) => {
//   try {
//     const { page = 1, limit = 10, status, category} = req.query;
    
//     const query = { userEmail: req.user.email };
    
//     // Add filters
//     if (status && status !== 'all') {
//       query.status = status;
//     }
    
//     if (category && category !== 'all') {
//       query.category = category;
//     }
    
    
//     const tasks = await Task.find(query)
//       .limit(limit * 1)
//       .skip((page - 1) * limit);
    
//     const total = await Task.countDocuments(query);
    
//     res.json({
//       success: true,
//       tasks,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Get tasks error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }

// });

// // Get task statistics
// router.get('/stats', authenticate, async (req, res) => {
//   try {
//     const userId = req.user._id;
    
//     const [total, completed, pending, overdue] = await Promise.all([
//       Task.countDocuments({ userId }),
//       Task.countDocuments({ userId, status: 'completed' }),
//       Task.countDocuments({ userId, status: 'pending' }),
//       Task.countDocuments({ userId, status: 'overdue' })
//     ]);
    
//     res.json({
//       success: true,
//       total,
//       completed,
//       pending,
//       overdue
//     });
//   } catch (error) {
//     console.error('Get stats error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // Create new task
// router.post('/', authenticate, [
//   body('title').trim().notEmpty().withMessage('Title is required'),
//   body('category').isIn(['Work', 'Personal', 'Health', 'Education', 'Shopping', 'Finance', 'Travel', 'Other']).withMessage('Invalid category'),
//   body('dueDate').isISO8601().withMessage('Valid due date is required'),
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const taskData = {
//       ...req.body,
//       userEmail: req.user.email
//     };

//     const task = new Task(taskData);
//     await task.save();

//     res.status(201).json({
//       success: true,
//       message: 'Task created successfully',
//       task
//     });
//   } catch (error) {
//     console.error('Create task error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // Update task
// router.put('/:id', authenticate, [
//   body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
//   body('category').optional().isIn(['Work', 'Personal', 'Health', 'Education', 'Shopping', 'Finance', 'Travel', 'Other']).withMessage('Invalid category'),
//   body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
//   body('status').optional().isIn(['pending', 'completed', 'overdue']).withMessage('Invalid status'),
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors: errors.array()
//       });
//     }

//     const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: 'Task not found'
//       });
//     }

//     // Update fields
//     Object.keys(req.body).forEach(key => {
//       if (req.body[key] !== undefined) {
//         task[key] = req.body[key];
//       }
//     });

//     // Set completedAt if status is completed
//     if (req.body.status === 'completed' && task.status !== 'completed') {
//       task.completedAt = new Date();
//     } else if (req.body.status !== 'completed') {
//       task.completedAt = null;
//     }

//     await task.save();

//     res.json({
//       success: true,
//       message: 'Task updated successfully',
//       task
//     });
//   } catch (error) {
//     console.error('Update task error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // Delete task
// router.delete('/:id', authenticate, async (req, res) => {
//   try {
//     const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: 'Task not found'
//       });
//     }

//     await Task.deleteOne({ _id: req.params.id });

//     res.json({
//       success: true,
//       message: 'Task deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete task error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// // Get single task
// router.get('/:id', authenticate, async (req, res) => {
//   try {
//     const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: 'Task not found'
//       });
//     }

//     res.json({
//       success: true,
//       task
//     });
//   } catch (error) {
//     console.error('Get task error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });

// export default router;

import express from 'express';
import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// // Get all tasks for authenticated user
// // Get all tasks for authenticated user
// // Get all tasks for authenticated user (without status filtering)
// router.get('/alltasks', authenticate, async (req, res) => {
//   try {
//     // Remove status from query parameters if it exists
//     const { page = 1, limit = 10, category, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;
    
//     // Create base query to find all tasks for the authenticated user
//     const query = { userEmail: req.user.email };
    
//     // Only filter by category if specified
//     if (category && category !== 'all') {
//       query.category = category;
//     }
    
//     // Build sort object
//     const sort = {};
//     sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
//     // Fetch all tasks without status filtering
//     const tasks = await Task.find(query)
//       .sort(sort)
//       .limit(parseInt(limit))
//       .skip((parseInt(page) - 1) * parseInt(limit));
    
//     const total = await Task.countDocuments(query);

//     res.json({
//       success: true,
//       tasks,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.error('Get tasks error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error'
//     });
//   }
// });


router.get('/alltasks', authenticate, async (req, res) => {
  try {
    console.log('User email making request:', req.user.email); // Verify user email
    
    const query = { userEmail: req.user.email };
    console.log('MongoDB query being used:', query);
    
    // Test with a direct find() to verify connection
    const testTasks = await Task.find({});
    console.log('All tasks in DB (no filter):', testTasks);
    
    // Now try with user filter
    const tasks = await Task.find(query);
    console.log('Tasks found for user:', tasks);
    
    res.json({
      success: true,
      tasks,
      pagination: {
        page: 1,
        limit: tasks.length,
        total: tasks.length,
        pages: 1
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get task statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userEmail = req.user.email; // Changed from userId to userEmail
    
    const [total, completed, pending, overdue] = await Promise.all([
      Task.countDocuments({ userEmail }),
      Task.countDocuments({ userEmail, status: 'completed' }),
      Task.countDocuments({ userEmail, status: 'pending' }),
      Task.countDocuments({ userEmail, status: 'overdue' })
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

    const taskData = {
      ...req.body,
      userEmail: req.user.email
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

    const task = await Task.findOne({ 
      _id: req.params.id, 
      userEmail: req.user.email
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
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
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userEmail: req.user.email
    });
    
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
    const task = await Task.findOne({ 
      _id: req.params.id, 
      userEmail: req.user.email 
    });
    
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