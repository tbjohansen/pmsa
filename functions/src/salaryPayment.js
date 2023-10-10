const { onCall } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { increment } = require("firebase/firestore");

exports.salaryPayment = onCall(
  //   { timeoutSeconds: 30, cors: true, maxInstances: 10 },
  { cors: ["https://hrmsa.vercel.app"] },
  async (request) => {
    //initilize values
    const employee = request.data.employee;
    const uid = employee.id;
    const payment = request.data.payment;
    const paymentMethod = request.data.paymentMethod;
    const bankAcc = request.data.bankAcc;
    const mobile = request.data.mobile;
    const updated_at = request.data.updated_at;

    let successArray = [];

    try {
      const adminRef = getFirestore().collection("app").doc("system");
      const docSnap = await adminRef.get();

      if (docSnap.exists()) {
        const data = docSnap.data();
        //check if monthly date
        const res = setEmployeeSalaryPath({
          month: data.month,
          year: data.year,
          uid,
          employee,
          payment,
          paymentMethod,
          bankAcc,
          mobile,
          updated_at,
        });
        successArray.push(res);
      } else {
        // docSnap.data() will be undefined in this case
        successArray.push(null);
      }
    } catch (error) {
      console.log("Error set employee salary payment:", error);
      successArray.push(null);
    }

    return Promise.all(successArray).then(() => {
      return { status: 200, message: "Employee salary is paid successfully" };
    });
  }
);

async function setEmployeeSalaryPath({
  month,
  year,
  uid,
  employee,
  payment,
  paymentMethod,
  bankAcc,
  mobile,
  updated_at,
}) {
  let successArray = [];

  try {
    const path = getFirestore()
      .collection("salary")
      .doc(year)
      .collection(month)
      .doc(uid);
    await path.set(
      {
        payment,
        updated_at,
      },
      { merge: true }
    );

    setPayrollBucketPath({
      month,
      year,
      uid,
      employee,
      payment,
      paymentMethod,
      bankAcc,
      mobile,
      updated_at,
    });
    successArray.push(res);
  } catch (e) {
    console.log("couldn't update salary path");
    console.log(e);
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}

async function setPayrollBucketPath({
  month,
  year,
  uid,
  employee,
  payment,
  paymentMethod,
  bankAcc,
  mobile,
  updated_at,
}) {
  let successArray = [];

  try {
    const path = getFirestore().collection("payrollBucket");
    await path.set(
      {
        employeeID: uid,
        employeeName: employee.name,
        designation: employee.designation,
        payment,
        id: path.id,
        paymentMethod,
        bankAccount: bankAcc,
        mobile,
        created_at: updated_at,
        updated_at,
      },
      { merge: true }
    );

    const res = setPayrollPath({
      month,
      year,
      uid,
      employee,
      payment,
      paymentMethod,
      bankAcc,
      mobile,
      payrollID: path.id,
      updated_at,
    });
    successArray.push(res);
  } catch (e) {
    console.log("couldn't update payroll path");
    console.log(e);
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}

async function setPayrollPath({
  month,
  year,
  uid,
  employee,
  payment,
  paymentMethod,
  bankAcc,
  mobile,
  updated_at,
  payrollID,
}) {
  let successArray = [];

  try {
    const path = getFirestore()
      .collection("payroll")
      .doc(`${year}`)
      .collection(`${month}`)
      .doc(`${payrollID}`);
    await path.set(
      {
        employeeID: uid,
        employeeName: employee.name,
        designation: employee.designation,
        payment,
        id: path.id,
        paymentMethod,
        bankAccount: bankAcc,
        mobile,
        created_at: updated_at,
        updated_at,
      },
      { merge: true }
    );

    const res = getEmployeeActiveLoans({
      month,
      year,
      uid,
      payment,
      updated_at,
    });
    successArray.push(res);
  } catch (e) {
    console.log("couldn't update payroll bucket path");
    console.log(e);
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}

async function getEmployeeActiveLoans({
  month,
  year,
  uid,
  payment,
  updated_at,
}) {
  //
  let successArray = [];

  try {
    const citiesRef = getFirestore()
      .collection("users")
      .doc("employees")
      .collection(uid)
      .doc("public")
      .collection("loans");
    const snapshot = await citiesRef.where("paid", "==", false).get();
    if (snapshot.empty) {
      console.log("No matching documents.");
      successArray.push(null);
    } else {
      //
      snapshot.forEach((doc) => {
        const loan = doc.data();
        const res = updateEmployeeLoanPath({
          loan,
          uid,
          month,
          year,
          payment,
          created_at: updated_at,
        });
        successArray.push(res);
      });
    }
  } catch (e) {
    console.log(e);
    console.log("employee loans collection path is wrong");
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}

async function updateEmployeeLoanPath({
  loan,
  uid,
  month,
  year,
  created_at,
}) {
  let successArray = [];

  let paid = false;
  const amountPaid = loan.paidAmout + loan.deductionAmount;

  if (amountPaid >= loan.amount) {
    paid = true;
  }

  try {
    const path = getFirestore()
      .collection("users")
      .doc("employee")
      .collection(uid)
      .doc("public")
      .collection("loans")
      .doc(loan.id);
    await path.set(
      {
        debt: increment(-loan.deductionAmount),
        paidAmout: amountPaid,
        paid,
        updated_at: created_at,
      },
      { merge: true }
    );

    const res = updateLoanPath({ loan, month, year, created_at });
    successArray.push(res);
  } catch (e) {
    console.log("couldn't update employee loan path");
    console.log(e);
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}

async function updateLoanPath({
  loan,
  month,
  year,
  created_at,
}) {
  let successArray = [];

  let paid = false;
  const amountPaid = loan.paidAmout + loan.deductionAmount;

  if (amountPaid >= loan.amount) {
    paid = true;
  }

  try {
    const path = getFirestore()
      .collection("loans")
      .doc(loan.id);
    await path.set(
      {
        debt: increment(-loan.deductionAmount),
        paidAmout: amountPaid,
        paid,
        updated_at: created_at,
      },
      { merge: true }
    );

    const res = setLoanPayment({ loan, month, year, created_at });
    successArray.push(res);
  } catch (e) {
    console.log("couldn't update employee loan path");
    console.log(e);
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}

async function setLoanPayment({ loan, month, year, created_at }) {
  let successArray = [];

  try {
    const path = await getFirestore()
      .collection("loanPayments")
      .set(
        {
          loanID: loan.id,
          id: path.id,
          paidAmout: loan.deductionAmount,
          month,
          year,
          created_at,
        },
        { merge: true }
      );
    successArray.push(path);
  } catch (e) {
    console.log(e);
    return "";
  }

  return Promise.all(successArray).then(() => {
    return "";
  });
}
