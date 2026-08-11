const { Product, Category } = require("ecommerce-data-model");
const { NotFoundError, ConflictError } = require("../../lib/errors");
const { Op } = require("sequelize");


const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 30

const SORTABLE_FIELDS = {
    name_asc: ['name', 'ASC'],
    name_desc: ['name', 'DESC'],
    price_asc: ['price', 'ASC'],
    price_desc: ['price', 'DESC'],
    createdAt_asc: ['createdAt', 'ASC'],
    createdAt_desc: ['createdAt', 'DESC']
};

const DEFAULT_SORT = ['name', 'ASC']

class ProductService
{
    #pagination(query)
    {
        let page = parseInt(query.page);
        let pageSize = parseInt(query.pageSize);
        if (!Number.isInteger(page) || page < 1) page = 1;
        if (!Number.isInteger(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE
        if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;
        return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
    }
    #buildWhere(query)
    {
        const where = {};
        if (query.name)
        {
            where.name = { [Op.ilike]: `%${query.name}%` }
        }
        if (query.sku)
        {
            where.sku = { [Op.ilike]: `%${query.sku}%` }
        }
        if (query.categoryId)
        {
            where.categoryId = query.categoryId;
        }
        if (query.minPrice || query.maxPrice)
        {
            where.price = {};
            if (query.minPrice) where.price[Op.gte] = Number(query.minPrice)
            if (query.maxPrice) where.price[Op.lte] = Number(query.maxPrice)
        }
        if (query.inStock === "true")
        {
            where.stockQuantity = { [Op.gt]: 0 };
        }
        return where;
    }


    async listProducts(query)
    {
        const { page, pageSize, offset, limit } = this.#pagination(query);
        const order = [SORTABLE_FIELDS[query.sortBy] || DEFAULT_SORT];
        const where = this.#buildWhere(query);
        const { rows, count } = await Product.findAndCountAll({
            where,
            limit,
            offset,
            order
        });
        return {
            rows,
            count,
            pagination: {
                page,
                pageSize,
                totalPages: Math.ceil(count / limit)
            }
        }
    }

    async getById(productId)
    {
        const product = await Product.findByPk(productId);
        if (!product)
        {
            throw new NotFoundError('Product not found');
        }
        return product;
    }

    async createProduct({ sku, name, description, price, stockQuantity, categoryId })
    {
        const category = await Category.findByPk(categoryId);
        if (!category)
        {
            throw new NotFoundError('Category not found');
        }

        const existingSku = await Product.findOne({ where: { sku } });
        if (existingSku)
        {
            throw new ConflictError('A product with this SKU already exists');
        }
        const createdProduct = await Product.create({
            sku, name, description, price, stockQuantity, categoryId
        });
        return createdProduct;
    }

    async updateProduct(productId, { name, description, price, categoryId } = {})
    {
        if (name === undefined &&
            description === undefined &&
            categoryId === undefined &&
            price === undefined
        )
        {
            throw new ValidationError('At least one updatable field must be provided');
        }
        const product = await Product.findByPk(productId);
        if (!product)
        {
            throw new NotFoundError('Product not found');
        }
        await product.update({
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(price !== undefined && { price }),
            ...(categoryId !== undefined && { categoryId }),
        });
        return product;
    }


    async updateInventory(productId, { stockQuantity } = {})
    {
        const product = await Product.findByPk(productId);
        if (!product)
        {
            throw new NotFoundError('Product not found');
        }
        await product.update({
            ...(stockQuantity !== undefined && { stockQuantity })
        });
        return product;
    }

    async deleteProduct(productId)
    {
        const product = await Product.findByPk(productId);
        if (!product)
        {
            throw new NotFoundError('Product not found');
        }
        await product.destroy();

    }
    // \\restore unique doubt
    async restoreProduct(productId)
    {
        const product = await Product.findByPk(productId, { paranoid: false });
        if (!product)
        {
            throw new NotFoundError('Product not found');
        }
        if (!product.deletedAt)
        {
            throw new ConflictError('Product is not deleted');
        }
        const skuConflict = await Product.findOne({ where: { sku: product.sku } })
        if (skuConflict)
        {
            throw new ConflictError(`Cannot restore. another product already uses sku`);
        }
        await product.restore();
        return product;
    }
}


module.exports = ProductService;