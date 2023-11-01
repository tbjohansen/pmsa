const { getAuth } = require("firebase-admin/auth");
const { onCall } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");

exports.createNewUser = onCall(
  //   { timeoutSeconds: 30, cors: true, maxInstances: 10 },
  {cors: ["https://hrmsa.vercel.app"]},
  async(request) => {
    //initilize values
    const email = request.data.email;
    const name = request.data.fullName;
    const role = request.data.role;
    const roleID = request.data.roleID;
    const created_at = request.data.created_at;

    let successArray = [];

    try {

      const res = getAllEmployees({});
      successArray.push(res);
    } catch (error) {
      console.log("Error adding user to payroll:", error);
      successArray.push(null);
    }

    return Promise.all(successArray).then(() => {
      return {status: 200, message: "User is created successfully"};
    });
  }
);

async function getAllEmployees({}) {
  let successArray = [];

  try {
    const employeeSnapshot = await getFirestore().collection("employees").where("status", "==", true).get();

    if(employeeSnapshot.size !== 0){
        employeeSnapshot.forEach((doc) => {
          const employee = doc.data();

          const res = setEmployeeOnMonthPayroll({employee});
          successArray.push(res);
        })
    } else {
      successArray.push(null);
    }
  } catch (error) {
      console.log("Error getting employees:", error);
      successArray.push(null);
  }

}

async function setEmployeeOnMonthPayroll({employee}) {
  let successArray = [];

  try {
    
  } catch (error) {
    console.log("Error creating employee on month payroll path:", error);
      successArray.push(null);
  }
}

async function updateEmployeeOnPath({employee}) {
  let successArray = [];

  try {
    
  } catch (error) {
    console.log("Error updating employee on users path:", error);
      successArray.push(null);
  }
}

async function updateEmployeeOnBucket({employee}) {
  
  let successArray = [];

  try {
    
  } catch (error) {
    console.log("Error updating employee on bucket path:", error);
      successArray.push(null);
  }
}


