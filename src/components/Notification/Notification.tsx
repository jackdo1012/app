import React, { useEffect, useRef, useState } from "react";
import styles from "./Notification.module.scss";
import axios from "axios";
import { serverUrl } from "../../app/env";
import {
    Notification as EachNotification,
    Notifications,
} from "../../app/types";
import { removeAll } from "../../slices/activeNotification";
import { useAppDispatch } from "../../app/hooks";
import SocketIO from "../../app/socket";

const Notification: React.FC = function () {
    const [notiifcations, setNotifications] = useState<EachNotification[]>([]);
    const [page, setPage] = useState<number>(1);
    const [max, setMax] = useState<boolean>(false);

    const bottomElement = useRef<HTMLDivElement>();

    const dispatch = useAppDispatch();

    const resetNoti: (title?: string, body?: string) => Promise<void> = async (
        _title,
        _body,
    ) => {
        const notificationResponse = await axios
            .get<{
                success: boolean;
                notification?: Notifications;
                message?: string;
            }>(`${serverUrl}/notification`, {
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })
            .then((data) => data.data);
        if (notificationResponse.success) {
            notificationResponse.notification &&
                setNotifications(
                    notificationResponse.notification.notificationList,
                );
        }
    };
    useEffect(() => {
        (async () => {
            try {
                await resetNoti();

                SocketIO.getPrivateComment()?.on(
                    "new-comment-notification",
                    resetNoti,
                );
                SocketIO.getPrivatePost()?.on(
                    "new-post-notification",
                    resetNoti,
                );
                SocketIO.getPrivateFollow()?.on(
                    "new-follow-notification",
                    resetNoti,
                );
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    const seeAll = async () => {
        try {
            const response = await axios
                .put(
                    `${serverUrl}/notification/readAll`,
                    {},
                    {
                        headers: {
                            authorization: `Bearer ${localStorage.getItem(
                                "token",
                            )}`,
                        },
                    },
                )
                .then((data) => data.data);
            if (response.success) {
                dispatch(removeAll());
                resetNoti();
            }
        } catch (err: any) {
            console.log(err.message);
        }
    };

    const newNotificationList = async () => {
        if (bottomElement.current && !max) {
            const { scrollTop, scrollHeight, clientHeight } =
                bottomElement.current;
            if (scrollTop + clientHeight === scrollHeight) {
                const notificationResponse = await axios
                    .get<{
                        success: boolean;
                        notification?: Notifications;
                        message?: string;
                    }>(`${serverUrl}/notification?page=${page + 1}`, {
                        headers: {
                            authorization: `Bearer ${localStorage.getItem(
                                "token",
                            )}`,
                        },
                    })
                    .then((data) => data.data);
                if (notificationResponse.success) {
                    if (
                        notificationResponse.notification &&
                        notificationResponse.notification?.notificationList
                            .length > 0
                    ) {
                        const newList: EachNotification[] =
                            notificationResponse.notification?.notificationList;
                        setPage(page + 1);
                        setNotifications((prev) => [...prev, ...newList]);
                    } else {
                        setMax(true);
                    }
                }
            }
        }
    };

    return (
        <div
            ref={bottomElement as React.RefObject<HTMLDivElement>}
            onScroll={newNotificationList}
            className={styles.notifications}
        >
            <button onClick={seeAll} className={styles.seeAll}>
                See all
            </button>
            {notiifcations.map((notification, index) => (
                <div
                    className={`${styles.notification}${
                        notification.read ? " " + styles.read : ""
                    }`}
                    key={index}
                >
                    <div className={styles.title}>{notification.title}</div>
                    <div className={styles.body}>{notification.body}</div>
                </div>
            ))}
        </div>
    );
};

export default Notification;
