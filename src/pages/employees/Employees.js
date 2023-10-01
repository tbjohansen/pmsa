import React, { useEffect } from "react";
import { db } from "../../App";
import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Popconfirm, Switch, Table, Tag } from "antd";
import {
  addEmployees,
  addEmployeesDetails,
  selectEmployees,
} from "../../features/employeeSlice";
import AddEmployee from "./AddEmployee";
import toast from "react-hot-toast";
import EditEmployee from "./EditEmployee";
import { RemoveRedEye } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import moment from "moment";

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <>{text}</>,
  },
  {
    title: "Full Name",
    key: "fullName",
    render: (_, employee) => (
      <>
        <p>
          {employee?.firstName} {employee?.middleName} {employee?.lastName}
        </p>
      </>
    ),
  },
  {
    title: "Contacts",
    key: "contacts",
    render: (_, employee) => (
      <>
        <p>{employee?.phone}</p>
        <p>{employee?.email}</p>
      </>
    ),
  },
  {
    title: "Gender",
    dataIndex: "gender",
    key: "gender",
    render: (text) => <p className="capitalize">{text}</p>,
  },
  {
    title: "Designation",
    dataIndex: "designation",
    key: "designation",
    render: (text) => <p className="capitalize">{text}</p>,
  },
  {
    title: "Status",
    key: "status",
    render: (_, employee) => (
      <>
        <EmployeeStatus employee={employee} />
      </>
    ),
  },
  {
    title: "Payroll",
    key: "payroll",
    render: (_, employee) => (
      <>
       {employee?.salary? <> {employee?.payroll ? (
          <Tag color={"green"}>Registered</Tag>
        ) : (
          <RegisterPayroll employee={employee} />
        )}</> : <p className="text-xs">Add salary details</p>}
      </>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, employee) => (
      <p className="flex flex-row gap-1 justify-start">
        <EditEmployee employee={employee} />
        <ViewEmployee employee={employee} />
      </p>
    ),
  },
];

const ViewEmployee = ({ employee }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleViewEmployee = () => {
    dispatch(addEmployeesDetails(employee));
    navigate(`/employees/${employee?.id}`);
  };

  return (
    <p className="mt-1">
      <IconButton onClick={() => handleViewEmployee()}>
        <RemoveRedEye className="text-red-500 text-xl cursor-pointer" />
      </IconButton>
    </p>
  );
};

const RegisterPayroll = ({ employee }) => {
  const dispatch = useDispatch();

  const month = moment().format("MMMM");
  const monthNumber = moment().month(month).format("M");
  const year = moment().format("YYYY");

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

  const changeStatus = async () => {
    await setDoc(doc(db, "salaries", year, monthNumber, employee.id), {
      ...employee,
    })
      .then(() => {
        updateEmployeeToPath(employee.id);
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
      });
  };

  const updateEmployeeToPath = async (id) => {
    // Add a new document with a generated id
    await updateDoc(
      doc(db, "users", "employees", id, "public", "account", "info"),
      {
        payroll: true,
      }
    )
      .then(async () => {
        await updateDoc(doc(db, "employeesBucket", employee?.id), {
          payroll: true,
        })
          .then(() => {
            getEmployees();
            toast.success(
              "Employee is added to this month payroll successfully"
            );
          })
          .catch((error) => {
            // console.error("Error removing document: ", error.message);
            toast.error(error.message);
          });
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
      });
  };

  return (
    <Popconfirm
      title=""
      description={`Are you sure to add this employee on payroll this month?`}
      okText="Yes"
      cancelText="No"
      okButtonProps={{
        className: "bg-blue-500",
      }}
      onConfirm={changeStatus}
    >
      <button
        type="button"
        className="px-4 py-2 w-full border rounded-md border-blue-300 hover:bg-blue-300 hover:text-white"
      >
        Register
      </button>
    </Popconfirm>
  );
};

const EmployeeStatus = ({ employee }) => {
  const dispatch = useDispatch();

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

  const changeStatus = async () => {
    await updateDoc(doc(db, "employeesBucket", employee?.id), {
      status: !employee.status,
    })
      .then(() => {
        updateEmployeeToPath(employee.id);
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
      });
  };

  const updateEmployeeToPath = async (id) => {
    // Add a new document with a generated id
    await updateDoc(
      doc(db, "users", "employees", id, "public", "account", "info"),
      {
        status: !employee.status,
      }
    )
      .then(() => {
        getEmployees();
        toast.success("Employee status is changed successfully");
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
      });
  };

  return (
    <Popconfirm
      title="Change Status"
      description={`Are you sure you want to ${
        employee?.status ? "deactivate" : "activate"
      } this employee?`}
      okText="Yes"
      cancelText="No"
      okButtonProps={{
        className: "bg-blue-500",
      }}
      onConfirm={changeStatus}
    >
      <Switch
        checked={employee?.status}
        className={employee?.status ? null : `bg-zinc-300 rounded-full`}
      />
    </Popconfirm>
  );
};

const Employees = () => {
  const dispatch = useDispatch();

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

  const employeesList = employees
    .slice()
    .sort((a, b) => b.created_at - a.created_at);
  const sortedEmployees = employeesList.map((employee, index) => {
    const key = index + 1;
    return { ...employee, key };
  });

  return (
    <div className="px-2">
      <div className="flex flex-row justify-end">
        <AddEmployee />
      </div>
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedEmployees}
          size="middle"
          pagination={{ defaultPageSize: 6, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default Employees;
