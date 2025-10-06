# Inventory Management System API — Backend

A Node.js backend API for managing inventory, including product creation, stock updates, and low-stock alerts. This project uses MongoDB (with Mongoose ORM) and is designed for quick integration into inventory or warehouse management applications.

## Features

- Add, update, fetch, and delete products
- Track product stock levels
- Low-stock threshold alerts
- RESTful API design
- Comprehensive test suite using Jest and an in-memory MongoDB server for isolated testing

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or newer)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)

### Installation

```bash
git clone https://github.com/Radharamangurjar315/Inventory-Management-System-API----Backend.git
cd Inventory-Management-System-API----Backend
npm install
```

### Running the Server

```bash
node index.js
```

The API will be available at (https://inventory-management-system-api-backend.onrender.com) .

## API Endpoints

> **Note:** Replace `:id` with the product ID.

- `POST /products` — Create a new product
- `GET /products` — Get all products
- `GET /products/:id` — Get product by ID
- `PUT /products/:id` — Update product details
- `DELETE /products/:id` — Delete a product
- `POST /products/:id/increase` — Increase product stock
- `POST /products/:id/decrease` — Decrease product stock
- `GET /products/low-stock` — Get products below their low stock threshold

## Example Product Object

```json
{
  "name": "Sample Product",
  "description": "A sample item",
  "stockQuantity": 20,
  "lowStockThreshold": 5
}
```

## Testing

Tests are located in the `tests/` directory and cover:

- Product creation validations
- Product fetching (all, by ID, error cases)
- Stock increase/decrease logic by passing "amount" Number type JSON body.

To run tests:

```bash
npm run test:coverage
```

## Technologies Used

- Node.js & Express
- MongoDB & Mongoose
- Jest (testing)
- mongodb-memory-server (testing)

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.


**Author:** [@Radharamangurjar315](https://github.com/Radharamangurjar315)
