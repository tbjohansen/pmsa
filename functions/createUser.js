const { getAuth } = require("firebase-admin/auth");
const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");

exports.createUser = onRequest(
  //   { timeoutSeconds: 30, cors: true, maxInstances: 10 },
  {cors: false},
  async (req, res) => {
    //initilize values
    const email = req.email;
    const name = req.fullName;
    const role = req.role;
    const roleID = req.roleID;
    const created_at = req.created_at;

    let successArray = [];

    try {
      const user = await getAuth().createUser({
        email: email,
        emailVerified: true,
        password: "msa@1234",
        disabled: false,
      });

      successArray.push(user);

      const res = createUserDatabase({
        user,
        name,
        email,
        role,
        roleID,
        created_at,
      });
      successArray.push(res);
    } catch (error) {
      console.log("Error creating new user:", error);
      successArray.push(null);
    }

    return Promise.all(successArray).then(() => {
      return res.sendStatus(200);
    });
  }
);

async function createUserDatabase({
  user,
  name,
  email,
  role,
  roleID,
  created_at,
}) {
  //check if clients doc is created
  let successArray = [];

  try {
    const adminRef = getFirestore().collection("users").doc("admins");
    const adminSnapshot = await adminRef.get();

    if (adminSnapshot.exists) {
      //clients doc is already created
      //we know user is new so create its public doc and set empty value
      //check if public directory exists
      const res = checkPublicDirectory({
        user,
        name,
        email,
        role,
        roleID,
        created_at,
      });
      successArray.push(res);
    } else {
      //create clients doc
      await adminRef.set({});
      const res = setPublicDirectory({
        user,
        name,
        email,
        role,
        roleID,
        created_at,
      });
      successArray.push(res);
    }
  } catch (e) {
    console.log(e);
    console.log("couldn't get admins doc");
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}

async function checkPublicDirectory({
  user,
  name,
  email,
  role,
  roleID,
  created_at,
}) {
  //create clients doc
  let successArray = [];

  try {
    const accSnapshot = await getFirestore()
      .collection("users")
      .doc("admins")
      .collection(user.uid)
      .doc("public")
      .get();

    if (accSnapshot.exists) {
      //set user data
      const res = setUserAccData({
        user,
        name,
        email,
        role,
        roleID,
        created_at,
      });
      successArray.push(res);
    } else {
      //create user public doc
      const res = setPublicDirectory({
        user,
        name,
        email,
        role,
        roleID,
        created_at,
      });
      successArray.push(res);
    }
  } catch (e) {
    console.log(e);
    console.log("public doc path is wrong");
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}

async function setPublicDirectory({
  user,
  name,
  email,
  role,
  roleID,
  created_at,
}) {
  let successArray = [];

  try {
    await getFirestore()
      .collection("users")
      .doc("admins")
      .collection(user.uid)
      .doc("public")
      .set({});
    const res = setUserAccData({ user, name, email, role, roleID, created_at });
    successArray.push(res);
  } catch (e) {
    console.log(e);
    console.log("failed to create public doc");
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}

async function setUserAccData({ user, name, email, role, roleID, created_at }) {
  let successArray = [];

  try {
    const path = getFirestore()
      .collection("users")
      .doc("admins")
      .collection(user.uid)
      .doc("public")
      .collection("account")
      .doc("info");
    await path.set({
      userID: user.uid,
      fullName: name,
      email,
      role,
      roleID,
      created_at,
      status: true,
    });

    const res = setUserToAdminBucket({
      user,
      name,
      email,
      role,
      roleID,
      created_at,
    });
    successArray.push(res);
  } catch (e) {
    console.log("couldn't register user");
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
  created_at,
}) {
  let successArray = [];

  try {
    const res = await getFirestore()
      .collection("userBucket")
      .doc(user.uid)
      .set({
        fullName: name,
        email,
        status: true,
        role,
        roleID,
        userID: user.uid,
        created_at,
      });
    successArray.push(res);
  } catch (e) {
    console.log(e);
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}
