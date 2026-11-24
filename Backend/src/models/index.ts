import { sequelize } from "../config/database.js";
import User from "./User.model.js";
import UserOTP from "./UserOTP.model.js";
import BusinessEntity from "./BusinessEntity.model.js";
import StatutoryIdentifier from "./StatutoryIdentifier.model.js";
import Role from "./Role.model.js";
import Permission from "./Permission.model.js";
import RolePermission from "./RolePermission.model.js";
import BusinessType from "./BusinessType.model.js";
import Category from "./Category.model.js";
import Subcategory from "./Subcategory.model.js";
import Industry from "./Industry.model.js";
import BusinessActivity from "./BusinessActivity.model.js";
import BusinessFacility from "./BusinessFacility.model.js";
import BusinessPersonnel from "./BusinessPersonnel.model.js";
import DocumentVault from "./DocumentVault.model.js";
import { BusinessProduct } from "./BusinessProduct.model.js";
import { Certification } from "./Certification.model.js";
import Currency from "./Currency.model.js";
import BusinessDepartmentContact from "./BusinessDepartmentContact.model.js";
import BusinessCommercialTerms from "./BusinessCommercialTerms.model.js";
import BusinessTradeLogistics from "./BusinessTradeLogistics.model.js";
import BusinessBankingDetails from "./BusinessBankingDetails.model.js";
import BusinessComplianceDeclarations from "./BusinessComplianceDeclarations.model.js";
import VendorBusinessType from "./VendorBusinessType.model.js";
import VendorCategory from "./VendorCategory.model.js";
import VendorSubcategory from "./VendorSubcategory.model.js";
import VendorBusinessActivity from "./VendorBusinessActivity.model.js";
import BusinessManufacturingCapability from "./BusinessManufacturingCapability.model.js";
import BusinessServiceCapability from "./BusinessServiceCapability.model.js";
import BusinessOperatingProfile from "./BusinessOperatingProfile.model.js";
import BusinessEnquiry from "./BusinessEnquiry.model.js";

// ─── Model Associations ──────────────────────────────────────────────────────

// User ke paas ek Business hota hai (1-to-1)
User.hasOne(BusinessEntity, {
  foreignKey: "ownerUserId",
  as: "business"
});

// Business ka ek Owner (User) hota hai (1-to-1)
BusinessEntity.belongsTo(User, {
  foreignKey: "ownerUserId",
  as: "owner"
});

// Business ke paas uske government IDs (GSTIN, PAN, CIN) hote hain
BusinessEntity.hasOne(StatutoryIdentifier, {
  foreignKey: "businessId",
  as: "statutory"
});

// Statutory IDs kisi ek Business ko belong karte hain
StatutoryIdentifier.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business"
});

// Ek Category ke andar multiple Subcategories hoti hain (1-to-Many)
Category.hasMany(Subcategory, {
  foreignKey: "categoryCode",
  sourceKey: "code",
  as: "subcategories",
});

// Har Subcategory kisi ek Category ko belong karti hai (Many-to-1)
Subcategory.belongsTo(Category, {
  foreignKey: "categoryCode",
  targetKey: "code",
  as: "category",
});

// Business ke paas multiple plants / branch offices ho sakte hain (1-to-Many)
BusinessEntity.hasMany(BusinessFacility, {
  foreignKey: "businessId",
  as: "facilities",
});

// Har facility kisi ek Business ko belong karti hai
BusinessFacility.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// Business ke paas multiple key executives / department heads hote hain (1-to-Many)
BusinessEntity.hasMany(BusinessPersonnel, {
  foreignKey: "businessId",
  as: "keyPersonnel",
});

// Har executive kisi ek Business ko belong karta hai
BusinessPersonnel.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// Business ke paas statutory & legal proof documents hote hain (1-to-Many)
BusinessEntity.hasMany(DocumentVault, {
  foreignKey: "businessId",
  as: "documents",
  onDelete: "CASCADE",
});

// Har document kisi ek Business ko belong karta hai
DocumentVault.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// ─── Step 3 Split Relational Associations ───────────────────────────────────

// 1. Vendor Business Types (1-to-Many)
BusinessEntity.hasMany(VendorBusinessType, {
  foreignKey: "businessId",
  as: "vendorBusinessTypes",
  onDelete: "CASCADE",
});
VendorBusinessType.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// 2. Vendor Categories (1-to-Many)
BusinessEntity.hasMany(VendorCategory, {
  foreignKey: "businessId",
  as: "vendorCategories",
  onDelete: "CASCADE",
});
VendorCategory.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// 3. Vendor Subcategories (1-to-Many)
BusinessEntity.hasMany(VendorSubcategory, {
  foreignKey: "businessId",
  as: "vendorSubcategories",
  onDelete: "CASCADE",
});
VendorSubcategory.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// 4. Vendor Business Activities (1-to-Many)
BusinessEntity.hasMany(VendorBusinessActivity, {
  foreignKey: "businessId",
  as: "vendorActivities",
  onDelete: "CASCADE",
});
VendorBusinessActivity.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// 5. Manufacturing Capabilities (1-to-1)
BusinessEntity.hasOne(BusinessManufacturingCapability, {
  foreignKey: "businessId",
  as: "manufacturingCapability",
  onDelete: "CASCADE",
});
BusinessManufacturingCapability.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// 6. Service Capabilities (1-to-1)
BusinessEntity.hasOne(BusinessServiceCapability, {
  foreignKey: "businessId",
  as: "serviceCapability",
  onDelete: "CASCADE",
});
BusinessServiceCapability.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// 7. Operating Profiles / Scale Metrics (1-to-1)
BusinessEntity.hasOne(BusinessOperatingProfile, {
  foreignKey: "businessId",
  as: "operatingProfile",
  onDelete: "CASCADE",
});
BusinessOperatingProfile.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// Business ke paas multiple Products / Services hote hain (1-to-Many)
BusinessEntity.hasMany(BusinessProduct, {
  foreignKey: "businessId",
  as: "products",
  onDelete: "CASCADE",
});

