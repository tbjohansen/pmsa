import React, { useEffect, useState } from "react";
import { Button, DatePicker, Segmented, Space, Table, Tag } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { addEmployees, selectEmployees } from "../../features/employeeSlice";
import { db } from "../../App";

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
        <p>{payroll?.role}</p>
      </>
    ),
  },
  {
    title: "Basic Salary",
    key: "basicSalary",
    render: (_, payroll) => (
      <>
        <p>{payroll?.basicSalary}</p>
      </>
    ),
  },
  {
    title: "Deductions",
    key: "deductions",
    render: (_, payroll) => (
      <>
        <p>{payroll?.deductions}</p>
      </>
    ),
  },
  {
    title: "Net Salary",
    key: "netSalary",
    render: (_, payroll) => (
      <>
        <p>{payroll?.netSalary}</p>
      </>
    ),
  },
  {
    title: "Payment",
    key: "status",
    render: (_, payroll) => <></>,
  },
  {
    title: "Actions",
    key: "action",
    render: (_, payroll) => (
      <p className="flex flex-row gap-1 justify-start"></p>
    ),
  },
];

const MonthSalaries = () => {
  const sortedPayroll = [];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={sortedPayroll}
        size="middle"
        pagination={{ defaultPageSize: 6, size: "middle" }}
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

    getEmployees();
  })

  // const monthExpenses = expenses.filter((expense) => {
  //   return (
  //     expense.month === parseInt(monthValue) &&
  //     moment(expense.expense_date).format("YYYY") === yearValue.toString()
  //   );
  // });

  const employees = useSelector(selectEmployees);
  const activeEmployees = employees.filter((employee) => employee.status == true);

  const totalBasicSalary = activeEmployees.reduce(
    (sum, employee) => sum + employee.salary,
    0
  );

  const totalNetSalary = activeEmployees.reduce(
    (sum, employee) => sum + employee.netSalary,
    0
  );

  const totalDeductions = activeEmployees.reduce(
    (sum, employee) => sum + employee.deductionAmount,
    0
  );

  const totalNSSFDeductions = activeEmployees.reduce(
    (sum, employee) => sum + employee.nssfAmount,
    0
  );

  const totalPAYEAmount = activeEmployees.reduce(
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
                <p className="capitalize">{activeEmployees?.length || 0}</p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Total Basic Salary Amount:</p>
                <p className="capitalize">{formatter.format(totalBasicSalary)}</p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Total PAYE Employees Amount:</p>
                <p className="capitalize">{formatter.format(totalPAYEAmount)}</p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Total NSSF Deductions Amount:</p>
                <p className="capitalize">{formatter.format(totalNSSFDeductions)}</p>
              </div>
            </div>
            <div className="w-[50%] px-4 py-4">
            <div className="flex flex-row gap-2 py-1">
                <p>Total Deductions Amount:</p>
                <p className="capitalize">{formatter.format(totalDeductions)}</p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Total Net Salary Amount:</p>
                <p className="capitalize">{formatter.format(totalNetSalary)}</p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Net Salary Amount (15th):</p>
                <p className="capitalize">TZS 10,72000.00</p>
                <Tag color={"green"} className="text-sm">
                  Paid
                </Tag>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p>Net Salary Amount (30th):</p>
                <p className="capitalize">TZS 10,72000.00</p>
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
                <Tab label="MONTH SALARIES" {...a11yProps(0)} />
                <Tab label="MID OF THE MONTH " {...a11yProps(1)} />
                <Tab label="END OF THE MONTH" {...a11yProps(2)} />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              <MonthSalaries />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}></CustomTabPanel>
            <CustomTabPanel value={value} index={2}></CustomTabPanel>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
