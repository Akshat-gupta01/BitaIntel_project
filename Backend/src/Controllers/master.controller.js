const { business_types, categories, subcategories } = require("../models");

// 1. Get all active Business Types (BT01 to BT14)
const getBusinessType = async (req, res) => {
  try {
    const businessTypes = await business_types.findAll({
      where: { status: "active" },
      attributes: ["id", "code", "name"],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Business types fetched successfully",
      count: businessTypes.length,
      data: businessTypes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching business types",
      error: error.message,
    });
  }
};

// 2. Get all active 20 Main Categories (CAT001 to CAT020)
const getcategories = async (req, res) => {
  try {
    const allCategories = await categories.findAll({
      where: { status: "active" },
      attributes: ["id", "code", "name"],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      count: allCategories.length,
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// 3. Get Subcategories (supports dynamic filtering by category_id or category_ids)
// Example: /api/master/subcategories?category_ids=1,2,3
const getsubcategories = async (req, res) => {
  try {
    const { category_id, category_ids } = req.query;
    const whereClause = { status: "active" };

    // Dynamic filtering based on category selection
    if (category_ids) {
      const ids = category_ids
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id) && id > 0);

      if (ids.length > 0) {
        whereClause.category_id = ids;
      }
    } else if (category_id) {
      whereClause.category_id = Number(category_id);
    }

    const subCategoryList = await subcategories.findAll({
      where: whereClause,
      attributes: ["id", "code", "name", "category_id"],
      include: [
        {
          model: categories,
          as: "category",
          attributes: ["id", "code", "name"],
        },
      ],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Subcategories fetched successfully",
      count: subCategoryList.length,
      data: subCategoryList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching subcategories",
      error: error.message,
    });
  }
};

module.exports = {
  getBusinessType,
  getcategories,
  getsubcategories,
};
