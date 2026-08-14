'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize)
  {
    const saltRounds = 10;

    const adminPassword = await bcrypt.hash(
      'sysadmin',
      saltRounds
    );

    const customerPassword = await bcrypt.hash(
      'Customer@123',
      saltRounds
    );

    const users = [
      {
        id: '99999999-9999-4999-8999-999999999999',
        first_name: 'System',
        last_name: 'Admin',
        email: 'sysadmin@gmail.com',
        password: adminPassword,
        role: 'ADMIN',
        is_email_verified: true,
        is_blocked: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: '88888888-8888-4888-8888-888888888888',
        first_name: 'John',
        last_name: 'Doe',
        email: 'customer1@example.com',
        password: customerPassword,
        role: 'CUSTOMER',
        is_email_verified: true,
        is_blocked: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      },
      {
        id: '77777777-7777-4777-8777-777777777777',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'customer2@example.com',
        password: customerPassword,
        role: 'CUSTOMER',
        is_email_verified: true,
        is_blocked: false,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null
      }
    ];

    await queryInterface.bulkInsert('users', users);
  },

  async down(queryInterface, Sequelize)
  {
    await queryInterface.bulkDelete('users', {
      id: [
        '99999999-9999-4999-8999-999999999999',
        '88888888-8888-4888-8888-888888888888',
        '77777777-7777-4777-8777-777777777777'
      ]
    });
  }
};