import * as React from "react";
import { styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import { colors } from "../assets/utils/colors";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import {
  LocalAtm,
  Person,
  Window,
  Settings,
  People,
  CreditScore,
  GroupAdd,
  Topic,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { auth, db } from "../App";
import { doc, getDoc } from "firebase/firestore";
import { addUserInfo, selectUserInfo } from "../features/userSlice";

const drawerWidth = 220;

//############# SideNavListItem #################
const SideNavListItem = styled(ListItem)(({ theme }) => ({
  paddingTop: 0,
  transition: "all ease-in-out 0.3s",
  "&::before": {
    content: '""',
    position: "absolute",
    height: 0,
    bottom: "50%",
    width: 4,
    transition: "all ease-in-out 0.3s",
    backgroundColor: colors.link,
  },
  "&:hover": {
    // backgroundColor: colors.link,
  },
  "& .icon": {
    minWidth: 0,
    justifyContent: "center",
    color: colors.bgColor2,
    opacity: 0.9,
    fontSize: 33,
  },
  "& .name": {
    color: colors.bgColor2,
  },
}));

//! #################### MAIN FUNC ######################
const SideBar = ({ handleDrawerToggle, mobileOpen }) => {
  const [open] = React.useState(false);

  //user access
  const dispatch = useDispatch();

  const user = auth.currentUser;
  const uid = user.uid;

  React.useEffect(() => {
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
  }, [dispatch, uid]);

  const userInfo = useSelector(selectUserInfo);

  const { window } = "props";
  const container =
    window !== undefined ? () => window().document.body : undefined;

  // ################# LINKS ################
  const links = [
    {
      id: 1,
      name: "Dashboard",
      icon: <Window className="icon" />,
      url: "/",
      tooltip: "Dashboard",
    },
    {
      id: 2,
      name: "Employees",
      icon: <People className="icon" />,
      url: "/employees",
      tooltip: "Employees",
    },
    {
      id: 3,
      name: "Payroll",
      icon: <LocalAtm className="icon" />,
      url: "/payroll",
      tooltip: "Payroll",
    },
    {
      id: 4,
      name: "Loans",
      icon: <CreditScore className="icon" />,
      url: "/loans",
      tooltip: "Loans",
    },
    {
      id: 5,
      name: "Users",
      icon: <GroupAdd className="icon" />,
      url: "/users",
      tooltip: "Users",
    },
    {
      id: 6,
      name: "Assets",
      icon: <Topic className="icon" />,
      url: "/assets",
      tooltip: "Assets",
    },
    {
      id: 7,
      name: "Profile",
      icon: <Person className="icon" />,
      url: "/profile",
      tooltip: "Profile",
    },
    {
      id: 8,
      name: "Settings",
      icon: <Settings className="icon" />,
      url: "/settings",
      tooltip: "Settings",
    },
  ];

  const hrLinks = [
    {
      id: 1,
      name: "Dashboard",
      icon: <Window className="icon" />,
      url: "/",
      tooltip: "Dashboard",
    },
    {
      id: 2,
      name: "Employees",
      icon: <People className="icon" />,
      url: "/employees",
      tooltip: "Employees",
    },
    {
      id: 3,
      name: "Payroll",
      icon: <LocalAtm className="icon" />,
      url: "/payroll",
      tooltip: "Payroll",
    },
    {
      id: 4,
      name: "Loans",
      icon: <CreditScore className="icon" />,
      url: "/loans",
      tooltip: "Loans",
    },
    {
      id: 5,
      name: "Assets",
      icon: <Topic className="icon" />,
      url: "/assets",
      tooltip: "Assets",
    },
    {
      id: 6,
      name: "Profile",
      icon: <Person className="icon" />,
      url: "/profile",
      tooltip: "Profile",
    },
    {
      id: 7,
      name: "Settings",
      icon: <Settings className="icon" />,
      url: "/settings",
      tooltip: "Settings",
    },
  ];

  const loadingLinks = [
    {
      id: 1,
      name: "Dashboard",
      icon: <Window className="icon" />,
      url: "/loading",
      tooltip: "Dashboard",
    },
  ];

  const cashierLinks = [
    {
      id: 1,
      name: "Dashboard",
      icon: <Window className="icon" />,
      url: "/",
      tooltip: "Dashboard",
    },
    {
      id: 2,
      name: "Payroll",
      icon: <LocalAtm className="icon" />,
      url: "/cashier-payroll",
      tooltip: "Payroll",
    },
    {
      id: 3,
      name: "Profile",
      icon: <Person className="icon" />,
      url: "/profile",
      tooltip: "Profile",
    },
  ];

  // ################# DRAWER CONTENT ################
  const drawer = () => {
    return (
      <Box>
        {userInfo ? (
          <>
            {userInfo?.role.toLowerCase() === "hr" ? (
              <>
                {hrLinks?.map((link) => (
                  <NavLink to={link.url} key={link.id}>
                    {({ isActive }) => (
                      <SideNavListItem
                        disablePadding
                        sx={{
                          display: "block",
                          my: 2,
                          bgcolor: isActive && {
                            background: colors.secondary,
                          },
                          "&:hover": !isActive && {
                            transition: "all ease-in-out 0.3s",
                            "&::before": {
                              transition: "all ease-in-out 0.3s",
                              height: "100%",
                              bottom: 0,
                            },
                          },
                        }}
                      >
                        <ListItemButton
                          sx={{
                            py: 0.5,
                          }}
                        >
                          <ListItemIcon>{link.icon}</ListItemIcon>
                          <ListItemText
                            className="name"
                            primary={link.name}
                            primaryTypographyProps={{
                              fontSize: 14,
                            }}
                          />
                        </ListItemButton>
                      </SideNavListItem>
                    )}
                  </NavLink>
                ))}
              </>
            ) : (
              <>
                {userInfo?.role.toLowerCase() === "cashier" ? (
                  <>
                    {links?.map((link) => (
                      <NavLink to={link.url} key={link.id}>
                        {({ isActive }) => (
                          <SideNavListItem
                            disablePadding
                            sx={{
                              display: "block",
                              my: 2,
                              bgcolor: isActive && {
                                background: colors.secondary,
                              },
                              "&:hover": !isActive && {
                                transition: "all ease-in-out 0.3s",
                                "&::before": {
                                  transition: "all ease-in-out 0.3s",
                                  height: "100%",
                                  bottom: 0,
                                },
                              },
                            }}
                          >
                            <ListItemButton
                              sx={{
                                py: 0.5,
                              }}
                            >
                              <ListItemIcon>{link.icon}</ListItemIcon>
                              <ListItemText
                                className="name"
                                primary={link.name}
                                primaryTypographyProps={{
                                  fontSize: 14,
                                }}
                              />
                            </ListItemButton>
                          </SideNavListItem>
                        )}
                      </NavLink>
                    ))}
                  </>
                ) : (
                  <>
                    {cashierLinks?.map((link) => (
                      <NavLink to={link.url} key={link.id}>
                        {({ isActive }) => (
                          <SideNavListItem
                            disablePadding
                            sx={{
                              display: "block",
                              my: 2,
                              bgcolor: isActive && {
                                background: colors.secondary,
                              },
                              "&:hover": !isActive && {
                                transition: "all ease-in-out 0.3s",
                                "&::before": {
                                  transition: "all ease-in-out 0.3s",
                                  height: "100%",
                                  bottom: 0,
                                },
                              },
                            }}
                          >
                            <ListItemButton
                              sx={{
                                py: 0.5,
                              }}
                            >
                              <ListItemIcon>{link.icon}</ListItemIcon>
                              <ListItemText
                                className="name"
                                primary={link.name}
                                primaryTypographyProps={{
                                  fontSize: 14,
                                }}
                              />
                            </ListItemButton>
                          </SideNavListItem>
                        )}
                      </NavLink>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {loadingLinks?.map((link) => (
              <NavLink to={link.url} key={link.id}>
                {({ isActive }) => (
                  <SideNavListItem
                    disablePadding
                    sx={{
                      display: "block",
                      my: 2,
                      bgcolor: isActive && {
                        background: colors.secondary,
                      },
                      "&:hover": !isActive && {
                        transition: "all ease-in-out 0.3s",
                        "&::before": {
                          transition: "all ease-in-out 0.3s",
                          height: "100%",
                          bottom: 0,
                        },
                      },
                    }}
                  >
                    <ListItemButton
                      sx={{
                        py: 0.5,
                      }}
                    >
                      <ListItemIcon>{link.icon}</ListItemIcon>
                      <ListItemText
                        className="name"
                        primary={link.name}
                        primaryTypographyProps={{
                          fontSize: 14,
                        }}
                      />
                    </ListItemButton>
                  </SideNavListItem>
                )}
              </NavLink>
            ))}
          </>
        )}
      </Box>
    );
  };

  return (
    <>
      {/* ##################### mobile ################# */}
      <Drawer
        container={container}
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: "70%", // Change the width of drawer in mobile
            backgroundColor: colors.primary,
            py: 4,
          },
        }}
      >
        <Toolbar />
        {drawer()}
      </Drawer>

      {/* ##################### desktop ################ */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: "none", sm: "block" },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            whiteSpace: "nowrap",
          },
          [`& .MuiPaper-root`]: { backgroundColor: colors.primary },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {userInfo ? (
              <>
                {userInfo?.role.toLowerCase() === "hr" ? (
                  <>
                    {hrLinks?.map((link) => (
                      <NavLink to={link.url} key={link.id}>
                        {({ isActive }) => (
                          <SideNavListItem
                            disablePadding
                            sx={{
                              display: "block",
                              my: 2,
                              bgcolor: isActive && {
                                background: colors.secondary,
                              },
                              "&:hover": !isActive && {
                                transition: "all ease-in-out 0.3s",
                                "&::before": {
                                  transition: "all ease-in-out 0.3s",
                                  height: "100%",
                                  bottom: 0,
                                },
                              },
                            }}
                          >
                            <ListItemButton
                              sx={{
                                py: 0.5,
                              }}
                            >
                              <ListItemIcon>{link.icon}</ListItemIcon>
                              <ListItemText
                                className="name"
                                primary={link.name}
                                primaryTypographyProps={{
                                  fontSize: 14,
                                }}
                              />
                            </ListItemButton>
                          </SideNavListItem>
                        )}
                      </NavLink>
                    ))}
                  </>
                ) : (
                  <>
                    {userInfo?.role.toLowerCase() === "cashier" ? (
                      <>
                        {links?.map((link) => (
                          <NavLink to={link.url} key={link.id}>
                            {({ isActive }) => (
                              <SideNavListItem
                                disablePadding
                                sx={{
                                  display: "block",
                                  my: 2,
                                  bgcolor: isActive && {
                                    background: colors.secondary,
                                  },
                                  "&:hover": !isActive && {
                                    transition: "all ease-in-out 0.3s",
                                    "&::before": {
                                      transition: "all ease-in-out 0.3s",
                                      height: "100%",
                                      bottom: 0,
                                    },
                                  },
                                }}
                              >
                                <ListItemButton
                                  sx={{
                                    py: 0.5,
                                  }}
                                >
                                  <ListItemIcon>{link.icon}</ListItemIcon>
                                  <ListItemText
                                    className="name"
                                    primary={link.name}
                                    primaryTypographyProps={{
                                      fontSize: 14,
                                    }}
                                  />
                                </ListItemButton>
                              </SideNavListItem>
                            )}
                          </NavLink>
                        ))}
                      </>
                    ) : (
                      <>
                        {cashierLinks?.map((link) => (
                          <NavLink to={link.url} key={link.id}>
                            {({ isActive }) => (
                              <SideNavListItem
                                disablePadding
                                sx={{
                                  display: "block",
                                  my: 2,
                                  bgcolor: isActive && {
                                    background: colors.secondary,
                                  },
                                  "&:hover": !isActive && {
                                    transition: "all ease-in-out 0.3s",
                                    "&::before": {
                                      transition: "all ease-in-out 0.3s",
                                      height: "100%",
                                      bottom: 0,
                                    },
                                  },
                                }}
                              >
                                <ListItemButton
                                  sx={{
                                    py: 0.5,
                                  }}
                                >
                                  <ListItemIcon>{link.icon}</ListItemIcon>
                                  <ListItemText
                                    className="name"
                                    primary={link.name}
                                    primaryTypographyProps={{
                                      fontSize: 14,
                                    }}
                                  />
                                </ListItemButton>
                              </SideNavListItem>
                            )}
                          </NavLink>
                        ))}
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <>
                  {loadingLinks?.map((link) => (
                    <NavLink to={link.url} key={link.id}>
                      {({ isActive }) => (
                        <SideNavListItem
                          disablePadding
                          sx={{
                            display: "block",
                            my: 2,
                            bgcolor: isActive && {
                              background: colors.secondary,
                            },
                            "&:hover": !isActive && {
                              transition: "all ease-in-out 0.3s",
                              "&::before": {
                                transition: "all ease-in-out 0.3s",
                                height: "100%",
                                bottom: 0,
                              },
                            },
                          }}
                        >
                          <ListItemButton
                            sx={{
                              py: 0.5,
                            }}
                          >
                            <ListItemIcon>{link.icon}</ListItemIcon>
                            <ListItemText
                              className="name"
                              primary={link.name}
                              primaryTypographyProps={{
                                fontSize: 14,
                              }}
                            />
                          </ListItemButton>
                        </SideNavListItem>
                      )}
                    </NavLink>
                  ))}
                </>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default SideBar;
