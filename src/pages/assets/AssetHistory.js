import React, { useEffect, useState } from "react";
import { db } from "../../App";
import { collection, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Table } from "antd";
import { RemoveRedEye } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { IconButton } from "@mui/material";
import { addAssetHistory, selectAssetHistory } from "../../features/assetSlice";
import moment from "moment";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <>{text}</>,
  },
  {
    title: "Employee",
    key: "name",
    render: (_, asset) => (
      <>
        <p>{asset?.employeeName}</p>
        <p className="capitalize">{asset?.employeeDesignation}</p>
      </>
    ),
  },
  {
    title: "Assignor",
    key: "assignor",
    dataIndex: "assignor",
    render: (assignor) => (
      <>
        <p>{assignor?.name}</p>
        <p className="capitalize">{assignor?.role}</p>
      </>
    ),
  },
  {
    title: "Assigned Date",
    dataIndex: "assignedDate",
    key: "assignedDate",
    render: (date) => <p>{moment.unix(date?.seconds).format("DD-MM-YYYY")}</p>,
  },
  {
    title: "Returned date",
    key: "returnedDate",
    render: (_, asset) => (
      <>
        {asset?.returned ? (
          <p>{moment(asset?.returnedDate).format("DD-MM-YYY")}</p>
        ) : (
          <p>In Possession</p>
        )}
      </>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, asset) => (
      <p className="flex flex-row gap-1 justify-start">
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
        <h4 className="text-lg font-semibold text-center pb-2">Description</h4>
        <div className="text-sm py-1">
          <p>{asset?.description}</p>
        </div>
      </Modal>
    </p>
  );
};

const AssetHistory = () => {
  const dispatch = useDispatch();
  const { assetID } = useParams();

  useEffect(() => {
    const getAssetHistory = async () => {
      let assetArray = [];

      const querySnapshot = await getDocs(
        collection(db, "assets", assetID, "assigned")
      );
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        assetArray.push(data);
      });

      if (assetArray.length > 0) {
        dispatch(addAssetHistory(assetArray));
      }
    };

    getAssetHistory();
  }, [dispatch]);

  const assets = useSelector(selectAssetHistory);

  const assetList = assets.slice().sort((a, b) => b.created_at - a.created_at);
  const sortedAssets = assetList.map((asset, index) => {
    const key = index + 1;
    return { ...asset, key };
  });

  return (
    <div className="">
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedAssets}
          size="middle"
          pagination={{ defaultPageSize: 6, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default AssetHistory;
