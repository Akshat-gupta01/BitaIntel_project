require("dotenv").config();
const jwt = require("jsonwebtoken");

const token = jwt.sign({ userId: 2 }, process.env.JWT_SECRET, { expiresIn: "1d" });

async function main() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch("http://localhost:3000/api/v1/vendor/enquiries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      console.log("STATUS:", res.status);
      console.log(JSON.stringify(body, null, 2));
      return;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  console.log("SERVER_NOT_REACHABLE");
}

main();
