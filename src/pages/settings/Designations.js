import React, { useEffect } from "react";
import { db } from "../../App";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Button, message, Popconfirm, Table } from "antd";
import Delete from "@mui/icons-material/Delete";
import AddDesignation from "./AddDesignation";
import EditDesignation from "./EditDesignation";
import {
  addDesignations,
  selectDesignations,
} from "../../features/settingSlice";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <>{text}</>,
  },
  {
    title: "Designation Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    render: (text) => <>{text}</>,
  },
  {
    title: "Actions",
    key: "action",
    render: (_, designation) => (
      <p className="flex flex-row gap-1 justify-start">
        <EditDesignation designation={designation} />
        <DeleteDesignation designation={designation} />
      </p>
    ),
  },
];

const DeleteDesignation = ({ designation }) => {
  const dispatch = useDispatch();

  const getDesignations = async () => {
    let designationsArray = [];

    const querySnapshot = await getDocs(collection(db, "designations"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      designationsArray.push(data);
    });

    if (designationsArray.length > 0) {
      dispatch(addDesignations(designationsArray));
    }
  };

  const confirmDelete = async () => {
    //delete designation
    try {
      const dataRef = doc(db, "designations", designation?.id);

      await deleteDoc(dataRef)
        .then(() => {
          message.success("Designation is deleted successful");
          getDesignations();
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          message.error(error.message);
        });
    } catch (error) {
      // console.log(error);
      message.error(error.message);
    }
  };

  return (
    <Popconfirm
      title="Delete Designation"
      description="Are you sure to delete this designation?"
      okText="Yes"
      cancelText="No"
      onConfirm={() => confirmDelete()}
    >
      <Button type="text" shape="circle" className="flex justify-center mt-1">
        <Delete className="text-red-500 text-xl cursor-pointer" />
      </Button>
    </Popconfirm>
  );
};

const Designations = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getDesignations = async () => {
      let designationsArray = [];

      const querySnapshot = await getDocs(collection(db, "designations"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        designationsArray.push(data);
      });

      if (designationsArray.length > 0) {
        dispatch(addDesignations(designationsArray));
      }
    };

    getDesignations();
  }, [dispatch]);

  const designations = useSelector(selectDesignations);

  const allDesignations = designations
    .slice()
    .sort((a, b) => b.created_at - a.created_at);
  const sortedDesignations = allDesignations.map((designation, index) => {
    const key = index + 1;
    return { ...designation, key };
  });

  return (
    <div className="px-2">
      <div className="flex flex-row justify-end">
        <AddDesignation />
      </div>
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedDesignations}
          size="middle"
          pagination={{ defaultPageSize: 6, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default Designations;
