const Task = require('../models/Task');

const ALLOWED_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];

const pick = (body) =>
  ALLOWED_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});

// GET /api/tasks?status=&priority=&search=
const getTasks = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.search) {
      const escaped = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: escaped, $options: 'i' };
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const data = pick(req.body);
    if (!data.title || !String(data.title).trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (data.dueDate === '') data.dueDate = null;

    const task = await Task.create({ ...data, user: req.user._id });
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const data = pick(req.body);
    if (data.dueDate === '') data.dueDate = null;
    if (data.title !== undefined && !String(data.title).trim()) {
      return res.status(400).json({ message: 'Title cannot be empty' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      data,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted', id: task._id });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask };
