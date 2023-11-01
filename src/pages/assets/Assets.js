import React, { useEffect } from "react";
import { db } from "../../App";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Popconfirm, Switch, Table, Tag } from "antd";
import toast from "react-hot-toast";
import { addAssetDetails, addAssets, selectAssets } from "../../features/assetSlice";
import AddAsset from "./AddAsset";
import EditAsset from "./EditAsset";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { RemoveRedEye } from "@mui/icons-material";

const formatter = new Intl.NumberFormat("en-US");

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <>{text}</>,
  },
  {
    title: "Asset Type",
    dataIndex: "typeName",
    key: "typeName",
    render: (text) => <>{text}</>,
  },
  {
    title: "Asset Name",
    dataIndex: "name",
    key: "name",
    render: (text) => <>{text}</>,
  },
  {
    title: "Asset Number",
    dataIndex: "assetNumber",
    key: "assetNumber",
  },
  {
    title: "Costs",
    dataIndex: "cost",
    key: "cost",
    render: (text) => <p>TZS {formatter.format(text)}</p>,
  },
  {
    title: "Active",
    key: "active",
    render: (_, asset) => (
      <>
        <AssetStatus asset={asset} />
      </>
    ),
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
    render: (_, { status }) => (
      <>
        {status === "available" ? (
          <Tag color={"blue"}>Available</Tag>
        ) : (
          <Tag color={"green"}>Assigned</Tag>
        )}
      </>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, asset) => (
      <p className="flex flex-row gap-1 justify-start">
        <EditAsset asset={asset} />
        <ViewAsset asset={asset} />
      </p>
    ),
  },
];

const ViewAsset = ({ asset }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleViewAsset = () => {
    dispatch(addAssetDetails(asset));
    navigate(`/assets/${asset?.id}`);
  };

  return (
    <p className="mt-1">
      <IconButton onClick={() => handleViewAsset()}>
        <RemoveRedEye className="text-red-500 text-xl cursor-pointer" />
      </IconButton>
    </p>
  );
};

const AssetStatus = ({ asset }) => {
  const dispatch = useDispatch();

  const getAssets = async () => {
    let assetsArray = [];

    const querySnapshot = await getDocs(collection(db, "assetsBucket"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      assetsArray.push(data);
    });

    if (assetsArray.length > 0) {
      dispatch(addAssets(assetsArray));
    }
  };

  const changeStatus = async () => {
    await updateDoc(doc(db, "assetsBucket", asset?.id), {
      status: !asset.active,
    })
      .then(() => {
        toast.success(
          `Asset is ${asset?.active ? "deactivated" : "activated"} successfully`
        );
        getAssets();
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
      });
  };

  return (
    <Popconfirm
      title="Change Status"
      description={`Are you sure you want to ${
        asset?.active ? "deactivate" : "activate"
      } this asset?`}
      okText="Yes"
      cancelText="No"
      okButtonProps={{
        className: "bg-blue-500",
      }}
      onConfirm={changeStatus}
    >
      <Switch
        checked={asset?.active}
        className={asset?.active ? null : `bg-zinc-300 rounded-full`}
      />
    </Popconfirm>
  );
};

const Assets = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getAssets = async () => {
      let assetsArray = [];

      const querySnapshot = await getDocs(collection(db, "assetsBucket"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        assetsArray.push(data);
      });

      if (assetsArray.length > 0) {
        dispatch(addAssets(assetsArray));
      }
    };

    getAssets();
  }, [dispatch]);

  const assets = useSelector(selectAssets);

  const assetsList = assets.slice().sort((a, b) => b.created_at - a.created_at);
  const sortedAssets = assetsList.map((asset, index) => {
    const key = index + 1;
    return { ...asset, key };
  });

  return (
    <div className="px-2">
      <div className="flex flex-row justify-end">
        <AddAsset />
      </div>
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedAssets}
          size="middle"
          pagination={{ defaultPageSize: 10, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default Assets;
