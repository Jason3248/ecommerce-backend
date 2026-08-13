const { Sequelize } = require("sequelize");
const configs = require("../../config/database.js");

const sequelize = new Sequelize(
    configs[process.env.NODE_ENV || "development"] || configs.development
);

const User = require("./user.model.js").initModel(sequelize);
const Category = require("./category.model.js").initModel(sequelize);
const Product = require("./product.model.js").initModel(sequelize);
const Cart = require("./cart.model.js").initModel(sequelize);
const CartItem = require("./cart-item.model.js").initModel(sequelize);
const Order = require("./order.model.js").initModel(sequelize);
const OrderItem = require("./order-item.model.js").initModel(sequelize);
const Payment = require("./payment.model.js").initModel(sequelize);
const SystemConfig = require("./system-config.model.js").initModel(sequelize);
const PasswordResetToken = require("./password-reset-token.model.js").initModel(sequelize);
const EmailVerificationToken = require("./email-verification-token.model.js").initModel(sequelize);

const models = {
    User,
    Category,
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment,
    SystemConfig,
    PasswordResetToken,
    EmailVerificationToken
};

Object.values(models).forEach(model => model.associate(models));
module.exports = {
    sequelize,
    Sequelize,
    ...models
}