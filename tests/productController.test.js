
import { jest } from "@jest/globals";
import '../jest.config.mjs';

const mockProduct = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

jest.unstable_mockModule("../models/product.js", () => ({
  default: mockProduct,
}));

const mod = await import("../controller/productController.js");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  increaseStock,
  decreaseStock,
  getLowStockProducts,
} = mod;

describe("Product Controller", () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("createProduct", () => {
    it("should create product successfully", async () => {
      const req = {
        body: { name: "Laptop", description: "Desc", stockQuantity: 5, lowStockThreshold: 2 },
      };
      const mockCreated = { ...req.body, _id: "123" };
      mockProduct.create.mockResolvedValueOnce(mockCreated);

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockCreated
      }));
    });

    it("should return 400 if required fields missing", async () => {
      const req = { body: { name: "", description: "Desc" } };
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getProducts", () => {
    it("should return products", async () => {
      const mockProducts = [{ name: "Laptop" }];
      mockProduct.find.mockResolvedValueOnce(mockProducts);

      await getProducts({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockProducts }));
    });

    it("should return 404 if no products", async () => {
      mockProduct.find.mockResolvedValueOnce([]);
      await getProducts({}, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      const req = { params: { id: "123" }, body: { name: "Updated" } };
      const updatedProduct = { _id: "123", name: "Updated" };
      mockProduct.findByIdAndUpdate.mockResolvedValueOnce(updatedProduct);

      await updateProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: updatedProduct }));
    });

    it("should return 404 if product not found", async () => {
      const req = { params: { id: "123" }, body: { name: "Updated" } };
      mockProduct.findByIdAndUpdate.mockResolvedValueOnce(null);

      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      const req = { params: { id: "123" } };
      mockProduct.findByIdAndDelete.mockResolvedValueOnce({ _id: "123" });

      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if product not found", async () => {
      const req = { params: { id: "123" } };
      mockProduct.findByIdAndDelete.mockResolvedValueOnce(null);

      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("increaseStock", () => {
    it("should increase stock successfully", async () => {
      const req = { params: { id: "123" }, body: { amount: 5 } };
      const product = { stockQuantity: 10, save: jest.fn().mockResolvedValueOnce(true) };
      mockProduct.findById.mockResolvedValueOnce(product);

      await increaseStock(req, res);

      expect(product.stockQuantity).toBe(15);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 400 if invalid amount", async () => {
      const req = { params: { id: "123" }, body: { amount: -5 } };
      await increaseStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("decreaseStock", () => {
    it("should decrease stock successfully", async () => {
      const req = { params: { id: "123" }, body: { amount: 5 } };
      const product = { stockQuantity: 10, save: jest.fn().mockResolvedValueOnce(true) };
      mockProduct.findById.mockResolvedValueOnce(product);

      await decreaseStock(req, res);

      expect(product.stockQuantity).toBe(5);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 400 if insufficient stock", async () => {
      const req = { params: { id: "123" }, body: { amount: 20 } };
      const product = { stockQuantity: 10, save: jest.fn() };
      mockProduct.findById.mockResolvedValueOnce(product);

      await decreaseStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getLowStockProducts", () => {
    it("should return low stock products", async () => {
      const mockProducts = [{ name: "Laptop", stockQuantity: 1, lowStockThreshold: 5 }];
      mockProduct.find.mockResolvedValueOnce(mockProducts);

      await getLowStockProducts({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if no low stock products", async () => {
      mockProduct.find.mockResolvedValueOnce([]);
      await getLowStockProducts({}, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
