import React, { useState } from "react";
import { db } from "../../App";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import Box from "@mui/material/Box";
import Edit from "@mui/icons-material/Edit";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button, IconButton } from "@mui/material";
import { useDispatch } from "react-redux";
import { message } from "antd";
import { addAssetTypes } from "../../features/settingSlice";

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

const EditAssetType = ({ assetType }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [typeName, setName] = useState(assetType?.typeName);
  const [description, setDescription] = useState(assetType?.description);
  const [loading, setLoading] = useState(false);

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

  const assetTypeRegistration = async (e) => {
    e.preventDefault();

    if (!typeName) {
      message.warning("Please enter type name");
    } else {
      //start registration
      setLoading(true);
      try {
        const dataRef = doc(db, "assetTypes", assetType?.id);

        //
        await updateDoc(dataRef, {
          typeName,
          description,
        })
          .then(() => {
            message.success("Asset type is updated successfully");
            getAssetTypes();
            setLoading(false);
          })
          .catch((error) => {
            // console.error("Error removing document: ", error.message);
            message.error(error.message);
            setLoading(false);
          });
      } catch (error) {
        message.error(error.message);
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
            className="w-[82%] cursor-not-allowed"
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
            className="w-[82%]"
            onClick={(e) => assetTypeRegistration(e)}
          >
            EDIT ASSET TYPE
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <IconButton onClick={handleOpen} className="flex justify-center">
        <Edit className="text-red-500 text-xl cursor-pointer" />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Edit Asset Type</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Type Name"
                  variant="outlined"
                  className="w-[82%]"
                  value={typeName}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  id="outlined-multiline-static"
                  label="Description"
                  multiline
                  rows={2}
                  variant="outlined"
                  className="w-[82%]"
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

export default EditAssetType;
