import React, { useEffect, useState } from "react";
import { auth, db } from "../../App";
import {
  collection,
  doc,
  getDocs,
  Timestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { Autocomplete, Button, IconButton, MenuItem } from "@mui/material";
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
  top: "48%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  bgcolor: "background.paper",
  //   boxShadow: 24,
  p: 4,
};

const EditLoan = ({ loan }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [employee, setEmployee] = useState({
    id: loan?.employeeID,
    label: `${loan?.employeeFirstName} ${loan?.employeeMiddleName} ${loan?.employeeLastName} (${loan?.employeeDesignation})`,
    data: {
      id: loan?.employeeID,
      firstName: loan?.employeeFirstName,
      middleName: loan?.employeeMiddleName,
      lastName: loan?.employeeLastName,
      designation: loan?.employeeDesignation,
      paymentMode: loan?.employeePaymentMode,
      salary: loan?.employeeSalary,
    },
  });
  const [amount, setAmount] = useState(loan?.amount);
  const [date, setDate] = useState(moment(loan?.date));
  const [deductionTime, setDeductionTime] = useState(loan?.deductionTime);
  const [deduction, setDeduction] = useState(loan?.deductionAmount);
  const [deductionAmount, setDeductionAmount] = useState(
    formatter.format(loan?.deductionAmount)
  );
  const [salaryDeduction, setSalaryDeduction] = useState(loan?.salaryDeduction);
  const [midMonthDeduction, setMidDeduction] = useState(
    loan?.midMonthDeduction
  );
  const [endMonthDeduction, setEndDeduction] = useState(
    loan?.endMonthDeduction
  );
  const [description, setDescription] = useState(loan?.description);
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

  const getSalaryDeductionDetails = () => {
    if (salaryDeduction && deduction) {
      //check if salary deduction is mid, end or both
      const half = parseInt(deduction) / 2;
      if (salaryDeduction == 1) {
        //mid month salary only
        setMidDeduction(deduction);
        setEndDeduction(0);
      } else if (salaryDeduction == 3) {
        //both mid and end
        setMidDeduction(half);
        setEndDeduction(half);
      } else {
        //end month salary only
        setMidDeduction(0);
        setEndDeduction(deduction);
      }
    }
  };

  useEffect(() => {
    getSalaryDeductionDetails();
  }, [salaryDeduction, deduction]);

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
      toast.error("Please select employee");
    } else if (!amount) {
      toast.error("Please enter loan amount");
    } else if (!date) {
      toast.error("Please select date");
    } else if (!deductionTime) {
      toast.error("Please enter deduction months");
    } else if (!deduction) {
      toast.error("Please enter deduction amount");
    } else if (employee?.data?.paymentMode == 2 && !salaryDeduction) {
      toast.error("Please select salary for deduction");
    } else {
      //start registration
      setLoading(true);
      //check if employee has salary details
      if (employee?.data?.salary) {
        try {
          // Add a new document with a generated id
          const dataRef = doc(db, "loans", loan?.id);
          await updateDoc(dataRef, {
            employeeID: employee?.data?.id,
            employeeFirstName: employee?.data?.firstName,
            employeeMiddleName: employee?.data?.middleName,
            employeeLastName: employee?.data?.lastName,
            employeeDesignation: employee?.data?.designation,
            employeePaymentMode: employee?.data?.paymentMode,
            employeeSalary: employee?.data?.salary,
            date: Timestamp.fromDate(new Date(date)),
            amount: parseInt(amount),
            deductionMonths: deductionTime,
            deductionAmount: parseInt(deduction),
            midMonthDeduction: parseInt(midMonthDeduction),
            endMonthDeduction: parseInt(endMonthDeduction),
            description,
            id: dataRef.id,
            paid: false,
            paidAmount: 0,
            debt: parseInt(amount),
            updated_at: Timestamp.fromDate(new Date()),
          })
            .then(() => {
              setLoanToEmployee({ loanID: loan.id });
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
      } else {
        toast.error("Sorry! Add employee salary details first to proceed");
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
      await updateDoc(dataRef, {
        employeeID: employee?.data?.id,
        employeeFirstName: employee?.data?.firstName,
        employeeMiddleName: employee?.data?.middleName,
        employeeLastName: employee?.data?.lastName,
        employeeDesignation: employee?.data?.designation,
        employeePaymentMode: employee?.data?.paymentMode,
        employeeSalary: employee?.data?.salary,
        date: Timestamp.fromDate(new Date(date)),
        amount: parseInt(amount),
        deductionMonths: deductionTime,
        deductionAmount: parseInt(deduction),
        midMonthDeduction: parseInt(midMonthDeduction),
        endMonthDeduction: parseInt(endMonthDeduction),
        description,
        loanID,
        paid: false,
        paidAmount: 0,
        debt: parseInt(amount),
        updated_at: Timestamp.fromDate(new Date()),
      })
        .then(() => {
          updateEmployeeSalaryDetails({
            employeeID: employee?.id,
            deductionAmount: parseInt(deduction),
            loanAmount: parseInt(amount),
            midDeduction: parseInt(midMonthDeduction),
            endDeduction: parseInt(endMonthDeduction),
            salaryDeduction,
          });
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

  const updateEmployeeSalaryDetails = async ({
    employeeID,
    deductionAmount,
    loanAmount,
    midDeduction,
    endDeduction,
    salaryDeduction,
  }) => {
    //find loan difference
    const amountDiff = loanAmount - loan.amount;
    const deductionDiff = deductionAmount - loan.deductionAmount;
    const midDeductionDiff = midDeduction - loan.midMonthDeduction;
    const endDeductionDiff = endDeduction - loan.endMonthDeduction;

    const dataRef = doc(
      db,
      "users",
      "employees",
      employeeID,
      "public",
      "account",
      "info"
    );
    await updateDoc(dataRef, {
      loan: increment(amountDiff),
      loanStatus: true,
      loanDeduction: increment(deductionDiff),
      salaryToDeductLoan: salaryDeduction,
      netSalary: increment(-deductionDiff),
      midMonthNetSalary: increment(-midDeductionDiff),
      endMonthNetSalary: increment(-endDeductionDiff),
      updated_at: Timestamp.fromDate(new Date()),
    })
      .then(async () => {
        //update loan details on employee on bucket
        const dataRef = doc(collection(db, "employeesBucket", employeeID));
        await updateDoc(dataRef, {
          loan: increment(amountDiff),
          loanStatus: true,
          loanDeduction: increment(deductionDiff),
          salaryToDeductLoan: salaryDeduction,
          netSalary: increment(-deductionDiff),
          midMonthNetSalary: increment(-midDeductionDiff),
          endMonthNetSalary: increment(-endDeductionDiff),
          updated_at: Timestamp.fromDate(new Date()),
        })
          .then(() => {
            //
            checkDeductionEligibility({
              employeeID,
              deductionAmount: deductionDiff,
              loanAmount: amountDiff,
              midDeduction: midDeductionDiff,
              endDeduction: endDeductionDiff,
              salaryDeduction,
            });
          })
          .catch((error) => {
            setLoading(false);
            toast.error(error.message);
          });
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
        setLoading(false);
      });
  };

  const checkDeductionEligibility = async ({
    employeeID,
    deductionAmount,
    loanAmount,
    midDeduction,
    endDeduction,
    salaryDeduction,
    employee,
  }) => {
    if (employee.payment === "end") {
      //write into next month salary
      updateEmployeeSalaryPath({
        employeeID,
        deductionAmount,
        loanAmount,
        midDeduction,
        endDeduction,
        salaryDeduction,
      });
    } else {
      if (employee.payment === "half") {
        //write deduction to current month end salary
        updateEmployeeSalaryPath({
          employeeID,
          deductionAmount,
          loanAmount,
          midDeduction,
          endDeduction,
          salaryDeduction,
        });
      } else {
        updateEmployeeSalaryPath({
          employeeID,
          deductionAmount,
          loanAmount,
          midDeduction,
          endDeduction,
          salaryDeduction,
        });
      }
    }
  };

  const updateEmployeeSalaryPath = async ({
    employeeID,
    deductionAmount,
    loanAmount,
    midDeduction,
    endDeduction,
    salaryDeduction,
  }) => {
    //update loan details on employee on bucket
    //check if mid month or end month salaries are paid
    const dataRef = doc(collection(db, "salary", "year", "month", employeeID));
    await updateDoc(dataRef, {
      loan: increment(loanAmount),
      loanStatus: true,
      loanDeduction: increment(deductionAmount),
      salaryToDeductLoan: salaryDeduction,
      netSalary: increment(-deductionAmount),
      midMonthNetSalary: increment(-midDeduction),
      endMonthNetSalary: increment(-endDeduction),
      midMonthLoanDeduction: increment(midDeduction),
      endMonthLoanDeduction: increment(endDeduction),
      updated_at: Timestamp.fromDate(new Date()),
    })
      .then(() => {
        //
        getLoans();

        toast.success("Employee loan is updated successfully");
      })
      .catch((error) => {
        setLoading(false);
        toast.error(error.message);
      });
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
              {employee?.data?.paymentMode == 2 ? (
                <div className="w-full py-2 flex justify-center">
                  <TextField
                    id="outlined-select-currency"
                    size="small"
                    select
                    label="Select Salary For Deduction"
                    variant="outlined"
                    className="w-[92%]"
                    value={salaryDeduction}
                    onChange={(e) => setSalaryDeduction(e.target.value)}
                  >
                    <MenuItem value={1}>Mid of the month salary</MenuItem>
                    <MenuItem value={2}>End of the month salary</MenuItem>
                    <MenuItem value={3}>Both mid and end of the month</MenuItem>
                  </TextField>
                </div>
              ) : null}
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
