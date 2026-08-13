const { Cart, CartItem, SystemConfig, Product } = require("ecommerce-data-model");
const { NotFoundError, ForbiddenError, OutOfStockError, BusinessRuleError } = require("../../lib/errors");
const logger = require("../../configs/logger.js");

class CartService
{
    async #getMaxQuantityPerProduct()
    {
        const config = await SystemConfig.findOne({
            where: { key: 'MAX_CART_QUANTITY_PER_PRODUCT' }
        });
        if (!config) return null;
        const parsed = parseInt(config.value);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    }

    #calculateSubtotal(items)
    {
        const subtotal = items.reduce((sum, item) =>
        {
            return sum + parseFloat(item.product.price) * item.quantity;
        }, 0);
        return Number(subtotal.toFixed(2));
    }

    async #serializeCart(cart)
    {
        const items = await CartItem.findAll({
            where: {
                cartId: cart.id
            },
            include: [
                {
                    model: Product,
                    as: 'product'
                }
            ],
            order: [['createdAt', 'ASC']]
        });
        return {
            id: cart.id,
            userId: cart.userId,
            items,
            total: this.#calculateSubtotal(items)
        }
    }
    async getCart(userId)
    {
        const cart = await Cart.findOne(
            {
                where: { userId },
                include: {
                    model: CartItem,
                    as: 'items'
                }
            });
        if (!cart)
        {
            throw new NotFoundError("Cart not found");
        }
        return this.#serializeCart(cart);
    }

    async addItem(userId, { productId, quantity })
    {
        const product = await Product.findOne({ where: { id: productId } });
        if (!product)
        {
            throw new NotFoundError('Product not found');
        }
        const cart = await Cart.findOne({ where: { userId } });
        const existingCartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
        const newQuantity = existingCartItem ? existingCartItem.quantity + quantity : quantity;
        if (newQuantity > product.stockQuantity)
        {
            throw new OutOfStockError(
                `Only ${product.stockQuantity} unit of "${product.name}" are available`
            );
        }
        const maxItemLimit = await this.#getMaxQuantityPerProduct() || 30;
        if (newQuantity > maxItemLimit)
        {
            throw new BusinessRuleError(
                `Cannot have more than ${maxItemLimit} of a product in your cart`
            );
        }
        if (existingCartItem)
        {
            await existingCartItem.update({ quantity: newQuantity });
        } else
        {
            await CartItem.create({ cartId: cart.id, productId, quantity: newQuantity });
        }

        return this.#serializeCart(cart);
    }


    async updateItemQuantity(userId, itemId, { quantity })
    {
        const cart = await Cart.findOne({ where: { userId } });
        const cartItem = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });
        if (!cartItem)
        {
            throw new NotFoundError('Cart item not found');
        }
        if (quantity === 0)
        {
            await cartItem.destroy();
            return this.#serializeCart(cart);
        }
        const product = await Product.findByPk(cartItem.productId);
        if (quantity > product.stockQuantity)
        {
            throw new OutOfStockError(
                `Only ${product.stockQuantity} unit of "${product.name}" available`
            );
        }
        const maxItemLimit = await this.#getMaxQuantityPerProduct() || 30;
        if (quantity > maxItemLimit)
        {
            throw new BusinessRuleError(
                `Cannot have more than ${maxItemLimit} of this product in your cart`
            );
        }
        await cartItem.update({ quantity });
        return this.#serializeCart(cart);
    }


    async removeItem(userId, itemId)
    {
        const cart = await Cart.findOne({ where: { userId } });
        const cartItem = await CartItem.findOne({ where: { id: itemId, cartId: cart.id } });
        if (!cartItem)
        {
            throw new NotFoundError('Cart Item not found');
        }
        await cartItem.destroy();
        return this.#serializeCart(cart);
    }
}

module.exports = CartService;