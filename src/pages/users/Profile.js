import React, { useEffect, useState } from "react";
import { SyncLock } from "@mui/icons-material";
import { Box, Button, Modal, TextField } from "@mui/material";
import { signOut, updatePassword } from "firebase/auth";
import { toast } from "react-hot-toast";
import { auth, db } from "../../App";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { addUserInfo, selectUserInfo } from "../../features/userSlice";
import { useDispatch, useSelector } from "react-redux";

const style = {
  position: "absolute",
  top: "45%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  p: 4,
};

const Profile = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = auth.currentUser;
  const uid = user.uid;

  useEffect(() => {
    const getProfile = async () => {
      try {
        const docRef = doc(db, "userBucket", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          dispatch(addUserInfo(data));
        } else {
          // docSnap.data() will be undefined in this case
          console.log("No such document!");
        }
      } catch (error) {
        console.log(error);
      }
    };

    getProfile();
  }, [dispatch]);

  const profile = useSelector(selectUserInfo);

  const changePassword = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      toast.warning("Please enter new password");
    } else if (!confirmPassword) {
      toast.warning("Please enter confirm password");
    } else {
      //start registration
      setLoading(true);

      await updatePassword(user, newPassword)
        .then(() => {
          // Update successful.
          toast.success("Password is changed successfully");
          setLoading(false);

          //signout
          signOut(auth)
            .then(() => {
              // Sign-out successful.
              navigate(`/login`);
            })
            .catch((error) => {
              // An error happened.
              console.log(error.message);
            });
        })
        .catch((error) => {
          // An error ocurred
          toast.error(error.message);
          setLoading(false);
        });
    }
  };

  const renderButton = () => {
    if (loading) {
      return (
        <>
          <Button
            size="large"
            variant="contained"
            className="w-[82%] cursor-not-allowed"
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
            className="w-[82%]"
            onClick={(e) => changePassword(e)}
          >
            CHANGE PASSWORD
          </Button>
        </>
      );
    }
  };

  return (
    <div className="w-[100%] flex flex-row justify-center px-4 py-8">
      <div className="w-[40%] flex flex-col justify-center max-w-xs p-6 shadow-md rounded-xl sm:px-12 bg-[#fcf8f8] ">
        <div className="w-32 h-32 mx-auto rounded-full bg-gray-500 aspect-square"></div>
        <div className="space-y-4 text-center divide-y divide-gray-300">
          <div className="my-2 space-y-1">
            <h2 className="text-xl font-semibold sm:text-2xl">
              {profile?.fullName}
            </h2>
            <p className="px-5 text-xs sm:text-base text-gray-600">
              {profile?.role}
            </p>
            <p className="px-5 text-xs sm:text-base text-gray-600">
              {profile?.email}
            </p>
          </div>
          <div className="flex justify-center pt-2 space-x-4 align-center">
            <div
              onClick={handleOpen}
              className="h-10 w-[100%] bg-blue-300 cursor-pointer rounded-full flex flex-row gap-1 justify-center text-white"
            >
              <SyncLock className="mt-2 py-0.5" />{" "}
              <p className="py-2">Change Password</p>
            </div>

            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style} className="rounded-md">
                <div>
                  <h3 className="text-center text-xl py-4">Change Password</h3>
                  <div>
                    <div className="w-full py-2 flex justify-center">
                      <TextField
                        size="small"
                        id="outlined-basic"
                        label="New Password"
                        variant="outlined"
                        className="w-[82%]"
                        type={"password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="w-full py-2 flex flex-row gap-2 justify-center">
                      <TextField
                        id="outlined-basic"
                        label="Confirm Password"
                        size="small"
                        variant="outlined"
                        type={"password"}
                        className="w-[82%]"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
