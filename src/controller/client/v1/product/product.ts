/**
 * @openapi
 * tags:
 *   name: Product
 *   description: Product management for client platform
 */

/**
 * @openapi
 * /client/product/list:
 *   post:
 *     tags: [Product]
 *     summary: Get all products with pagination and filters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Success }
 */

/**
 * @openapi
 * /client/product/create:
 *   post:
 *     tags: [Product]
 *     summary: Create a new product
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Created }
 */

const response = require('../../../../utils/response');
const responseHandler = require('../../../../utils/response/responseHandler');
const getSelectObject = require('../../../../utils/getSelectObject');

const addProduct = (addProductUsecase) => async (req, res) => {
  try {
    let dataToCreate = { ...(req.body || {}) };
    dataToCreate.addedBy = req.user.id;
    let result = await addProductUsecase(dataToCreate, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const bulkInsertProduct = (bulkInsertProductUsecase) => async (req, res) => {
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

const findAllProduct = (findAllProductUsecase) => async (req, res) => {
  try {
    let query: any = { ...(req.body.query || {}) };
    let options: any = { ...(req.body.options || {}) };
    let result = await findAllProductUsecase(
      {
        query,
        options,
        isCountOnly: req.body.isCountOnly || false,
      },
      req,
      res
    );
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const getProduct = (getProductUsecase) => async (req, res) => {
  try {
    if (!req.params.id) {
      return responseHandler(res, response.badRequest());
    }
    let query: any = { _id: req.params.id };
    let options: any = {};
    let result = await getProductUsecase(
      {
        query,
        options,
      },
      req,
      res
    );
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const getProductCount = (getProductCountUsecase) => async (req, res) => {
  try {
    let where = { ...(req.body.where || {}) };
    let result = await getProductCountUsecase({ where }, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const updateProduct = (updateProductUsecase) => async (req, res) => {
  try {
    if (!req.params.id) {
      return responseHandler(
        res,
        response.badRequest({ message: 'Insufficient request parameters! id is required.' })
      );
    }
    let dataToUpdate = { ...(req.body || {}) };
    let query: any = { _id: req.params.id };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let result = await updateProductUsecase(
      {
        dataToUpdate,
        query,
      },
      req,
      res
    );
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const bulkUpdateProduct = (bulkUpdateProductUsecase) => async (req, res) => {
  try {
    let dataToUpdate = { ...(req.body.data || {}) };
    let query: any = { ...(req.body.filter || {}) };
    delete dataToUpdate.addedBy;
    dataToUpdate.updatedBy = req.user.id;
    let result = await bulkUpdateProductUsecase(
      {
        dataToUpdate,
        query,
      },
      req,
      res
    );
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const partialUpdateProduct = (partialUpdateProductUsecase) => async (req, res) => {
  try {
    if (!req.params.id) {
      return responseHandler(
        res,
        response.badRequest({ message: 'Insufficient request parameters! id is required.' })
      );
    }
    let query: any = { _id: req.params.id };
    let dataToUpdate = { ...(req.body || {}) };
    dataToUpdate.updatedBy = req.user.id;
    let result = await partialUpdateProductUsecase(
      {
        dataToUpdate,
        query,
      },
      req,
      res
    );
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const softDeleteProduct = (softDeleteProductUsecase) => async (req, res) => {
  try {
    if (!req.params.id) {
      return responseHandler(
        res,
        response.badRequest({ message: 'Insufficient request parameters! id is required.' })
      );
    }
    let query: any = { _id: req.params.id };
    const dataToUpdate = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let result = await softDeleteProductUsecase(
      {
        query,
        dataToUpdate,
      },
      req,
      res
    );
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const deleteProduct = (deleteProductUsecase) => async (req, res) => {
  try {
    if (!req.params.id) {
      return responseHandler(
        res,
        response.badRequest({ message: 'Insufficient request parameters! id is required.' })
      );
    }
    let query: any = { _id: req.params.id };
    let result = await deleteProductUsecase(query, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const deleteManyProduct = (deleteManyProductUsecase) => async (req, res) => {
  try {
    if (!req.body || !req.body.ids) {
      return responseHandler(
        res,
        response.badRequest({ message: 'Insufficient request parameters! ids field is required.' })
      );
    }
    let ids = req.body.ids;
    let query: any = { _id: { $in: ids } };
    let result = await deleteManyProductUsecase(query, req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};

const softDeleteManyProduct = (softDeleteManyProductUsecase) => async (req, res) => {
  try {
    if (!req.body || !req.body.ids) {
      return responseHandler(
        res,
        response.badRequest({ message: 'Insufficient request parameters! ids field is required.' })
      );
    }
    let ids = req.body.ids;
    let query: any = { _id: { $in: ids } };
    const dataToUpdate = {
      isDeleted: true,
      updatedBy: req.user.id,
    };
    let result = await softDeleteManyProductUsecase(
      {
        query,
        dataToUpdate,
      },
      req,
      res
    );
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
  softDeleteManyProduct,
};
