import React, { useEffect, useState } from "react";
import { auth, db } from "../../App";
import {
  collection,
  setDoc,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { addAssets } from "../../features/assetSlice";
import { addEmployees, selectEmployees } from "../../features/employeeSlice";
import { useParams } from "react-router-dom";

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  // boxShadow: 24,
  p: 4,
};

const AssignAsset = ({ asset }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [employee, setEmployee] = useState("");
  const [assignedDate, setDate] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { assetID } = useParams();

  const user = auth.currentUser;
  const uid = user?.uid;
  const displayName = user?.displayName;

  useEffect(() => {
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

    getEmployees();
  }, [dispatch]);

  const employees = useSelector(selectEmployees);
  const sortedEmployees = employees.map((employee) => ({
    id: employee.id,
    label: `${employee.firstName} ${employee.middleName} ${employee.lastName} (${employee.designation})`,
    data: employee,
  }));

  const employeeOnChange = (e, value) => {
    // console.log(value);
    setEmployee(value.data);
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

    if (!employee) {
      toast.warning("Please select employee");
    } else if (!assignedDate) {
      toast.warning("Please select assigned date");
    } else {
      //start registration
      setLoading(true);
      try {
        // Add a new document with a generated id
        const dataRef = doc(
          collection(db, "users", "employees", employee?.id, "public", "assets")
        );
        await setDoc(dataRef, {
          employeeID: employee?.id,
          employeeName: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
          employeeDesignation: employee?.designation,
          assignedDate,
          assignorName: displayName,
          assignorID: uid,
          assetID,
          assetName: asset?.name,
          assetNumber: asset?.assetNumber,
          description,
          id: dataRef.id,
          created_at: Timestamp.fromDate(new Date()),
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            setAssignedAssetToPath();

            setEmployee("");
            setDate("");
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

  const setAssignedAssetToPath = async () => {
    //
    const dataRef = doc(collection(db, "assets", assetID, "assigned"));
    await setDoc(dataRef, {
      employeeID: employee?.id,
      employeeName: `${employee.firstName} ${employee.middleName} ${employee.lastName}`,
      employeeDesignation: employee?.designation,
      assignedDate,
      assignorName: displayName,
      assignorID: uid,
      assetID,
      assetName: asset?.name,
      assetNumber: asset?.assetNumber,
      description,
      id: dataRef.id,
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date()),
    })
      .then(() => {
        updateAssignedAssetPath();
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
        setLoading(false);
      });
  };

  const updateAssignedAssetPath = async () => {
    //
    const dataRef = doc(db, "assetsBucket", assetID);
    await updateDoc(dataRef, {
      assigned: true,
      status: "assigned",
      updated_at: Timestamp.fromDate(new Date()),
    })
      .then(() => {
        setEmployee("");
        setDate("");
        setDescription("");
        getAssets();
        toast.success("Asset is assgned to employee successfully");
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
            onClick={(e) => assetRegistration(e)}
          >
            ASSIGN ASSET
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <button
        type="button"
        className="px-6 py-2 w-full border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
        onClick={handleOpen}
      >
        Assign Asset
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">Assign An Asset</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedEmployees}
                  size="large"
                  className="w-[100%]"
                  value={employee}
                  onChange={employeeOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select employee" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <LocalizationProvider
                  dateAdapter={AdapterMoment}
                  className="w-[100%]"
                >
                  <DatePicker
                    value={assignedDate}
                    onChange={(newValue) => setDate(newValue)}
                  />
                </LocalizationProvider>
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

export default AssignAsset;
