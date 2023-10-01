import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import {  Modal, Table, Tag } from "antd";
import {
  addEmployeesLoans,
  selectEmployeeLoans,
} from "../../features/employeeSlice";
import { RemoveRedEye } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { IconButton } from "@mui/material";
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
        <ViewLoan loan={loan} />
      </p>
    ),
  },
];

const ViewLoan = ({ loan }) => {

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
            Loan Description
          </h4>
          <div className="text-sm py-1">
            <p>{loan?.description}</p>
          </div>
        </Modal>
    </p>
  );
};


const EmployeeLoans = () => {
  const dispatch = useDispatch();
  const {employeeID} = useParams();

  useEffect(() => {
    const getEmployeeLoans = async () => {
      let loansArray = [];

      const querySnapshot = await getDocs(collection(db, "users", "employees", employeeID, "public", "loans"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        loansArray.push(data);
      });

      if (loansArray.length > 0) {
        dispatch(addEmployeesLoans(loansArray));
      } else {
        dispatch(addEmployeesLoans([]));
      }
    };

    getEmployeeLoans();
  }, [dispatch]);

  const loans = useSelector(selectEmployeeLoans);

  const loanList = loans
    .slice()
    .sort((a, b) => b.created_at - a.created_at);
  const sortedLoans = loanList.map((asset, index) => {
    const key = index + 1;
    return { ...asset, key };
  });

  return (
    <div className="px-2">
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

export default EmployeeLoans;
