import React, { useState } from "react";
import { Table, Tag } from "antd";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { addSalaries, selectSalaries } from "../../features/payrollSlice";
import {
  collection,
  doc,
  getDocs,
  increment,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../App";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "react-hot-toast";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DownloadForOfflineOutlined } from "@mui/icons-material";

const style = {
  position: "absolute",
  top: "48%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  //   boxShadow: 24,
  p: 4,
};

const formatter = new Intl.NumberFormat("en-US");

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <p>{text}</p>,
  },
  {
    title: "Employee Name",
    key: "employeeName",
    render: (_, payroll) => (
      <>
        <p>
          {payroll?.firstName} {payroll?.middleName} {payroll?.lastName}
        </p>
        <p>{payroll?.designation}</p>
      </>
    ),
  },
  {
    title: "Basic Salary",
    key: "basicSalary",
    render: (_, payroll) => (
      <>
        <p>TZS {formatter.format(payroll?.salary || 0)}</p>
      </>
    ),
  },
  {
    title: "Deductions",
    key: "deductions",
    render: (_, payroll) => (
      <>
        <p>TZS {formatter.format(payroll?.deductionAmount || 0)}</p>
      </>
    ),
  },
  {
    title: "Net Salary",
    key: "netSalary",
    render: (_, payroll) => (
      <>
        <p>TZS {formatter.format(payroll?.netSalary || 0)}</p>
      </>
    ),
  },
  {
    title: "Mid Month Salary",
    key: "midSalary",
    render: (_, payroll) => (
      <>
        <MidSalary payroll={payroll} />
      </>
    ),
  },
  {
    title: "Payment",
    key: "status",
    render: (_, payroll) => (
      <>
        {payroll?.payment === "none" ? (
          <PaySalary payroll={payroll} />
        ) : (
          <Tag color={"green"}>Paid</Tag>
        )}
      </>
    ),
  },
  // {
  //   title: "Actions",
  //   key: "action",
  //   render: (_, payroll) => (
  //     <p className="flex flex-row gap-1 justify-start"></p>
  //   ),
  // },
];

