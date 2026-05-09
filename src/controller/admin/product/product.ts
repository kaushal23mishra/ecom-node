/**
 * @openapi
 * tags:
 *   name: Product
 *   description: Product management for admin platform
 */

/**
 * @openapi
 * /admin/product/list:
 *   post:
 *     tags: [Product]
 *     summary: Get all products with pagination and filters
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query: { type: object }
 *               options: { type: object }
 *     responses:
 *       200: { description: Success }
 */

/**
 * @openapi
 * /admin/product/create:
 *   post:
 *     tags: [Product]
 *     summary: Create a new product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               description: { type: string }
 *     responses:
 *       200: { description: Product created }
 */
const response = require('../../../utils/response');
const responseHandler = require('../../../utils/response/responseHandler');
const getSelectObject = require('../../../utils/getSelectObject');

const addProduct = (addProductUsecase) => async (req: any, res: any) => {
  try {
    let dataToCreate = { ...req.body || {} };
    dataToCreate.addedBy = req.user.id;
    let result = await addProductUsecase(dataToCreate, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const bulkInsertProduct = (bulkInsertProductUsecase) => async (req: any, res: any) => {
  try {
    let dataToCreate = [...req.body.data];
    for (let i = 0; i < dataToCreate.length; i++) {
      dataToCreate[i] = {
        ...dataToCreate[i],
        addedBy: req.user.id,
      };
    }
    let result = await bulkInsertProductUsecase(dataToCreate, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const findAllProduct = (findAllProductUsecase) => async (req: any, res: any) => {
  try {
    let query: any = { ...req.body.query || {} };
    let options: any = { ...req.body.options || {} };
    let result = await findAllProductUsecase({
      query,
      options,
      isCountOnly: req.body.isCountOnly || false
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const getProduct = (getProductUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest());
    }
    let query: any = { _id: req.params.id };
    let options: any = {};
    let result = await getProductUsecase({
      query,
      options
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const getProductCount = (getProductCountUsecase) => async (req: any, res: any) => {
  try {
    let where = { ...req.body.where || {} };
    let result = await getProductCountUsecase({ where }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const updateProduct = (updateProductUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let dataToUpdate = { ...req.body || {} };
    let query: any = { _id: req.params.id };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let result = await updateProductUsecase({
      dataToUpdate,
      query
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const bulkUpdateProduct = (bulkUpdateProductUsecase) => async (req: any, res: any) => {
  try {
    let dataToUpdate = { ...req.body.data || {} };
    let query: any = { ...req.body.filter || {} };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let result = await bulkUpdateProductUsecase({
      dataToUpdate,
      query
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const partialUpdateProduct = (partialUpdateProductUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let query: any = { _id: req.params.id };
    let dataToUpdate = { ...req.body || {} };
    dataToUpdate.updatedBy = req.user.id;
    let result = await partialUpdateProductUsecase({
      dataToUpdate,
      query
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const softDeleteProduct = (softDeleteProductUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let query: any = { _id: req.params.id };
    const dataToUpdate = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let result = await softDeleteProductUsecase({
      query,
      dataToUpdate
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const deleteProduct = (deleteProductUsecase) => async (req: any, res: any) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! id is required.' }));
    }
    let query: any = { _id: req.params.id };
    let result = await deleteProductUsecase(query, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const deleteManyProduct = (deleteManyProductUsecase) => async (req: any, res: any) => {
  try {
    if (!req.body || !req.body.ids) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! ids field is required.' }));
    }
    let ids = req.body.ids;
    let query: any = { _id: { $in: ids } };
    let result = await deleteManyProductUsecase(query, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const softDeleteManyProduct = (softDeleteManyProductUsecase) => async (req: any, res: any) => {
  try {
    if (!req.body || !req.body.ids) {
      return responseHandler(res, response.badRequest({ message: 'Insufficient request parameters! ids field is required.' }));
    }
    let ids = req.body.ids;
    let query: any = { _id: { $in: ids } };
    const dataToUpdate = {
      isDeleted: true,
      updatedBy: req.user.id
    };
    let result = await softDeleteManyProductUsecase({
      query,
      dataToUpdate
    }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

export = {
  addProduct,
  bulkInsertProduct,
  findAllProduct,
  getProduct,
  getProductCount,
  updateProduct,
  bulkUpdateProduct,
  partialUpdateProduct,
  softDeleteProduct,
  deleteProduct,
  deleteManyProduct,
  softDeleteManyProduct
};
