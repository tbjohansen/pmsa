import React, { useState } from "react";
import { db } from "../../App";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Add from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Button, MenuItem } from "@mui/material";
import { useDispatch } from "react-redux";
import {
  addAdditionalInfo,
  addEmployeesDetails,
} from "../../features/employeeSlice";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { async } from "@firebase/util";

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  p: 4,
};

const AddEmployeeSalary = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [amount, setAmount] = useState("");
  const [paymentMode, setPayment] = useState("");
  const [socialSecurity, setSocial] = useState("");
  const [ssn, setSSN] = useState("");
  const [paye, setPaye] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { employeeID } = useParams();

  const getEmployeeDetails = async () => {
    const docRef = doc(
      db,
      "users",
      "employees",
      employeeID,
      "public",
      "account",
      "info"
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      dispatch(addEmployeesDetails(data));
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  const employeeSalaryRegistration = async (e) => {
    e.preventDefault();

    if (!amount) {
      toast.error("Please enter salary amount");
    } else if (!paymentMode) {
      toast.error("Please select salary payment mode");
    } else if (!socialSecurity) {
      toast.error("Please select social security status");
    } else {
      //initialize mid and end salary
      let midMonthSalary = 0;
      let endMonthSalary = 0;
      let midMonthNetSalary = 0;
      let endMonthNetSalary = 0;

      if (socialSecurity == 2) {
        if (!ssn) {
          toast.error("Please enter NSSF number");
        } else if (!paye) {
          toast.error("Please enter possible PAYE amount");
        } else {
          //start registration
          setLoading(true);

          const nssfAmount = parseInt(amount) / 10;
          const deductionAmount = parseInt(paye) + nssfAmount;
          const netSalary = parseInt(amount) - deductionAmount;

          if (paymentMode == 2) {
            midMonthSalary = parseInt(amount) / 2;
            endMonthSalary = parseInt(amount) / 2;
            midMonthNetSalary = netSalary / 2;
            endMonthNetSalary = netSalary / 2;
          } else {
            midMonthSalary = 0;
            endMonthSalary = parseInt(amount);
            midMonthNetSalary = 0;
            endMonthNetSalary = netSalary;
          }

          const dataRef = doc(
            db,
            "users",
            "employees",
            employeeID,
            "public",
            "account",
            "info"
          );
          await setDoc(
            dataRef,
            {
              salary: parseInt(amount),
              paymentMode: parseInt(paymentMode),
              socialSecurity: true,
              ssn,
              nssfAmount,
              deductionAmount,
              midMonthSalary,
              endMonthSalary,
              midMonthNetSalary,
              endMonthNetSalary,
              netSalary,
              loan: 0,
              paye: parseInt(paye),
            },
            { merge: true }
          )
            .then(async () => {
              //update salary on bucket
              // updateEmployeeBucket({
              //   salary: parseInt(amount),
              //   paye: parseInt(paye),
              //   paymentMode: parseInt(paymentMode),
              //   socialSecurity: true,
              //   ssn,
              //   nssfAmount,
              //   deductionAmount,
              //   netSalary,
              // });
              const dataRef = doc(
                collection(db, "employeesBucket", employeeID)
              );
              await updateDoc(dataRef, {
                salary: parseInt(amount),
                paye: parseInt(paye),
                paymentMode: parseInt(paymentMode),
                socialSecurity: true,
                ssn,
                netSalary,
                deductionAmount,
                nssfAmount,
                loan: 0,
                updated_at: Timestamp.fromDate(new Date()),
              })
                .then(() => {
                  //
                  setAmount("");
                  setPayment("");
                  setSocial("");
                  setSSN("");
                  setPaye("");
                  getEmployeeDetails();
                  toast.success("Salary info are saved successfully");
                  setLoading(false);
                })
                .catch((error) => {
                  setLoading(false);
                  console.log("Error creating new employee:", error);
                  toast.error(error.message);
                });
            })
            .catch((error) => {
              // console.error("Error removing document: ", error.message);
              toast.error(error.message);
              setLoading(false);
            });
        }
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
          "info"
        );
        await setDoc(
          dataRef,
          {
            salary: parseInt(amount),
            ssn: "",
            paye: 0,
            paymentMode: parseInt(paymentMode),
            socialSecurity: false,
            nssfAmount: 0,
            deductionAmount: 0,
            midMonthSalary,
            endMonthSalary,
            midMonthNetSalary,
            endMonthNetSalary,
            loan: 0,
            netSalary: parseInt(amount),
          },
          { merge: true }
        )
          .then(async () => {
            //update salary on bucket
            // updateEmployeeBucket({
            //   salary: parseInt(amount),
            //   paye: 0,
            //   paymentMode: parseInt(paymentMode),
            //   socialSecurity: false,
            //   ssn: "",
            //   nssfAmount: 0,
            //   deductionAmount: 0,
            //   netSalary: parseInt(amount),
            // });

            const dataRef = doc(collection(db, "employeesBucket", employeeID));
            await updateDoc(dataRef, {
              salary: parseInt(amount),
              paye: 0,
              paymentMode: parseInt(paymentMode),
              socialSecurity: false,
              ssn: "",
              nssfAmount: 0,
              deductionAmount: 0,
              netSalary: parseInt(amount),
              loan: 0,
              updated_at: Timestamp.fromDate(new Date()),
            })
              .then(() => {
                //
                setAmount("");
                setPayment("");
                setSocial("");
                setSSN("");
                setPaye("");
                getEmployeeDetails();
                toast.success("Salary info are saved successfully");
                setLoading(false);
              })
              .catch((error) => {
                setLoading(false);
                console.log("Error creating new employee:", error);
                toast.error(error.message);
              });
          })
          .catch((error) => {
            // console.error("Error removing document: ", error.message);
            toast.error(error.message);
            setLoading(false);
          });
      }
    }
  };

  // const updateEmployeeBucket = async ({
  //   salary,
  //   paye,
  //   paymentMode,
  //   socialSecurity,
  //   ssn,
  //   netSalary,
  //   deductionAmount,
  //   nssfAmount,
  // }) => {
  //   const dataRef = doc(collection(db, "employeesBucket", employeeID));
  //   await updateDoc(dataRef, {
  //     salary,
  //     paye,
  //     paymentMode,
  //     socialSecurity,
  //     ssn,
  //     netSalary,
  //     deductionAmount,
  //     nssfAmount,
  //     loan: 0,
  //     updated_at: Timestamp.fromDate(new Date()),
  //   })
  //     .then(() => {
  //       //
  //       setAmount("");
  //       setPayment("");
  //       setSocial("");
  //       setSSN("");
  //       setPaye("");
  //       getEmployeeDetails();
  //       toast.success("Salary info are saved successfully");
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       setLoading(false);
  //       console.log("Error creating new employee:", error);
  //       toast.error(error.message);
  //     });
  // };

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
            onClick={(e) => employeeSalaryRegistration(e)}
          >
            SAVE SALARY DETAILS
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
            <h3 className="text-center text-xl py-4">
              Add Employee Salary Details
            </h3>
            <div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Salary Amount"
                  variant="outlined"
                  className="w-[40%]"
                  type={"number"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <TextField
                  size="small"
                  id="outlined-select-currency"
                  select
                  label="Payment Mode"
                  className="w-[40%]"
                  value={paymentMode}
                  onChange={(e) => setPayment(e.target.value)}
                >
                  <MenuItem value={1}>Once (30th end of the month)</MenuItem>
                  <MenuItem value={2}>Twice (15th and 30th)</MenuItem>
                </TextField>
              </div>
              <div className="w-full py-2 flex flex-row gap-2 justify-center">
                <TextField
                  size="small"
                  id="outlined-select-currency"
                  select
                  label="NSSF"
                  className="w-[82%]"
                  value={socialSecurity}
                  onChange={(e) => setSocial(e.target.value)}
                >
                  <MenuItem value={1}>No</MenuItem>
                  <MenuItem value={2}>Yes</MenuItem>
                </TextField>
              </div>
              {socialSecurity == 2 ? (
                <div className="w-full py-2 flex flex-row gap-2 justify-center">
                  <TextField
                    size="small"
                    id="outlined-basic"
                    label="NSSF Number"
                    variant="outlined"
                    className="w-[40%]"
                    value={ssn}
                    onChange={(e) => setSSN(e.target.value)}
                  />
                  <TextField
                    id="outlined-basic"
                    label="Possible PAYE Amount"
                    size="small"
                    variant="outlined"
                    className="w-[40%]"
                    type={"number"}
                    value={paye}
                    onChange={(e) => setPaye(e.target.value)}
                  />
                </div>
              ) : null}
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

export default AddEmployeeSalary;
