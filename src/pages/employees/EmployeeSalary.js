import React from "react";
import { Card } from "@mui/material";
import AddEmployeeSalary from "./AddEmployeeSalary";
import EditEmployeeSalary from "./EditEmployeeSalary";

const formatter = new Intl.NumberFormat("en-US");

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
        <div className="w-[100%] flex flex-row gap-2 px-4 pb-2">
          <div className="w-[50%]">
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">Salary Amount</p>
              <p className="w-[50%]">TZS {formatter.format(info?.salary)}</p>
            </div>
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">Payment Mode</p>
              <p className="w-[50%] capitalize">
                {info?.paymentMode == 2 ? <>Twice</> : <>Once</>}
              </p>
            </div>
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">NSSF</p>
              <p className="w-[50%] capitalize">
                {info?.socialSecurity ? <>Yes</> : <>No</>}
              </p>
            </div>
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">NSSF Number</p>
              <p className="w-[50%]">{info?.ssn}</p>
            </div>
          </div>
          <div className="w-[50%]">
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">NSSF Amount</p>
              <p className="w-[50%]">
                TZS {formatter.format(info?.nssfAmount)}
              </p>
            </div>
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">PAYE Amount</p>
              <p className="w-[50%]">TZS {formatter.format(info?.paye)}</p>
            </div>
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">Total Deductions</p>
              <p className="w-[50%] capitalize">
                {formatter.format(info?.deductionAmount)}
              </p>
            </div>
            <div className="flex flex-row gap-2 py-2">
              <p className="w-[50%]">Net Salary</p>
              <p className="w-[50%] capitalize">
                {formatter.format(info?.netSalary)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeSalary;
