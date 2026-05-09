const addProduct = require('../../../../src/use-case/product/addProduct');
const response = require('../../../../src/utils/response');

describe('Product Use Case: addProduct', () => {
  let mockProductDb;
  let mockCreateValidation;

  beforeEach(() => {
    mockProductDb = { create: jest.fn(), };
    mockCreateValidation = jest.fn();
  });

  it('should successfully create a product when data is valid', async () => {
    const productData = {
      name: 'iPhone 15',
      price: 999 
    };
    mockCreateValidation.mockResolvedValue({ isValid: true });
    mockProductDb.create.mockResolvedValue({
      ...productData,
      id: 'product123' 
    });

    const execute = addProduct({
      productDb: mockProductDb,
      createValidation: mockCreateValidation,
    });

    const result = await execute(productData);

    expect(result.status).toBe('SUCCESS');
    expect(result.data.id).toBe('product123');
    expect(mockProductDb.create).toHaveBeenCalled();
  });

  it('should return validation error when product data is invalid', async () => {
    const productData = { name: '' };
    mockCreateValidation.mockResolvedValue({
      isValid: false,
      message: 'Name is required',
    });

    const execute = addProduct({
      productDb: mockProductDb,
      createValidation: mockCreateValidation,
    });

    const result = await execute(productData);

    expect(result.status).toBe('VALIDATION_ERROR');
    expect(result.message).toContain('Name is required');
    expect(mockProductDb.create).not.toHaveBeenCalled();
  });
});
