import React, { useEffect } from "react";
import { db } from "../../App";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "antd";
import { useParams } from "react-router-dom";
import {
  addLoanPayments,
  selectLoanPayments,
} from "../../features/loanSlice";
import moment from "moment";

const formatter = new Intl.NumberFormat("en-US");

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <>{text}</>,
  },
  {
    title: "Paid Amount",
    key: "amount",
    render: (_, payment) => (
      <>
        <p>{formatter.format(payment?.paidAmout || 0)}</p>
      </>
    ),
  },
  {
    title: "Deducted Salary",
    key: "salary",
    render: (_, payment) => (
      <>
        <p>
          {moment().month(payment?.month).format("MMMM")} {payment?.year}
        </p>
      </>
    ),
  },
  {
    title: "Date",
    key: "date",
    render: (_, payment) => (
      <>
        <p>{moment(payment?.created_at).format("DD-MM-YYYY")}</p>
      </>
    ),
  },
];

const PaymentHistory = () => {
  const dispatch = useDispatch();
  const { loanID } = useParams();

  useEffect(() => {
    const getPayments = async () => {
      let loansArray = [];

      const q = query(
        collection(db, "loanPayments"),
        where("loanID", "==", loanID)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        loansArray.push(data);
      });

      if (loansArray.length > 0) {
        dispatch(addLoanPayments(loansArray));
      }
    };

    getPayments();
  }, [dispatch]);

  const loans = useSelector(selectLoanPayments);

  const loansList = loans.slice().sort((a, b) => b.created_at - a.created_at);
  const sortedLoans = loansList.map((loan, index) => {
    const key = index + 1;
    return { ...loan, key };
  });

  return (
    <div className="">
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedLoans}
          size="middle"
          pagination={{ defaultPageSize: 10, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default PaymentHistory;
