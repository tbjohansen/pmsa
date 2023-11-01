import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../App";
import { Modal, Tag } from "antd";
import { RemoveRedEye } from "@mui/icons-material";
import { Button, IconButton, TextField } from "@mui/material";
import { toast } from "react-hot-toast";
import {
  addLoanDetails,
  addLoanPayments,
  selectLoanDetails,
} from "../../features/loanSlice";
import PaymentHistory from "./PaymentHistory";
import moment from "moment";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

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

const formatter = new Intl.NumberFormat("en-US");

const ClearLoanDebt = async () => {
  const dispatch = useDispatch();
  const { loanID } = useParams();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getPayments = async () => {
    let loansArray = [];

    const q = query(
      collection(db, "loanPayments"),
      where("loanID", "==", loanID)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      loansArray.push(data);
    });

    if (loansArray.length > 0) {
      dispatch(addLoanPayments(loansArray));
    }
  };

  const getLoanDetails = async () => {
    const docRef = doc(db, "loans", loanID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      dispatch(addLoanDetails(data));
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  const confirmLoanPayment = async () => {
    if (!amount) {
      toast.error("Please enter paid amount");
    } else {
      setLoading(true);

      try {
        // get loan details
        const loanRef = doc(db, "loans", loanID);
        const docSnap = await getDoc(loanRef);

        if (docSnap.exists()) {
          const loan = docSnap.data();
          const debt = loan.debt - parseInt(amount);
          let status = false;

          if (debt == 0) {
            status = true;
          }

          if (debt < 0) {
            //amount is greater than loan debt
            toast.error("Please enter amount same or less than employee debt");
          } else {
            //proceed with payments
            //update loan and employee loan paths
            const dataRef = doc(db, "loans", loanID);
            await updateDoc(dataRef, {
              paid: status,
              debt,
              paidAmount: parseInt(amount),
              lastPaymentDate: Timestamp.fromDate(new Date()),
              updated_at: Timestamp.fromDate(new Date()),
            })
              .then(async () => {
                // update employee loan path
                const dataRef = doc(
                  db,
                  "users",
                  "employees",
                  loan?.employeeID,
                  "public",
                  "loans",
                  loanID
                );
                await updateDoc(dataRef, {
                  paid: status,
                  debt,
                  paidAmount: parseInt(amount),
                  lastPaymentDate: Timestamp.fromDate(new Date()),
                  updated_at: Timestamp.fromDate(new Date()),
                })
                  .then(async () => {
                    //update
                    addLoanPayment({
                      loan,
                      debt,
                      paidAmount: parseInt(amount),
                      description,
                    });

                    //if loan is cleared clear all deductions related to loan
                    //if is not check if deduction amount is greater to remaing debt
                  })
                  .catch((error) => {
                    // console.error("Error removing document: ", error.message);
                    toast.error(error.message);
                    setLoading(false);
                  });
              })
              .catch((error) => {
                // console.error("Error removing document: ", error.message);
                toast.error(error.message);
                setLoading(false);
              });
          }
        } else {
          // docSnap.data() will be undefined in this case
          console.log("No such document!");
          toast.error("Sorry! Something went wrong please try again later");
          setLoading(false);
        }
      } catch (error) {
        toast.error(error.message);
        setLoading(false);
      }
    }
  };

  const addLoanPayment = async ({ loan, debt, paidAmount, description }) => {
    const month = moment().format("M");
    const year = moment().format("YYYY");

    const path = doc(collection(db, "loanPayments"));
    await setDoc(path, {
      loanID,
      id: path.id,
      paidAmount,
      month,
      year,
      description,
      created_at: Timestamp.fromDate(new Date()),
      updated_at: Timestamp.fromDate(new Date()),
    })
      .then(async () => {
        //
        const docRef = doc(db, "employeesBucket", loan.employeeID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const loanDiff = data.loan - paidAmount;

          if (loanDiff > 0) {
            //there is still debt
            updateLoanEmployeePaths({
              loan,
              debt,
              employee: data,
              paidAmount,
              loanStatus: true,
            });
          } else {
            //debt is cleared
            // updateEmployeePaths({loan, debt, paidAmount});
            updateLoanEmployeePaths({
              loan,
              debt,
              employee: data,
              paidAmount,
              loanStatus: false,
            });
          }
        } else {
          // docSnap.data() will be undefined in this case
          console.log("No such document!");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log("Error creating new employee:", error);
      });
  };

  const updateLoanEmployeePaths = async ({
    loan,
    debt,
    employee,
    paidAmount,
    loanStatus,
  }) => {
    if (debt < 1) {
      const dataRef = doc(
        db,
        "users",
        "employees",
        loan.employeeID,
        "public",
        "account",
        "info"
      );
      await updateDoc(dataRef, {
        loan: increment(-paidAmount),
        loanStatus,
        loanDeduction: increment(-loan.deductionAmount),
        netSalary: increment(loan.deductionAmount),
        midMonthNetSalary: increment(loan.midMonthDeduction),
        endMonthNetSalary: increment(loan.endMonthDeduction),
        updated_at: Timestamp.fromDate(new Date()),
      })
        .then(async () => {
          //update loan details on employee on bucket
          const dataRef = doc(db, "employeesBucket", loan.employeeID);
          await updateDoc(dataRef, {
            loan: increment(-paidAmount),
            loanStatus,
            loanDeduction: increment(-loan.deductionAmount),
            netSalary: increment(loan.deductionAmount),
            midMonthNetSalary: increment(loan.midMonthDeduction),
            endMonthNetSalary: increment(loan.endMonthDeduction),
            updated_at: Timestamp.fromDate(new Date()),
          })
            .then(() => {
              //
              checkDeductionEligibility({
                loan,
                debt,
                employee,
                paidAmount,
                loanStatus,
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
    } else {
      const dataRef = doc(
        db,
        "users",
        "employees",
        loan.employeeID,
        "public",
        "account",
        "info"
      );
      await updateDoc(dataRef, {
        loan: increment(-paidAmount),
        loanStatus,
        loanDeduction: increment(-debt),
        netSalary: increment(debt),
        midMonthNetSalary: increment(debt),
        endMonthNetSalary: increment(debt),
        updated_at: Timestamp.fromDate(new Date()),
      })
        .then(async () => {
          //update loan details on employee on bucket
          const dataRef = doc(db, "employeesBucket", loan.employeeID);
          await updateDoc(dataRef, {
            loan: increment(-paidAmount),
            loanStatus,
            loanDeduction: increment(-debt),
            netSalary: increment(debt),
            midMonthNetSalary: increment(debt),
            endMonthNetSalary: increment(debt),
            updated_at: Timestamp.fromDate(new Date()),
          })
            .then(() => {
              //
              checkDeductionEligibility({
                loan,
                debt,
                employee,
                paidAmount,
                loanStatus,
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
    }
  };

  const checkDeductionEligibility = async ({
    loan,
    debt,
    employee,
    paidAmount,
    loanStatus,
  }) => {
    //fetch app setting
    const docRef = doc(db, "app", "system");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      if (employee.payment === "end") {
        //write into next month salary
        updateEmployeeSalaryPath({
          loan,
          employee,
          debt,
          paidAmount,
          loanStatus,
          month: data.nextMonth,
          year: data.nextYear,
        });
      } else {
        if (employee.payment === "half") {
          //write deduction to current month end salary
          updateEmployeeSalaryPath({
            loan,
            employee,
            debt,
            paidAmount,
            loanStatus,
            month: data.month,
            year: data.year,
          });
        } else {
          updateEmployeeSalaryPath({
            loan,
            employee,
            debt,
            paidAmount,
            loanStatus,
            month: data.month,
            year: data.year,
          });
        }
      }
    }
  };

  const updateEmployeeSalaryPath = async ({
    loan,
    employee,
    debt,
    paidAmount,
    loanStatus,
    month,
    year,
  }) => {
    //check loan deduction
    if (debt < 1) {
      const dataRef = doc(db, "salary", year, month, employee.id);
      await setDoc(
        dataRef,
        {
          loan: increment(-paidAmount),
          loanStatus,
          loanDeduction: increment(-loan.deductionAmount),
          netSalary: increment(loan.deductionAmount),
          midMonthNetSalary: increment(loan.midMonthDeduction),
          endMonthNetSalary: increment(loan.endMonthDeduction),
          midMonthLoanDeduction: increment(-loan.midMonthDeduction),
          endMonthLoanDeduction: increment(-loan.endMonthDeduction),
          updated_at: Timestamp.fromDate(new Date()),
        },
        { merge: true }
      )
        .then(() => {
          //
          setAmount("");
          setDescription("");

          getLoanDetails();
          getPayments();

          setLoading(false);
          toast.success("Employee loan  payment is saved successfully");
        })
        .catch((error) => {
          setLoading(false);
          toast.error(error.message);
        });
    } else {
      if (debt > loan.deductionAmount) {
        const dataRef = doc(db, "salary", year, month, loan.employeeID);
        await setDoc(
          dataRef,
          {
            loan: increment(-paidAmount),
            loanStatus,
            updated_at: Timestamp.fromDate(new Date()),
          },
          { merge: true }
        )
          .then(() => {
            //
            setAmount("");
            setDescription("");

            getLoanDetails();
            getPayments();

            setLoading(false);
            toast.success("Employee loan  payment is saved successfully");
          })
          .catch((error) => {
            setLoading(false);
            toast.error(error.message);
          });
      } else {
        //finish up on mid and end months props
        const dataRef = doc(db, "salary", year, month, loan.employeeID);
        await setDoc(
          dataRef,
          {
            loan: increment(-paidAmount),
            loanStatus,
            loanDeduction: increment(-debt),
            netSalary: increment(debt),
            midMonthNetSalary: increment(debt),
            endMonthNetSalary: increment(debt),
            midMonthLoanDeduction: increment(-debt),
            endMonthLoanDeduction: increment(-debt),
            updated_at: Timestamp.fromDate(new Date()),
          },
          { merge: true }
        )
          .then(() => {
            //
            setAmount("");
            setDescription("");

            getLoanDetails();
            getPayments();

            setLoading(false);
            toast.success("Employee loan  payment is saved successfully");
          })
          .catch((error) => {
            setLoading(false);
            toast.error(error.message);
          });
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
            // onClick={(e) => confirmLoanPayment(e)}
          >
            CONFIRM EMPLOYEE LOAN DEBT PAYEMNT
          </Button>
        </>
      );
    }
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        type="button"
        className="px-4 py-2 w-full border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
      >
        PAY LOAN DEBT
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-md">
          <div>
            <h3 className="text-center text-xl py-4">
              Add Employee Mid Month Salary Payment Details
            </h3>
            <div>
              <div className="w-full py-2 flex justify-center">
                <TextField
                  size="small"
                  id="outlined-basic"
                  label="Amount"
                  variant="outlined"
                  className="w-[92%]"
                  type={"number"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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

const Loan = () => {
  const dispatch = useDispatch();
  const { loanID } = useParams();

  const [value, setValue] = useState(0);
  const [Loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getLoanDetails = async () => {
    const docRef = doc(db, "loans", loanID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      dispatch(addLoanDetails(data));
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  const getPayments = async () => {
    let loansArray = [];

    const q = query(
      collection(db, "loanPayments"),
      where("loanID", "==", loanID)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      loansArray.push(data);
    });

    if (loansArray.length > 0) {
      dispatch(addLoanPayments(loansArray));
    }
  };

  useEffect(() => {
    getLoanDetails();
    getPayments();
  }, [dispatch]);

  const loanDetails = useSelector(selectLoanDetails);

  // const handleClearLoan = async (loan) => {
  //   setLoading(true);

  //   try {
  //     // Add a new document with a generated id
  //     const dataRef = doc(db, "loans", loanID);
  //     await updateDoc(dataRef, {
  //       paid: true,
  //       debt: 0,
  //       paidAmount: loan?.amount,
  //       lastPaymentDate: Timestamp.fromDate(new Date()),
  //       updated_at: Timestamp.fromDate(new Date()),
  //     })
  //       .then(async () => {
  //         // update employee loan path
  //         const dataRef = doc(
  //           db,
  //           "users",
  //           "employees",
  //           loan?.employeeID,
  //           "public",
  //           "loans",
  //           loanID
  //         );
  //         await updateDoc(dataRef, {
  //           paid: true,
  //           debt: 0,
  //           paidAmount: loan?.amount,
  //           lastPaymentDate: Timestamp.fromDate(new Date()),
  //           updated_at: Timestamp.fromDate(new Date()),
  //         })
  //           .then(async () => {
  //             //
  //             getLoanDetails();
  //             toast.success("Loan debt is cleared successfully");
  //             setLoading(false);
  //           })
  //           .catch((error) => {
  //             // console.error("Error removing document: ", error.message);
  //             toast.error(error.message);
  //             setLoading(false);
  //           });
  //       })
  //       .catch((error) => {
  //         // console.error("Error removing document: ", error.message);
  //         toast.error(error.message);
  //         setLoading(false);
  //       });
  //   } catch (error) {
  //     toast.error(error.message);
  //     setLoading(false);
  //   }
  // };

  const renderDescription = (description) => {
    return (
      <>
        <IconButton onClick={showModal} className="text-sm">
          <RemoveRedEye fontSize="small" />
        </IconButton>
        <Modal
          title=""
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          okButtonProps={{
            className: "hidden",
          }}
          cancelButtonProps={{
            className: "hidden",
          }}
          width={600}
        >
          <h4 className="text-lg font-semibold text-center pb-2">
            Loan Description
          </h4>
          <div className="text-sm py-1">
            <p>{description}</p>
          </div>
        </Modal>
      </>
    );
  };

  return (
    <div className="px-4">
      <div className="w-[100%] h-[30%] rounded-lg bg-[#fcf8f8]">
        <div className="flex flex-row justify-between py-2 px-4">
          <div className="w-[50%] rounded-md h-10 flex flex-row gap-1 text-lg"></div>
          <div className="w-[50%] bg-white rounded-md h-10 flex flex-row justify-between gap-1">
            <div></div>
            <div>
              {loanDetails ? (
                <p className="py-1 px-1 text-xl">
                  {loanDetails?.debt == 0 ? (
                    <Tag color={"green"}>Paid</Tag>
                  ) : (
                    <>
                      <Tag color={"blue"}>Not Paid</Tag>
                    </>
                  )}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between ">
          <div className="w-[55%] flex flex-row gap-2">
            <div className="w-[100%] px-4 my-4">
              <div className="flex flex-row gap-2 py-1">
                <p className="w-[30%]">Total Amount:</p>
                <p className="w-[70%] capitalize">
                  TZS {formatter.format(loanDetails?.amount || 0)}
                </p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p className="w-[30%]">Employee Name:</p>
                <p className="w-[70%] capitalize">
                  {`${loanDetails?.employeeFirstName} ${loanDetails?.employeeMiddleName} ${loanDetails?.employeeLastName}`}
                </p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p className="w-[30%]">Loan Period:</p>
                <p className="w-[70%]">
                  {loanDetails?.deductionMonths || 0} Month
                </p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p className="w-[30%]">Monthly Deduction:</p>
                <p className="w-[70%]">
                  TZS {formatter.format(loanDetails?.deductionAmount || 0)}
                </p>
              </div>
              <div className="flex flex-row gap-2 py-1">
                <p className="w-[30%]">Description:</p>
                <p className="w-[70%]">
                  {renderDescription(loanDetails?.description)}
                </p>
              </div>
            </div>
          </div>
          <div className="w-[45%] px-4 py-4">
            <div className="flex flex-row gap-2 py-1">
              <p className="w-[30%]">Loan Date:</p>
              <p className="w-[70%] capitalize">
                {moment.unix(loanDetails?.date?.seconds).format("DD-MM-YYYY")}
              </p>
            </div>
            <div className="flex flex-row gap-2 py-1">
              <p className="w-[30%]">Paid Amount:</p>
              <p className="w-[70%] capitalize">
                TZS {formatter.format(loanDetails?.paidAmount || 0)}
              </p>
            </div>
            <div className="flex flex-row gap-2 py-1">
              <p className="w-[30%]">Debt Amount:</p>
              <p className="w-[70%] capitalize">
                TZS {formatter.format(loanDetails?.debt || 0)}
              </p>
            </div>
            <div className="py-2">
              {loanDetails?.paid == false ? (
                <>
                  {/* {Loading ? (
                    <button
                      type="button"
                      className="px-6 py-2 w-full cursor-not-allowed opacity-25 border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
                    >
                      Loading ...
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="px-6 py-2 w-full border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
                      onClick={() => handleClearLoan(loanDetails)}
                    >
                      Clear Loan Debt
                    </button>
                  )} */}
                  {/* <ClearLoanDebt /> */}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f2e1e1" }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="LOAN PAYMENT HISTORY" {...a11yProps(0)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          {/* <PaymentHistory /> */}
        </CustomTabPanel>
      </Box>
    </div>
  );
};

export default Loan;
