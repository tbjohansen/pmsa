import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts";
import { useDispatch, useSelector } from "react-redux";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../App";
import { addAssets, selectAssets } from "../features/assetSlice";
import { addEmployees, selectEmployees } from "../features/employeeSlice";
import moment from "moment";
import {
  addAllPayrolls,
  addSalaries,
  selectAllPayrolls,
  selectSalaries,
} from "../features/payrollSlice";
import { addLoans, selectLoans } from "../features/loanSlice";

const formatter = new Intl.NumberFormat("en-US");

const chartSetting = {
  yAxis: [
    {
      label: "Amount (TZS)",
    },
  ],
  width: 1000,
  height: 450,
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: "rotate(-90deg) translate(0px, -53px)",
    },
  },
};

// const dataset = [
//   {
//     salary: 59,
//     month: "Jan",
//   },
//   {
//     salary: 50,
//     month: "Fev",
//   },
//   {
//     salary: 47,
//     month: "Mar",
//   },
//   {
//     salary: 54,
//     month: "Apr",
//   },
//   {
//     salary: 57,
//     month: "May",
//   },
//   {
//     salary: 60,
//     month: "June",
//   },
//   {
//     salary: 59,
//     month: "July",
//   },
//   {
//     salary: 65,
//     month: "Aug",
//   },
//   {
//     salary: 51,
//     month: "Sept",
//   },
//   {
//     salary: 60,
//     month: "Oct",
//   },
//   {
//     salary: 67,
//     month: "Nov",
//   },
//   {
//     salary: 61,
//     month: "Dec",
//   },
// ];

const Home = () => {
  const dispatch = useDispatch();

  const month = moment().format("MMMM");
  const monthNumber = moment().month(month).format("M");
  const year = moment().format("YYYY");

  useEffect(() => {
    const getAssets = async () => {
      let assetsArray = [];

      const querySnapshot = await getDocs(collection(db, "assetsBucket"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        assetsArray.push(data);
      });

      if (assetsArray.length > 0) {
        dispatch(addAssets(assetsArray));
      }
    };

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

    const getLoans = async () => {
      let loansArray = [];

      const querySnapshot = await getDocs(collection(db, "loans"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        loansArray.push(data);
      });

      if (loansArray.length > 0) {
        dispatch(addLoans(loansArray));
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

    const getYearPayrolls = async () => {
      let salaryArray = [];

      const q = query(
        collection(db, "payrollBucket"),
        where("year", "==", year)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        // console.log(data);
        salaryArray.push(data);
      });

      if (salaryArray.length > 0) {
        dispatch(addAllPayrolls(salaryArray));
      } else {
        dispatch(addAllPayrolls([]));
      }
    };

    getAssets();
    getEmployees();
    getLoans();
    getMonthSalaries();
    getYearPayrolls();
  }, [dispatch]);

  const assets = useSelector(selectAssets);
  const employees = useSelector(selectEmployees);
  const salaries = useSelector(selectSalaries);
  const loans = useSelector(selectLoans);
  const payments = useSelector(selectAllPayrolls);

  const loanedAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);

  const returnedAmount = loans.reduce((sum, loan) => sum + loan.paidAmount, 0);

  const totalSalaries = salaries.reduce(
    (sum, salary) => sum + salary.netSalary,
    0
  );

  // Initialize an array to store sales for each month
  const monthlySalaries = Array(13).fill(0);

  const data = payments.filter((payment) => {

    const month = payment?.monthNumber;

    monthlySalaries[month] += payment?.amount;
  });

  // console.log(monthlySalaries);

  function getMonthName(monthIndex) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[monthIndex];
  }

  const newMonthlySalaries = monthlySalaries.slice(1);

  const dataset = newMonthlySalaries.map((salaries, monthIndex) => ({
    salary: salaries, 
    month: getMonthName(monthIndex)
  }));

  // console.log(dataset1);

  const valueFormatter = (value) => `${formatter.format(value)}`;

  return (
    <div>
      <div className="flex flex-row gap-2 justify-center">
        <Box>
          <Card sx={{ width: 200, bgcolor: "#EBD1D1" }}>
            <div className="py-2">
              <p className="text-center font-semibold">{assets?.length}</p>
              <p className="text-center text-sm">Total Assets</p>
            </div>
          </Card>
        </Box>
        <Box>
          <Card sx={{ width: 200, bgcolor: "#EBD1D1" }}>
            <div className="py-2">
              <p className="text-center font-semibold">{employees.length}</p>
              <p className="text-center text-sm">Total Employees</p>
            </div>
          </Card>
        </Box>
        <Box>
          <Card sx={{ width: 200, bgcolor: "#EBD1D1" }}>
            <div className="py-2">
              <p className="text-center font-semibold">
                TZS {formatter.format(loanedAmount)}
              </p>
              <p className="text-center text-sm">Total Loaned Amount</p>
            </div>
          </Card>
        </Box>
        <Box>
          <Card sx={{ width: 200, bgcolor: "#EBD1D1" }}>
            <div className="py-2">
              <p className="text-center font-semibold">
                TZS {formatter.format(returnedAmount)}
              </p>
              <p className="text-center text-sm">Total Returned Amount</p>
            </div>
          </Card>
        </Box>
        <Box>
          <Card sx={{ width: 200, bgcolor: "#EBD1D1" }}>
            <div className="py-2">
              <p className="text-center font-semibold">
                TZS {formatter.format(totalSalaries)}
              </p>
              <p className="text-center text-sm">Total Month Salaries</p>
            </div>
          </Card>
        </Box>
      </div>
      <div className="w-[100%] flex flex-row justify-center">
        <BarChart
          dataset={dataset}
          xAxis={[
            {
              scaleType: "band",
              dataKey: "month",
              categoryGapRatio: 0.8,
              barGapRatio: 0.4,
            },
          ]}
          margin={{ left: 92 }}
          series={[
            {
              dataKey: "salary",
              label: "Total Salaries",
              color: "#D1EBEB",
              valueFormatter,
            },
          ]}
          {...chartSetting}
        />
      </div>
    </div>
  );
};

export default Home;
