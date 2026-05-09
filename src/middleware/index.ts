import passport from 'passport';

const userDb = require('../data-access/userDb');
const userTokensDb = require('../data-access/userTokensDb');
const userRoleDb = require('../data-access/userRoleDb');
const routeRoleDb = require('../data-access/routeRoleDb');
const projectRouteDb = require('../data-access/projectRouteDb');

import authMiddleware from './auth';
import checkRolePermissionMiddleware from './checkRolePermission';
import adminPassportStrategyFactory from './adminPassportStrategy';
import devicePassportStrategyFactory from './devicePassportStrategy';
import clientPassportStrategyFactory from './clientPassportStrategy';
import errorHandler from './errorHandler';
import apiVersion from './apiVersion';

const auth = authMiddleware({
  passport,
  userTokensDb,
});

const checkRolePermission = checkRolePermissionMiddleware({
  userRoleDb,
  routeRoleDb,
  projectRouteDb,
});

const adminPassportStrategy = adminPassportStrategyFactory({ userDb });
const devicePassportStrategy = devicePassportStrategyFactory({ userDb });
const clientPassportStrategy = clientPassportStrategyFactory({ userDb });

export {
  auth,
  checkRolePermission,
  adminPassportStrategy,
  devicePassportStrategy,
  clientPassportStrategy,
  errorHandler,
  apiVersion,
};
