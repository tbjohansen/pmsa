import React, { useState } from "react";
import { Table } from "antd";
import { useSelector } from "react-redux";
import { selectPayroll } from "../../features/payrollSlice";
import moment from "moment";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DownloadForOfflineOutlined } from "@mui/icons-material";
import { MenuItem, TextField } from "@mui/material";

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
        <p>{payroll?.employeeName}</p>
        <p>{payroll?.designation}</p>
      </>
    ),
  },
  {
    title: "Paid Salary",
    key: "amount",
    render: (_, payroll) => (
      <>
        <p>TZS {formatter.format(payroll?.amount || 0)}</p>
      </>
    ),
  },
  {
    title: "Payment Mode",
    key: "paymentMethod",
    render: (_, payroll) => (
      <>
        <p className="capitalize">{payroll?.paymentMethod}</p>
      </>
    ),
  },
  {
    title: "Payment Number",
    key: "paymentNumber",
    render: (_, payroll) => (
      <>
        <p>
          {payroll?.bankAccount ? (
            <span>{payroll.bankAccount}</span>
          ) : (
            <>{payroll?.mobile ? <span>{payroll.mobile}</span> : null}</>
          )}
        </p>
      </>
    ),
  },
  {
    title: "Payment Date",
    key: "date",
    render: (_, payroll) => (
      <p>{moment.unix(payroll?.created_at?.seconds).format("DD-MM-YYYY")}</p>
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
    (sum, employee) => sum + employee.amount,
    0
  );

  const generatePDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Create a header row
    const headerRow = [
      "No",
      "Employee Name",
      "Designation",
      "Amount",
      "Mode",
      "Number",
      "Date",
    ];

    // Create an array to hold all the data rows
    const dataRows = [];

    // Iterate through the employees and create data rows for each one
    for (const employee of employees) {
      const dataRow = [
        employee.key,
        employee.employeeName,
        employee.designation,
        formatter.format(employee.amount),
        employee.paymentMethod,
        employee?.bankAccount || employee?.mobile,
        moment.unix(employee?.created_at?.seconds).format("DD-MM-YYYY"),
      ];
      dataRows.push(dataRow);
    }

    // Combine the header and data rows into the employeeData array
    const employeeData = [headerRow, ...dataRows];

    // Set document properties
    doc.setFontSize(16);

    // Add the heading
    doc.text(
      `PAID SALARIES AS THE END OF ${month.toUpperCase()} ${year}`,
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
      `Total Paid Amount: TZS ${formatter.format(totalNetSalary)}`,
      130,
      doc.autoTable.previous.finalY + 10
    );

    // Save the PDF
    doc.save(`Paid Salaries End Of ${month} ${year}.pdf`);
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

const EndMonthTransactions = ({ label, yearValue }) => {

  const [role, setRole] = useState("");

  const employees = useSelector(selectPayroll);
  const midMonthEmployees = employees.filter(
    (employee) => employee.payment == "full"
  );
  const employeesList = midMonthEmployees
    .slice()
    .sort((a, b) => b.created_at - a.created_at);
  const sortedEmployees = employeesList.map((employee, index) => {
    const key = index + 1;
    return { ...employee, key };
  });

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

export default EndMonthTransactions;
