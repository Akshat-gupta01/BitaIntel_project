// src/services/auditLogger.service.js
const { auditlog } = require('../models');

async function recordAuditLog({ userId, action, detail, ipAddress }) {
  try {
    await auditlog.create({
      user_id: userId || null,
      action,
      detail,
      ip_address: ipAddress || null
    });
  } catch (error) {
    // Audit failure should never crash the main application
    console.error('Audit Logging Failed:', error.message);
  }
}

module.exports = { recordAuditLog };
