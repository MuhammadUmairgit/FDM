import { useRef, useState, useEffect, useLayoutEffect, useMemo } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Badge,
  Box,
  ClickAwayListener,
  Link,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Popper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";

// project-imports
import MainCard from "components/MainCard";
import IconButton from "components/@extended/IconButton";
import Transitions from "components/@extended/Transitions";
import { ThemeMode } from "config";

// assets
import { Notification } from "iconsax-react";
import Avatar from "components/@extended/Avatar";
import CustomText from "components/CustomText/CustomText";
import { useMutation, useQuery } from "react-query";
import {
  getNotifications,
  markAsRead,
  markAsReadAll,
} from "services/notification/notification";
import { useMock } from "contexts/MockContext";
import {
  ALERT_CODE_COLOR,
  ALERT_TYPES,
  alertTypeKeys,
  alertTypes,
  getUserDetails,
  POSITION_LABELS,
  typesOfStatus,
  TYRE_STATUS_ICON_COLOR,
  TYRE_STATUS_TEXT_COLOR,
  USER_ROLE,
} from "utils/constants";
import { formatDateTime, getTimeAgo } from "utils/dateTime";
import CustomVirtualScroll from "components/common/CustomVirtualScroll";
import DeviceThermostatOutlinedIcon from "@mui/icons-material/DeviceThermostatOutlined";
import { Chat } from "@mui/icons-material";
import { useAuth } from "contexts/AuthContext";
import { getCustomNotificationKey } from "utils/notificationKeyUtil";
import { useTranslation } from "react-i18next";

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

