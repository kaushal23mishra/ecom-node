/**
 * @openapi
 * tags:
 *   name: User
 *   description: User management for admin platform
 */

/**
 * @openapi
 * /admin/user/list:
 *   post:
 *     tags: [User]
 *     summary: Get all users with pagination and filters
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query: { type: object }
 *               options: 
 *                 type: object
 *                 properties:
 *                   page: { type: integer, default: 1 }
 *                   limit: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Success }
 *       401: { $ref: '#/components/responses/UnauthorizedError' }
 */
const response = require('../../../utils/response');
const responseHandler = require('../../../utils/response/responseHandler');
const getSelectObject = require('../../../utils/getSelectObject');

const addUser = (addUserUsecase) => async (req: any, res: any) => {
  try {
    let dataToCreate = { ...req.body || {} };
    dataToCreate.addedBy = req.user.id;
    let result = await addUserUsecase(dataToCreate, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const bulkInsertUser = (bulkInsertUserUsecase) => async (req: any, res: any) => {
  try {
    let dataToCreate = [...req.body.data];
    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i] = {
        ...dataToCreate[i],
        addedBy: req.user.id,
      };
    }
    let result = await bulkInsertUserUsecase(dataToCreate, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const findAllUser = (findAllUserUsecase) => async (req: any, res: any) => {
  try {
    let query: any = { ...req.body.query || {} };
    let options: any = { ...req.body.options || {} };
    query._id = { $ne: req.user.id };
    if (req.body && req.body.query && req.body.query._id) {
      query._id.$in = [req.body.query._id];
    }
    let result = await findAllUserUsecase({
      query,
      options,
      isCountOnly: req.body.isCountOnly || false
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const getUser = (getUserUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest());
    }
    let query: any = { _id: req.params.id };
    let options: any = {};
    let result = await getUserUsecase({
      query,
      options
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const getUserCount = (getUserCountUsecase) => async (req: any, res: any) => {
  try {
    let where = { ...req.body.where || {} };
    let result = await getUserCountUsecase({ where }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const updateUser = (updateUserUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let dataToUpdate = { ...req.body || {} };
    let query: any = { _id: req.params.id };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    query._id.$ne = req.user.id;
    let result = await updateUserUsecase({
      dataToUpdate,
      query
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const bulkUpdateUser = (bulkUpdateUserUsecase) => async (req: any, res: any) => {
  try {
    let dataToUpdate = { ...req.body.data || {} };
    let query: any = { ...req.body.filter || {} };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    query._id = { $ne: req.user.id };
    if (req.body.filter && req.body.filter._id) {
      query._id.$in = [req.body.filter._id];
    }
    let result = await bulkUpdateUserUsecase({
      dataToUpdate,
      query
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const partialUpdateUser = (partialUpdateUserUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let query: any = { _id: req.params.id };
    let dataToUpdate = { ...req.body || {} };
    dataToUpdate.updatedBy = req.user.id;
    query._id.$ne = req.user.id;
    let result = await partialUpdateUserUsecase({
      dataToUpdate,
      query
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const softDeleteUser = (softDeleteUserUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let query: any = { _id: req.params.id };
    query._id.$ne = req.user.id;
    const dataToUpdate = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let result = await softDeleteUserUsecase({
      query,
      dataToUpdate,
      isWarning: req.body.isWarning || false
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const deleteUser = (deleteUserUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let query: any = { _id: req.params.id };
    query._id.$ne = req.user.id;
    let result = await deleteUserUsecase({
      query,
      isWarning: req.body.isWarning || false
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const deleteManyUser = (deleteManyUserUsecase) => async (req: any, res: any) => {
  try {
    if (!req.body || !req.body.ids) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! ids field is required.' }));
    }
    let ids = req.body.ids;
    let query: any = { _id: { $in: ids } };
    query._id.$ne = req.user.id;
    let result = await deleteManyUserUsecase({
      query,
      isWarning: req.body.isWarning || false
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const softDeleteManyUser = (softDeleteManyUserUsecase) => async (req: any, res: any) => {
  try {
    if (!req.body || !req.body.ids) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let ids = req.body.ids;
    let query: any = { _id: { $in: ids } };
    query._id.$ne = req.user.id;
    const dataToUpdate = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let result = await softDeleteManyUserUsecase({
      query,
      dataToUpdate,
      isWarning: req.body.isWarning || false
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const changePassword = (changePasswordUsecase) => async (req: any, res: any) => {
  try {
    let params = {
      ...req.body,
      userId: req.user.id
    };
    let result = await changePasswordUsecase(params);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const updateProfile = (updateProfileUsecase) => async (req: any, res: any) => {
  try {
    let result = await updateProfileUsecase({
      id: req.user.id,
      profileData: req.body
    });
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const getLoggedInUserInfo = (getUserUsecase) => async (req: any, res: any) => {
  try {
    const options = {};
    const query = {
      _id: req.user.id,
      isDeleted: false,
      isActive: true
    };
    let result = await getUserUsecase({
      query,
      options
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

export = {
  addUser,
  bulkInsertUser,
  findAllUser,
  getUser,
  getUserCount,
  updateUser,
  bulkUpdateUser,
  partialUpdateUser,
  softDeleteUser,
  deleteUser,
  deleteManyUser,
  softDeleteManyUser,
  changePassword,
  updateProfile,
  getLoggedInUserInfo
};
