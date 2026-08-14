'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize)
  {
    const categories = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Electronics',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        name: 'Clothing',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: '33333333-3333-4333-8333-333333333333',
        name: 'Books',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: '44444444-4444-4444-8444-444444444444',
        name: 'Home & Kitchen',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: '55555555-5555-4555-8555-555555555555',
        name: 'Sports',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ];

    await queryInterface.bulkInsert('categories', categories);
  },

  async down(queryInterface, Sequelize)
  {
    await queryInterface.bulkDelete('categories', {
      id: [
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        '33333333-3333-4333-8333-333333333333',
        '44444444-4444-4444-8444-444444444444',
        '55555555-5555-4555-8555-555555555555'
      ]
    });
  }
};
