import React, { useEffect } from "react";
import { db } from "../../App";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { message, Popconfirm, Switch, Table } from "antd";
import { addEmployees, selectEmployees } from "../../features/employeeSlice";
import AddEmployee from "./AddEmployee";

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
        <p>{employee?.firstName} {employee?.middleName} {employee?.lasName}</p>
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
    title: "Actions",
    key: "action",
    render: (_, employee) => (
      <p className="flex flex-row gap-1 justify-start">
        {/* <EditUser user={user} /> */}
        {/* <DeleteUser user={user} /> */}
      </p>
    ),
  },
];

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
        message.error(error.message);
      });
  };

  const updateEmployeeToPath = async (id) => {
    // Add a new document with a generated id
    await updateDoc(doc(db, "users", "employees", id, "public"), {
      status: !employee.status,
    })
      .then(() => {
        getEmployees();
        message.success("Employee status is changed successfully");
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        message.error(error.message);
      });
  };

  return (
    <Popconfirm
      title="Change Status"
      description={`Are you sure you want to ${
        user?.status ? "deactivate" : "activate"
      } this employee?`}
      okText="Yes"
      cancelText="No"
      onConfirm={changeStatus}
    >
      <Switch
        checked={user?.status}
        className={user?.status ? null : `bg-[#F24E1E] rounded-full`}
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

  const employeesList = employees.slice().sort((a, b) => b.created_at - a.created_at);
  const sortedEmployees = employeesList.map((employee, index) => {
    const key = index + 1;
    return { ...employee, key };
  });

  return (
    <div className="px-2">
      <div className="flex flex-row justify-end">
        <AddEmployee/>
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
