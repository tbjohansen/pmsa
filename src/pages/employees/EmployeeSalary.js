import React from "react";
import { Card } from "@mui/material";
import AddEmployeeSalary from "./AddEmployeeSalary";
import EditEmployeeSalary from "./EditEmployeeSalary";

const EmployeeSalary = ({ info }) => {
  return (
    <div className="w-[100%]">
      <Card sx={{ width: "100%", bgcolor: "#fcf8f8" }}>
        <div className="flex flex-row justify-between">
          <h4 className="w-[96%] text-center font-semibold py-4">
            Salary Details
          </h4>
          <div className="w-[4%] py-2">
            {info?.salary ? (
              <EditEmployeeSalary info={info} />
            ) : (
              <AddEmployeeSalary />
            )}
          </div>
        </div>
        <div className="px-4 pb-2">
          <div className="flex flex-row gap-2 py-2">
            <p className="w-[50%]">Salary Amount</p>
            <p className="w-[50%]">{info?.salary}</p>
          </div>
          <div className="flex flex-row gap-2 py-2">
            <p className="w-[50%]">Payment Mode</p>
            <p className="w-[50%] capitalize">{info?.paymentMode}</p>
          </div>
          <div className="flex flex-row gap-2 py-2">
            <p className="w-[50%]">NSSF</p>
            <p className="w-[50%] capitalize">{info?.socialSecurity}</p>
          </div>
          <div className="flex flex-row gap-2 py-2">
            <p className="w-[50%]">NSSF Number</p>
            <p className="w-[50%]">{info?.ssn}</p>
          </div>
          <div className="flex flex-row gap-2 py-2">
            <p className="w-[50%]">PAYE Amount</p>
            <p className="w-[50%]">{info?.paye}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeSalary;
