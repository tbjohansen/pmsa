import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts";

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
      transform: "rotate(-90deg) translate(0px, -20px)",
    },
  },
};

const dataset = [
  {
    london: 59,
    month: "Jan",
  },
  {
    london: 50,
    month: "Fev",
  },
  {
    london: 47,
    month: "Mar",
  },
  {
    london: 54,
    month: "Apr",
  },
  {
    london: 57,
    month: "May",
  },
  {
    london: 60,
    month: "June",
  },
  {
    london: 59,
    month: "July",
  },
  {
    london: 65,
    month: "Aug",
  },
  {
    london: 51,
    month: "Sept",
  },
  {
    london: 60,
    month: "Oct",
  },
  {
    london: 67,
    month: "Nov",
  },
  {
    london: 61,
    month: "Dec",
  },
];

const Home = () => {
  return (
    <div>
      <div className="flex flex-row gap-2 justify-center">
        <Box>
          <Card sx={{ width: 200, bgcolor: "#EBD1D1" }}>
            <div className="py-2">
              <p className="text-center font-semibold">38</p>
              <p className="text-center text-sm">Total Assets</p>
            </div>
          </Card>
        </Box>
        <Box>
          <Card sx={{ width: 200, bgcolor: "#EBD1D1" }}>
            <div className="py-2">
              <p className="text-center font-semibold">26</p>
              <p className="text-center text-sm">Total Employees</p>
            </div>
          </Card>
        </Box>
        <Box>
          <Card sx={{ width: 200, bgcolor: "#EBD1D1" }}>
            <div className="py-2">
              <p className="text-center font-semibold">TZS 4,713,000</p>
              <p className="text-center text-sm">Total Loaned Amount</p>
            </div>
          </Card>
        </Box>
        <Box>
          <Card sx={{ width: 200, bgcolor: "#EBD1D1" }}>
            <div className="py-2">
              <p className="text-center font-semibold">TZS 2,605,000</p>
              <p className="text-center text-sm">Total Returned Amount</p>
            </div>
          </Card>
        </Box>
        <Box>
          <Card sx={{ width: 200, bgcolor: "#EBD1D1" }}>
            <div className="py-2">
              <p className="text-center font-semibold">TZS 3,495,000</p>
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
            { dataKey: "london", label: "Total Salaries", color: "#EBD1D1" },
          ]}
          {...chartSetting}
        />
      </div>
    </div>
  );
};

export default Home;
