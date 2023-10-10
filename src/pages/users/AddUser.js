import React, { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../../App";
import {
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { addRoles, selectRoles } from "../../features/settingSlice";
import { addUsers } from "../../features/userSlice";
import toast from 'react-hot-toast';

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  // boxShadow: 24,
  p: 4,
};


const AddUser = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [fullName, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const functions = getFunctions();

  useEffect(() => {
    const getRoles = async () => {
      let rolesArray = [];

      const querySnapshot = await getDocs(collection(db, "roles"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        rolesArray.push(data);
      });

      if (rolesArray.length > 0) {
        dispatch(addRoles(rolesArray));
      }
    };

    getRoles();
  }, [dispatch]);

  const getUsers = async () => {
    let usersArray = [];

    const querySnapshot = await getDocs(collection(db, "userBucket"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      usersArray.push(data);
    });

    if (usersArray.length > 0) {
      dispatch(addUsers(usersArray));
    }
  };

  const roles = useSelector(selectRoles);

  const sortedRoles = roles.map((role) => ({
    id: role.id,
    label: role.name,
  }));

  const roleOnChange = (e, value) => {
    setRole(value);
  };

  const userRegistration = async (e) => {
    e.preventDefault();

    if (!fullName) {
      toast.error("Please enter full name");
    } else if (!email) {
      toast.error("Please enter email");
    } else if (!role) {
      toast.error("Please select role");
    } else {
      //start registration
      setLoading(true);

      const created_at = Timestamp.fromDate(new Date());

      //create user
      const addUser = httpsCallable(functions, "createNewUser");
      addUser({ email, role: role?.label, roleID: role?.id, fullName, created_at})
        .then((result) => {
          // Read result of the Cloud Function.
          const data = result.data;
          setLoading(false);
          setName("");
          setEmail("");
          setRole("");

          toast.success(data.message);
          //fetch users
          getUsers();
        })
        .catch((error) => {
          // Getting the Error details.
          // const code = error.code;
          const message = error.message;
          // const details = error.details;
          setLoading(false);
          toast.error(message);
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
            onClick={(e) => userRegistration(e)}
          >
            SAVE USER
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
        <Add className="mt-2 py-0.5" /> <p className="py-2">Create New User</p>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Add New User</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Name"
                  variant="outlined"
                  className="w-[82%]"
                  value={fullName}
                  onChange={(e) => setName(e.target.value)}
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
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedRoles}
                  size="small"
                  className="w-[40%]"
                  value={role}
                  onChange={roleOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select user role" />
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

export default AddUser;
