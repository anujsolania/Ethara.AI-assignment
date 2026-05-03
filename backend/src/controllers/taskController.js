const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, assignee, overdue, search, page = 1, limit = 50 } = req.query;

    const filter = {};

    // Members see tasks in their projects OR tasks assigned to them
    if (req.user.role !== 'admin') {
      const myProjects = await Project.find({ 'members.user': req.user.id }).select('_id');
      const projectIds = myProjects.map((p) => p._id);
      filter.$or = [{ project: { $in: projectIds } }, { assignee: req.user.id }];
    }

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = { $ne: 'done' };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        tasks,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignee, status, priority, dueDate, tags } = req.body;

    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignee: assignee || null,
      createdBy: req.user.id,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      tags: tags || [],
    });

    // Auto-add assignee to project members if not already there
    if (assignee) {
      const alreadyMember = proj.members.some((m) => m.user.toString() === assignee.toString());
      if (!alreadyMember) {
        proj.members.push({ user: assignee, role: 'member' });
        await proj.save();
      }
    }

    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('project', 'name color');

    res.status(201).json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color')
      .populate('comments.author', 'name email avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only update status of their own tasks
    if (req.user.role !== 'admin') {
      if (task.assignee?.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      const { status } = req.body;
      task.status = status || task.status;
    } else {
      const { title, description, assignee, status, priority, dueDate, tags } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignee !== undefined) task.assignee = assignee;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (tags !== undefined) task.tags = tags;

      // Auto-add new assignee to project members if not already there
      if (assignee) {
        const proj = await Project.findById(task.project);
        if (proj) {
          const alreadyMember = proj.members.some((m) => m.user.toString() === assignee.toString());
          if (!alreadyMember) {
            proj.members.push({ user: assignee, role: 'member' });
            await proj.save();
          }
        }
      }
    }

    await task.save();
    await task.populate('assignee', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');
    await task.populate('project', 'name color');

    res.json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Members can only update their own task status
    if (req.user.role !== 'admin' && task.assignee?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    task.status = status;
    await task.save();

    res.json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.comments.push({ author: req.user.id, text });
    await task.save();
    await task.populate('comments.author', 'name email avatar');

    res.json({ success: true, data: { comments: task.comments } });
  } catch (err) {
    next(err);
  }
};
