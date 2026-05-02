const express = require('express');
const router = express.Router();
const projects = require('../controllers/projectController');
const protect = require('../middleware/auth');
const { requireRole, requireProjectAccess } = require('../middleware/rbac');

router.use(protect);

router.get('/', projects.getProjects);
router.post('/', requireRole('admin'), projects.createProject);
router.get('/:id', requireProjectAccess, projects.getProject);
router.put('/:id', requireRole('admin'), projects.updateProject);
router.delete('/:id', requireRole('admin'), projects.deleteProject);
router.post('/:id/members', requireRole('admin'), projects.addMember);
router.delete('/:id/members/:userId', requireRole('admin'), projects.removeMember);

module.exports = router;
