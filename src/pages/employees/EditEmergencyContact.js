import React, { useState } from "react";
import { db } from "../../App";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { addAdditionalInfo } from "../../features/employeeSlice";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { Edit } from "@mui/icons-material";

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  //   boxShadow: 24,
  p: 4,
};

const EditEmergencyContacts = ({ info }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [name, setName] = useState(info?.contactName2);
  const [relation, setRelation] = useState({
    id: info?.relation2,
    label: info?.relation2,
  });
  const [address, setAddress] = useState(info?.address2);
  const [phone, setPhone] = useState(info?.phone2);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { employeeID } = useParams();

  const getEmployeeInfo = async () => {
    const docRef = doc(
      db,
      "users",
      "employees",
      employeeID,
      "public",
      "account",
      "additionalInfo"
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      dispatch(addAdditionalInfo(data));
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  const sortedRelations = [
    { id: "father", label: "Father" },
    { id: "mother", label: "Mother" },
    { id: "brother", label: "Brother" },
    { id: "sister", label: "Sister" },
    { id: "uncle", label: "Uncle" },
    { id: "aunt", label: "Aunt" },
    { id: "husband", label: "Husband" },
    { id: "wife", label: "Wife" },
  ];

  const relationOnChange = (e, value) => {
    setRelation(value);
  };

  const employeeRegistration = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Please enter full name");
    } else if (!address) {
      toast.error("Please enter address");
    } else if (!relation) {
      toast.error("Please select relation");
    } else if (!phone) {
      toast.error("Please enter phone number");
    } else {
      //start registration
      setLoading(true);

      const dataRef = doc(
        db,
        "users",
        "employees",
        employeeID,
        "public",
        "account",
        "additionalInfo"
      );
      await updateDoc(dataRef, {
        contactName2: name,
        relation2: relation?.id,
        address2: address,
        phone2: phone,
      })
        .then(() => {
          setName("");
          setRelation("");
          setAddress("");
          setPhone("");
          getEmployeeInfo();
          toast.success("Emergency contact is updated successfully");
          setLoading(false);
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          toast.error(error.message);
          setLoading(false);
        });
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
            onClick={(e) => employeeRegistration(e)}
          >
            EDIT EMERGENCY CONTACT
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <div
        onClick={handleOpen}
        className="h-8 w-8 bg-zinc-300 cursor-pointer rounded-full flex flex-row gap-1 justify-center"
      >
        <Edit className="my-1" />
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Edit Emergency Contact</h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Full Name"
                  variant="outlined"
                  className="w-[82%]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  id="outlined-basic"
                  label="Phone Number"
                  size="small"
                  type="number"
                  variant="outlined"
                  className="w-[40%]"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedRelations}
                  size="small"
                  className="w-[40%]"
                  value={relation}
                  onChange={relationOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Relation" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  id="outlined-basic"
                  label="Address"
                  size="small"
                  variant="outlined"
                  className="w-[82%]"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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

export default EditEmergencyContacts;
