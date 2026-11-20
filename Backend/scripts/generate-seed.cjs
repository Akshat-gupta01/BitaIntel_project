const fs = require("fs");
const path = require("path");

// Extract name from args (supports --name=xxx, --name xxx, or bare argument)
const args = process.argv.slice(2);
let name = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--name") {
    name = args[i + 1];
    break;
  } else if (args[i].startsWith("--name=")) {
    name = args[i].split("=")[1];
    break;
  } else if (!args[i].startsWith("--")) {
    name = args[i];
    break;
  }
}

if (!name) {
  console.error("Please provide a seeder name.");
  console.error("Example: npm run seed:generate my-seed-name");
  console.error("     or: npm run seed:generate -- --name my-seed-name");
  process.exit(1);
}

// Clean name
const cleanName = name
  .toLowerCase()
  .replace(/[^a-z0-9_-]/g, "-")
  .replace(/-+/g, "-");

// Timestamp format: YYYYMMDDHHmmss
const now = new Date();
const timestamp = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
  String(now.getHours()).padStart(2, "0"),
  String(now.getMinutes()).padStart(2, "0"),
  String(now.getSeconds()).padStart(2, "0")
].join("");

const filename = `${timestamp}-${cleanName}.cjs`;
const targetDir = path.resolve(__dirname, "..", "src", "seeders");

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const targetPath = path.join(targetDir, filename);

const template = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('table_name', [{
     *   name: 'Sample Entity',
     *   createdAt: new Date(),
     *   updatedAt: new Date()
     * }], {});
     */
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('table_name', null, {});
     */
  }
};
`;

fs.writeFileSync(targetPath, template, "utf8");
console.log(`\x1b[32m✔ Successfully created seeder:\x1b[0m src/seeders/${filename}`);

