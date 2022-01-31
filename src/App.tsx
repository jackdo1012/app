import React, { useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Home from "./components/Home/Home";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import { useAppDispatch } from "./app/hooks";
import { setUsername } from "./slices/username";
import User from "./components/User/User";
import EachPost from "./components/EachPost/EachPost";
import Setting from "./components/Setting/Setting";
import Navbar from "./components/Common/Navbar/Navbar";
import NotFound from "./components/Common/NotFound/NotFound";
import EachNotification from "./components/Notification/Notification";
import { Notifications, Notification } from "./app/types";
import axios from "axios";
import { increaseByOne, setAmount } from "./slices/activeNotification";
import SocketIO from "./app/socket";
import { serverUrl } from "./app/env";

interface NotificationsResponse {
    success: boolean;
    notification?: Notifications;
    message?: string;
}

const App: React.FC = function () {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        dispatch(setUsername(""));
        navigate("/login");
    };

    // const { activeNotification } = useAppSelector((state: RootState) => state);

    useEffect(() => {
        const addNoti: (title: string, body: string) => void = (
            _title,
            _body,
        ) => {
            dispatch(increaseByOne());
        };

        // * socket io initialization
        SocketIO.initPrivateFollow();
        SocketIO.initPrivateComment();
        SocketIO.initPrivatePost();
        SocketIO.getPrivateComment()?.on("new-comment-notification", addNoti);
        SocketIO.getPrivatePost()?.on("new-post-notification", addNoti);
        SocketIO.getPrivateFollow()?.on("new-follow-notification", addNoti);

        (async () => {
            try {
                const authStatus = await axios
                    .get(`${serverUrl}/auth`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token",
                            )}`,
                        },
                    })
                    .then((data) => data.data)
                    .catch((err) => err.response.data);
                authStatus.success &&
                    dispatch(setUsername(authStatus.username));

                const notificationResponse = await axios
                    .get<NotificationsResponse>(`${serverUrl}/notification`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token",
                            )}`,
                        },
                    })
                    .then((data) => data.data)
                    .catch((err) => err.response.data);
                const numberOfNotRead: number = notificationResponse.success
                    ? notificationResponse.notification?.notificationList.filter(
                          (noti: Notification) => !noti.read,
                      ).length || 0
                    : 0;
                dispatch(setAmount(numberOfNotRead));
            } catch (error) {
                console.log(error);
            }
        })();
    }, [dispatch]);

    return (
        <div className="App">
            <Navbar logout={logout} />
            <Routes>
                <Route element={<PrivateRoute />}>
                    <Route path="/" element={<Navigate to="/home" />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/setting" element={<Setting />} />
                    <Route
                        path="/notification"
                        element={<EachNotification />}
                    />
                </Route>
                <Route path="/u/:user" element={<User />} />
                <Route path="/p/:postId" element={<EachPost />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="*" element={<NotFound message="" />} />
            </Routes>
        </div>
    );
};

export default App;
