import React, { useEffect, useState } from "react";
import { db } from "../../App";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button, MenuItem } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  addDesignations,
  selectDesignations,
} from "../../features/settingSlice";
import { addEmployees } from "../../features/employeeSlice";
import toast from 'react-hot-toast';

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const AddEmployee = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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

  const desgnations = useSelector(selectDesignations);

  const sortedDesignation = desgnations.map((designation) => ({
    id: designation.id,
    label: designation.name,
  }));

  const designationOnChange = (e, value) => {
    setDesignation(value);
  };

  const employeeRegistration = async (e) => {
    e.preventDefault();

    if (!firstName) {
      toast.error("Please enter first name");
    } else if (!lastName) {
      toast.error("Please enter last name");
    } else if (!gender) {
      toast.error("Please select gender");
    } else if (!phone) {
      toast.error("Please enter phone number");
    } else if (!desgnations) {
      toast.error("Please select designation");
    } else {
      //start registration
      setLoading(true);
      //employee number
      const employeeNumber = "EMP-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      const dataRef = doc(collection(db, "employeesBucket"));
      await setDoc(dataRef, {
        firstName,
        middleName,
        lastName,
        gender,
        email,
        phone,
        employeeNumber,
        designation: designation?.label,
        designationID: designation?.id,
        id: dataRef.id,
        status: true,
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date()),
      })
        .then(() => {
          //
          addEmployeeToPath({id: dataRef.id, employeeNumber});
        })
        .catch((error) => {
          setLoading(false);
          console.log("Error creating new employee:", error);
          toast.error(error.message);
        });
    }
  };

  const addEmployeeToPath = async ({id, employeeNumber}) => {
    //
    const dataRef = doc(db, "users", "employees", id, "public", "account", "info");
    await setDoc(dataRef, {
        firstName,
        middleName,
        lastName,
        gender,
        email,
        phone,
        employeeNumber,
        designation: designation?.label,
        designationID: designation?.id,
        id: id,
        status: true,
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date()),
    })
      .then(() => {
        setFirstName("");
        setMiddleName("");
        setLastName("");
        setGender("");
        setPhone("");
        setEmail("");
        setDesignation("");
        getEmployees();
        toast.success("Employee is saved successfully");
        setLoading(false);
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
        setLoading(false);
      });
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
            onClick={(e) => employeeRegistration(e)}
          >
            SAVE EMPLOYEE
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
        <Add className="mt-2 py-0.5" /> <p className="py-2">Add Employee</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New Employee</h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="First Name"
                  variant="outlined"
                  className="w-[82%]"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Middle Name"
                  variant="outlined"
                  className="w-[82%]"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Last Name"
                  variant="outlined"
                  className="w-[82%]"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  id="outlined-basic"
                  label="Email"
                  size="small"
                  variant="outlined"
                  className="w-[82%]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  id="outlined-basic"
                  label="Phone Number"
                  size="small"
                  type="number"
                  variant="outlined"
                  className="w-[82%]"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-select-currency"
                  select
                  label="Gender"
                  className="w-[82%]"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <MenuItem value={"female"}>Female</MenuItem>
                  <MenuItem value={"male"}>Male</MenuItem>
                </TextField>
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedDesignation}
                  size="small"
                  className="w-[82%]"
                  value={designation}
                  onChange={designationOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Designation" />
                  )}
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

export default AddEmployee;
