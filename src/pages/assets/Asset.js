import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../App";
import { Modal, Tag } from "antd";
import {
  addAssetDetails,
  addAssetHistory,
  selectAssetsDetails,
} from "../../features/assetSlice";
import { Cancel, CheckCircle, RemoveRedEye } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import AssetHistory from "./AssetHistory";
import { toast } from "react-hot-toast";
import AssignAsset from "./AssignAsset";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const formatter = new Intl.NumberFormat("en-US");

const Asset = () => {
  const dispatch = useDispatch();
  const { assetID } = useParams();

  const [value, setValue] = useState(0);
  const [activeLoading, setActiveLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getAssetDetails = async () => {
    const docRef = doc(db, "assetsBucket", assetID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      dispatch(addAssetDetails(data));
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  useEffect(() => {
    const getAssetHistory = async () => {
      let assetArray = [];

      const querySnapshot = await getDocs(
        collection(db, "assets", assetID, "assignments")
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
    getAssetDetails();
  }, [dispatch]);

  const assetDetails = useSelector(selectAssetsDetails);

  const handleActiveStatus = async (status) => {
    //start registration
    setActiveLoading(true);
    try {
      // Add a new document with a generated id
      const dataRef = doc(db, "assetsBucket", assetID);
      await updateDoc(dataRef, {
        active: !status,
        updated_at: Timestamp.fromDate(new Date()),
      })
        .then(() => {
          getAssetDetails();
          toast.success("Asset active status is changed successfully");
          setActiveLoading(false);
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          toast.error(error.message);
          setActiveLoading(false);
        });
    } catch (error) {
      // console.error(error);
      toast.error(error.message);
      setActiveLoading(false);
    }
  };

  const handleReturnAssset = async (asset) => {
    setReturnLoading(true);

    try {
      // Add a new document with a generated id
      const dataRef = doc(
        db,
        "assets",
        assetID,
        "assigned",
        asset?.assetRefID
      );
      await updateDoc(dataRef, {
        returned: true,
        returnDate: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date()),
      })
        .then(async () => {
          // update employee asset path
          const assetRef = doc(
            db,
            "users",
            "employees",
            asset?.employeeID,
            "public",
            "assets",
            asset?.employeeRefID
          );
          await updateDoc(assetRef, {
            returned: true,
            returnDate: Timestamp.fromDate(new Date()),
            updated_at: Timestamp.fromDate(new Date()),
          })
            .then(() => {
              // update asset bucket
              updateAssetBucket();
            })
            .catch((error) => {
              // console.error("Error removing document: ", error.message);
              toast.error(error.message);
              setReturnLoading(false);
            });
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          toast.error(error.message);
          setReturnLoading(false);
        });
    } catch (error) {
      toast.error(error.message);
      setReturnLoading(false);
    }
  };

  const updateAssetBucket = async () => {
    //
    const dataRef = doc(db, "assetsBucket", assetID);
    await updateDoc(dataRef, {
      assigned: false,
      status: "available",
      updated_at: Timestamp.fromDate(new Date()),
    })
      .then(() => {
        // update employee asset path
        getAssetDetails();
        toast.success("Asset is returned successfully");
        setReturnLoading(false);
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
        setReturnLoading(false);
      });
  };

  const renderDescription = (description) => {
    return (
      <>
        <IconButton onClick={showModal} className="text-sm">
          <RemoveRedEye fontSize="small" />
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
            <p>{description}</p>
          </div>
        </Modal>
      </>
    );
  };

  return (
    <div className="px-4">
      <div className="w-[100%] h-[30%] rounded-lg bg-[#fcf8f8]">
        <div className="flex flex-row justify-between py-2 px-4">
          <div className="w-[50%] rounded-md h-10 flex flex-row gap-1 text-lg"></div>
          <div className="w-[50%] bg-white rounded-md h-10 flex flex-row justify-between gap-1">
            <div>
              {assetDetails ? (
                <p className="py-2 px-1">
                  {assetDetails?.active ? (
                    <span className="flex flex-row gap-2">
                      <CheckCircle className="text-xl text-green-500" />{" "}
                      <span className="">Active</span>
                    </span>
                  ) : (
                    <span className="flex flex-row gap-2">
                      <Cancel className="text-xl text-red-500" />{" "}
                      <span className="">Deactivated</span>
                    </span>
                  )}
                </p>
              ) : null}
            </div>
            <div>
              {assetDetails ? (
                <p className="py-1 px-1 text-xl">
                  {assetDetails?.status === "available" ? (
                    <Tag color={"blue"}>Available</Tag>
                  ) : (
                    <>
                      <Tag color={"green"}>Assigned</Tag>
                    </>
                  )}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between ">
          <div className="w-[65%] flex flex-row gap-2">
            <div className="w-[15%] my-8 px-2">
              <div className="flex flex-row justify-center rounded-full bg-zinc-200 w-20 h-20"></div>
            </div>
            <div className="w-[85%] px-2 my-4">
              <div className="flex flex-row gap-2 py-1">
                <p className="w-[30%]">Asset Type:</p>
                <p className="w-[70%] capitalize">{assetDetails?.typeName}</p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p className="w-[30%]">Asset Name:</p>
                <p className="w-[70%] capitalize">{assetDetails?.name}</p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p className="w-[30%]">Asset ID:</p>
                <p className="w-[70%]">{assetDetails?.assetNumber}</p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p className="w-[30%]">Asset Cost:</p>
                <p className="w-[70%]">
                  TZS {formatter.format(assetDetails?.cost || 0)}
                </p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p className="w-[30%]">Description:</p>
                <p className="w-[70%]">
                  {renderDescription(assetDetails?.description)}
                </p>
              </div>
            </div>
          </div>
          <div className="w-[35%] px-4 py-4">
            <div className="py-2">
              {activeLoading ? (
                <button
                  type="button"
                  className="px-6 py-2 w-full cursor-not-allowed opacity-25 border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
                >
                  Loading ...
                </button>
              ) : (
                <button
                  type="button"
                  className="px-6 py-2 w-full border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
                  onClick={() => handleActiveStatus(assetDetails?.active)}
                >
                  {assetDetails?.active ? (
                    <>Deactivate Asset</>
                  ) : (
                    <>Activate Asset</>
                  )}
                </button>
              )}
            </div>
            <div className="py-2">
              {assetDetails ? (
                <>
                  {" "}
                  {assetDetails?.status === "available" ? (
                    <AssignAsset asset={assetDetails} />
                  ) : (
                    <>
                      {returnLoading ? (
                        <button
                          type="button"
                          className="px-6 py-2 w-full cursor-not-allowed opacity-25 border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
                        >
                          Loading ...
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="px-6 py-2 w-full border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
                          onClick={() => handleReturnAssset(assetDetails)}
                        >
                          Return Asset
                        </button>
                      )}
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f2e1e1" }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="ASSIGNED HISTORY" {...a11yProps(0)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <AssetHistory />
        </CustomTabPanel>
      </Box>
    </div>
  );
};

export default Asset;
