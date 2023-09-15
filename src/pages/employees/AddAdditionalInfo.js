import React, { useState } from "react";
import { db } from "../../App";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button, MenuItem } from "@mui/material";
import { useDispatch } from "react-redux";
import { addEmployees } from "../../features/employeeSlice";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

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

const AddAdditionalInfo = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [passport, setPassport] = useState("");
  const [bankName, setBank] = useState("");
  const [bankAccount, setAccount] = useState("");
  const [ssn, setSSN] = useState("");
  const [maritalStatus, setMarital] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { employeeID } = useParams();

  const getEmployees = async () => {
    let employeesArray = [];

    const querySnapshot = await getDocs(collection(db, "employeesBucket"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      employeesArray.push(data);
    });

    if (employeesArray.length > 0) {
      dispatch(addEmployees(employeesArray));
    }
  };

  const employeeRegistration = async (e) => {
    e.preventDefault();

    if (!maritalStatus) {
      toast.warning("Please select marital status");
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
      await setDoc(dataRef, {
        passport,
        bankName,
        bankAccount,
        ssn,
        maritalStatus,
      })
        .then(() => {
          setPassport("");
          setBank("");
          setAccount("");
          setSSN("");
          setMarital("");
          getEmployees();
          toast.success("Additional info are saved successfully");
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
            SAVE ADDITIONAL INFO
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
        <Add className="my-1" />
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add Additional Info</h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Passport"
                  variant="outlined"
                  className="w-[82%]"
                  value={passport}
                  onChange={(e) => setPassport(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  id="outlined-basic"
                  label="Bank Name"
                  size="small"
                  variant="outlined"
                  className="w-[40%]"
                  value={bankName}
                  onChange={(e) => setBank(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Bank Account"
                  variant="outlined"
                  className="w-[40%]"
                  value={bankAccount}
                  onChange={(e) => setAccount(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  id="outlined-basic"
                  label="SSN"
                  size="small"
                  variant="outlined"
                  className="w-[40%]"
                  value={ssn}
                  onChange={(e) => setSSN(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-select-currency"
                  select
                  label="Marital Status"
                  className="w-[40%]"
                  value={maritalStatus}
                  onChange={(e) => setMarital(e.target.value)}
                >
                  <MenuItem value={"single"}>Single</MenuItem>
                  <MenuItem value={"married"}>Married</MenuItem>
                </TextField>
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

export default AddAdditionalInfo;
