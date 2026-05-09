/**
 * @openapi
 * tags:
 *   name: Category
 *   description: Category management for admin platform
 */

/**
 * @openapi
 * /admin/category/list:
 *   post:
 *     tags: [Category]
 *     summary: Get all categories with pagination and filters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Success }
 */

/**
 * @openapi
 * /admin/category/create:
 *   post:
 *     tags: [Category]
 *     summary: Create a new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200: { description: Category created }
 */
const response = require('../../../utils/response');
const responseHandler = require('../../../utils/response/responseHandler');
const getSelectObject = require('../../../utils/getSelectObject');

const addCategory = (addCategoryUsecase) => async (req: any, res: any) => {
  try {
    let dataToCreate = { ...req.body || {} };
    dataToCreate.addedBy = req.user.id;
    let result = await addCategoryUsecase(dataToCreate, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const bulkInsertCategory = (bulkInsertCategoryUsecase) => async (req: any, res: any) => {
  try {
    let dataToCreate = [...req.body.data];
    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i] = {
        ...dataToCreate[i],
        addedBy: req.user.id,
      };
    }
    let result = await bulkInsertCategoryUsecase(dataToCreate, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const findAllCategory = (findAllCategoryUsecase) => async (req: any, res: any) => {
  try {
    let query: any = { ...req.body.query || {} };
    let options: any = { ...req.body.options || {} };
    let result = await findAllCategoryUsecase({
      query,
      options,
      isCountOnly: req.body.isCountOnly || false
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const getCategory = (getCategoryUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest());
    }
    let query: any = { _id: req.params.id };
    let options: any = {};
    let result = await getCategoryUsecase({
      query,
      options
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const getCategoryCount = (getCategoryCountUsecase) => async (req: any, res: any) => {
  try {
    let where = { ...req.body.where || {} };
    let result = await getCategoryCountUsecase({ where }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const updateCategory = (updateCategoryUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let dataToUpdate = { ...req.body || {} };
    let query: any = { _id: req.params.id };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let result = await updateCategoryUsecase({
      dataToUpdate,
      query
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const bulkUpdateCategory = (bulkUpdateCategoryUsecase) => async (req: any, res: any) => {
  try {
    let dataToUpdate = { ...req.body.data || {} };
    let query: any = { ...req.body.filter || {} };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let result = await bulkUpdateCategoryUsecase({
      dataToUpdate,
      query
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const partialUpdateCategory = (partialUpdateCategoryUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let query: any = { _id: req.params.id };
    let dataToUpdate = { ...req.body || {} };
    dataToUpdate.updatedBy = req.user.id;
    let result = await partialUpdateCategoryUsecase({
      dataToUpdate,
      query
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const softDeleteCategory = (softDeleteCategoryUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let query: any = { _id: req.params.id };
    const dataToUpdate = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let result = await softDeleteCategoryUsecase({
      query,
      dataToUpdate,
      isWarning: req.body.isWarning || false
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const deleteCategory = (deleteCategoryUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let query: any = { _id: req.params.id };
    let result = await deleteCategoryUsecase({
      query,
      isWarning: req.body.isWarning || false
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const deleteManyCategory = (deleteManyCategoryUsecase) => async (req: any, res: any) => {
  try {
    if (!req.body || !req.body.ids) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! ids field is required.' }));
    }
    let ids = req.body.ids;
    let query: any = { _id: { $in: ids } };
    let result = await deleteManyCategoryUsecase({
      query,
      isWarning: req.body.isWarning || false
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const softDeleteManyCategory = (softDeleteManyCategoryUsecase) => async (req: any, res: any) => {
  try {
    if (!req.body || !req.body.ids) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let ids = req.body.ids;
    let query: any = { _id: { $in: ids } };
    const dataToUpdate = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let result = await softDeleteManyCategoryUsecase({
      query,
      dataToUpdate,
      isWarning: req.body.isWarning || false
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

export = {
  addCategory,
  bulkInsertCategory,
  findAllCategory,
  getCategory,
  getCategoryCount,
  updateCategory,
  bulkUpdateCategory,
  partialUpdateCategory,
  softDeleteCategory,
  deleteCategory,
  deleteManyCategory,
  softDeleteManyCategory
};
