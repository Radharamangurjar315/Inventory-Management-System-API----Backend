import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Product from "../models/product.js";
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
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Product Controller", () => {

  describe("createProduct", () => {
    it("should create product successfully", async () => {
      const req = {
        body: { name: "A", description: "B", stockQuantity: 10, lowStockThreshold: 2 }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("should return 400 if required fields missing", async () => {
      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if stock or threshold invalid", async () => {
      const req = { body: { name: "A", description: "B", stockQuantity: -5, lowStockThreshold: "abc" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await createProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getProducts", () => {
    it("should return products", async () => {
      await Product.create({ name: "A", description: "B", stockQuantity: 5, lowStockThreshold: 2 });
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await getProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if no products", async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await getProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getProductById", () => {
    it("should return 404 if product not found", async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await getProductById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if invalid ID", async () => {
      const req = { params: { id: "123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await getProductById(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updateProduct", () => {
    it("should return 400 if no update data provided", async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if product not found", async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() }, body: { name: "X" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await updateProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteProduct", () => {
    it("should return 404 if product not found", async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if invalid ID", async () => {
      const req = { params: { id: "abc" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await deleteProduct(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("increaseStock", () => {
    it("should return 400 for invalid amount", async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() }, body: { amount: -5 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await increaseStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("decreaseStock", () => {
    it("should return 400 for insufficient stock", async () => {
      const prod = await Product.create({ name: "A", description: "B", stockQuantity: 2, lowStockThreshold: 1 });
      const req = { params: { id: prod._id }, body: { amount: 5 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await decreaseStock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getLowStockProducts", () => {
    it("should return 404 if no low stock products", async () => {
      await Product.create({ name: "A", description: "B", stockQuantity: 10, lowStockThreshold: 2 });
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await getLowStockProducts(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

});
