import React, { useEffect, useState } from "react";
import { auth, db } from "../../App";
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
import { Autocomplete, Button, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { addLoans } from "../../features/loanSlice";
import moment from "moment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { addEmployees, selectEmployees } from "../../features/employeeSlice";
import { isNumber } from "lodash";
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

const EditLoan = ({loan}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [employee, setEmployee] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(null);
  const [deductionTime, setDeductionTime] = useState("");
  const [deduction, setDeduction] = useState(0);
  const [deductionAmount, setDeductionAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const user = auth.currentUser;
  const uid = user?.uid;

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

  let formatter = new Intl.NumberFormat("en-uS");

  const getTotal = () => {
    if (amount && deductionTime) {
      let total = amount / deductionTime;
      console.log(total);
      setDeduction(total);
      if (isNumber(total)) {
        setDeductionAmount(formatter.format(total));
      }
    }
  };

  useEffect(() => {
    getTotal();
  }, [amount, deductionTime]);

  const employees = useSelector(selectEmployees);
  const sortedEmployees = employees.map((employee) => ({
    id: employee.id,
    label: `${employee.firstName} ${employee.middleName} ${employee.lastName} (${employee.designation})`,
    data: employee,
  }));

  const employeeOnChange = (e, value) => {
    // console.log(value);
    setEmployee(value);
  };

  const getLoans = async () => {
    let loansArray = [];

    const querySnapshot = await getDocs(collection(db, "loans"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      loansArray.push(data);
    });

    if (loansArray.length > 0) {
      dispatch(addLoans(loansArray));
    }
  };

  const loanRegistration = async (e) => {
    e.preventDefault();

    if (!employee) {
      toast.warning("Please select employee");
    } else if (!amount) {
      toast.warning("Please enter loan amount");
    } else if (!date) {
      toast.warning("Please select date");
    } else if (!deductionTime) {
      toast.warning("Please enter deduction months");
    } else if (!deduction) {
      toast.warning("Please enter deduction amount");
    } else {
      //start registration
      setLoading(true);
      try {
        // Add a new document with a generated id
        const dataRef = doc(collection(db, "loans"));
        await setDoc(dataRef, {
          employeeID: employee?.data?.id,
          employeeName: `${employee.data.firstName} ${employee.data.middleName} ${employee.data.lastName}`,
          employeeDesignation: employee?.data?.designation,
          date: Timestamp.fromDate(new Date(date)),
          amount: parseInt(amount),
          deductionMonths: deductionTime,
          deductionAmount: parseInt(deduction),
          description,
          id: dataRef.id,
          paid: false,
          paidAmount: 0,
          debt: 0,
          created_at: Timestamp.fromDate(new Date()),
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            setLoanToEmployee({ loanID: dataRef.id });
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

  const setLoanToEmployee = async ({ loanID }) => {
    try {
      // Add a new document with a generated id
      const dataRef = doc(
        db,
        "users",
        "employees",
        employee?.data?.id,
        "public",
        "loans",
        loanID
      );
      await setDoc(dataRef, {
        employeeID: employee?.data?.id,
        employeeName: `${employee.data.firstName} ${employee.data.middleName} ${employee.data.lastName}`,
        employeeDesignation: employee?.data?.designation,
        date: Timestamp.fromDate(new Date(date)),
        amount: parseInt(amount),
        deductionMonths: deductionTime,
        deductionAmount: parseInt(deduction),
        description,
        loanID,
        paid: false,
        paidAmount: 0,
        debt: 0,
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date()),
      })
        .then(() => {
          setEmployee("");
          setAmount("");
          setDate(null);
          setDeductionTime("");
          setDeduction(0);
          setDeductionAmount("");
          setDescription("");

          getLoans();
        })
        .catch((error) => {
          // console.error("Error removing document: ", error.message);
          toast.error(error.message);
          setLoading(false);
        });
    } catch (error) {
      console.log(error.message);
    }
  };

  const renderButton = () => {
    if (loading) {
      return (
        <>
          <Button
            size="large"
            variant="contained"
            className="w-[92%] cursor-not-allowed"
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
            className="w-[92%]"
            onClick={(e) => loanRegistration(e)}
          >
            EDIT EMPLOYEE LOAN
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
            <h3 className="text-center text-xl py-4">Edit Employee Loan</h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <Autocomplete
                  id="combo-box-demo"
                  options={sortedEmployees}
                  size="small"
                  className="w-[92%]"
                  value={employee}
                  onChange={employeeOnChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Employee" />
                  )}
                />
              </div>
              <div className="w-full py-2 flex justify-center gap-2">
                <TextField
                  size="large"
                  id="outlined-basic"
                  label="Amount"
                  variant="outlined"
                  className="w-[45%]"
                  type={"number"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <LocalizationProvider
                  dateAdapter={AdapterMoment}
                  dateLibInstance={moment.utc}
                >
                  <DatePicker
                    label="Select date"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    className="w-[45%]"
                  />
                </LocalizationProvider>
              </div>
              <div className="w-full py-2 flex justify-center gap-2">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Loan Period"
                  variant="outlined"
                  className="w-[45%]"
                  type={"number"}
                  value={deductionTime}
                  onChange={(e) => setDeductionTime(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Deduction Amount"
                  variant="outlined"
                  className="w-[45%]"
                  value={deductionAmount}
                  onChange={(e) => setDeduction(e.target.value)}
                />
              </div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  id="outlined-multiline-static"
                  label="Description"
                  multiline
                  rows={2}
                  variant="outlined"
                  className="w-[92%]"
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

export default EditLoan;
