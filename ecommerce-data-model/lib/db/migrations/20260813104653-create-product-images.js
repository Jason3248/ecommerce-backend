'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize)
  {
    await queryInterface.createTable('product_images', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      public_id: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      mime_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down(queryInterface, Sequelize)
  {
    await queryInterface.dropTable('product_images');
  }
};
