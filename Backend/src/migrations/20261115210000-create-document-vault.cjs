'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // ─── UP: document_vault table (Matches 02_DATABASE_SCHEMA_SPEC.md Section 2.6) ───
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('document_vault', {
      // id: Primary Key — auto increment, unsigned integer
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // businessId: Linked Business Entity (Foreign Key -> business_entities.id)
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

      // categoryKey: Category identifier (e.g. "incorporation_cert", "address_proof", "tax_registration", "board_resolution")
      categoryKey: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      // categoryName: Human-readable category label (e.g. "Certificate of Incorporation / Registration Proof")
      categoryName: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },

      // moduleCode: Module A through F (Default: "Module A" for Step 2 Foundational Docs)
      moduleCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'Module A',
      },

      // fileName: Original sanitized file name
      fileName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      // fileUrl: Storage path / URL (e.g. "/uploads/documents/doc-179475...pdf")
      fileUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },

      // fileSizeBytes: File size in bytes (max 15MB)
      fileSizeBytes: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      // mimeType: Validated MIME type ("application/pdf", "image/jpeg", "image/png")
      mimeType: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      // sha256Checksum: SHA-256 cryptographic hash for tamper evidence (Docs Section 2.6)
      sha256Checksum: {
        type: Sequelize.CHAR(64),
        allowNull: true,
      },

      // version: Document revision version (e.g. "v1.0", "v2.0")
      version: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'v1.0',
      },

      // status: PENDING, VERIFIED, REJECTED, EXPIRED, ACTION_REQUIRED (Docs Section 2.6)
      status: {
        type: Sequelize.ENUM('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED', 'ACTION_REQUIRED'),
        allowNull: false,
        defaultValue: 'PENDING',
      },

      // issueDate: Document issue date (Docs Line 45 metadata)
      issueDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      // expiryDate: Document validity expiration date (Docs Section 2.6 & Line 45)
      expiryDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },

      // rejectionReason: Reason provided by verification team if rejected
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // verifierName: Full name and title of verifying auditor (Docs Section 2.6)
      verifierName: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },

      // verifiedBy: User ID of verifier (Foreign Key -> users.id)
      verifiedBy: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },

      // verifiedAt: Timestamp when verified
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // createdAt: Record upload timestamp
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

    // Lookup index for fast queries by businessId
    await queryInterface.addIndex('document_vault', ['businessId'], {
      name: 'idx_document_vault_business_id',
    });

    // Composite index for fast category lookup per vendor
    await queryInterface.addIndex('document_vault', ['businessId', 'categoryKey'], {
      name: 'idx_document_vault_biz_cat',
    });
  },

  // ─── DOWN: Rollback ke time table drop karo ──────────────────────────────
  async down(queryInterface) {
    await queryInterface.dropTable('document_vault');
  },
};
