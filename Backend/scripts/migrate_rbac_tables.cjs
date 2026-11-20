const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bitaintel_db',
    port: Number(process.env.DB_PORT) || 3306,
  });

  console.log('Connected to MySQL database:', process.env.DB_NAME || 'bitaintel_db');

  // 1. Roles table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`roles\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`code\` VARCHAR(50) NOT NULL,
      \`name\` VARCHAR(100) NOT NULL,
      \`label\` VARCHAR(100) NOT NULL DEFAULT '',
      \`description\` VARCHAR(255) NULL,
      \`isSystem\` TINYINT(1) NOT NULL DEFAULT 0,
      \`isActive\` TINYINT(1) NOT NULL DEFAULT 1,
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE INDEX \`uq_roles_code\` (\`code\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✔ Checked/Created `roles` table');

  // 2. Permissions table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`permissions\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`code\` VARCHAR(100) NOT NULL,
      \`module\` VARCHAR(50) NOT NULL,
      \`action\` VARCHAR(50) NOT NULL,
      \`name\` VARCHAR(150) NOT NULL,
      \`description\` VARCHAR(255) NULL,
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE INDEX \`uq_permissions_code\` (\`code\`),
      INDEX \`idx_permissions_module\` (\`module\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✔ Checked/Created `permissions` table');

  // 3. Role Permissions join table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`role_permissions\` (
      \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`roleId\` INT UNSIGNED NOT NULL,
      \`permissionId\` INT UNSIGNED NOT NULL,
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE INDEX \`uq_role_permission\` (\`roleId\`, \`permissionId\`),
      CONSTRAINT \`fk_rp_role\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_rp_permission\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permissions\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✔ Checked/Created `role_permissions` table');

  await connection.end();
  console.log('Migration completed successfully.');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
