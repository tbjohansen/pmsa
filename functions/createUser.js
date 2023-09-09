const { getAuth } = require("firebase-admin/auth");
const { onRequest } = require("firebase-functions/v2/https");
exports.createUser = onRequest(
//   { timeoutSeconds: 30, cors: true, maxInstances: 10 },
  async (req, res) => {
    const writeResult = await getAuth().createUser({
      email: req.email,
      emailVerified: true,
      password: "msa@1234",
      disabled: false,
    });

    res.json({ result: `Message with ID: ${writeResult.id} added.` });
  }
);
