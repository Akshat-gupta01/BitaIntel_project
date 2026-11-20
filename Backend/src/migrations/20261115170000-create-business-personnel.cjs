'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: business_personnel table banao ───────────────────────────────────
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_personnel', {
      // id: Primary Key — auto increment, unsigned integer
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // businessId: Kis company ka executive/head hai (Foreign Key -> business_entities.id)
      businessId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'business_entities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      // name: Full Name — e.g. "Dr. Ananya Roy"
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },

      // designation: Role/Designation — e.g. "Marketing Head", "Purchase Head", "Account Head"
      designation: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      // department: Department — e.g. "Marketing", "Procurement", "Accounts", "Executive Management"
      department: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      // email: Official Corporate Email — e.g. "ananya@meridiansteel.com"
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      // mobile: Direct Mobile / Phone Number — e.g. "+91 98201 44825"
      mobile: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },

      // photoUrl: Profile photo URL/path (optional)
      photoUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      // isAuthorizedSignatory: Kya ye authorized signatory hai (true / false)
      isAuthorizedSignatory: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      // createdAt: Record creation timestamp
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      // updatedAt: Record last update timestamp
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Foreign key and lookup index for fast queries by businessId
    await queryInterface.addIndex('business_personnel', ['businessId'], {
      name: 'idx_business_personnel_business_id',
    });
  },

  // ─── DOWN: Rollback ke time table drop karo ──────────────────────────────
  async down(queryInterface) {
    await queryInterface.dropTable('business_personnel');
  },
};
