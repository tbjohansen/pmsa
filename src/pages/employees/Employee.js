import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  addEmployeesDetails,
  addAdditionalInfo,
  selectEmployeeDetails,
  selectAdditionalInfo,
} from "../../features/employeeSlice";
import Card from "@mui/material/Card";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../App";
import { Tag } from "antd";
import AddEmergencyContacts from "./AddEmergencyContact";
import EmployeeAssets from "./EmployeeAssets";
import EmployeeLoans from "./EmployeeLoans";
import EmployeeSalary from "./EmployeeSalary";
import AddPrimaryEmergencyContacts from "./AddPrimaryEmergencyContact";
import EditPrimaryEmergencyContacts from "./EditPrimaryEmergencyContact";
import EditEmergencyContacts from "./EditEmergencyContact";

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

const ProfileInfo = ({ info }) => {
  return (
    <div className="w-[100%]">
      <div className="flex flex-row justify-between">
        <Card sx={{ width: 500, bgcolor: "#fcf8f8" }}>
          <div className="flex flex-row justify-between">
            <h4 className="w-[92%] text-center font-semibold py-4">
              Emergency Contacts (1)
            </h4>
            <div className="w-[8%] py-2">
              {info?.contactName ? (
                <EditPrimaryEmergencyContacts info={info} />
              ) : (
                <AddPrimaryEmergencyContacts />
              )}
            </div>
          </div>
          <div className="px-4 pb-2">
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">Name</p>
              <p className="w-[50%]">{info?.contactName}</p>
            </div>
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">Relation</p>
              <p className="w-[50%] capitalize">{info?.relation}</p>
            </div>
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">Phone</p>
              <p className="w-[50%]">{info?.phone}</p>
            </div>
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">Address</p>
              <p className="w-[50%]">{info?.address}</p>
            </div>
          </div>
        </Card>
        <Card sx={{ width: 500, bgcolor: "#fcf8f8" }}>
          <div className="flex flex-row justify-between">
            <h4 className="w-[92%] text-center font-semibold py-4">
              Emergency Contacts (2)
            </h4>
            <div className="w-[8%] py-2">
              {info?.contactName2 ? (
                <EditEmergencyContacts info={info} />
              ) : (
                <AddEmergencyContacts />
              )}
            </div>
          </div>
          <div className="px-4 pb-2">
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">Name</p>
              <p className="w-[50%]">{info?.contactName2}</p>
            </div>
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">Relation</p>
              <p className="w-[50%] capitalize">{info?.relation2}</p>
            </div>
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">Phone</p>
              <p className="w-[50%]">{info?.phone2}</p>
            </div>
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">Address</p>
              <p className="w-[50%]">{info?.address2}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const Employee = () => {
  const dispatch = useDispatch();
  const { employeeID } = useParams();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const getEmployeeDetails = async () => {
      const docRef = doc(db, "employeesBucket", employeeID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        dispatch(addEmployeesDetails(data));
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        dispatch(addEmployeesDetails({}));
      } 
    };

    const getEmployeeInfo = async () => {
      const docRef = doc(
        db,
        "users",
        "employees",
        employeeID,
        "public",
        "account",
        "additionalInfo"
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        dispatch(addAdditionalInfo(data));
      } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        dispatch(addAdditionalInfo({}))
      }
    };

    getEmployeeDetails();
    getEmployeeInfo();
  }, [dispatch]);

  const employeeDetails = useSelector(selectEmployeeDetails);
  const info = useSelector(selectAdditionalInfo);

  return (
    <div className="px-4">
      <div className="w-[100%] h-[30%] rounded-lg flex flex-row gap-2 justify-between bg-[#fcf8f8]">
        <div className="w-[50%] flex flex-row gap-2 border-r-2 border-zinc-300 border-dashed">
          <div className="py-4 px-2">
            <div className="flex flex-row justify-center rounded-full bg-zinc-200 w-20 h-20"></div>
          </div>
          <div className="px-2 my-4">
            <p className="py-0.5">
              {employeeDetails?.firstName} {employeeDetails?.middleName}{" "}
              {employeeDetails?.lastName}
            </p>
            <p className="py-0.5">{employeeDetails?.designation}</p>
            <p className="py-0.5">Employee ID : {employeeDetails?.employeeNumber}</p>
            <p className="py-0.5 capitalize">Employee Role : {employeeDetails?.role}</p>
          </div>
        </div>
        <div className="w-[50%] px-4 py-4">
          <div className="flex flex-row gap-2 py-0.5">
            <p>Phone:</p>
            <p>{employeeDetails?.phone}</p>
          </div>
          <div className="flex flex-row gap-2 py-0.5">
            <p>Email:</p>
            <p>{employeeDetails?.email}</p>
          </div>
          <div className="flex flex-row gap-2 py-0.5">
            <p>Gender:</p>
            <p className="capitalize">{employeeDetails?.gender}</p>
          </div>
          <div className="flex flex-row gap-2 py-0.5">
            <p>Status:</p>
            <p>
              {employeeDetails?.status ? (
                <Tag color={"green"}>Active</Tag>
              ) : (
                <Tag color={"red"}>deactivated</Tag>
              )}
            </p>
          </div>
        </div>
        <div className="w-[5%]"></div>
      </div>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f2e1e1" }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
            //   sx={{ bgcolor: "#d8b4fe" }}
          >
            <Tab label="PROFILE" {...a11yProps(0)} />
            <Tab label="SALARY" {...a11yProps(1)} />
            <Tab label="LOANS" {...a11yProps(2)} />
            <Tab label="ASSETS" {...a11yProps(3)} />
            <Tab label="PAY SLIPS" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <ProfileInfo info={info} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <EmployeeSalary info={employeeDetails} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <EmployeeLoans />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          <EmployeeAssets />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={4}>
        </CustomTabPanel>
      </Box>
    </div>
  );
};

export default Employee;
