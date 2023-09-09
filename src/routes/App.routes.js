import React from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "../pages/layouts/AppLayout";
import Login from "../pages/auth/Login";
import Home from "../pages/Home";
import Setting from "../pages/settings/Setting";
import Users from "../pages/users/Users";
import Assets from "../pages/assets/Assets";
import Employees from "../pages/employees/Employees";
import Profile from "../pages/users/Profile";
import Loans from "../pages/loans/Loans";
import Payroll from "../pages/payroll/Payroll";

const LoginElement = () => <Login />;
// const DeviceElement = () => <DeviceInfo />;

const DashboardElement = () => (
  <AppLayout>
    <Home />
  </AppLayout>
);

const UsersElement = () => (
  <AppLayout>
    <Users />
  </AppLayout>
);

const SettingElement = () => (
  <AppLayout>
    <Setting />
  </AppLayout>
);

const AssetsElement = () => (
  <AppLayout>
    <Assets />
  </AppLayout>
);

const EmployeesElement = () => (
  <AppLayout>
    <Employees />
  </AppLayout>
);

const ProfileElement = () => (
  <AppLayout>
    <Profile />
  </AppLayout>
);

const LoansElement = () => (
  <AppLayout>
    <Loans />
  </AppLayout>
);

const PayrollElement = () => (
  <AppLayout>
    <Payroll />
  </AppLayout>
);

const App = () => {
  return (
    <React.Fragment>
      <Routes>
        <Route>
          <Route path="/login" element={<LoginElement />} />
          {/* <Route path="/device" element={<DeviceElement />} /> */}
        </Route>

        <Route>
          <Route path="/" element={<DashboardElement />} />
          {/* <Route path="/dashboard" element={<DashboardElement />} /> */}
          <Route path="/users" element={<UsersElement />} />
          <Route path="/settings" element={<SettingElement />} />
          <Route path="/assets" element={<AssetsElement />} />
          <Route path="/employees" element={<EmployeesElement />} />
          <Route path="/profile" element={<ProfileElement />} />
          <Route path="/loans" element={<LoansElement />} />
          <Route path="/payroll" element={<PayrollElement />} />

          <Route path="/employees/:employeeID" element={<EmployeesElement />} />
          <Route path="/asset/:assetID" element={<EmployeesElement />} />
        </Route>
      </Routes>
    </React.Fragment>
  );
};

export default App;