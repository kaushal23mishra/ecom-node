import express from 'express';
const router = express.Router();
const systemController = require('../../controller/admin/system/systemController');
const { auth } = require('../../middleware');
const authConstant = require('../../constants/authConstant');

router.get('/info', auth(authConstant.PLATFORM.ADMIN), systemController.getSystemInfo);

export default router;
