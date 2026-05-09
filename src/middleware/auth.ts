import { Request, Response, NextFunction } from 'express';
import { LOGIN_ACCESS, PLATFORM } from '../constants/authConstant';
import { responseHandler, response } from '../utils';
const { unAuthorized } = response;

const verifyCallback =
  (userTokensDb: any, req: any, resolve: any, reject: any, platform: any) =>
  async (error: any, user: any, info: any) => {
    if (error || info || !user) {
      return reject('Unauthorized User');
    }
    req.user = user;
    if (!user.isActive) {
      return reject('User is deactivated');
    }
    let userToken = await userTokensDb.findOne({
      token: (req.headers.authorization as string).replace('Bearer ', ''),
      userId: user.id,
    });
    if (!userToken) {
      return reject('Token not found');
    }
    if (userToken.isTokenExpired) {
      return reject('Token is Expired');
    }
    if (user.userType) {
      let allowedPlatforms = LOGIN_ACCESS[user.userType] ? LOGIN_ACCESS[user.userType] : [];
      if (!allowedPlatforms.includes(platform)) {
        return reject('Unauthorized user');
      }
    }
    resolve();
  };

export const auth =
  ({ passport, userTokensDb }: any) =>
  (platform: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (platform == PLATFORM.ADMIN) {
      return new Promise((resolve, reject) => {
        passport.authenticate(
          'admin-rule',
          { session: false },
          verifyCallback(userTokensDb, req, resolve, reject, platform)
        )(req, res, next);
      })
        .then(() => next())
        .catch((error) => {
          responseHandler(res, unAuthorized());
        });
    } else if (platform == PLATFORM.DEVICE) {
      return new Promise((resolve, reject) => {
        passport.authenticate(
          'device-rule',
          { session: false },
          verifyCallback(userTokensDb, req, resolve, reject, platform)
        )(req, res, next);
      })
        .then(() => next())
        .catch((error) => {
          responseHandler(res, unAuthorized());
        });
    } else if (platform == PLATFORM.CLIENT) {
      return new Promise((resolve, reject) => {
        passport.authenticate(
          'client-rule',
          { session: false },
          verifyCallback(userTokensDb, req, resolve, reject, platform)
        )(req, res, next);
      })
        .then(() => next())
        .catch((error) => {
          responseHandler(res, unAuthorized());
        });
    }
  };

export default auth;
