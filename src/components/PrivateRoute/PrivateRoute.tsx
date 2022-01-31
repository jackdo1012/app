import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Outlet } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { setUsername } from "../../slices/username";
import { serverUrl } from "../../app/env";

enum AUTH_STATUS {
    AUTHENTICATED,
    UNAUTHENTICATED,
    PENDING,
}

const PrivateRoute: React.FC = function () {
    const [auth, setAuth] = useState<AUTH_STATUS>(AUTH_STATUS.PENDING);

    const dispatch = useAppDispatch();

    useEffect(() => {
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
                    .then((data) => data.data);
                setAuth(
                    authStatus.success
                        ? AUTH_STATUS.AUTHENTICATED
                        : AUTH_STATUS.UNAUTHENTICATED,
                );
                dispatch(setUsername(authStatus.username));
            } catch (err) {
                setAuth(AUTH_STATUS.UNAUTHENTICATED);
            }
        })();
    }, []);

    return auth === AUTH_STATUS.AUTHENTICATED ? (
        <Outlet />
    ) : auth === AUTH_STATUS.PENDING ? (
        <></>
    ) : (
        <Navigate to="/login" />
    );
};

export default PrivateRoute;
