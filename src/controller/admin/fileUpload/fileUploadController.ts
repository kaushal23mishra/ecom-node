const response = require('../../../utils/response');
const responseHandler = require('../../../utils/response/responseHandler');

const upload = (fileUploadUsecase) => async (req, res) => {
  try {
    let result = await fileUploadUsecase(req, res);
    return responseHandler(res, result);
  } catch (error: any) {
    return responseHandler(res, response.internalServerError({ message: error.message }));
  }
};
export = { upload };
