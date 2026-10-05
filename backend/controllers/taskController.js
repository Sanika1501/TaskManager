const Task = require('../models/Task');
const { asyncHandler } = require('../middleware/errorMiddleware');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Validates title/description/completed from a request body.
 * `partial` = true for updates (fields optional, but must be valid if present).
 * Returns { errors, data } where data contains only whitelisted, cleaned fields.
 */
const validateTaskInput = (body = {}, partial = false) => {
  const errors = [];
  const data = {};

  if (body.title !== undefined || !partial) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push('Title is required and must be a non-empty string');
    } else if (body.title.trim().length > 100) {
      errors.push('Title cannot exceed 100 characters');
    } else {
      data.title = body.title.trim();
    }
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      errors.push('Description must be a string');
    } else if (body.description.trim().length > 500) {
      errors.push('Description cannot exceed 500 characters');
    } else {
      data.description = body.description.trim();
    }
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== 'boolean') {
      errors.push('Completed must be a boolean (true or false)');
    } else {
      data.completed = body.completed;
    }
  }

  return { errors, data };
};

/**
 * Finds a task by ID that belongs to the logged-in user.
 * Sends the proper error response and returns null if invalid / not found / not owned.
 * Not-owned tasks return 404 so other users' task IDs are never revealed.
 */
const findOwnedTask = async (req, res) => {
  const { id } = req.params;

  if (!OBJECT_ID_REGEX.test(id)) {
    res.status(400).json({ success: false, message: 'Invalid task ID' });
    return null;
  }

  const task = await Task.findOne({ _id: id, user: req.user.id });

  if (!task) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return null;
  }

  return task;
};

/**
 * @desc    Get all tasks of the logged-in user (optional ?completed=true|false)
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = asyncHandler(async (req, res) => {
  const filter = { user: req.user.id };

  if (req.query.completed === 'true') filter.completed = true;
  if (req.query.completed === 'false') filter.completed = false;

  const tasks = await Task.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
});

/**
 * @desc    Create a task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = asyncHandler(async (req, res) => {
  const { errors, data } = validateTaskInput(req.body, false);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const task = await Task.create({ ...data, user: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    task,
  });
});

/**
 * @desc    Get a single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req, res);
  if (!task) return;

  res.status(200).json({ success: true, task });
});

/**
 * @desc    Update a task (title, description, completed)
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req, res);
  if (!task) return;

  const { errors, data } = validateTaskInput(req.body, true);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least one field to update: title, description, completed',
    });
  }

  Object.assign(task, data);
  await task.save();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    task,
  });
});

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwnedTask(req, res);
  if (!task) return;

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

module.exports = { getTasks, createTask, getTaskById, updateTask, deleteTask };
