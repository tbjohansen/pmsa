import React, { useEffect } from "react";
import { db } from "../../App";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { Popconfirm, Switch, Table } from "antd";
import { addUsers, selectUsers } from "../../features/userSlice";
import AddUser from "./AddUser";
import toast, { Toaster } from 'react-hot-toast';

const columns = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text) => <>{text}</>,
  },
  {
    title: "Full Name",
    dataIndex: "fullName",
    key: "fullName",
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (text) => <>{text}</>,
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
  },
  {
    title: "Status",
    key: "status",
    render: (_, user) => (
      <>
        <UserStatus user={user} />
      </>
    ),
  },
  {
    title: "Actions",
    key: "action",
    render: (_, user) => (
      <p className="flex flex-row gap-1 justify-start">
        {/* <EditUser user={user} /> */}
        {/* <DeleteUser user={user} /> */}
      </p>
    ),
  },
];

const UserStatus = ({ user }) => {
  const dispatch = useDispatch();

  const getUsers = async () => {
    let usersArray = [];

    const querySnapshot = await getDocs(collection(db, "userBucket"));
    querySnapshot.forEach((doc) => {
      //set data
      const data = doc.data();
      usersArray.push(data);
    });

    if (usersArray.length > 0) {
      dispatch(addUsers(usersArray));
    }
  };

  const changeStatus = async () => {
    await updateDoc(doc(db, "userBucket", user?.id), {
      status: !user.status,
    })
      .then(() => {
        updateUserToPath(user.id);
      })
      .catch((error) => {
        // console.error("Error removing document: ", error.message);
        toast.error(error.message);
      });
  };

  const updateUserToPath = async (id) => {
    // Add a new document with a generated id
    await updateDoc(doc(db, "users", "admins", id, "public"), {
      status: !user.status,
    })
      .then(() => {
        getUsers();
        toast.success("User status is changed successfully");
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
        user?.status ? "deactivate" : "activate"
      } this user?`}
      okText="Yes"
      cancelText="No"
      onConfirm={changeStatus}
    >
      <Switch
        checked={user?.status}
        className={user?.status ? null : `bg-zinc-300 rounded-full`}
      />
    </Popconfirm>
  );
};

const Users = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUsers = async () => {
      let usersArray = [];
  
      const querySnapshot = await getDocs(collection(db, "userBucket"));
      querySnapshot.forEach((doc) => {
        //set data
        const data = doc.data();
        usersArray.push(data);
      });
  
      if (usersArray.length > 0) {
        dispatch(addUsers(usersArray));
      }
    };

    getUsers();
  }, [dispatch]);

  const users = useSelector(selectUsers);

  const usersList = users.slice().sort((a, b) => b.created_at - a.created_at);
  const sortedUsers = usersList.map((user, index) => {
    const key = index + 1;
    return { ...user, key };
  });

  return (
    <div className="px-2">
      <div className="flex flex-row justify-end">
        <AddUser />
      </div>
      <div className="pt-8">
        <Table
          columns={columns}
          dataSource={sortedUsers}
          size="middle"
          pagination={{ defaultPageSize: 6, size: "middle" }}
        />
      </div>
    </div>
  );
};

export default Users;
