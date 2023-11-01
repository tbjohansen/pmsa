import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Table } from "antd";
import { useParams } from "react-router-dom";
import { addLoanDetails, addLoanPayments, selectLoanDetails, selectLoanPayments } from "../../features/loanSlice";
import moment from "moment";
import { IconButton } from "@mui/material";
import { DownloadForOfflineOutlined, RemoveRedEye } from "@mui/icons-material";
import { isEmpty } from "lodash";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
        <p>{formatter.format(payment?.paidAmount || 0)}</p>
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
  {
    title: "Description",
    key: "description",
    render: (_, payment) => (
      <p className="flex flex-row gap-1 justify-start">
        <ViewDescription payment={payment} />
      </p>
    ),
  },
];

const ViewDescription = ({ payment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <p className="mt-1">
      <IconButton onClick={() => showModal()} className="cursor-pointer">
        <RemoveRedEye className="text-red-500 text-lg" />
      </IconButton>
      <Modal
        title=""
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{
          className: "hidden",
        }}
        cancelButtonProps={{
          className: "hidden",
        }}
        width={600}
      >
        <h4 className="text-lg font-semibold text-center pb-2">
          Loan Payment Description
        </h4>
        <div className="text-sm py-1">
          <p>{payment?.description}</p>
        </div>
      </Modal>
    </p>
  );
};

const LoanPaymentsPDF = ({ payments, loan }) => {
  const totalPaidAmount = payments.reduce(
    (sum, payment) => sum + payment.paidAmount,
    0
  );

  const name = `${loan?.firstName.toUpperCase()} ${loan?.lastName.toUpperCase()}`;
  const debt = loan?.debt;

  const generatePDF = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Create a header row
    const headerRow = [
      "No",
      "Paid Amount",
      "Month",
      "Year",
      "Description",
    ];

    // Create an array to hold all the data rows
    const dataRows = [];

    // Iterate through the employees and create data rows for each one
    for (const payment of payment) {
      const dataRow = [
        payment.key,
        formatter.format(payment.paidAmount),
        moment().month(payment?.month).format("MMMM"),
        payment.year,
        payment?.description
      ];
      dataRows.push(dataRow);
    }

    // Combine the header and data rows into the employeeData array
    const paymentData = [headerRow, ...dataRows];

    // Set document properties
    doc.setFontSize(16);

    // Add the heading
    doc.text(
      `${name} LOAN PAYMENT AS OF ${moment().format("DD-MM-YYYY")}`,
      50,
      10
    );

    doc.setFontSize(12);

    // Add employee table
    doc.autoTable({
      head: paymentData.slice(0, 1), // Header row
      body: paymentData.slice(1), // Employee data
      startY: 20, // Position to start the table
    });

    // Add total payroll on the right-hand side
    doc.text(
      `Total Paid Amount: TZS ${formatter.format(totalPaidAmount)}`,
      130,
      doc.autoTable.previous.finalY + 10
    );

    doc.text(
      `Debt Amount: TZS ${formatter.format(debt)}`,
      130,
      doc.autoTable.previous.finalY + 20
    );

    // Save the PDF
    doc.save(`Loan payments as ${moment().format("DD/MM/YYYY")}.pdf`);
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

    const getLoanDetails = async () => {
      const docRef = doc(db, "loans", loanID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        dispatch(addLoanDetails(data));
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        dispatch(addLoanDetails({}));
      } 
    }

    getPayments();
    getLoanDetails();
  }, [dispatch]);

  const loans = useSelector(selectLoanPayments);
  const loan = useSelector(selectLoanDetails);

  const loansList = loans.slice().sort((a, b) => b.created_at - a.created_at);
  const sortedLoans = loansList.map((loan, index) => {
    const key = index + 1;
    return { ...loan, key };
  });

  return (
    <div className="">
      <div className="py-2">
        {sortedLoans.length > 0  && !isEmpty(loan) ? (
          <div className="flex flex-row justify-between">
            <div className="w-[80%]"></div>
            <div className="w-[20%] text-sm">
              <LoanPaymentsPDF
                payments={sortedLoans}
                loan={loan}
              />
            </div>
          </div>
        ) : null}
      </div>
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
