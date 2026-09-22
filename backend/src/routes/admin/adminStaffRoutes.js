const express = require('express');
const adminStaffController = require('../../controllers/adminStaffController');
const requireStaffAuth = require('../../middlewares/requireStaffAuth');
const requireRole = require('../../middlewares/requireRole');

const router = express.Router();

router.use(requireStaffAuth);

// Changing YOUR OWN password is available to every role and is guarded by
// the current password instead of by role. Declared before '/:id/...' so
// the literal path is never swallowed by the id parameter.
router.post('/me/password', adminStaffController.changeOwnPassword);

// Everything below manages OTHER people's access — owner only.
router.use(requireRole('owner'));

router.get('/', adminStaffController.list);
router.post('/', adminStaffController.create);
router.patch('/:id', adminStaffController.update);
router.post('/:id/password', adminStaffController.resetPassword);

module.exports = router;
