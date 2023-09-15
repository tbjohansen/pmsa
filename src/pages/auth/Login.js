import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { message } from "antd";
import bgImg from "../../assets/images/bgImage.svg";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const auth = getAuth();

  const signInUser = () => {
    if (!email) {
      message.warning("Please enter your email");
    } else if (!password) {
      message.warning("Please enter your password");
    } else {
      //start
      setLoading(true);

      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          // Signed in
          message.success("Logged in");
          setLoading(false);
          navigate(`/`);
        })
        .catch((error) => {
          setLoading(false);
          message.error(error.message);
        });
    }
  };

  const renderButton = () => {
    if (loading) {
      return (
        <button
          type="button"
          className="bg-blue-600 opacity-25 cursor-not-allowed w-full px-8 py-3 font-semibold rounded-md text-white"
        >
          Loading...
        </button>
      );
    } else {
      return (
        <button
          type="button"
          onClick={() => signInUser()}
          className="bg-blue-600 w-full px-8 py-3 font-semibold rounded-md text-white"
        >
          Sign in
        </button>
      );
    }
  };

  return (
    <>
      <div className="w-[100%] h-[100%] flex flex-row gap-2 pt-12">
        <div
          style={{ backgroundImage: `url(${bgImg})` }}
          className="w-[65%]"
        ></div>
        <div className="bg-gray-300 w-[35%] flex flex-col max-w-md p-6 rounded-md sm:p-10 dark:bg-gray-900 dark:text-gray-100">
          <div className="mb-8 text-center">
            <h1 className="my-3 text-4xl font-bold">Welcome</h1>
            <p className="text-sm dark:text-gray-400">
              Sign in to access your account
            </p>
          </div>
          <div className="space-y-12">
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm">Password</label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div>{renderButton()}</div>
              <p className="px-6 text-sm text-center dark:text-gray-400">
                Don't remember your password?{" "}
                <a
                  rel="noopener noreferrer"
                  href="/"
                  className="text-blue-600 hover:underline"
                >
                  Reset here
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
