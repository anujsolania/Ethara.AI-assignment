const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    let projectFilter = {};
    let taskFilter = {};

    if (req.user.role !== 'admin') {
      const myProjects = await Project.find({ 'members.user': req.user.id }).select('_id');
      const projectIds = myProjects.map((p) => p._id);
      projectFilter = { _id: { $in: projectIds } };
      taskFilter = { project: { $in: projectIds } };
    }

    const [
      totalProjects,
      activeProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      reviewTasks,
      doneTasks,
      overdueTasks,
      totalMembers,
    ] = await Promise.all([
      Project.countDocuments(projectFilter),
      Project.countDocuments({ ...projectFilter, status: 'active' }),
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'todo' }),
      Task.countDocuments({ ...taskFilter, status: 'in-progress' }),
      Task.countDocuments({ ...taskFilter, status: 'review' }),
      Task.countDocuments({ ...taskFilter, status: 'done' }),
      Task.countDocuments({ ...taskFilter, dueDate: { $lt: now }, status: { $ne: 'done' } }),
      req.user.role === 'admin' ? User.countDocuments() : null,
    ]);

    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          activeProjects,
          totalTasks,
          totalMembers,
          completionRate,
          byStatus: { todo: todoTasks, inProgress: inProgressTasks, review: reviewTasks, done: doneTasks },
          overdueTasks,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/overdue
exports.getOverdueTasks = async (req, res, next) => {
  try {
    const now = new Date();
    let filter = { dueDate: { $lt: now }, status: { $ne: 'done' } };

    if (req.user.role !== 'admin') {
      const myProjects = await Project.find({ 'members.user': req.user.id }).select('_id');
      filter.project = { $in: myProjects.map((p) => p._id) };
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('project', 'name color')
      .sort('dueDate')
      .limit(20);

    res.json({ success: true, data: { tasks } });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/recent-tasks
exports.getRecentTasks = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      const myProjects = await Project.find({ 'members.user': req.user.id }).select('_id');
      filter.project = { $in: myProjects.map((p) => p._id) };
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('project', 'name color')
      .sort('-updatedAt')
      .limit(10);

    res.json({ success: true, data: { tasks } });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/members (admin only)
exports.getMembers = async (req, res, next) => {
  try {
    const users = await User.find().sort('name');
    res.json({ success: true, data: { users } });
  } catch (err) {
    next(err);
  }
};
