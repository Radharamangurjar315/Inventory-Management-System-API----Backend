
import { jest } from "@jest/globals";
import mongoose from "mongoose";
import Product from "../models/product.js";
import { MongoMemoryServer } from "mongodb-memory-server";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  increaseStock,
  decreaseStock,
  getLowStockProducts
} from "../controller/productController.js";


const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});
});

describe("Product Controller", () => {

  describe("createProduct", () => {
    it("should create product successfully", async () => {
      const req = { body: { name: "Test", description: "Desc", stockQuantity: 10, lowStockThreshold: 5 } };
      const res = mockResponse();
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({ name: "Test", stockQuantity: 10 })
      }));
    });

    it("should return 400 if required fields missing", async () => {
      const req = { body: { name: "", description: "", stockQuantity: null } };
      const res = mockResponse();
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if stock or threshold invalid", async () => {
      const req = { body: { name: "A", description: "B", stockQuantity: -5, lowStockThreshold: "abc" } };
      const res = mockResponse();
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getProducts", () => {
    it("should return products", async () => {
      await Product.create({ name: "P1", description: "D1", stockQuantity: 10, lowStockThreshold: 5 });
      const req = {};
      const res = mockResponse();
      await getProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.any(Array) }));
    });

    it("should return 404 if no products", async () => {
      const req = {};
      const res = mockResponse();
      await getProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getProductById", () => {
    it("should return product by ID", async () => {
      const product = await Product.create({ name: "P2", description: "D2", stockQuantity: 8, lowStockThreshold: 3 });
      const req = { params: { id: product._id } };
      const res = mockResponse();
      await getProductById(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ name: "P2" }) }));
    });

    it("should return 404 if product not found", async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };
      const res = mockResponse();
      await getProductById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if invalid ID format", async () => {
      const req = { params: { id: "invalid-id" } };
      const res = mockResponse();
      await getProductById(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      const product = await Product.create({ name: "Old", description: "Desc", stockQuantity: 5, lowStockThreshold: 2 });
      const req = { params: { id: product._id }, body: { name: "New", stockQuantity: 7 } };
      const res = mockResponse();
      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ name: "New", stockQuantity: 7 }) }));
    });

    it("should return 404 if product not found", async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() }, body: { name: "New" } };
      const res = mockResponse();
      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if no update data provided", async () => {
      const product = await Product.create({ name: "X", description: "Y", stockQuantity: 5, lowStockThreshold: 2 });
      const req = { params: { id: product._id }, body: {} };
      const res = mockResponse();
      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      const product = await Product.create({ name: "ToDelete", description: "Desc", stockQuantity: 1, lowStockThreshold: 0 });
      const req = { params: { id: product._id } };
      const res = mockResponse();
      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if product not found", async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };
      const res = mockResponse();
      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("increaseStock", () => {
    it("should increase stock successfully", async () => {
      const product = await Product.create({ name: "Stock", description: "Desc", stockQuantity: 5, lowStockThreshold: 2 });
      const req = { params: { id: product._id }, body: { amount: 3 } };
      const res = mockResponse();
      await increaseStock(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.stockQuantity).toBe(8);
    });

    it("should return 400 if amount invalid", async () => {
      const product = await Product.create({ name: "Stock", description: "Desc", stockQuantity: 5, lowStockThreshold: 2 });
      const req = { params: { id: product._id }, body: { amount: -2 } };
      const res = mockResponse();
      await increaseStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("decreaseStock", () => {
    it("should decrease stock successfully", async () => {
      const product = await Product.create({ name: "Stock", description: "Desc", stockQuantity: 5, lowStockThreshold: 2 });
      const req = { params: { id: product._id }, body: { amount: 3 } };
      const res = mockResponse();
      await decreaseStock(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.stockQuantity).toBe(2);
    });

    it("should return 400 if insufficient stock", async () => {
      const product = await Product.create({ name: "Stock", description: "Desc", stockQuantity: 2, lowStockThreshold: 2 });
      const req = { params: { id: product._id }, body: { amount: 5 } };
      const res = mockResponse();
      await decreaseStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getLowStockProducts", () => {
    it("should return low stock products", async () => {
      await Product.create({ name: "Low", description: "Desc", stockQuantity: 1, lowStockThreshold: 5 });
      const req = {};
      const res = mockResponse();
      await getLowStockProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.length).toBeGreaterThan(0);
    });

    it("should return 404 if no low stock products", async () => {
      await Product.create({ name: "High", description: "Desc", stockQuantity: 10, lowStockThreshold: 5 });
      const req = {};
      const res = mockResponse();
      await getLowStockProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

});
