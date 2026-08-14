'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize)
  {
    const products = [
      {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        sku: 'ELEC-001',
        name: 'Wireless Headphones',
        description: 'Bluetooth wireless headphones with noise cancellation.',
        price: 4999.00,
        stock_quantity: 50,
        image_url: null,
        category_id: '11111111-1111-4111-8111-111111111111',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        sku: 'ELEC-002',
        name: 'Mechanical Keyboard',
        description: 'Mechanical keyboard with RGB backlighting.',
        price: 3499.00,
        stock_quantity: 30,
        image_url: null,
        category_id: '11111111-1111-4111-8111-111111111111',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        sku: 'CLTH-001',
        name: 'Classic Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt.',
        price: 799.00,
        stock_quantity: 100,
        image_url: null,
        category_id: '22222222-2222-4222-8222-222222222222',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        sku: 'BOOK-001',
        name: 'Clean Code',
        description: 'A handbook of agile software craftsmanship.',
        price: 999.00,
        stock_quantity: 25,
        image_url: null,
        category_id: '33333333-3333-4333-8333-333333333333',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        sku: 'HOME-001',
        name: 'Stainless Steel Water Bottle',
        description: 'Reusable stainless steel water bottle.',
        price: 599.00,
        stock_quantity: 75,
        image_url: null,
        category_id: '44444444-4444-4444-8444-444444444444',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
        sku: 'SPRT-001',
        name: 'Yoga Mat',
        description: 'Non-slip exercise and yoga mat.',
        price: 899.00,
        stock_quantity: 40,
        image_url: null,
        category_id: '55555555-5555-4555-8555-555555555555',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ];

    await queryInterface.bulkInsert('products', products);
  },

  async down(queryInterface, Sequelize)
  {
    await queryInterface.bulkDelete('products', {
      id: [
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
        'ffffffff-ffff-4fff-8fff-ffffffffffff'
      ]
    });
  }
};