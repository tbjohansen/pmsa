import React, { useEffect, useState } from "react";
import { db } from "../../App";
import {
  collection,
  setDoc,
  doc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addAssetTypes, selectAssetTypes } from "../../features/settingSlice";
import { addAssets } from "../../features/assetSlice";

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddAsset = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [assetType, setAssetType] = useState("");
  const [assetName, setAssetName] = useState("");
  const [assetNumber, setAssetNumber] = useState("");
  const [assetAmount, setAssetAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

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

  const types = useSelector(selectAssetTypes);
  const sortedTypes = types.map((assetType) => ({
    id: assetType.id,
    label: assetType.typeName,
  }));

  const assetTypeOnChange = (e, value) => {
    setAssetType(value);
  };

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

  const assetRegistration = async (e) => {
    e.preventDefault();

    if (!assetType) {
      toast.error("Please select asset type");
    } else if (!assetName) {
      toast.error("Please add asset name");
    } else if (!assetNumber) {
      toast.error("Please add asset number");
    } else if (!assetAmount) {
      toast.error("Please add asset cost");
    } else {
      //start registration
      setLoading(true);
      try {
        // Add a new document with a generated id
        const dataRef = doc(collection(db, "assetsBucket"));
        await setDoc(dataRef, {
          typeName: assetType?.label,
          typeID: assetType?.id,
          name: assetName,
          cost: assetAmount,
          assetNumber,
          description,
          id: dataRef.id,
          assigned: false,
          active: true,
          status: "available",
          created_at: Timestamp.fromDate(new Date()),
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            setAssetName("");
            setAssetNumber("");
            setAssetType("");
            setAssetAmount("");
            setDescription("");
            getAssets();
            toast.success("Asset is saved successfully");
            setLoading(false);
          })
          .catch((error) => {
            // console.error("Error removing document: ", error.message);
            toast.error(error.message);
            setLoading(false);
          });
      } catch (error) {
        toast.error(error.message);
        setLoading(false);
      }
    }
  };

  const renderButton = () => {
    if (loading) {
      return (
        <>
          <Button
            size="large"
            variant="contained"
            className="w-[100%] cursor-not-allowed"
            disabled
          >
            <svg
              className="animate-spin h-5 w-5 mr-3 ..."
              viewBox="0 0 24 24"
            ></svg>
            Loading...
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button
            size="large"
            variant="contained"
            className="w-[100%]"
            onClick={(e) => assetRegistration(e)}
          >
            SAVE ASSET
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-10 w-44 bg-blue-300 cursor-pointer rounded-full flex flex-row gap-1 justify-center text-white"
      >
        <Add className="mt-2 py-0.5" /> <p className="py-2">Add Asset</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add Asset Details</h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedTypes}
                  size="small"
                  className="w-[82%]"
                  value={assetType}
                  onChange={assetTypeOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select asset type" />
                  )}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Asset Name"
                  variant="outlined"
                  className="w-[82%]"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Asset Number"
                  variant="outlined"
                  className="w-[82%]"
                  value={assetNumber}
                  onChange={(e) => setAssetNumber(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Asset Cost"
                  variant="outlined"
                  className="w-[82%]"
                  value={assetAmount}
                  type={"number"}
                  onChange={(e) => setAssetAmount(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  id="outlined-multiline-static"
                  label="Description"
                  multiline
                  rows={2}
                  variant="outlined"
                  className="w-[100%]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="w-full py-2 pt-3 flex justify-center">
                {renderButton()}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AddAsset;
