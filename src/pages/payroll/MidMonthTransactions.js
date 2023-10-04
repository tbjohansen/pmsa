import React from "react";
import { Table } from "antd";
import { useSelector } from "react-redux";
import { selectSalaries } from "../../features/payrollSlice";

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
        <p>{formatter.format(payroll?.salary || 0)}</p>
      </>
    ),
  },
  {
    title: "Deductions",
    key: "deductions",
    render: (_, payroll) => (
      <>
        <p>{formatter.format(payroll?.deductionAmount || 0)}</p>
      </>
    ),
  },
  {
    title: "Net Salary",
    key: "netSalary",
    render: (_, payroll) => (
      <>
        <p>{formatter.format(payroll?.netSalary || 0)}</p>
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

const MidSalary = ({ payroll }) => {
  const salary = payroll.netSalary / 2;
  return <p>{formatter.format(salary || 0)}</p>;
};

const PaymentStatus = ({ payroll }) => {};

const MidMonthTransactions = () => {
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
      <Table
        columns={columns}
        dataSource={sortedEmployees}
        size="middle"
        pagination={{ defaultPageSize: 10, size: "middle" }}
      />
    </div>
  );
};

export default MidMonthTransactions;
