require("dotenv").config();
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");

const SECRET = process.env.JWT_SECRET;
const tokenUser2 = jwt.sign({ userId: 2 }, SECRET, { expiresIn: "1d" });
const tokenUser3 = jwt.sign({ userId: 3 }, SECRET, { expiresIn: "1d" });
const BASE = "http://localhost:3000/api/v1";

async function call(path, { method = "GET", token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json };
}

(async () => {
  // 1. Tenant isolation: user 3 (Amul industry) must not see propack enquiries
  const u3 = await call("/vendor/enquiries", { token: tokenUser3 });
  console.log("USER3_LIST_STATUS", u3.status);
  console.log(
    "USER3_BUSINESS_IDS",
    JSON.stringify(u3.json?.data?.enquiries?.map((e) => e.businessId))
  );

  // 2. Cross-tenant reply attempt must be rejected
  const cross = await call("/vendor/enquiries/1/reply", {
    method: "POST",
    token: tokenUser3,
    body: { replyMessage: "hijack attempt" },
  });
  console.log("USER3_CROSS_REPLY", cross.status, cross.json?.error?.code);

  // 3. Create a temporary enquiry for propack (businessId 6) and reply as owner
  const conn = await mysql.createConnection(
    "mysql://root:Akshat%402006@127.0.0.1:3306/bitaintel_db"
  );
  const [ins] = await conn.query(
    "INSERT INTO business_enquiries (enquiryNumber, businessId, buyerName, buyerEmail, buyerPhone, buyerCompany, subject, details, budget, status, createdAt, updatedAt) VALUES (?, 6, 'Temp Buyer', 'temp@example.com', '9000000000', 'Temp Co', 'Temp RFQ', 'Temp details', 'RFQ', 'New', NOW(), NOW())",
    ["ENQ-TEST-" + Date.now()]
  );
  const tempId = ins.insertId;

  const reply = await call(`/vendor/enquiries/${tempId}/reply`, {
    method: "POST",
    token: tokenUser2,
    body: { replyMessage: "Vendor test quotation" },
  });
  console.log("OWNER_REPLY", reply.status, reply.json?.data?.status, JSON.stringify(reply.json?.data?.replyMessage));

  const statusUpd = await call(`/vendor/enquiries/${tempId}/status`, {
    method: "PATCH",
    token: tokenUser2,
    body: { status: "In Discussion" },
  });
  console.log("OWNER_STATUS", statusUpd.status, statusUpd.json?.data?.status);

  // Admin reply then vendor reply again -> must preserve both
  await call(`/admin/enquiries/${tempId}/reply`, {
    method: "POST",
    token: jwt.sign({ userId: 1 }, SECRET, { expiresIn: "1d" }),
    body: { replyMessage: "Admin relayed terms" },
  });
  const reply2 = await call(`/vendor/enquiries/${tempId}/reply`, {
    method: "POST",
    token: tokenUser2,
    body: { replyMessage: "Vendor follow-up" },
  });
  console.log("PRESERVED_THREAD", reply2.status, JSON.stringify(reply2.json?.data?.replyMessage));

  await conn.query("DELETE FROM business_enquiries WHERE id = ?", [tempId]);
  console.log("TEMP_CLEANED", tempId);
  await conn.end();
})().catch((e) => {
  console.error("TEST_ERROR", e);
  process.exit(1);
});
