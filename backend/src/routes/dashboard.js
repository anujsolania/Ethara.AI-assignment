const express = require('express');
const router = express.Router();
const dashboard = require('../controllers/dashboardController');
const protect = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect);

router.get('/stats', dashboard.getStats);
router.get('/overdue', dashboard.getOverdueTasks);
router.get('/recent-tasks', dashboard.getRecentTasks);
router.get('/members', requireRole('admin'), dashboard.getMembers);

module.exports = router;
