
const response = require('../../utils/response');

const createOrLoginGuestUser = ({
  userDb, createValidation 
}) => async (params: any) => {
  try {
        
  } catch (error: any) {
    return response.internalServerError({ message:error.message });
  }
};
export = createOrLoginGuestUser;