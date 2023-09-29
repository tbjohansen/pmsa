const { getAuth } = require("firebase-admin/auth");
const { onCall } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");

exports.updateUser = onCall(
  //   { timeoutSeconds: 30, cors: true, maxInstances: 10 },
  { cors: ["https://hrmsa.vercel.app"] },
  async (request) => {
    //initilize values
    const uid = request.data.userID;
    const email = request.data.email;
    const name = request.data.fullName;
    const role = request.data.role;
    const roleID = request.data.roleID;
    const status = request.data.status;
    const updated_at = request.data.updated_at;

    let successArray = [];

    try {
      const user = await getAuth().updateUser(uid, {
        email: email,
        displayName: name,
        emailVerified: true,
        disabled: status
      });

      successArray.push(user);

      const res = setUserAccData({
        user,
        name,
        email,
        role,
        roleID,
        status,
        updated_at,
      });
      successArray.push(res);
    } catch (error) {
      console.log("Error updating user:", error);
      successArray.push(null);
    }

    return Promise.all(successArray).then(() => {
      return { status: 200, message: "User is updated successfully" };
    });
  }
);

async function setUserAccData({ user, name, email, role, roleID, status, updated_at }) {
  let successArray = [];

  try {
    const path = getFirestore()
      .collection("users")
      .doc("admins")
      .collection(user.uid)
      .doc("public")
      .collection("account")
      .doc("info");
    await path.set(
      {
        userID: user.uid,
        fullName: name,
        email,
        role,
        roleID,
        updated_at,
        status
      },
      { merge: true }
    );

    const res = setUserToAdminBucket({
      user,
      name,
      email,
      role,
      roleID,
      status,
      updated_at,
    });
    successArray.push(res);
  } catch (e) {
    console.log("couldn't update user");
    console.log(e);
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}

async function setUserToAdminBucket({
  user,
  name,
  email,
  role,
  roleID,
  status,
  updated_at,
}) {
  let successArray = [];

  try {
    const res = await getFirestore().collection("userBucket").doc(user.uid).set(
      {
        fullName: name,
        email,
        role,
        roleID,
        status,
        userID: user.uid,
        updated_at,
      },
      { merge: true }
    );
    successArray.push(res);
  } catch (e) {
    console.log(e);
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}
