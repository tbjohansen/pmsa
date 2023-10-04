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
  updateDoc,
} from "firebase/firestore";
import { addEmployees } from "../../features/employeeSlice";
import { db } from "../../App";
import { addSalaries, selectSalaries } from "../../features/payrollSlice";
import { toast } from "react-hot-toast";
import MidMonthPayroll from "./MidMonthPayroll";
import EndMonthPayroll from "./EndMonthPayroll";

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
  {
    title: "Actions",
    key: "action",
    render: (_, payroll) => (
      <p className="flex flex-row gap-1 justify-start"></p>
    ),
  },
];

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
    if (employee?.payment !== "none") {
      await deleteDoc(doc(db, "salaries", year, monthNumber, employee?.id))
        .then(() => {
          updateEmployeeToPath(employee.id);
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          toast.error(error.message);
        });
    } else {
      toast.custom("Sorry! Employee can't be removed on this month payroll");
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
      }
    };

    getEmployees();
    getMonthSalaries();
  });

  // const monthExpenses = expenses.filter((expense) => {
  //   return (
  //     expense.month === parseInt(monthValue) &&
  //     moment(expense.expense_date).format("YYYY") === yearValue.toString()
  //   );
  // });

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
    (employee) => employee.paymentMode == 2
  );

  const endMonthEmployees = employees.filter(
    (employee) => employee.paymentMode == 1
  );

  const midMonthSalary = midMonthEmployees.reduce(
    (sum, employee) => sum + employee.netSalary / 2,
    0
  );

  const endMonthSalary = endMonthEmployees.reduce(
    (sum, employee) => sum + employee.netSalary / 2,
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
    (sum, employee) => sum + employee.deductionAmount,
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

  let formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "TZS",
  });

  const onMonthChange = (e) => {
    const eNumber = moment().month(e).format("M");
    setLabel(e);
    setMonthValue(eNumber);
    //filter truck expense
  };

  const onYearChange = (date, dateString) => {
    // console.log(date);
    setYear(dateString);
  };

  const handleClearFilter = () => {
    setYear(year);
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
        <div className="w-[60%]"></div>
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
              <div className="flex flex-row gap-2 py-1">
                <p>Total Employees:</p>
                <p className="capitalize">{sortedEmployees?.length || 0}</p>
              </div>
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
                <Tag color={"green"} className="text-sm">
                  Paid
                </Tag>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Net Salary Amount (30th):</p>
                <p className="capitalize">
                  {formatter.format(endMonthSalary || 0)}
                </p>
                <Tag color={"red"} className="text-sm">
                  Not Paid
                </Tag>
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
                <Tab label="MONTH PAYROLL" {...a11yProps(0)} />
                <Tab label="MID OF THE MONTH PAYROLL" {...a11yProps(1)} />
                <Tab label="END OF THE MONTH PAYROLL" {...a11yProps(2)} />
                <Tab label="MID OF THE MONTH SALARIES" {...a11yProps(3)} />
                <Tab label="END OF THE MONTH SALARIES" {...a11yProps(4)} />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              <MonthSalaries />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <MidMonthPayroll />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              <EndMonthPayroll employees={endMonthEmployees} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}></CustomTabPanel>
            <CustomTabPanel value={value} index={4}></CustomTabPanel>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
