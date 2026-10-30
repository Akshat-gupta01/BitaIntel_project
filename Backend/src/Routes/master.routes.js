const express = require("express");
const {
  getBusinessType,
  getcategories,
  getsubcategories,
} = require("../Controllers/master.controller");

const router = express.Router();

// Master Data Endpoints
router.get("/business-types", getBusinessType);
router.get("/categories", getcategories);
router.get("/subcategories", getsubcategories);

module.exports = router;
