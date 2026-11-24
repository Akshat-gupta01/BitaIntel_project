const mysql = require("mysql2/promise");

(async () => {
  const conn = await mysql.createConnection(
    "mysql://root:Akshat%402006@127.0.0.1:3306/bitaintel_db"
  );
  const [businesses] = await conn.query(
    "SELECT id, name, slug, ownerUserId, verificationStatus FROM business_entities ORDER BY id DESC LIMIT 15"
  );
  console.log("BUSINESSES:", JSON.stringify(businesses, null, 2));

  const [enquiries] = await conn.query(
    "SELECT id, enquiryNumber, businessId, productName, buyerName, buyerEmail, subject, status, replyMessage, createdAt FROM business_enquiries ORDER BY id DESC LIMIT 20"
  );
  console.log("ENQUIRIES:", JSON.stringify(enquiries, null, 2));

  const [users] = await conn.query(
    "SELECT id, name, email, role FROM users ORDER BY id DESC LIMIT 15"
  );
  console.log("USERS:", JSON.stringify(users, null, 2));

  await conn.end();
})().catch((e) => {
  console.error("QUERY_ERROR", e.message);
  process.exit(1);
});
