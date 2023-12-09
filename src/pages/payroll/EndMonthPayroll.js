import React, { useEffect, useState } from "react";
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
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
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
        <DeductionAmount payroll={payroll} />
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
    title: "End Month Salary",
    key: "midSalary",
    render: (_, payroll) => (
      <>
        <EndSalary payroll={payroll} />
      </>
    ),
  },
  {
    title: "Payment",
    key: "status",
    render: (_, payroll) => (
      <>
        {payroll?.payment !== "full" ? (
          <PaySalary payroll={payroll} />
        ) : (
          <Tag color={"green"}>Paid</Tag>
        )}
      </>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, payroll) => <SalarySlipPDF employee={payroll} />,
  },
];

const DeductionAmount = ({ payroll }) => {
  const totalAmount =
    payroll?.deductionAmount || 0 + payroll?.endMonthLoanDeduction || 0;

  return <p>TZS {formatter.format(totalAmount)}</p>;
};

const EndSalary = ({ payroll }) => {
  const salary = payroll.netSalary / payroll.paymentMode;
  return <p>TZS {formatter.format(payroll?.endMonthNetSalary || salary)}</p>;
};

const MonthPayrollPDF = ({ employees, month, year }) => {
  const totalNetSalary = employees.reduce(
    (sum, employee) => sum + employee.endMonthNetSalary,
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
        formatter.format(employee.endMonthSalary),
        formatter.format(employee.paye),
        formatter.format(employee?.nssfAmount / 2),
        formatter.format(employee?.endMonthLoanDeduction || 0),
        formatter.format(employee.endMonthNetSalary),
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
      `MONTHLY SALARIES AS END OF ${month.toUpperCase()} ${year}`,
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
    doc.save(`Month Salaries End ${month} ${year}.pdf`);
  };

  return (
    <button
      type="button"
      onClick={() => generatePDF()}
      className="px-4 py-2 w-full flex flex-row gap-2 justify-center border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
    >
      <p>Generate </p> <DownloadForOfflineOutlined fontSize="small" />
    </button>
  );
};

const SalarySlipPDF = ({ employee }) => {
  const generatePDF = () => {
    const pdf = new jsPDF();

    // Specific data values for earnings and deductions
    const basicSalary = employee?.endMonthSalary;
    const loans = employee?.endMonthLoanDeduction;
    const nssf = employee?.nssfAmount / 2;
    const paye = employee?.paye;

    // Calculate total earnings and deductions
    const totalEarnings = basicSalary;
    const totalDeductions = loans + nssf + paye;

    // Add content to PDF
    const title = "END MONTH SALARY SLIP";
    const titleWidth =
      (pdf.getStringUnitWidth(title) * pdf.internal.getFontSize()) /
      pdf.internal.scaleFactor;
    const titleX = (pdf.internal.pageSize.width - titleWidth) / 2;

    // Position on the right side
    // Position on the right side
    const rightAlignX = pdf.internal.pageSize.width - 14;

    pdf.text(title, titleX, 20);
    // Employee Information on the right
    pdf.setFontSize(12);
    pdf.text(
      `${employee?.firstName} ${employee?.middleName} ${employee?.lastName}`,
      rightAlignX,
      30,
      { align: "right", fontSize: 10 }
    );
    pdf.text(`${employee?.designation}`, rightAlignX, 36, { align: "right" });
    pdf.text(`${employee?.month} ${employee?.year}`, rightAlignX, 42, {
      align: "right",
    });

    // Earnings and Deductions Table
    pdf.setFontSize(10);
    pdf.autoTable({
      startY: 50,
      head: [["Earnings", "Amount (TZS)", "Deductions", "Amount (TZS)"]],
      body: [
        [
          "Basic Salary",
          `${formatter.format(basicSalary)}`,
          "Loans",
          `${formatter.format(loans)}`,
        ],
        ["", ``, "NSSF", `${formatter.format(nssf)}`],
        ["", ``, "PAYE", `${formatter.format(paye)}`],
        [
          "Total Earnings",
          `${formatter.format(totalEarnings)}`,
          "Total Deductions",
          {
            content: `${formatter.format(totalDeductions)}`,
            fontStyle: "bold",
          },
        ],
      ],
      theme: "grid", // Add grid lines
      styles: { fontSize: 10, cellPadding: 2, valign: "middle" },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "right" },
        2: { halign: "left" },
        3: { halign: "right" },
      },
    });

    pdf.setFontSize(12);

    // Net Salary
    // const netSalary = totalEarnings - totalDeductions;
    const netSalaryString = `Net Salary: TZS ${formatter.format(
      employee?.endMonthNetSalary
    )}`;
    pdf.text(netSalaryString, rightAlignX, pdf.autoTable.previous.finalY + 10, {
      align: "right",
    });

    // Save the PDF
    pdf.save(
      `${employee?.firstName} ${employee?.middleName} ${employee?.lastName} End Month Salary Slip ${employee?.month} ${employee?.year}`
    );
  };

  return (
    <div
      onClick={() => generatePDF()}
      className="px-4 py-2 w-full flex flex-row gap-2 justify-center cursor-pointer"
    >
      <DownloadForOfflineOutlined fontSize="medium" />
    </div>
  );
};

