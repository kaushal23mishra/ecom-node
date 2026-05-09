import express from 'express';
const router = express.Router();

import adminRoutes from './admin/index';
import deviceRoutes from './device/v1/index';
import clientRoutes from './client/v1/index';

router.use(adminRoutes);
router.use(deviceRoutes);
router.use(clientRoutes);

export default router;
