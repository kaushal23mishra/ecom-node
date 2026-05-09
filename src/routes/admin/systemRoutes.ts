import express from 'express';
const router = express.Router();
const systemController = require('../../controller/admin/system/systemController');
const { auth } = require('../../middleware');
const authConstant = require('../../constants/authConstant');

router.get('/info', auth(authConstant.PLATFORM.ADMIN), systemController.getSystemInfo);

router.post('/latestappupgrade', (req, res) => {
  res.json({
    status: 'SUCCESS',
    message: 'Your request is successfully executed',
    data: [
      {
        app_platform: req.body?.app_platform || 'android',
        current_version: '1.0.0',
        criticality: '0',
        upgrade_message: 'App is up to date',
        status: '0',
      },
    ],
  });
});

export default router;