const PaySalary = ({ payroll }) => {
  const dispatch = useDispatch();

  const functions = getFunctions();

  // const month = moment().format("MMMM");
  // const monthNumber = moment().month(month).format("M");
  // const year = moment().format("YYYY");

  const month = payroll?.month;
  const monthNumber = payroll?.monthNumber;
  const year = payroll?.year;

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
    if (payroll?.payment === "none" || payroll?.payment === "half") {
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
      // console.log(payroll.payment);
      toast.error("Sorry! Employee month salary is alredy paid");
    }
  };

  const updateSalariesToPath = async ({ payroll }) => {
    // Add a new document with a generated id
    await updateDoc(doc(db, "salaries", year, monthNumber, payroll.id), {
      payment: "full",
      updated_at: Timestamp.fromDate(new Date()),
      loan: increment(-payroll?.endMonthLoanDeduction || 0),
    })
      .then(async () => {
        //set payroll bucket
        const path = doc(collection(db, "payrollBucket"));
        await setDoc(path, {
          employeeID: payroll.id,
          employeeName: `${payroll.firstName} ${payroll.middleName} ${payroll.lastName}`,
          designation: payroll.designation,
          payment: "full",
          id: path.id,
          paymentMethod,
          bankAccount: bankAcc,
          mobile,
          amount: payroll?.endMonthNetSalary,
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
      payment: "full",
      id,
      paymentMethod,
      bankAccount: bankAcc,
      mobile,
      amount: payroll?.endMonthNetSalary,
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date()),
    })
      .then(async () => {
        //get active loans
        const q = query(
          collection(db, "users", "employees", payroll.id, "public", "loans"),
          where("salaryDeduction", "in", [2, 3])
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.size > 0) {
          querySnapshot.forEach((doc) => {
            //set data
            const data = doc.data();

            if (data?.debt > 0 && data?.paid == false) {
              // console.log(data);
              updateEmployeeLoanPaths({ payroll, loan: data });
            }
          });
        } else {
          updateEmployeeToPath({ payroll, loan: {}, paid: false });
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
    const amountPaid = loan.paidAmout + loan.endMonthDeduction;

    if (amountPaid >= loan.amount) {
      paid = true;
    }

    await updateDoc(
      doc(db, "users", "employees", payroll.id, "public", "loans", loan.loanID),
      {
        debt: increment(-loan.endMonthDeduction),
        paidAmout: amountPaid,
        paid,
        updated_at: Timestamp.fromDate(new Date()),
      }
    )
      .then(async () => {
        await updateDoc(doc(db, "loans", loan?.loanID), {
          debt: increment(-loan.endMonthDeduction),
          paidAmout: amountPaid,
          paid,
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            setLoanPayment({ loan, payroll, paid });

            //if loan is fully paid
            //remove loan deduction amount on employee paths and next month salary path
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

  const setLoanPayment = async ({ loan, payroll, paid }) => {
    const path = doc(collection(db, "loanPayments"));
    await setDoc(path, {
      loanID: loan.loanID,
      id: path.id,
      paidAmount: loan.endMonthDeduction,
      month,
      year,
      description: "End of the month deduction",
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date()),
    })
      .then(() => {
        //
        updateEmployeeToPath({ loan, payroll, paid });
      })
      .catch((error) => {
        setLoading(false);
        console.log("Error creating new employee:", error);
        toast.error(error.message);
      });
  };

  const updateEmployeeToPath = async ({ loan, payroll, paid }) => {
    // fetch employee details
    const docRef = doc(db, "employeesBucket", payroll?.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      const debt = data?.loan - payroll?.endMonthLoanDeduction;

      if (debt > 0) {
        //there is still loan debt
        //check if loan is fully paid
        if (paid) {
          //yes
          //remove loan deductions
          await updateDoc(
            doc(
              db,
              "users",
              "employees",
              payroll.id,
              "public",
              "account",
              "info"
            ),
            {
              payment: "full",
              loan: increment(-payroll?.endMonthLoanDeduction || 0),
              loanDeduction: increment(-loan?.deductionAmount || 0),
              netSalary: increment(loan?.deductionAmount || 0),
              midMonthNetSalary: increment(loan?.midMonthDeduction || 0),
              endMonthNetSalary: increment(loan?.endMonthDeduction || 0),
              midMonthLoanDeduction: increment(-loan?.midMonthDeduction || 0),
              endMonthLoanDeduction: increment(-loan?.endMonthDeduction || 0),
            }
          )
            .then(async () => {
              await updateDoc(doc(db, "employeesBucket", payroll?.id), {
                payment: "full",
                loan: increment(-payroll?.endMonthLoanDeduction || 0),
                loanDeduction: increment(-loan?.deductionAmount || 0),
                netSalary: increment(loan?.deductionAmount || 0),
                midMonthNetSalary: increment(loan?.midMonthDeduction || 0),
                endMonthNetSalary: increment(loan?.endMonthDeduction || 0),
                midMonthLoanDeduction: increment(-loan?.midMonthDeduction || 0),
                endMonthLoanDeduction: increment(-loan?.endMonthDeduction || 0),
              })
                .then(() => {
                  getEmployees();

                  setPayment("");
                  setBank("");
                  setMobile("");
                  setDescription("");
                  setLoading(false);

                  toast.success("Employee month salary is paid successfully");
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
        } else {
          //no
          await updateDoc(
            doc(
              db,
              "users",
              "employees",
              payroll.id,
              "public",
              "account",
              "info"
            ),
            {
              payment: "full",
              loan: increment(-payroll?.endMonthLoanDeduction || 0),
            }
          )
            .then(async () => {
              await updateDoc(doc(db, "employeesBucket", payroll?.id), {
                payment: "full",
                loan: increment(-payroll?.endMonthLoanDeduction || 0),
              })
                .then(() => {
                  getEmployees();

                  setPayment("");
                  setBank("");
                  setMobile("");
                  setDescription("");
                  setLoading(false);

                  toast.success("Employee month salary is paid successfully");
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
        }
      } else {
        //loan debt is cleared
        await updateDoc(
          doc(
            db,
            "users",
            "employees",
            payroll.id,
            "public",
            "account",
            "info"
          ),
          {
            payment: "full",
            loan: increment(-payroll?.endMonthLoanDeduction || 0),
            loanStatus: false,
            loanDeduction: 0,
            midMonthLoanDeduction: 0,
            endMonthLoanDeduction: 0,
            netSalary: increment(payroll?.loanAmount || 0),
            midMonthNetSalary: increment(payroll?.midMonthLoanDeduction || 0),
            endMonthNetSalary: increment(payroll?.endMonthLoanDeduction || 0),
          }
        )
          .then(async () => {
            await updateDoc(doc(db, "employeesBucket", payroll?.id), {
              payment: "full",
              loan: increment(-payroll?.endMonthLoanDeduction || 0),
              loanStatus: false,
              loanDeduction: 0,
              midMonthLoanDeduction: 0,
              endMonthLoanDeduction: 0,
              netSalary: increment(payroll?.loanAmount || 0),
              midMonthNetSalary: increment(payroll?.midMonthLoanDeduction || 0),
              endMonthNetSalary: increment(payroll?.endMonthLoanDeduction || 0),
            })
              .then(() => {
                getEmployees();

                setPayment("");
                setBank("");
                setMobile("");
                setDescription("");
                setLoading(false);

                toast.success("Employee month salary is paid successfully");
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
      }
    }
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
              Add Employee End Month Salary Payment Details
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

const EndMonthPayroll = ({ label, yearValue }) => {
  const employees = useSelector(selectSalaries);

  const [role, setRole] = useState("");
  const [employeeArray, setEmployeeArray] = useState([]);

  const employeesList = employees
    .slice()
    .sort((a, b) => b.created_at - a.created_at);
  const sortedEmployees = employeesList.map((employee, index) => {
    const key = index + 1;
    return { ...employee, key };
  });

  useEffect(() => {}, [role]);

  const categoryEmployees = employeesList.filter(
    (employee) => employee?.role === role
  );

  const filteredEmployees = categoryEmployees.map((employee, index) => {
    const key = index + 1;
    return { ...employee, key };
  });

  return (
    <div>
      <div>
        {sortedEmployees.length > 0 ? (
          <div className="flex flex-row justify-between">
            <div className="w-[60%]"></div>
            <div className="w-[40%] text-sm flex flex-row gap-2">
              <TextField
                size="small"
                id="outlined-select-currency"
                select
                label="Role"
                className="w-[82%]"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value={""}>All</MenuItem>
                <MenuItem value={"driver"}>Driver</MenuItem>
                <MenuItem value={"mechanic"}>Mechanic</MenuItem>
                <MenuItem value={"turnboy"}>Turnboy</MenuItem>
              </TextField>
              {role ? (
                <MonthPayrollPDF
                  employees={filteredEmployees}
                  year={yearValue}
                  month={label}
                />
              ) : (
                <MonthPayrollPDF
                  employees={sortedEmployees}
                  year={yearValue}
                  month={label}
                />
              )}
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

export default EndMonthPayroll;
