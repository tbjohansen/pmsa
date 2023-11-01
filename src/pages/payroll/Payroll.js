import React, { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Popconfirm,
  Segmented,
  Space,
  Table,
  Tag,
} from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  updateDoc,
} from "firebase/firestore";
import { addEmployees } from "../../features/employeeSlice";
import { db } from "../../App";
import {
  addPayroll,
  addSalaries,
  selectPayroll,
  selectSalaries,
} from "../../features/payrollSlice";
import { toast } from "react-hot-toast";
import MidMonthPayroll from "./MidMonthPayroll";
import EndMonthPayroll from "./EndMonthPayroll";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DownloadForOfflineOutlined } from "@mui/icons-material";
import MidMonthTransactions from "./MidMonthTransactions";
import EndMonthTransactions from "./EndMonthTransactions";
import { addLoans, selectLoans } from "../../features/loanSlice";
import { async } from "@firebase/util";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

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
        {/* <p>TZS {formatter.format(payroll?.deductionAmount || 0)}</p> */}
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
    title: "Payroll",
    key: "payroll",
    render: (_, payroll) => (
      <>
        <RemovePayroll employee={payroll} />
      </>
    ),
  },
  {
    title: "Payment",
    key: "status",
    render: (_, payroll) => (
      <>
        <PaymentStatus payroll={payroll} />
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

const DeductionAmount = ({ payroll }) => {
  const totalAmount =
    payroll?.deductionAmount +
    payroll?.midMonthLoanDeduction +
    payroll?.endMonthLoanDeduction;

  return <p>TZS {formatter.format(totalAmount)}</p>;
};

const PaymentStatus = ({ payroll }) => {
  if (payroll?.payment === "full") {
    return <Tag color={"green"}>Full Paid</Tag>;
  } else if (payroll?.payment === "half") {
    return <Tag color={"green"}>Half Paid</Tag>;
  } else {
    return <Tag color={"blue"}>Not Paid</Tag>;
  }
};

const RemovePayroll = ({ employee }) => {
  const dispatch = useDispatch();

  const month = moment().format("MMMM");
  const monthNumber = moment().month(month).format("M");
  const year = moment().format("YYYY");

  // console.log(employee);

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

  const changeStatus = async () => {
    if (employee?.payment === "none") {
      await deleteDoc(doc(db, "salaries", year, monthNumber, employee?.id))
        .then(() => {
          updateEmployeeToPath(employee.id);
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          toast.error(error.message);
        });
    } else {
      toast.error("Sorry! Employee can't be removed on this month payroll");
    }
  };

  const updateEmployeeToPath = async (id) => {
    // Add a new document with a generated id
    await updateDoc(
      doc(db, "users", "employees", id, "public", "account", "info"),
      {
        payroll: false,
      }
    )
      .then(async () => {
        await updateDoc(doc(db, "employeesBucket", employee?.id), {
          payroll: false,
        })
          .then(() => {
            getEmployees();
            toast.success(
              "Employee is removed to this month payroll successfully"
            );
          })
          .catch((error) => {
            // console.error("Error removing document: ", error.message);
            toast.error(error.message);
          });
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
      });
  };

  return (
    <Popconfirm
      title=""
      description={`Are you sure to remove this employee on payroll this month?`}
      okText="Yes"
      cancelText="No"
      okButtonProps={{
        className: "bg-blue-500",
      }}
      onConfirm={changeStatus}
    >
      <button
        type="button"
        className="px-4 py-2 w-full border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
      >
        Remove
      </button>
    </Popconfirm>
  );
};

const UpdateMonth = ({ payroll }) => {
  const dispatch = useDispatch();

  const month = "October";
  const monthNumber = "10";
  const year = "2023";

  // console.log(employee);

  const changeStatus = async () => {
    payroll.forEach(async (data) => {
      //
      await updateDoc(doc(db, "employeesBucket", data?.employeeID), {
        // loan: increment(data?.amount),
        // loanStatus: true,
        // salaryToDeductLoan: data?.salaryDeduction,
        // loanDeduction: increment(data?.deductionAmount),
        // netSalary: increment(-data?.deductionAmount),
        midMonthLoanDeduction: increment(data?.midMonthDeduction),
        endMonthLoanDeduction: increment(data?.endMonthDeduction),
        midMonthNetSalary: increment(-data?.midMonthDeduction),
        endMonthNetSalary: increment(-data?.endMonthDeduction),

        // midMonthLoanDeduction: 0,
        // endMonthLoanDeduction: 0,
        // midMonthNetSalary: 0,
        // endMonthNetSalary: 0,
      })
        .then(async () => {
          await updateDoc(
            doc(
              db,
              "users",
              "employees",
              data.employeeID,
              "public",
              "account",
              "info"
            ),
            {
              // loan: increment(data?.amount),
              // loanStatus: true,
              // salaryToDeductLoan: data?.salaryDeduction,
              // loanDeduction: increment(data?.deductionAmount),
              // netSalary: increment(-data?.deductionAmount),
              midMonthLoanDeduction: increment(data?.midMonthDeduction),
              endMonthLoanDeduction: increment(data?.endMonthDeduction),
              midMonthNetSalary: increment(-data?.midMonthDeduction),
              endMonthNetSalary: increment(-data?.endMonthDeduction),

              // midMonthLoanDeduction: 0,
              // endMonthLoanDeduction: 0,
              // midMonthNetSalary: 0,
              // endMonthNetSalary: 0,
            }
          )
            .then(() => {
              updateEmployeeToPath({ data });
            })
            .catch((error) => {
              // console.error("Error removing document: ", error.message);
              toast.error(error.message);
            });
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          toast.error(error.message);
        });
    });
  };

  const updateEmployeeToPath = async ({ data }) => {
    // Add a new document with a generated id
    await updateDoc(doc(db, "salaries", year, monthNumber, data?.employeeID), {
      // loan: increment(data?.amount),
      // loanStatus: true,
      // salaryToDeductLoan: data?.salaryDeduction,
      // loanDeduction: increment(data?.deductionAmount),
      // netSalary: increment(-data?.deductionAmount),
      midMonthLoanDeduction: increment(data?.midMonthDeduction),
      endMonthLoanDeduction: increment(data?.endMonthDeduction),
      midMonthNetSalary: increment(-data?.midMonthDeduction),
      endMonthNetSalary: increment(-data?.endMonthDeduction),

      // midMonthLoanDeduction: 0,
      // endMonthLoanDeduction: 0,
      // midMonthNetSalary: 0,
      // endMonthNetSalary: 0,
    })
      .then(() => {
        console.log("done");
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
      });
  };

  return (
    <Popconfirm
      title=""
      description={`Are you sure to remove this employee on payroll this month?`}
      okText="Yes"
      cancelText="No"
      okButtonProps={{
        className: "bg-blue-500",
      }}
      onConfirm={changeStatus}
    >
      <button
        type="button"
        className="px-4 py-2 w-full border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
      >
        UPDATE MONTH & YEAR
      </button>
    </Popconfirm>
  );
};

const MonthSalaries = () => {
  const employees = useSelector(selectSalaries);
  const employeesList = employees
    .slice()
    .sort((a, b) => b.created_at - a.created_at);
  const sortedEmployees = employeesList.map((employee, index) => {
    const key = index + 1;
    return { ...employee, key };
  });

  return (
    <div>
      <Table
        columns={columns}
        dataSource={sortedEmployees}
        size="middle"
        pagination={{ defaultPageSize: 10, size: "middle" }}
      />
    </div>
  );
};

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
        formatter.format(employee.salary),
        formatter.format(employee.paye),
        formatter.format(employee.nssfAmount),
        formatter.format(employee.loanDeduction),
        formatter.format(employee.netSalary),
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
    doc.text(`MONTHLY SALARIES AS OF ${month.toUpperCase()} ${year}`, 50, 10);

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
    doc.save(`Month Salaries ${month} ${year}.pdf`);
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

const Payroll = () => {
  const dispatch = useDispatch();

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const month = moment().format("MMMM");
  const monthNumber = moment().month(month).format("M");
  const year = moment().format("YYYY");

  const [label, setLabel] = useState(month);
  const [monthValue, setMonthValue] = useState(monthNumber);
  const [yearValue, setYear] = useState(year);

  useEffect(() => {
    const getEmployees = async () => {
      let employeesArray = [];

      const querySnapshot = await getDocs(collection(db, "employeesBucket"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        employeesArray.push(data);
      });

      if (employeesArray.length > 0) {
        dispatch(addEmployees(employeesArray));
      }
    };

    const getMonthSalaries = async () => {
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

    const getMonthPayroll = async () => {
      let payrollArray = [];

      const querySnapshot = await getDocs(
        collection(db, "payroll", year, monthNumber)
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        payrollArray.push(data);
      });

      if (payrollArray.length > 0) {
        dispatch(addPayroll(payrollArray));
      } else {
        dispatch(addPayroll([]));
      }
    };

    const getLoans = async () => {
      let employeesArray = [];

      const querySnapshot = await getDocs(collection(db, "loans"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        employeesArray.push(data);
      });

      if (employeesArray.length > 0) {
        dispatch(addLoans(employeesArray));
      }
    };

    getEmployees();
    getMonthSalaries();
    getMonthPayroll();
    getLoans();
  }, [dispatch]);

  const loans = useSelector(selectLoans);

  const getFilteredMonthSalaries = async ({ dateMonth, dateYear }) => {
    let salaryArray = [];

    const querySnapshot = await getDocs(
      collection(db, "salaries", dateYear, dateMonth)
    );
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      // console.log(data);
      salaryArray.push(data);
    });

    if (salaryArray.length > 0) {
      dispatch(addSalaries(salaryArray));
    } else {
      dispatch(addSalaries([]));
      toast.success(
        `Sorry! Selected year ${dateYear} and month ${dateMonth} has no data`
      );
    }
  };

  const getFilteredMonthPayroll = async ({ dateMonth, dateYear }) => {
    let salaryArray = [];

    const querySnapshot = await getDocs(
      collection(db, "payroll", dateYear, dateMonth)
    );
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      salaryArray.push(data);
    });

    if (salaryArray.length > 0) {
      dispatch(addPayroll(salaryArray));
    } else {
      dispatch(addPayroll([]));
    }
  };

  // const monthExpenses = expenses.filter((expense) => {
  //   return (
  //     expense.month === parseInt(monthValue) &&
  //     moment(expense.expense_date).format("YYYY") === yearValue.toString()
  //   );
  // });

  const payroll = useSelector(selectPayroll);

  const employees = useSelector(selectSalaries);
  const employeesList = employees
    .slice()
    .sort((a, b) => b.created_at - a.created_at);
  const sortedEmployees = employeesList.map((employee, index) => {
    const key = index + 1;
    return { ...employee, key };
  });

  // const employees = useSelector(selectEmployees);
  // const activeEmployees = employees.filter(
  //   (employee) => employee.status == true
  // );

  const midMonthEmployees = employees.filter(
    (employee) => employee.paymentMode === 2
  );

  const endMonthEmployees = employees.filter(
    (employee) => employee.paymentMode === 1
  );

  const midMonthSalary = midMonthEmployees.reduce(
    (sum, employee) => sum + employee.netSalary / 2,
    0
  );

  const endMonthSalary = employees.reduce(
    (sum, employee) => sum + employee.netSalary / employee.paymentMode,
    0
  );

  const totalBasicSalary = sortedEmployees.reduce(
    (sum, employee) => sum + employee.salary,
    0
  );

  const totalNetSalary = sortedEmployees.reduce(
    (sum, employee) => sum + employee.netSalary,
    0
  );

  const totalDeductions = sortedEmployees.reduce(
    (sum, employee) =>
      sum +
      employee.deductionAmount +
      employee.midMonthLoanDeduction +
      employee.endMonthLoanDeduction,
    0
  );

  const totalNSSFDeductions = sortedEmployees.reduce(
    (sum, employee) => sum + employee.nssfAmount,
    0
  );

  const totalPAYEAmount = sortedEmployees.reduce(
    (sum, employee) => sum + employee.paye,
    0
  );

  const totalLoanDeduction = sortedEmployees.reduce(
    (sum, employee) =>
      sum + employee.midMonthLoanDeduction + employee.endMonthLoanDeduction,
    0
  );

  let formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "TZS",
  });

  const onMonthChange = (e) => {
    const eNumber = moment().month(e).format("M");
    setLabel(e);
    setMonthValue(eNumber);
    //filter truck expense
    getFilteredMonthSalaries({ dateMonth: eNumber, dateYear: yearValue });
    getFilteredMonthPayroll({ dateMonth: eNumber, dateYear: yearValue });
  };

  const onYearChange = (date, dateString) => {
    // console.log(date);
    if (dateString) {
      setYear(dateString);
      getFilteredMonthSalaries({ dateMonth: monthValue, dateYear: dateString });
      getFilteredMonthPayroll({ dateMonth: monthValue, dateYear: dateString });
    } else {
      setYear(year);
      setMonthValue(monthNumber);
      getFilteredMonthSalaries({ dateMonth: monthNumber, dateYear: year });
      getFilteredMonthPayroll({ dateMonth: monthNumber, dateYear: year });
    }
  };

  const handleClearFilter = () => {
    setYear(year);
    setMonthValue(monthNumber);
    getFilteredMonthSalaries({ dateMonth: monthNumber, dateYear: year });
    getFilteredMonthPayroll({ dateMonth: monthNumber, dateYear: year });
  };

  return (
    <div className="px-2">
      <div className="w-[100%]">
        <Segmented
          size="large"
          options={[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ]}
          value={label}
          onChange={onMonthChange}
          className="w-[100%] px-2"
        />
      </div>
      <div className="flex flex-row justify-between py-2">
        <div className="w-[60%] flex justify-center items-center">
          <h4>Total Employees : {sortedEmployees?.length || 0}</h4>
        </div>
        <div className="w-[40%] flex flex-row gap-2 justify-between px-2 py-2">
          <div className="w-[100%]">
            <h4 className="py-2 px-2">Filter by Year :</h4>
          </div>
          <div className="w-full">
            <Space direction="vertical">
              <DatePicker onChange={onYearChange} picker="year" />
            </Space>
          </div>
          <div className="w-full">
            <Space direction="vertical">
              <Button
                className="bg-black rounded-full text-white bg-blue-300 hover: text-white"
                onClick={() => handleClearFilter()}
              >
                Clear filter
              </Button>
            </Space>
          </div>
        </div>
      </div>
      <div>
        <div className="px-4">
          <div className="w-[100%] h-[30%] rounded-lg flex flex-row gap-2 justify-between bg-[#fcf8f8]">
            <div className="w-[50%] px-4 py-4 border-r-2 border-zinc-300 border-dashed">
              {/* <div className="flex flex-row gap-2 py-1">
                <p>Total Employees:</p>
                <p className="capitalize">{sortedEmployees?.length || 0}</p>
              </div> */}
              <div className="flex flex-row gap-2 py-1">
                <p>Total Basic Salary Amount:</p>
                <p className="capitalize">
                  {formatter.format(totalBasicSalary)}
                </p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Total PAYE Employees Amount:</p>
                <p className="capitalize">
                  {formatter.format(totalPAYEAmount)}
                </p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Total NSSF Deductions Amount:</p>
                <p className="capitalize">
                  {formatter.format(totalNSSFDeductions)}
                </p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Total Loan Deductions Amount:</p>
                <p className="capitalize">
                  {formatter.format(totalLoanDeduction)}
                </p>
              </div>
            </div>
            <div className="w-[50%] px-4 py-4">
              <div className="flex flex-row gap-2 py-1">
                <p>Total Deductions Amount:</p>
                <p className="capitalize">
                  {formatter.format(totalDeductions)}
                </p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Total Net Salary Amount:</p>
                <p className="capitalize">{formatter.format(totalNetSalary)}</p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Net Salary Amount (15th):</p>
                <p className="capitalize">
                  {formatter.format(midMonthSalary || 0)}
                </p>
                {/* <Tag color={"green"} className="text-sm">
                  Paid
                </Tag> */}
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Net Salary Amount (30th):</p>
                <p className="capitalize">
                  {formatter.format(endMonthSalary || 0)}
                </p>
                {/* <Tag color={"red"} className="text-sm">
                  Not Paid
                </Tag> */}
              </div>
            </div>
            <div className="w-[5%]"></div>
          </div>
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "#f2e1e1",
              }}
            >
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
                //   sx={{ bgcolor: "#d8b4fe" }}
              >
                <Tab label="MONTH SALARIES" {...a11yProps(0)} />
                <Tab label="MID MONTH SALARIES" {...a11yProps(1)} />
                <Tab label="END MONTH SALARIES" {...a11yProps(2)} />
                <Tab label="MID MONTH PAYROLL" {...a11yProps(3)} />
                <Tab label="END MONTH PAYROLL" {...a11yProps(4)} />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              {sortedEmployees.length > 0 ? (
                <div className="flex flex-row justify-between">
                  <div className="w-[80%]">
                    {/* <UpdateMonth payroll={loans} /> */}
                  </div>
                  <div className="w-[20%] text-sm">
                    <MonthPayrollPDF
                      employees={sortedEmployees}
                      year={yearValue}
                      month={label}
                    />
                  </div>
                </div>
              ) : null}
              <MonthSalaries />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <MidMonthPayroll label={label} yearValue={yearValue} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              <EndMonthPayroll label={label} yearValue={yearValue} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
              <MidMonthTransactions label={label} yearValue={yearValue} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4}>
              <EndMonthTransactions label={label} yearValue={yearValue} />
            </CustomTabPanel>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
