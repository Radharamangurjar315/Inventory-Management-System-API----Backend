import Product from "../models/product.js"; 

// Create a new product with with body = name, description, stockQuantity, lowStockThreshold
export const createProduct = async (req, res) => {
  try {
    const { name, description, stockQuantity, lowStockThreshold } = req.body;

    if (
      !name?.trim() ||
      !description?.trim() ||
      stockQuantity === undefined ||
      lowStockThreshold === undefined
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const stock = Number(stockQuantity);
    const threshold = Number(lowStockThreshold);

    if (Number.isNaN(stock) || Number.isNaN(threshold)) {
      return res.status(400).json({ error: "Stock quantity and threshold must be valid numbers" });
    }

    if (stock < 0 || threshold < 0) {
      return res.status(400).json({ error: "Stock quantity and threshold cannot be negative" });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      stockQuantity: stock,
      lowStockThreshold: threshold,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error creating product:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

// To get all products

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (err) {
    console.error("Error fetching products:", err);

    if (err.name === "CastError" || err.name === "ValidationError") {
      return res.status(400).json({ error: "Invalid request data" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};


// Get a specific product by its unique ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error fetching product by ID:", err);

    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};


// Update product details by its unique ID
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error updating product:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }

    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};


// Delete a product by its unique ID
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting product:", err);

    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

// Increase stock quantity of a product by its unique ID with body = amount
// amount should be a positive integer
// amount is the value to increase the stockQuantity by
export const increaseStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    if (amount === undefined || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.stockQuantity += Number(amount);
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Stock increased successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error increasing stock:", err);

    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

// Decrease stock quantity of a product by its unique ID with body = amount
// amount should be a positive integer
// amount is the value to decrease the stockQuantity by
export const decreaseStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    if (amount === undefined || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stockQuantity < Number(amount)) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    product.stockQuantity -= Number(amount);
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Stock decreased successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error decreasing stock:", err);

    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};


// Get all products that are low in stock (stockQuantity < lowStockThreshold)
export const getLowStockProducts = async (req, res) => {
  try {
    // using $expr to compare two fields within the same document 
    // $lt means "less than"
    const products = await Product.find({
      $expr: { $lt: ["$stockQuantity", "$lowStockThreshold"] },    // MongoDB expression to compare two fields
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No low stock products found" });
    }

    return res.status(200).json({
      success: true,
      message: "Low stock products fetched successfully",
      data: products,
    });
  } catch (err) {
    console.error("Error fetching low stock products:", err);

    return res.status(500).json({ error: "Internal server error" });
  }
};

