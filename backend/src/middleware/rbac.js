const Project = require('../models/Project');

// Require specific role(s) on the user model
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

// Ensure user is a member of the project (or admin)
const requireProjectAccess = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();

    const projectId = req.params.id || req.body.project || req.query.project;
    if (!projectId) return next();

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isMember = project.members.some((m) => m.user.toString() === req.user.id.toString());
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You are not a member of this project' });
    }

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireRole, requireProjectAccess };
