import React, { useEffect } from "react";
import { db } from "../../App";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Button, Popconfirm, Table } from "antd";
import Delete from "@mui/icons-material/Delete";
import { addAssetTypes, selectAssetTypes } from "../../features/settingSlice";
import AddAssetType from "./AddAssetType";
import EditAssetType from "./EditAssetType";
import { toast } from "react-hot-toast";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <>{text}</>,
  },
  {
    title: "Type Name",
    dataIndex: "typeName",
    key: "typeName",
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
    render: (_, assetType) => (
      <p className="flex flex-row gap-1 justify-start">
        <EditAssetType assetType={assetType} />
        <DeleteAssetType assetType={assetType} />
      </p>
    ),
  },
];

const DeleteAssetType = ({ assetType }) => {
  const dispatch = useDispatch();

  const getAssetTypes = async () => {
    let typesArray = [];

    const querySnapshot = await getDocs(collection(db, "assetTypes"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      typesArray.push(data);
    });

    if (typesArray.length > 0) {
      dispatch(addAssetTypes(typesArray));
    }
  };

  const confirmDelete = async () => {
    //delete designation
    try {
      const dataRef = doc(db, "assetTypes", assetType?.id);

      await deleteDoc(dataRef)
        .then(() => {
          toast.success("Asset type is deleted successful");
          getAssetTypes();
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          toast.error(error.message);
        });
    } catch (error) {
      // console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <Popconfirm
      title="Delete Designation"
      description="Are you sure to delete this asset type?"
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

const AssetTypes = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getTypes = async () => {
      let typesArray = [];

      const querySnapshot = await getDocs(collection(db, "assetTypes"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        typesArray.push(data);
      });

      if (typesArray.length > 0) {
        dispatch(addAssetTypes(typesArray));
      }
    };

    getTypes();
  }, [dispatch]);

  const assetTypes = useSelector(selectAssetTypes);

  const allAssettypes = assetTypes
    .slice()
    .sort((a, b) => b.created_at - a.created_at);
  const sortedTypes = allAssettypes.map((asset, index) => {
    const key = index + 1;
    return { ...asset, key };
  });

  return (
    <div className="px-2">
      <div className="flex flex-row justify-end">
        <AddAssetType />
      </div>
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedTypes}
          size="middle"
          pagination={{ defaultPageSize: 6, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default AssetTypes;