// Har product kisi ek Business ko belong karta hai
BusinessProduct.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// Business ke paas multiple Quality & Compliance Certifications hote hain (1-to-Many)
BusinessEntity.hasMany(Certification, {
  foreignKey: "businessId",
  as: "certifications",
  onDelete: "CASCADE",
});

// Har certificate kisi ek Business ko belong karta hai
Certification.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// ─── Step 5 Split Relational Associations ───────────────────────────────────

// 1. Departmental Business Points of Contact (1-to-Many)
BusinessEntity.hasMany(BusinessDepartmentContact, {
  foreignKey: "businessId",
  as: "departmentContacts",
  onDelete: "CASCADE",
});
BusinessDepartmentContact.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// 2. Commercial & Payment Terms (1-to-1)
BusinessEntity.hasOne(BusinessCommercialTerms, {
  foreignKey: "businessId",
  as: "commercialTerms",
  onDelete: "CASCADE",
});
BusinessCommercialTerms.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// 3. Trade Operations & Logistics (1-to-1)
BusinessEntity.hasOne(BusinessTradeLogistics, {
  foreignKey: "businessId",
  as: "tradeLogistics",
  onDelete: "CASCADE",
});
BusinessTradeLogistics.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// 4. Banking & Financial Settlement Details (1-to-1)
BusinessEntity.hasOne(BusinessBankingDetails, {
  foreignKey: "businessId",
  as: "bankingDetails",
  onDelete: "CASCADE",
});
BusinessBankingDetails.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// 5. Compliance & Due Diligence Declarations (1-to-1)
BusinessEntity.hasOne(BusinessComplianceDeclarations, {
  foreignKey: "businessId",
  as: "complianceDeclarations",
  onDelete: "CASCADE",
});
BusinessComplianceDeclarations.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// 6. Procurement & RFQ Buyer Enquiries (1-to-Many)
BusinessEntity.hasMany(BusinessEnquiry, {
  foreignKey: "businessId",
  as: "enquiries",
  onDelete: "CASCADE",
});
BusinessEnquiry.belongsTo(BusinessEntity, {
  foreignKey: "businessId",
  as: "business",
});

// 7. Product ke sath RFQ Enquiry Association (1-to-Many)
// Har Product ke liye specific buyer RFQs / Enquiries receive ho sakti hain
BusinessProduct.hasMany(BusinessEnquiry, {
  foreignKey: "productId",
  as: "enquiries",
  onDelete: "SET NULL",
});
BusinessEnquiry.belongsTo(BusinessProduct, {
  foreignKey: "productId",
  as: "product",
});

// ─── RBAC Role-Permission Associations ───────────────────────────────────────
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "roleId",
  otherKey: "permissionId",
  as: "permissions",
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permissionId",
  otherKey: "roleId",
  as: "roles",
});
RolePermission.belongsTo(Role, { foreignKey: "roleId", as: "role" });
RolePermission.belongsTo(Permission, { foreignKey: "permissionId", as: "permission" });
Role.hasMany(RolePermission, { foreignKey: "roleId", as: "rolePermissions" });
Permission.hasMany(RolePermission, { foreignKey: "permissionId", as: "rolePermissions" });

// ─── Export database instance aur saare models ───────────────────────────────
export {
  sequelize,
  User,
  UserOTP,
  BusinessEntity,
  StatutoryIdentifier,
  Role,
  Role as Roles,
  Permission,
  RolePermission,
  BusinessType,
  Category,
  Subcategory,
  Industry,
  BusinessActivity,
  BusinessFacility,
  BusinessPersonnel,
  DocumentVault,
  BusinessProduct,
  Certification,
  Currency,
  BusinessDepartmentContact,
  BusinessCommercialTerms,
  BusinessTradeLogistics,
  BusinessBankingDetails,
  BusinessComplianceDeclarations,
  VendorBusinessType,
  VendorCategory,
  VendorSubcategory,
  VendorBusinessActivity,
  BusinessManufacturingCapability,
  BusinessServiceCapability,
  BusinessOperatingProfile,
  BusinessEnquiry,
};
export default {
  sequelize,
  User,
  UserOTP,
  BusinessEntity,
  StatutoryIdentifier,
  Role,
  Roles: Role,
  Permission,
  RolePermission,
  BusinessType,
  Category,
  Subcategory,
  Industry,
  BusinessActivity,
  BusinessFacility,
  BusinessPersonnel,
  DocumentVault,
  BusinessProduct,
  Certification,
  Currency,
  BusinessDepartmentContact,
  BusinessCommercialTerms,
  BusinessTradeLogistics,
  BusinessBankingDetails,
  BusinessComplianceDeclarations,
  VendorBusinessType,
  VendorCategory,
  VendorSubcategory,
  VendorBusinessActivity,
  BusinessManufacturingCapability,
  BusinessServiceCapability,
  BusinessOperatingProfile,
  BusinessEnquiry,
};
