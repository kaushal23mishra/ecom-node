import express from 'express';
import authRoutes from './auth';
import userRoutesRoutes from './userRoutes';
import productRoutesRoutes from './productRoutes';
import categoryRoutesRoutes from './categoryRoutes';
import orderRoutesRoutes from './orderRoutes';
import bannerRoutesRoutes from './bannerRoutes';
import cartRoutesRoutes from './cartRoutes';
import countryRoutesRoutes from './countryRoutes';
import cityRoutesRoutes from './cityRoutes';
import pincodeRoutesRoutes from './pincodeRoutes';
import stateRoutesRoutes from './stateRoutes';
import walletRoutesRoutes from './walletRoutes';
import walletTransactionRoutesRoutes from './walletTransactionRoutes';
import shippingRoutesRoutes from './shippingRoutes';
import uploadRoutesRoutes from './uploadRoutes';

const router = express.Router();

router.use('/device/auth', authRoutes);
router.use(userRoutesRoutes);
router.use(productRoutesRoutes);
router.use(categoryRoutesRoutes);
router.use(orderRoutesRoutes);
router.use(bannerRoutesRoutes);
router.use(cartRoutesRoutes);
router.use(countryRoutesRoutes);
router.use(cityRoutesRoutes);
router.use(pincodeRoutesRoutes);
router.use(stateRoutesRoutes);
router.use(walletRoutesRoutes);
router.use(walletTransactionRoutesRoutes);
router.use(shippingRoutesRoutes);
router.use(uploadRoutesRoutes);

export default router;
