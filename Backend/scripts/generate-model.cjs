const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const args = process.argv.slice(2);

function getArg(flag) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag) {
      return args[i + 1] || null;
    }
    if (args[i].startsWith(`${flag}=`)) {
      return args[i].slice(flag.length + 1);
    }
  }
  return null;
}

const name = getArg("--name");
const attributes = getArg("--attributes");

if (!name || !attributes) {
  console.error("Please provide --name and --attributes");
  console.error('Example: npm run model:generate -- --name User --attributes "name:string,email:string"');
  process.exit(1);
}

if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  console.error("Model name must be PascalCase, e.g. User");
  process.exit(1);
}

const typeMap = {
  string: ["string", "STRING"],
  text: ["string", "TEXT"],
  integer: ["number", "INTEGER"],
  bigint: ["number", "BIGINT"],
  float: ["number", "FLOAT"],
  double: ["number", "DOUBLE"],
  decimal: ["number", "DECIMAL"],
  boolean: ["boolean", "BOOLEAN"],
  date: ["Date", "DATE"],
  uuid: ["string", "UUID"],
  json: ["object", "JSON"]
};

const fields = attributes.split(",").map((item) => {
  const trimmed = item.trim();
  const [field, rawType] = trimmed.split(":");
  const type = rawType?.toLowerCase();

  if (
    !field ||
    !/^[A-Za-z_][A-Za-z0-9_]*$/.test(field) ||
    !typeMap[type] ||
    ["id", "createdAt", "updatedAt"].includes(field)
  ) {
    console.error(`Invalid attribute: "${item}". Format should be field:type (e.g. name:string).`);
    process.exit(1);
  }

  return {
    name: field,
    type: type,
    tsType: typeMap[type][0],
    sequelizeType: typeMap[type][1]
  };
});

// Resolve relative to project root (where scripts folder resides)
const projectRoot = path.resolve(__dirname, "..");
const modelsDir = path.join(projectRoot, "src", "models");
const migrationsDir = path.join(projectRoot, "src", "migrations");

fs.mkdirSync(modelsDir, { recursive: true });
fs.mkdirSync(migrationsDir, { recursive: true });

const tsFile = path.join(modelsDir, `${name}.model.ts`);

if (fs.existsSync(tsFile)) {
  console.error(`${tsFile} already exists.`);
  process.exit(1);
}

const previousModels = new Set(
  fs.readdirSync(modelsDir).filter((file) => file.endsWith(".js"))
);
const previousMigrations = new Set(
  fs.readdirSync(migrationsDir).filter((file) => file.endsWith(".js"))
);

// Run original Sequelize CLI generator
const command = process.platform === "win32" ? "npx.cmd" : "npx";

const result = spawnSync(
  command,
  [
    "sequelize-cli",
    "model:generate",
    "--name",
    name,
    "--attributes",
    attributes,
    "--models-path",
    modelsDir,
    "--migrations-path",
    migrationsDir
  ],
  {
    cwd: projectRoot,
    stdio: "inherit",
    shell: process.platform === "win32"
  }
);

if (result.status !== 0) {
  console.error("Sequelize model generation failed.");
  process.exit(result.status || 1);
}

// Find the newly generated JS model
const newModels = fs.readdirSync(modelsDir).filter(
  (file) => file.endsWith(".js") && !previousModels.has(file)
);

const expectedName = `${name.toLowerCase()}.js`;
const generatedFile =
  newModels.find((f) => f.toLowerCase() === expectedName) ||
  (newModels.length === 1 ? newModels[0] : null);

if (!generatedFile) {
  console.error("Could not identify the generated JS model.");
  process.exit(1);
}

// Remove the generated JS model
fs.unlinkSync(path.join(modelsDir, generatedFile));

// Rename newly generated migration .js to .cjs (for ES Module compatibility)
const newMigrations = fs.readdirSync(migrationsDir).filter(
  (file) => file.endsWith(".js") && !previousMigrations.has(file)
);
for (const mig of newMigrations) {
  const oldPath = path.join(migrationsDir, mig);
  const newPath = path.join(migrationsDir, mig.replace(/\.js$/, ".cjs"));
  fs.renameSync(oldPath, newPath);
}

// Generate TypeScript model
const declarations = fields
  .map((field) => `  declare ${field.name}: ${field.tsType};`)
  .join("\n");

const definitions = fields
  .map(
    (field) =>
      `    ${field.name}: {\n      type: DataTypes.${field.sequelizeType},\n      allowNull: false\n    },`
  )
  .join("\n");

const modelContent = `import {
  Model,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional
} from "sequelize";
import { sequelize } from "../config/database.js";

export class ${name} extends Model<
  InferAttributes<${name}, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<${name}, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;

${declarations}

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

${name}.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
${definitions}
  },
  {
    sequelize,
    modelName: "${name}",
    timestamps: true
  }
);

export default ${name};
`;

fs.writeFileSync(tsFile, modelContent);

console.log("\nTypeScript model created successfully!");
console.log(tsFile);
