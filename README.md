# ALIZHMARKET - Farmers Market Platform

## Overview
ALIZHMARKET is a web platform that connects farmers with buyers. Farmers can list their fresh products (vegetables, fruits, meat, dairy), manage their inventory, and fulfill orders. Buyers can browse products, add them to a cart, and place orders.

### Features
* **Role-based Access Control:** Separate interfaces for Farmers and Buyers.
* **Authentication:** Secure JWT-based registration and login.
* **Product Management:** Farmers can create, update, and delete products.
* **Order System:** Buyers can place orders; Farmers can mark them as completed.
* **Responsive UI:** Built with EJS and custom CSS.

## Setup and Installation

1.  **Clone the repository**
    ```bash
    git clone <your-repo-link>
    cd login-system
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the root directory and add:
    ```env
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3000`.

## API Documentation

### Authentication (Public)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (Buyer/Farmer) |
| `POST` | `/api/auth/login` | Login user and get token |

### User Profile (Private)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Get logged-in user profile |
| `PUT` | `/api/users/profile` | Update user profile name/email |

### Products (Resource)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Get all products | Public |
| `GET` | `/api/products/:id` | Get specific product | Public |
| `POST` | `/api/products` | Create a new product | Farmer |
| `PUT` | `/api/products/:id` | Update a product | Farmer |
| `DELETE` | `/api/products/:id` | Delete a product | Farmer |

### Orders
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Create a new order | Buyer |
| `PUT` | `/api/orders/:id/cancel` | Cancel an order | Buyer (Owner) |
| `PUT` | `/api/orders/:id/complete`| Mark order as completed | Farmer |