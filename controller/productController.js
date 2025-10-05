import Product from "../models/product.js"; 

export const createProduct = async (req, res) => {
  try {

    const { name, description, stockQuantity, lowStockThreshold } = req.body;
    if (!name || !description || stockQuantity == null || lowStockThreshold == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await Product.create(req.body);
    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Server error. Could not create product." });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal Server error. Could not fetch products." });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(400).json({ message: "Invalid product ID" });
  }
};

export const increaseStock = async (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.stockQuantity += amount;
    await product.save();
    res.json(product);
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
};

export const decreaseStock = async (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ message: "Invalid amount" });
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stockQuantity < amount) {
      return res.status(400).json({ message: "Insufficient stock" });
    }
    product.stockQuantity -= amount;
    await product.save();
    res.json(product);
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lt: ["$stockQuantity", "$lowStockThreshold"] },
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No low stock products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};
