import React from "react";
import { Tabs } from "antd";
import Designations from "./Designations";
import AssetTypes from "./AssetTypes";
import Roles from "./Roles";

const Setting = () => {
  return (
    <Tabs
      defaultActiveKey="1"
      type="card"
      size="large"
      centered
      items={[
        {
          label: "DESIGNATIONS",
          key: "1",
          children: <Designations />,
        },
        {
          label: "ASSET TYPES",
          key: "2",
          children: <AssetTypes />,
        },
        {
          label: "USER ROLES",
          key: "3",
          children: <Roles />,
        },
      ]}
    />
  );
};

export default Setting;