const NotificationPage = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down("md"));

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const { isMock } = useMock();
  const { role, selectedClientAuth } = useAuth();
  const { t } = useTranslation();

  let { id: rawUserId } = getUserDetails() || {};
  const userId = getCustomNotificationKey(role, rawUserId, selectedClientAuth);

  // Fix: Handle multiple user IDs separately
  const getNotificationsFromStorage = () => {
    try {
      const notificationsStore = JSON.parse(localStorage.getItem("tpms_notifications")) || {};
      
      // If userId is an array like [17,444], handle each ID separately
      if (Array.isArray(userId)) {
        const allMarkedNotifications = [];
        userId.forEach(id => {
          const userNotifications = notificationsStore[id]?.notificationIds;
          if (Array.isArray(userNotifications)) {
            allMarkedNotifications.push(...userNotifications);
          } else if (typeof userNotifications === 'string') {
            try {
              const parsed = JSON.parse(userNotifications);
              if (Array.isArray(parsed)) {
                allMarkedNotifications.push(...parsed);
              }
            } catch {
              // Ignore corrupted data
            }
          }
        });
        return allMarkedNotifications;
      } else {
        // Single user ID handling
        const userNotifications = notificationsStore[userId]?.notificationIds;
        
        if (Array.isArray(userNotifications)) {
          return userNotifications;
        } else if (typeof userNotifications === 'string') {
          try {
            const parsed = JSON.parse(userNotifications);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return [];
      }
    } catch {
      return [];
    }
  };

  const [markedNotifications, setMarkedNotifications] = useState(getNotificationsFromStorage());

  const isCustomerLevelUserAccess =
    role == USER_ROLE.CustomerAdmin || role == USER_ROLE.CustomerUser;

  // -------------------------------------
  // STEP A: add these refs and side-effect
  // -------------------------------------
  // const audioRef = useRef(null); // a ref to the <audio> element
  // const prevCountRef = useRef(0); // store previous notification length
  const notificationSound = useMemo(
    () => new Audio("/mixkit-dry-pop-up-notification-alert-2356.mp3"),
    []
  );
  const { data: notificationData, refetch: refetchNotificationData } = useQuery(
    ["getNotifications", isMock],
    () =>
      getNotifications({
        isMock,
        customerId: !isCustomerLevelUserAccess ? selectedClientAuth : null,
      }),
    {
      refetchInterval: 5000,
      // onSuccess: (data) => {
      //   const storageKey = "tpms_notifications";
      //   const today = new Date().toDateString();

      //   // Prevent invalid or incomplete userId keys like "380_null"
      //   const userIdString = userId?.toString() || "";
      //   if (
      //     !userIdString ||
      //     userIdString.includes("null") ||
      //     userIdString.includes("undefined")
      //   ) {
      //     return;
      //   }

      //   let storedData = JSON.parse(localStorage.getItem(storageKey)) || {};

      //   // Clean old entries (different day)
      //   for (const [id, entry] of Object.entries(storedData)) {
      //     const entryDate = new Date(entry.time).toDateString();
      //     if (entryDate !== today) {
      //       delete storedData[id];
      //     }
      //   }

      //   // Now update the current user's notification IDs
      //   const updatedMarkedNotificationsData =
      //     storedData[userId]?.notificationIds || [];

      //   const updatedMarkedNotifications =
      //     updatedMarkedNotificationsData.filter((id) =>
      //       data?.response.some((notification) => notification.id === id)
      //     );

      //   storedData[userId] = {
      //     notificationIds: updatedMarkedNotifications,
      //     time: new Date().toISOString(),
      //   };

      //   localStorage.setItem(storageKey, JSON.stringify(storedData));
      //   setMarkedNotifications(updatedMarkedNotifications);
      // },

      onSuccess: (data) => {
        const storageKey = "tpms_notifications"; // for marked notifications
        const latestKey = "tpms_latest_notifications"; // for comparing new notifications
        const today = new Date().toDateString();

        const userIdString = userId?.toString() || "";
        const customerId = selectedClientAuth; // or however you define the active customer

        if (
          !userIdString ||
          userIdString.includes("null") ||
          userIdString.includes("undefined") ||
          !customerId
        ) {
          return;
        }

        const currentNotificationIds = data?.response.map((n) => n.id) || [];

        // 🔔 STEP 1: Compare new notifications for this customer
        const prevAllCustomers = JSON.parse(
          localStorage.getItem(latestKey) || "{}"
        );

        let hasNewNotifications = false;

        if (Array.isArray(userId)) {
          // Check each user ID separately for new notifications
          userId.forEach(userIdItem => {
            const prevCustomersIds = prevAllCustomers[userIdItem] || [];
            const newNotificationIds = currentNotificationIds.filter(
              (id) => !prevCustomersIds.includes(id)
            );
            if (newNotificationIds.length > 0) {
              hasNewNotifications = true;
            }
          });
        } else {
          const prevCustomersIds = prevAllCustomers[customerId] || [];
          const newNotificationIds = currentNotificationIds.filter(
            (id) => !prevCustomersIds.includes(id)
          );
          if (newNotificationIds.length > 0) {
            hasNewNotifications = true;
          }
        }

        if (hasNewNotifications) {
          notificationSound.play().catch((err) => {
            console.warn("Notification sound failed:", err);
          });
        }

        // Save the updated notification list for this customer
        // Handle multiple user IDs separately for latest notifications
        if (Array.isArray(userId)) {
          const updatedLatestNotifications = { ...prevAllCustomers };
          userId.forEach(userIdItem => {
            updatedLatestNotifications[userIdItem] = currentNotificationIds;
          });
          localStorage.setItem(latestKey, JSON.stringify(updatedLatestNotifications));
        } else {
          localStorage.setItem(
            latestKey,
            JSON.stringify({
              ...prevAllCustomers,
              [customerId]: currentNotificationIds,
            })
          );
        }

        // ✅ STEP 2: Your existing logic — clean old entries and manage marked notifications
        let storedData = JSON.parse(localStorage.getItem(storageKey)) || {};

        // Clean old entries (different day) - handle both single IDs and arrays
        for (const [id, entry] of Object.entries(storedData)) {
          if (entry && entry.time) {
            const entryDate = new Date(entry.time).toDateString();
            if (entryDate !== today) {
              delete storedData[id];
            }
          } else {
            // Remove entries without proper structure
            delete storedData[id];
          }
        }

        // Fix: Handle multiple user IDs separately
        let allUpdatedMarkedNotifications = [];
        
        if (Array.isArray(userId)) {
          // Handle each user ID separately
          userId.forEach(id => {
            const updatedMarkedNotificationsData = storedData[id]?.notificationIds || [];
            
            // Ensure it's an array
            const safeMarkedNotifications = Array.isArray(updatedMarkedNotificationsData) 
              ? updatedMarkedNotificationsData 
              : [];

            const updatedMarkedNotifications = safeMarkedNotifications.filter((notificationId) =>
              data?.response.some((notification) => notification.id === notificationId)
            );

            // Store each user ID separately
            storedData[id] = {
              notificationIds: updatedMarkedNotifications,
              time: new Date().toISOString(),
            };
            
            allUpdatedMarkedNotifications.push(...updatedMarkedNotifications);
          });
        } else {
          // Single user ID handling
          const updatedMarkedNotificationsData = storedData[userId]?.notificationIds || [];
          
          const safeMarkedNotifications = Array.isArray(updatedMarkedNotificationsData) 
            ? updatedMarkedNotificationsData 
            : [];

          const updatedMarkedNotifications = safeMarkedNotifications.filter((notificationId) =>
            data?.response.some((notification) => notification.id === notificationId)
          );

          storedData[userId] = {
            notificationIds: updatedMarkedNotifications,
            time: new Date().toISOString(),
          };
          
          allUpdatedMarkedNotifications = updatedMarkedNotifications;
        }

        localStorage.setItem(storageKey, JSON.stringify(storedData));
        setMarkedNotifications(allUpdatedMarkedNotifications);
      },
    }
  );

  // const notificationSound = useMemo(
  //   () => new Audio("/mixkit-dry-pop-up-notification-alert-2356.mp3"),
  //   []
  // );

  // const hasMounted = useRef(false);

  // useEffect(() => {
  //   const currentCount = notificationData?.response?.length ?? 0;

  //   // Get the previous count from localStorage, default to 0
  //   const prevCount = parseInt(
  //     localStorage.getItem("prevNotificationCount") || "0",
  //     10
  //   );

  //   if (hasMounted.current) {
  //     if (currentCount > prevCount) {
  //       notificationSound.currentTime = 0;
  //       notificationSound.play().catch((err) => {
  //         console.warn("Audio play failed even after interaction:", err);
  //       });
  //     }

  //     // ✅ Update count only after initial mount
  //     localStorage.setItem("prevNotificationCount", currentCount.toString());
  //   } else {
  //     hasMounted.current = true;
  //   }
  // }, [notificationData]);

  const { mutate: markAsReadMutation } = useMutation(
    ({ id, isMock }) => markAsRead(id, isMock),
    {
      onSuccess: () => {
        refetchNotificationData();
      },
      onError: () => {},
    }
  );

  const { mutate: markAsReadAllMutation } = useMutation(
    (isMock) => markAsReadAll(isMock),
    {
      onSuccess: () => {
        refetchNotificationData();
      },
      onError: () => {},
    }
  );

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const onClickNotificationItem = (id) => {
    if (!markedNotifications.includes(id)) {
      const updatedMarkedNotifications = [...markedNotifications, id];
      setMarkedNotifications(updatedMarkedNotifications);

      // Fix: Handle multiple user IDs separately
      const currentStore = JSON.parse(localStorage.getItem("tpms_notifications")) || {};

      if (Array.isArray(userId)) {
        // Update each user ID separately
        userId.forEach(userIdItem => {
          const existingNotifications = currentStore[userIdItem]?.notificationIds || [];
          if (!existingNotifications.includes(id)) {
            currentStore[userIdItem] = {
              notificationIds: [...existingNotifications, id],
              time: new Date().toISOString(),
            };
          }
        });
      } else {
        // Single user ID handling
        currentStore[userId] = {
          notificationIds: updatedMarkedNotifications,
          time: new Date().toISOString(),
        };
      }

      if (userId) {
        localStorage.setItem("tpms_notifications", JSON.stringify(currentStore));
      }
    }
  };

  const onMarkAllReadClick = () => {
    const allNotificationIds =
      notificationData?.response?.map((notification) => notification.id) || [];

    setMarkedNotifications(allNotificationIds);

    // Fix: Handle multiple user IDs separately
    const currentStore = JSON.parse(localStorage.getItem("tpms_notifications")) || {};
    
    if (Array.isArray(userId)) {
      // Update each user ID separately
      userId.forEach(userIdItem => {
        currentStore[userIdItem] = {
          notificationIds: allNotificationIds,
          time: new Date().toISOString(),
        };
      });
    } else {
      // Single user ID handling
      currentStore[userId] = {
        notificationIds: allNotificationIds,
        time: new Date().toISOString(),
      };
    }

    if (userId) {
      localStorage.setItem("tpms_notifications", JSON.stringify(currentStore));
    }
  };

  const renderErrorValuePostFix = (alertCode) => {
    if (alertCode === 1 || alertCode === 2) return " bar";
    else if (alertCode === 3 || alertCode === 4) return " °C";
    else if (alertCode === 7 || alertCode === 8) return " km";
    else return "";
  };

  const renderStatusIcon = (alertCode) => {
    if (alertCode === 1 || alertCode === 2) {
      return (
        <Avatar
          type="filled"
          sx={{
            bgcolor: ALERT_CODE_COLOR[alertCode],
            border: `1px solid ${TYRE_STATUS_ICON_COLOR[alertCode]}`,
          }}
        >
          <DeviceThermostatOutlinedIcon
            sx={{
              color: TYRE_STATUS_TEXT_COLOR[alertCode],
            }}
          />
        </Avatar>
      );
    } else if (alertCode === 3 || alertCode === 4) {
      return (
        <Avatar
          type="filled"
          sx={{
            bgcolor: ALERT_CODE_COLOR[alertCode],
            border: `1px solid ${TYRE_STATUS_ICON_COLOR[alertCode]}`,
          }}
        >
          <svg
            fill={TYRE_STATUS_ICON_COLOR[alertCode]}
            width="25px"
            height="25px"
            viewBox="0 0 14 14"
            role="img"
            focusable="false"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m 3.4767038,12.31335 c -0.67992,-0.039 -0.728272,-0.052 -0.803235,-0.2249 -0.02231,-0.051 -0.135858,-0.4012 -0.252334,-0.7775 l -0.211775,-0.6841 -0.212772,-0.3186 c -0.230041,-0.3444997 -0.496677,-0.8688997 -0.64244,-1.2635997 -0.11163,-0.3023 -0.244281,-0.8284 -0.297156,-1.1785 -0.0636,-0.4212 -0.07604,-1.0756 -0.02686,-1.4135 0.140864,-0.968 0.499903,-1.8707 1.055412,-2.6534 0.302845,-0.4267 0.326411,-0.5024 0.396083,-1.2724 0.05342,-0.5904 0.06811,-0.6492 0.191274,-0.7657 0.114098,-0.108 0.179796,-0.1194 0.685781,-0.1193 0.452647,10e-5 0.480334,0 0.570086,0.057 0.178091,0.1079 0.190546,0.1487 0.190317,0.6246 -2.48e-4,0.4828 -0.02917,0.6465 -0.160476,0.9082 -0.04726,0.094 -0.384248,0.5756 -0.748854,1.0698 -0.364605,0.4943 -0.693144,0.9544 -0.730085,1.0226 -0.158309,0.2923 -0.290046,0.9369 -0.31166,1.5251 -0.04482,1.2197 0.395902,2.428 1.225599,3.3601997 0.121399,0.1364 0.277376,0.2954 0.346616,0.3534 l 0.125891,0.1054 3.14259,0 3.1425952,0 0.19894,-0.1922 c 1.03673,-1.0014997 1.5719,-2.3744997 1.47926,-3.7949997 -0.0355,-0.5439 -0.18846,-1.1817 -0.34102,-1.4216 -0.04,-0.063 -0.35145,-0.4926 -0.69212,-0.9548 -0.71294,-0.9672 -0.74723,-1.0198 -0.8402902,-1.2867 -0.066,-0.1892 -0.0692,-0.2198 -0.07,-0.6614 -8.3e-4,-0.4297 0.003,-0.468 0.0503,-0.5317 0.1226802,-0.1646 0.1430202,-0.1701 0.6635502,-0.1788 0.5125,-0.01 0.61122,0.01 0.73312,0.1085 0.11207,0.094 0.14543,0.2278 0.18874,0.755 0.0635,0.7731 0.0874,0.8461 0.44864,1.3696 0.50672,0.7345 0.82577,1.521 0.97695,2.4084 0.0924,0.5426 0.061,1.3562 -0.0773,1.999 -0.14263,0.6632 -0.48435,1.4619 -0.87268,2.0397997 l -0.20641,0.3071 -0.22065,0.7143 c -0.12136,0.3928 -0.23999,0.746 -0.26363,0.7849 -0.076,0.1249 -0.1444,0.1418 -0.69146,0.1706 -0.27875,0.015 -0.58772,0.033 -0.6866102,0.041 l -0.17978,0.014 0,-0.3121 0,-0.3121 -0.21079,0 -0.21078,0 0,0.2975 0,0.2976 -0.63236,0 -0.63236,0 0,-0.2976 0,-0.2975 -0.21078,0 -0.210789,0 0,0.2975 0,0.2976 -0.632356,0 -0.632357,0 0,-0.2976 0,-0.2975 -0.210785,0 -0.210786,0 0,0.2975 0,0.2976 -0.632356,0 -0.632356,0 0,-0.2976 0,-0.2975 -0.210786,0 -0.210785,0 0,0.3099 0,0.31 -0.09299,0 c -0.05115,0 -0.365566,-0.019 -0.698708,-0.038 z m 3.229728,-2.3095 c -0.254728,-0.091 -0.445305,-0.2668997 -0.558284,-0.5153997 -0.0447,-0.098 -0.05563,-0.1677 -0.05627,-0.3576 -6.61e-4,-0.2047 0.0079,-0.2542 0.06566,-0.3774 0.08782,-0.1873 0.258312,-0.3657 0.435021,-0.4551 0.131221,-0.066 0.165179,-0.072 0.403656,-0.073 0.230463,-10e-5 0.276613,0.01 0.401645,0.066 0.173158,0.081 0.341556,0.2453 0.432261,0.4214 0.0568,0.1102 0.0699,0.1717 0.0782,0.3679 0.008,0.1979 10e-4,0.2586 -0.044,0.3791 -0.07581,0.2012 -0.275084,0.4111 -0.476799,0.502 -0.204625,0.092 -0.490129,0.1096997 -0.681153,0.041 z m -0.05102,-2.4120997 c -0.185841,-0.073 -0.384573,-0.2646 -0.483142,-0.4648 l -0.08119,-0.1649 0,-2.0712 0,-2.0712 0.07823,-0.1651 c 0.191331,-0.4038 0.628706,-0.6143 1.051461,-0.506 0.274673,0.07 0.474835,0.2312 0.61244,0.4923 l 0.0681,0.1292 0,2.1203 0,2.1203 -0.0697,0.1323 c -0.08938,0.1697 -0.250094,0.3299 -0.417883,0.4165 -0.113784,0.059 -0.167165,0.069 -0.380344,0.076 -0.204741,0.01 -0.270655,-10e-4 -0.378001,-0.044 z" />
          </svg>
        </Avatar>
      );
    } else if (alertCode === 7 || alertCode === 8) {
      return (
        <Avatar
          type="filled"
          sx={{
            bgcolor: ALERT_CODE_COLOR[alertCode],
            border: `1px solid ${TYRE_STATUS_ICON_COLOR[alertCode]}`,
          }}
        >
          <svg
            width="800px"
            height="800px"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            stroke-width="3"
            stroke={TYRE_STATUS_ICON_COLOR[alertCode]}
            fill={"none"}
          >
            <path d="M17.94,54.81a.1.1,0,0,1-.14,0c-1-1.11-11.69-13.23-11.69-21.26,0-9.94,6.5-12.24,11.76-12.24,4.84,0,11.06,2.6,11.06,12.24C28.93,41.84,18.87,53.72,17.94,54.81Z" />
            <circle cx="17.52" cy="31.38" r="4.75" />
            <path d="M49.58,34.77a.11.11,0,0,1-.15,0c-.87-1-9.19-10.45-9.19-16.74,0-7.84,5.12-9.65,9.27-9.65,3.81,0,8.71,2,8.71,9.65C58.22,24.52,50.4,33.81,49.58,34.77Z" />
            <circle cx="49.23" cy="17.32" r="3.75" />
            <path d="M17.87,54.89a28.73,28.73,0,0,0,3.9.89" />
            <path
              d="M24.68,56.07c2.79.12,5.85-.28,7.9-2.08,5.8-5.09,2.89-11.25,6.75-14.71a16.72,16.72,0,0,1,4.93-3"
              stroke-dasharray="7.8 2.92"
            />
            <path d="M45.63,35.8a23,23,0,0,1,3.88-.95" />
          </svg>
        </Avatar>
      );
    }
    return (
      <Avatar
        type="filled"
        sx={{
          bgcolor: "#0000001a",
          border: "1px solid black",
        }}
      >
        <Chat size={20} variant="Bold" sx={{ color: "black" }} />
      </Avatar>
    );
  };

  const iconBackColorOpen =
    theme.palette.mode === ThemeMode.DARK
      ? "background.default"
      : "secondary.200";
  const iconBackColor =
    theme.palette.mode === ThemeMode.DARK ? "secondary.200" : "#e3e6e9";

  const iconCustomStyle = {
    width: "35px",
    height: "35px",
    padding: "8px !important",
  };

  // Badge count calculation
  const unreadCount =
    notificationData?.response?.length -
      markedNotifications.filter((id) =>
        notificationData?.response?.some(
          (notification) => notification.id === id
        )
      ).length || 0;

  const formatAlertRawValue = (value) => {
    if (value == null || isNaN(value)) return "";

    const numericValue = parseFloat(value);
    const barValue = numericValue / 100;
    if (barValue >= 1000000) {
      return (barValue / 1000000).toFixed(2);
    }
    return barValue.toFixed(2);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.5 }}>
      {/* -------------------------------------
          STEP B: place the audio element here
          -------------------------------------
      */}
      {/* <audio ref={audioRef} preload="auto">
        <source
          src="/mixkit-dry-pop-up-notification-alert-2356.mp3"
          type="audio/mpeg"
        />
      </audio> */}

      <IconButton
        color="secondary"
        variant="light"
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? "profile-grow" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        size="large"
        sx={{
          color: "secondary.main",
          bgcolor: open ? iconBackColorOpen : iconBackColor,
          p: 1,
          ...iconCustomStyle,
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="success"
          sx={{ width: "18px", "& .MuiBadge-badge": { top: -2, right: -2 } }}
        >
          <Notification variant="Bold" />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? "bottom" : "bottom-end"}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [matchesXs ? -5 : 0, 9],
              },
            },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Transitions
            type="grow"
            position={matchesXs ? "top" : "top-right"}
            sx={{ overflow: "hidden" }}
            in={open}
            {...TransitionProps}
          >
            <Paper
              sx={{
                "& .MuiCardContent-root ": {
                  p: 0,
                  minWidth: "370px",
                },
                boxShadow: theme.customShadows.z1,
                borderRadius: 1.5,
                width: "100%",
                minWidth: 285,
                maxWidth: 420,
                [theme.breakpoints.down("md")]: {
                  maxWidth: 285,
                },
              }}
            >
              <ClickAwayListener
                onClickAway={handleClose}
                sx={{ padding: "0px !important" }}
              >
                <MainCard elevation={0} border={false}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ padding: "10px 10px 0px" }}
                  >
                    <Typography variant="h5">
                      <CustomText text="notifications" />
                    </Typography>
                    <Link
                      href="#"
                      variant="h6"
                      color="primary"
                      onClick={onMarkAllReadClick}
                    >
                      <CustomText text="mark_all_read" />
                    </Link>
                  </Stack>
                  {notificationData?.response?.length > 0 ? (
                    <List
                      component="nav"
                      sx={{
                        "& .MuiListItemButton-root": {
                          p: 1.5,
                          my: 1.5,
                          border: `1px solid ${theme.palette.divider}`,
                          "&:hover": {
                            bgcolor: "primary.lighter",
                            borderColor: theme.palette.primary.light,
                          },
                          "& .MuiListItemSecondaryAction-root": {
                            mt: "6px",
                            ml: 1,
                            top: "auto",
                            right: "auto",
                            alignSelf: "flex-start",
                            transform: "none",
                            position: "relative",
                          },
                        },
                      }}
                    >
                      <CustomVirtualScroll
                        items={notificationData?.response}
                        renderItem={(index, item) => {
                          const {
                            licensePlate,
                            axle,
                            position,
                            createdDate,
                            id,
                            alertCode,
                            value,
                          } = item || {};
                          const isRead = markedNotifications.includes(id);

                          return (
                            <ListItemButton
                              onClick={() => onClickNotificationItem(id)}
                              key={id}
                              sx={{
                                marginRight: "6px",
                                marginLeft: "10px",
                                border: "2px solid !important",
                                borderColor: !isRead
                                  ? "#4680ff !important"
                                  : "rgba(219, 224, 229, 0.65) !important",
                              }}
                            >
                              <ListItemAvatar>
                                {renderStatusIcon(alertCode)}
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="h6">
                                    <Typography
                                      component="span"
                                      variant="subtitle1"
                                    >
                                      {`${t(
                                        alertTypeKeys[alertCode] ||
                                          "unknown_alert"
                                      )} `}
                                    </Typography>
                                    {t("for")}
                                    <Typography
                                      component="span"
                                      variant="subtitle1"
                                    >
                                      {` ${licensePlate} ${
                                        value == null || isNaN(value) ? "" : ","
                                      } `}
                                    </Typography>
                                    <Typography
                                      component="span"
                                      variant="subtitle1"
                                    >
                                      {` ${
                                        typesOfStatus[alertCode] ==
                                          "WARNING_PRESSURE" ||
                                        typesOfStatus[alertCode] ==
                                          "ALERT_PRESSURE"
                                          ? formatAlertRawValue(value)
                                          : value == null || isNaN(value)
                                          ? ""
                                          : value
                                      } ${renderErrorValuePostFix(alertCode)}`}
                                    </Typography>
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="h6">
                                    {`${t("axle")} ${axle}, `}

                                    {position &&
                                      `${t(
                                        POSITION_LABELS[
                                          position?.toLowerCase()
                                        ] ?? position
                                      )}, `}

                                    <Typography
                                      component="span"
                                      variant="subtitle1"
                                    >
                                      {getTimeAgo(createdDate)}
                                    </Typography>
                                  </Typography>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Typography variant="caption" noWrap>
                                  {formatDateTime(createdDate)}
                                </Typography>
                              </ListItemSecondaryAction>
                            </ListItemButton>
                          );
                        }}
                      />
                    </List>
                  ) : (
                    <Box
                      sx={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        display: "flex",
                        justifyContent: "center",
                        textAlign: "center",
                        alignItems: "center",
                        color: "#0c6cc1",
                        height: "auto",
                        minHeight: "360px",
                        overflow: "auto",
                      }}
                    >
                      <CustomText text={"no_data_found"} />
                    </Box>
                  )}
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default NotificationPage;