const { vendor_capabilities, business_profiles } = require("../models");

/**
 * 1. Save or Update Vendor Capabilities (Step 3)
 * Handles both "Save Draft" and "Save & Continue"
 */
const saveCapabilities = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      business_types,
      category_ids,
      subcategory_ids,
      business_activities,
      manufacturing_capabilities,
      service_capabilities,
      operating_profile,
      facility_documents,
      step_status = "draft",
    } = req.body;

    // Fetch user's business profile to link business_profile_id
    const profile = await business_profiles.findOne({
      where: { user_id: userId },
    });
    const businessProfileId = profile ? profile.id : null;

    // Conditional Validation only when completing Step 3
    if (step_status === "completed") {
      if (!business_types || business_types.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one Business Type",
        });
      }

      if (!category_ids || category_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one Category",
        });
      }

      // Check if Manufacturer/OEM selected -> manufacturing capabilities required
      const isManufacturer = business_types.some((bt) =>
        ["BT01", "BT02", "BT03"].includes(bt)
      );
      if (isManufacturer && !manufacturing_capabilities) {
        return res.status(400).json({
          success: false,
          message:
            "Manufacturing capabilities are required when Manufacturer/OEM is selected",
        });
      }

      // Check if Service Provider selected -> service capabilities required
      const isServiceProvider = business_types.includes("BT11");
      if (isServiceProvider && !service_capabilities) {
        return res.status(400).json({
          success: false,
          message:
            "Service capabilities are required when Service Provider is selected",
        });
      }
    }

    // Upsert: Find existing record or create new
    let capability = await vendor_capabilities.findOne({
      where: { user_id: userId },
    });

    if (capability) {
      await capability.update({
        business_profile_id: businessProfileId || capability.business_profile_id,
        business_types: business_types ?? capability.business_types,
        category_ids: category_ids ?? capability.category_ids,
        subcategory_ids: subcategory_ids ?? capability.subcategory_ids,
        business_activities: business_activities ?? capability.business_activities,
        manufacturing_capabilities:
          manufacturing_capabilities ?? capability.manufacturing_capabilities,
        service_capabilities:
          service_capabilities ?? capability.service_capabilities,
        operating_profile: operating_profile ?? capability.operating_profile,
        facility_documents: facility_documents ?? capability.facility_documents,
        step_status,
      });

      return res.status(200).json({
        success: true,
        message:
          step_status === "completed"
            ? "Step 3 capabilities completed successfully"
            : "Step 3 draft saved successfully",
        data: capability,
      });
    }

    // Create new record
    capability = await vendor_capabilities.create({
      user_id: userId,
      business_profile_id: businessProfileId,
      business_types: business_types || [],
      category_ids: category_ids || [],
      subcategory_ids: subcategory_ids || [],
      business_activities: business_activities || [],
      manufacturing_capabilities: manufacturing_capabilities || null,
      service_capabilities: service_capabilities || null,
      operating_profile: operating_profile || null,
      facility_documents: facility_documents || [],
      step_status,
    });

    return res.status(201).json({
      success: true,
      message:
        step_status === "completed"
          ? "Step 3 capabilities completed successfully"
          : "Step 3 draft saved successfully",
      data: capability,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error saving vendor capabilities",
      error: error.message,
    });
  }
};

/**
 * 2. Get Vendor Capabilities (Pre-fill Step 3 for returning vendors)
 */
const getCapabilities = async (req, res) => {
  try {
    const userId = req.user.id;

    const capability = await vendor_capabilities.findOne({
      where: { user_id: userId },
    });

    return res.status(200).json({
      success: true,
      message: capability
        ? "Vendor capabilities retrieved successfully"
        : "No capabilities found for this user",
      data: capability || null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching vendor capabilities",
      error: error.message,
    });
  }
};

/**
 * 3. Upload Facility Documents & Photographs
 */
const uploadFacilityDocs = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one document or photograph to upload",
      });
    }

    const newDocuments = files.map((file) => ({
      name: file.originalname,
      filename: file.filename,
      url: `/uploads/facility-documents/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      uploaded_at: new Date(),
    }));

    // Find user's business profile to link business_profile_id
    const profile = await business_profiles.findOne({
      where: { user_id: userId },
    });
    const businessProfileId = profile ? profile.id : null;

    // Find existing vendor capabilities or create new
    let capability = await vendor_capabilities.findOne({
      where: { user_id: userId },
    });

    if (capability) {
      const existingDocs = Array.isArray(capability.facility_documents)
        ? capability.facility_documents
        : [];
      const updatedDocs = [...existingDocs, ...newDocuments];
      await capability.update({ facility_documents: updatedDocs });
    } else {
      capability = await vendor_capabilities.create({
        user_id: userId,
        business_profile_id: businessProfileId,
        facility_documents: newDocuments,
        step_status: "draft",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Facility documents uploaded and saved to database successfully",
      documents: capability.facility_documents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error uploading facility documents",
      error: error.message,
    });
  }
};

module.exports = {
  saveCapabilities,
  getCapabilities,
  uploadFacilityDocs,
};

