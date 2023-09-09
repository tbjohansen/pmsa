import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

const Employee = () => {
    const dispatch = useDispatch();
    const {employeeID} = useParams();

    useEffect(() => {
        const getEmployeeDetails = async() => {

        }

        getEmployeeDetails();
    }, [])

    return <div className="px-4">
        <div className="w-[100%] h-[30%] rounded-lg">

        </div>
    </div>
}

export default Employee;