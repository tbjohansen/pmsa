import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { auth, db } from "../../App";
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
import { message } from "antd";
import {
  addDesignations,
  addRoles,
  selectDesignations,
  selectRoles,
} from "../../features/settingSlice";
import { addUsers } from "../../features/userSlice";
import { addEmployees } from "../../features/employeeSlice";

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
      message.warning("Please enter first name");
    } else if (!lastName) {
      message.warning("Please enter last name");
    } else if (!gender) {
      message.warning("Please select gender");
    } else if (!phone) {
      message.warning("Please enter phone number");
    } else if (!desgnations) {
      message.warning("Please select designation");
    } else {
      //start registration
      setLoading(true);
      await setDoc(doc(db, "employeesBucket", "id"), {
        firstName,
        middleName,
        lastName,
        gender,
        email,
        phone,
        designation: designation?.label,
        designationID: designation?.id,
        employeeID: "id",
        status: true,
        created_at: Timestamp.fromDate(new Date()),
      })
        .then((employee) => {
          //
          addEmployeeToPath(employee.id);
        })
        .catch((error) => {
          setLoading(false);
          console.log("Error creating new employee:", error);
        });
    }
  };

  const addEmployeeToPath = async (id) => {
    // Add a new document with a generated id
    await setDoc(doc(db, "users", "employees", id, "public"), {
        firstName,
        middleName,
        lastName,
        gender,
        email,
        phone,
        designation: designation?.label,
        designationID: designation?.id,
        employeeID: id,
        status: true,
        created_at: Timestamp.fromDate(new Date()),
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
        message.success("Employee is saved successfully");
        setLoading(false);
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        message.error(error.message);
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
        <Add className="mt-2 py-0.5" /> <p className="py-2">Add New Employee</p>
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
                  className="w-[40%]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
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
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-select-currency"
                  select
                  label="Gender"
                  className="w-[40%]"
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
                  className="w-[40%]"
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
