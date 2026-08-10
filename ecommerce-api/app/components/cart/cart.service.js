const { Cart, CartItem } = require("ecommerce-data-model");
const { NotFoundError, ForbiddenError } = require("../../lib/errors");

class CartService
{
    async getCart(userId)
    {
        const cart = Cart.findOne(
            {
                where: { userId },
                include: {
                    model: CartItem,
                    as: 'items'
                }
            });
        return cart;
    }

    async addItem(userId, { productId, quantity })
    {
        const cart = await Cart.findOne({ where: { userId } });
        const existingCartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
        if (existingCartItem)
        {
            return await this.updateItemQuantity(userId, productId, { quantity });

        }
        const newCartItem = await CartItem.create({
            cartId: cart.id,
            productId,
            quantity
        });
        return newCartItem;
    }


    async updateItemQuantity(userId, productId, { quantity })
    {
        const cart = await Cart.findOne({ where: { userId } });
        const cartItem = await CartItem.findOne({ where: { cartId: cart.id, productId } });
        if (!cartItem)
        {
            throw new NotFoundError('Cart item not available for updation');
        }
        await cartItem.update({
            ...(quantity !== undefined && { quantity })
        });
        return cartItem;
    }


    async removeItem(userId, productId)
    {
        const cart = await Cart.findOne({ where: { userId } });
        const cartItem = await CartItem.findOne({ where: { productId } });
        await cartItem.destroy();
    }
}

module.exports = CartService;