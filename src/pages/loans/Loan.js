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
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../App";
import { Modal, Tag } from "antd";
import { RemoveRedEye } from "@mui/icons-material";
import { IconButton } from "@mui/material";
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

const formatter = new Intl.NumberFormat("en-US");

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

  useEffect(() => {
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

    getLoanDetails();
    getPayments();
  }, [dispatch]);

  const loanDetails = useSelector(selectLoanDetails);

  const handleClearLoan = async (loan) => {
    setLoading(true);

    try {
      // Add a new document with a generated id
      const dataRef = doc(db, "loans", loanID);
      await updateDoc(dataRef, {
        paid: true,
        debt: 0,
        paidAmount: loan?.amount,
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
            paid: true,
            debt: 0,
            paidAmount: loan?.amount,
            lastPaymentDate: Timestamp.fromDate(new Date()),
            updated_at: Timestamp.fromDate(new Date()),
          })
            .then(async () => {
              //
              getLoanDetails();
              toast.success("Loan debt is cleared successfully");
              setLoading(false);
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
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

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
                  {loanDetails?.employeeName}
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
                  {Loading ? (
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
                  )}
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
          <PaymentHistory />
        </CustomTabPanel>
      </Box>
    </div>
  );
};

export default Loan;
