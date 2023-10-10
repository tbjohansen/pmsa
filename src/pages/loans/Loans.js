import React, { useEffect } from "react";
import { db } from "../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { RemoveRedEye } from "@mui/icons-material";
import AddLoan from "./AddLoan";
import {
  addLoanDetails,
  addLoans,
  selectLoans,
} from "../../features/loanSlice";
import moment from "moment";
import EditLoan from "./EditLoan";

const formatter = new Intl.NumberFormat("en-US");

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <>{text}</>,
  },
  {
    title: "Employee",
    key: "employee",
    render: (_, loan) => (
      <>
        <p>{`${loan?.employeeFirstName} ${loan?.employeeMiddleName} ${loan?.employeeLastName}`}</p>
        <p className="capitalize">{loan?.employeeDesignation}</p>
      </>
    ),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (text) => <>TZS {formatter.format(text)}</>,
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (date) => <>{moment.unix(date?.seconds).format("DD-MM-YYYY")}</>,
  },
  {
    title: "Period",
    dataIndex: "deductionMonths",
    key: "deductionMonths",
    render: (text) => <>{text} Months</>,
  },
  {
    title: "Monthly Deduction",
    dataIndex: "deductionAmount",
    key: "deductionAmount",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Debt",
    key: "debt",
    dataIndex: "debt",
    render: (_, { debt }) => (
      <>
        {debt == 0 ? (
          <Tag color={"green"}>Paid</Tag>
        ) : (
          <p>TZS {formatter.format(debt)}</p>
        )}
      </>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, loan) => (
      <p className="flex flex-row gap-1 justify-start">
        <EditLoan loan={loan} />
        <ViewLoan loan={loan} />
      </p>
    ),
  },
];

const ViewLoan = ({ loan }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleViewLoan = () => {
    dispatch(addLoanDetails(loan));
    navigate(`/loans/${loan?.id}`);
  };

  return (
    <p className="mt-1">
      <IconButton onClick={() => handleViewLoan()}>
        <RemoveRedEye className="text-red-500 text-xl cursor-pointer" />
      </IconButton>
    </p>
  );
};

const Loans = () => {
  const dispatch = useDispatch();

  useEffect(() => {
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

    getLoans();
  }, [dispatch]);

  const loans = useSelector(selectLoans);

  const loansList = loans.slice().sort((a, b) => b.created_at - a.created_at);
  const sortedLoans = loansList.map((loan, index) => {
    const key = index + 1;
    return { ...loan, key };
  });

  return (
    <div className="px-2">
      <div className="flex flex-row justify-end">
        <AddLoan />
      </div>
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedLoans}
          size="middle"
          pagination={{ defaultPageSize: 6, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default Loans;