const MonthPayrollPDF = ({ employees, month, year }) => {
  const totalNetSalary = employees.reduce(
    (sum, employee) => sum + employee.netSalary,
    0
  );

  const generatePDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Create a header row
    const headerRow = [
      "No",
      "Name",
      "Designation",
      "Salary",
      "PAYE",
      "NSSF",
      "Loans",
      "Net Salary",
    ];

    // Create an array to hold all the data rows
    const dataRows = [];

    // Iterate through the employees and create data rows for each one
    for (const employee of employees) {
      const dataRow = [
        employee.key,
        `${employee.firstName} ${employee.lastName}`,
        employee.designation,
        formatter.format(employee.midMonthSalary),
        formatter.format(employee.paye),
        formatter.format(employee.nssfAmount),
        formatter.format(employee.midMonthLoanDeduction),
        formatter.format(employee.midMonthNetSalary),
      ];
      dataRows.push(dataRow);
    }

    // Combine the header and data rows into the employeeData array
    const employeeData = [headerRow, ...dataRows];

    // Calculate the total payroll
    const totalSalary = employeeData
      .slice(1) // Skip the header row
      .reduce((acc, row) => acc + row[2], 0);

    // Set document properties
    doc.setFontSize(16);

    // Add the heading
    doc.text(
      `MONTHLY SALARIES AS OF MID ${month.toUpperCase()} ${year}`,
      50,
      10
    );

    doc.setFontSize(12);

    // Add employee table
    doc.autoTable({
      head: employeeData.slice(0, 1), // Header row
      body: employeeData.slice(1), // Employee data
      startY: 20, // Position to start the table
    });

    // Add total payroll on the right-hand side
    doc.text(
      `Total Payroll: TZS ${formatter.format(totalNetSalary)}`,
      130,
      doc.autoTable.previous.finalY + 10
    );

    // Save the PDF
    doc.save(`Month Salaries Mid ${month} ${year}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={() => generatePDF()}
      className="px-4 py-1 w-full flex flex-row gap-2 justify-center border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
    >
      <p>Generate </p> <DownloadForOfflineOutlined fontSize="small" />
    </button>
  );
};

const PaySalary = ({ payroll }) => {
  const dispatch = useDispatch();

  const functions = getFunctions();

  const month = moment().format("MMMM");
  const monthNumber = moment().month(month).format("M");
  const year = moment().format("YYYY");

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [paymentMethod, setPayment] = useState("");
  const [bankAcc, setBank] = useState("");
  const [mobile, setMobile] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const getEmployees = async () => {
    let salaryArray = [];

    const querySnapshot = await getDocs(
      collection(db, "salaries", year, monthNumber)
    );
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      salaryArray.push(data);
    });

    if (salaryArray.length > 0) {
      dispatch(addSalaries(salaryArray));
    } else {
      dispatch(addSalaries([]));
    }
  };

  const confirmPayment = async () => {
    if (payroll?.payment === "none") {
      if (!paymentMethod) {
        toast.error("Please select payment method");
      } else if (paymentMethod === "bank" && !bankAcc) {
        toast.error("Please enter bank account");
      } else if (paymentMethod === "mobile" && !mobile) {
        toast.error("please enter mobile number");
      } else {
        //trigger function
        const created_at = Timestamp.fromDate(new Date());

        setLoading(true);

        //create user
        // const paySalary = httpsCallable(functions, "salaryPayment");
        // paySalary({
        //   employee: payroll,
        //   paymentMethod: "half",
        //   paymentMethod,
        //   bankAcc,
        //   mobile,
        //   description,
        //   updated_at: created_at,
        // })
        //   .then((result) => {
        //     // Read result of the Cloud Function.
        //     // const data = result.data;

        //     updateEmployeeToPath({ payroll });
        //   })
        //   .catch((error) => {
        //     // Getting the Error details.
        //     // const code = error.code;
        //     const message = error.message;
        //     // const details = error.details;
        //     setLoading(false);
        //     toast.error(message);
        //   });

        updateSalariesToPath({ payroll });
      }
    } else {
      console.log(payroll.payment);
      toast.error("Sorry! Employee mid month salary is alredy paid");
    }
  };

  const updateSalariesToPath = async ({ payroll }) => {
    // Add a new document with a generated id
    await updateDoc(doc(db, "salaries", year, monthNumber, payroll.id), {
      payment: "half",
      updated_at: Timestamp.fromDate(new Date()),
      loan: increment(-payroll?.midMonthLoanDeduction || 0),
    })
      .then(async () => {
        //set payroll bucket
        const path = doc(collection(db, "payrollBucket"));
        await setDoc(path, {
          employeeID: payroll.id,
          employeeName: `${payroll.firstName} ${payroll.middleName} ${payroll.lastName}`,
          designation: payroll.designation,
          payment: "half",
          id: path.id,
          paymentMethod,
          bankAccount: bankAcc,
          mobile,
          monthNumber,
          year,
          amount: payroll?.midMonthNetSalary,
          created_at: Timestamp.fromDate(new Date()),
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            //
            setPayrollToPath({ id: path.id, payroll });
          })
          .catch((error) => {
            setLoading(false);
            console.log("Error creating new employee:", error);
            toast.error(error.message);
          });
      })
      .catch((error) => {
        setLoading(false);
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
      });
  };

  const setPayrollToPath = async ({ id, payroll }) => {
    // Add a new document with a generated id
    const docRef = doc(db, "payroll", year, monthNumber, id);
    await setDoc(docRef, {
      employeeID: payroll.id,
      employeeName: `${payroll.firstName} ${payroll.middleName} ${payroll.lastName}`,
      designation: payroll.designation,
      payment: "half",
      id,
      paymentMethod,
      bankAccount: bankAcc,
      mobile,
      monthNumber,
      year,
      amount: payroll?.midMonthNetSalary,
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date()),
    })
      .then(async () => {
        //get active loans
        const querySnapshot = await getDocs(
          collection(db, "users", "employees", payroll.id, "public", "loans")
        );
        if (querySnapshot.size > 0) {
          querySnapshot.forEach((doc) => {
            //set data
            const data = doc.data();

            updateEmployeeLoanPaths({ payroll, loan: data });
          });
        } else {
          updateEmployeeToPath({ payroll });
        }
      })
      .catch((error) => {
        setLoading(false);
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
      });
  };

  const updateEmployeeLoanPaths = async ({ payroll, loan }) => {
    let paid = false;
    const amountPaid = loan.paidAmout + loan.deductionAmount;

    if (amountPaid >= loan.amount) {
      paid = true;
    }

    await updateDoc(
      doc(db, "users", "employees", payroll.id, "public", "loans", loan.id),
      {
        debt: increment(-loan.deductionAmount),
        paidAmout: amountPaid,
        paid,
        updated_at: Timestamp.fromDate(new Date()),
      }
    )
      .then(async () => {
        await updateDoc(doc(db, "loans", loan?.id), {
          debt: increment(-loan.deductionAmount),
          paidAmout: amountPaid,
          paid,
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            setLoanPayment({ loan, payroll });
          })
          .catch((error) => {
            setLoading(false);
            // console.error("Error removing document: ", error.message);
            toast.error(error.message);
          });
      })
      .catch((error) => {
        setLoading(false);
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
      });
  };

  const setLoanPayment = async ({ loan, payroll }) => {
    const path = doc(collection(db, "loanPayments"));
    await setDoc(path, {
      loanID: loan.id,
      id: path.id,
      paidAmout: loan.deductionAmount,
      month,
      year,
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date()),
    })
      .then(() => {
        //
        updateEmployeeToPath({ payroll });
      })
      .catch((error) => {
        setLoading(false);
        console.log("Error creating new employee:", error);
        toast.error(error.message);
      });
  };

  const updateEmployeeToPath = async ({ payroll }) => {
    // Add a new document with a generated id
    await updateDoc(
      doc(db, "users", "employees", payroll.id, "public", "account", "info"),
      {
        payment: "half",
        loan: increment(-payroll?.midMonthLoanDeduction || 0),
      }
    )
      .then(async () => {
        await updateDoc(doc(db, "employeesBucket", payroll?.id), {
          payment: "half",
          loan: increment(-payroll?.midMonthLoanDeduction || 0),
        })
          .then(() => {
            getEmployees();

            setPayment("");
            setBank("");
            setMobile("");
            setDescription("");
            setLoading(false);

            toast.success("Employee mid month salary is paid successfully");
          })
          .catch((error) => {
            setLoading(false);
            // console.error("Error removing document: ", error.message);
            toast.error(error.message);
          });
      })
      .catch((error) => {
        setLoading(false);
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
      });
  };

  const renderButton = () => {
    if (loading) {
      return (
        <>
          <Button
            size="large"
            variant="contained"
            className="w-[92%] cursor-not-allowed"
            disabled
          >
            <svg
              className="animate-spin h-5 w-5 mr-3 ..."
              viewBox="0 0 24 24"
            ></svg>
            Loading...
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button
            size="large"
            variant="contained"
            className="w-[92%]"
            onClick={(e) => confirmPayment(e)}
          >
            CONFIRM EMPLOYEE SALARY PAYEMNT
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        type="button"
        className="px-4 py-2 w-full border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
      >
        PAY SALARY
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">
              Add Employee Mid Month Salary Payment Details
            </h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  id="outlined-select-currency"
                  size="small"
                  select
                  label="Select Salary Payment Method"
                  variant="outlined"
                  className="w-[92%]"
                  value={paymentMethod}
                  onChange={(e) => setPayment(e.target.value)}
                >
                  <MenuItem value={"bank"}>Bank</MenuItem>
                  <MenuItem value={"cash"}>Cash</MenuItem>
                  <MenuItem value={"mobile"}>Mobile Money</MenuItem>
                </TextField>
              </div>
              {paymentMethod === "bank" ? (
                <div className="w-full py-2 flex justify-center">
                  <TextField
                    size="small"
                    id="outlined-basic"
                    label="Bank Account"
                    variant="outlined"
                    className="w-[92%]"
                    value={bankAcc}
                    onChange={(e) => setBank(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  {paymentMethod === "mobile" ? (
                    <div className="w-full py-2 flex justify-center">
                      <TextField
                        size="small"
                        id="outlined-basic"
                        label="phone Number"
                        variant="outlined"
                        className="w-[92%]"
                        type={"number"}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                      />
                    </div>
                  ) : null}
                </>
              )}
              <div className="w-full py-2 flex justify-center">
                <TextField
                  id="outlined-multiline-static"
                  label="Description"
                  multiline
                  rows={2}
                  variant="outlined"
                  className="w-[92%]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="w-full py-2 pt-3 flex justify-center">
                {renderButton()}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

const MidSalary = ({ payroll }) => {
  const salary = payroll.netSalary / 2;
  return <p>TZS {formatter.format(salary || 0)}</p>;
};

const MidMonthPayroll = ({ label, yearValue }) => {
  const employees = useSelector(selectSalaries);
  const midMonthEmployees = employees.filter(
    (employee) => employee.paymentMode == 2
  );
  const employeesList = midMonthEmployees
    .slice()
    .sort((a, b) => b.created_at - a.created_at);
  const sortedEmployees = employeesList.map((employee, index) => {
    const key = index + 1;
    return { ...employee, key };
  });

  return (
    <div>
      <div>
        {sortedEmployees.length > 0 ? (
          <div className="flex flex-row justify-between">
            <div className="w-[80%]"></div>
            <div className="w-[20%] text-sm">
              <MonthPayrollPDF
                employees={sortedEmployees}
                year={yearValue}
                month={label}
              />
            </div>
          </div>
        ) : null}
      </div>
      <Table
        columns={columns}
        dataSource={sortedEmployees}
        size="middle"
        pagination={{ defaultPageSize: 10, size: "middle" }}
      />
    </div>
  );
};

export default MidMonthPayroll;
