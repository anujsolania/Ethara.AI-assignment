const express = require('express');
const router = express.Router();
const tasks = require('../controllers/taskController');
const protect = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect);

router.get('/', tasks.getTasks);
router.post('/', requireRole('admin'), tasks.createTask);
router.get('/:id', tasks.getTask);
router.put('/:id', tasks.updateTask);
router.patch('/:id/status', tasks.updateStatus);
router.delete('/:id', requireRole('admin'), tasks.deleteTask);
router.post('/:id/comments', tasks.addComment);

module.exports = router;
