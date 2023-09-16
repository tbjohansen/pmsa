import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import {  Modal, Table } from "antd";
import {
  addEmployeesLoans,
  selectEmployeeLoans,
} from "../../features/employeeSlice";
import toast from "react-hot-toast";
import { RemoveRedEye } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { IconButton } from "@mui/material";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <>{text}</>,
  },
  {
    title: "Type",
    dataIndex: "typeName",
    key: "typeName",
    render: (text) => <p className="capitalize">{text}</p>,
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <p className="capitalize">{text}</p>,
  },
  {
    title: "Asset Number",
    dataIndex: "assetNumber",
    key: "assetNumber",
    render: (text) => <p className="">{text}</p>,
  },
  {
    title: "Assigned Date",
    dataIndex: "assignedDate",
    key: "assignedDate",
    render: (text) => <p className="">{text}</p>,
  },
  {
    title: "Assignee",
    dataIndex: "assignee",
    key: "assignee",
    render: (text) => <p className="">{text}</p>,
  },
  {
    title: "Returned date",
    dataIndex: "returnedDate",
    key: "returnedDate",
    render: (text) => <p className="">{text}</p>,
  },
  {
    title: "Actions",
    key: "action",
    render: (_, asset) => (
      <p className="flex flex-row gap-1 justify-start">
        {/* <EditEmployee employee={employee} /> */}
        <ViewAsset asset={asset} />
      </p>
    ),
  },
];

const ViewAsset = ({ asset }) => {

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
            Asset Description
          </h4>
          <div className="text-sm py-1">
            <p>{asset?.description}</p>
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
