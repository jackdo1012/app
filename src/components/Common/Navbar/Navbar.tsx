import React, { memo, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import { RootState } from "../../../app/store";
import styles from "./Navbar.module.scss";
import { PublicUserInfoResponse, PublicUsers } from "../../../app/types";
import axios from "axios";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import DropDown from "./DropDown";
import { IoMdNotificationsOutline, IoMdNotifications } from "react-icons/io";
import { serverUrl } from "../../../app/env";

interface Props {
    logout: () => void;
}

const Navbar: React.FC<Props> = memo(function ({ logout }) {
    const { username, activeNotification } = useAppSelector(
        (state: RootState) => state,
    );

    const location = useLocation();
    const navigate = useNavigate();

    const [publicUserInfo, setPublicUserInfo] = useState<PublicUsers>(
        {} as PublicUsers,
    );
    const [dropDownStatus, setDropDownStatus] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            if (username !== "") {
                const publicUserInfo = await axios
                    .get<PublicUserInfoResponse>(
                        `${serverUrl}/user/public/${username}`,
                    )
                    .then((data) => data.data);
                setPublicUserInfo(publicUserInfo.user || ({} as PublicUsers));
            }
        })();
    }, [username]);

    return (
        <div className={styles.navbar}>
            <div className={styles.navbarLeft}>
                <NavLink
                    to="/"
                    className={`${styles.nav} ${styles.hover}${
                        location.pathname === "/home" ? " " + styles.active : ""
                    }`}
                >
                    Home
                </NavLink>
                <NavLink
                    to="/setting"
                    className={`${styles.nav} ${styles.hover}${
                        location.pathname === "/setting"
                            ? " " + styles.active
                            : ""
                    }`}
                >
                    Setting
                </NavLink>
            </div>
            {Object.entries(publicUserInfo).length > 0 && (
                <div className={styles.navbarRight}>
                    <div className={styles.notiNav + " " + styles.nav}>
                        {location.pathname === "/notification" ? (
                            <IoMdNotifications />
                        ) : (
                            <NavLink to="/notification">
                                <IoMdNotificationsOutline />
                            </NavLink>
                        )}
                        {activeNotification.value > 0 && (
                            <p className={styles.notiCount}>
                                {activeNotification.value}
                            </p>
                        )}
                    </div>
                    <div className={`${styles.nav}`}>
                        <div
                            className={styles.navBasicInfo}
                            onClick={() => navigate(`/u/${username}`)}
                        >
                            <img
                                className={styles.navAvatar}
                                src={publicUserInfo.public.avatarUrl}
                                alt=""
                            />
                            <span className={styles.navUsername}>
                                {publicUserInfo.public.username}
                            </span>
                        </div>
                        <div
                            className={styles.dropDownBtn}
                            onClick={() => setDropDownStatus((prev) => !prev)}
                        >
                            <RiArrowDropDownLine />
                        </div>
                        {dropDownStatus && (
                            <>
                                <DropDown
                                    logout={logout}
                                    closeDropDown={() => {
                                        setDropDownStatus(false);
                                        setPublicUserInfo({} as PublicUsers);
                                    }}
                                />
                                <div
                                    className={styles.navOverlay}
                                    onClick={() => setDropDownStatus(false)}
                                ></div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default Navbar;
