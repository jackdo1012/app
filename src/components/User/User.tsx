import React, { useEffect, useState } from "react";
import styles from "./User.module.scss";
import { useParams } from "react-router-dom";
import { FollowResponse, FullUserInfoResponse } from "../../app/types";
import axios from "axios";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import { HiOutlineUserAdd, HiOutlineUserRemove } from "react-icons/hi";
import FollowList from "./FollowList";
import Post from "../Common/Post/Post";
import SocketIO from "../../app/socket";
import NotFound from "../Common/NotFound/NotFound";
import { serverUrl } from "../../app/env";

interface IFollowList {
    show: boolean;
    follows?: string[];
}

const User: React.FC = function () {
    const { user } = useParams();

    const { username } = useAppSelector((state: RootState) => state);

    const [userInfo, setUserInfo] = useState<FullUserInfoResponse>({
        success: false,
    });
    const [followStatus, setFollowStatus] = useState<boolean | null>(null);
    const [followList, setFollowList] = useState<IFollowList>({
        show: false,
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const prevTitle = document.title;

    useEffect(() => {
        document.title += ` ${user}`;
    }, [user]);

    useEffect(() => {
        return () => {
            document.title = prevTitle;
        };
    }, []);

    useEffect(() => {
        (async () => {
            const res = await axios
                .get<FullUserInfoResponse>(`${serverUrl}/user/full/${user}`)
                .then((data) => data.data);

            setIsLoading(false);
            if (!res.success) {
                setUserInfo({ success: false, message: res.message });
            } else {
                setUserInfo(res);
                SocketIO.initPublicFollow(user || "");
                SocketIO.getPublicFollow()?.on("new-follow", async () => {
                    const follow = await axios
                        .get<FollowResponse>(`${serverUrl}/follow/get/${user}`)
                        .then((data) => data.data);
                    if (follow.success) {
                        setUserInfo((prev) => {
                            const temp = { ...prev };
                            if (follow.userFollow && temp.user) {
                                temp.user.follow[0] = follow.userFollow;
                            }
                            return temp;
                        });
                    }
                });
            }
        })();
    }, [user, username]);

    useEffect(() => {
        if (username) {
            if (username !== user) {
                userInfo.user?.follow[0].followed.includes(username)
                    ? setFollowStatus(true)
                    : setFollowStatus(false);
            } else {
                setFollowStatus(null);
            }
        }
    }, [username, userInfo, user]);

    const followToggle: (targetUserId: string) => Promise<void> = async (
        targetUserId,
    ) => {
        if (userInfo.success && username !== user && username !== null) {
            const response = await axios
                .post(
                    `${serverUrl}/follow/toggle`,
                    {
                        targetUserId,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token",
                            )}`,
                        },
                    },
                )
                .then((data) => data.data);
            const res = await axios
                .get<FullUserInfoResponse>(`${serverUrl}/user/full/${user}`)
                .then((data) => data.data);
            if (!res.success) {
                setUserInfo({ success: false, message: res.message });
            } else {
                setUserInfo(res);
            }
            if (response.success) {
                // * send notification to private channel
                if (response.followStatus) {
                    SocketIO.getPrivateFollow()?.emit("new-follow", user);
                }
                SocketIO.getPublicFollow()?.emit("public-new-follow", user);
            }
        }
    };

    const close: () => void = () => {
        setFollowList({ show: false });
    };
    return (
        <div className={styles.userPage}>
            {userInfo.success && user ? (
                <div className={styles.user}>
                    {followList.show && (
                        <FollowList list={followList.follows} close={close} />
                    )}
                    <img
                        src={userInfo.user?.public.avatarUrl}
                        alt=""
                        className={styles.avatar}
                    />
                    <p className={styles.mainUsername}>
                        {userInfo.user?.public.username}
                    </p>
                    <div className={styles.followContainer}>
                        <button
                            className={`${styles.followBtn} ${
                                followStatus === null
                                    ? styles.unableFollowed
                                    : followStatus === true
                                    ? styles.followed
                                    : styles.notFollowed
                            }`}
                            onClick={() =>
                                followToggle(userInfo.user?._id || "")
                            }
                        >
                            {followStatus ? (
                                <HiOutlineUserRemove />
                            ) : (
                                <HiOutlineUserAdd />
                            )}
                        </button>
                        <button
                            className={styles.followingBtn}
                            onClick={() => {
                                userInfo.user?.follow[0] &&
                                    userInfo.user?.follow[0].following.length >
                                        0 &&
                                    setFollowList({
                                        show: true,
                                        follows:
                                            userInfo.user?.follow[0].following,
                                    });
                            }}
                        >
                            {`${userInfo.user?.follow[0].following.length} following`}
                        </button>
                        <button
                            className={styles.followedBtn}
                            onClick={() => {
                                userInfo.user?.follow[0] &&
                                    userInfo.user?.follow[0].followed.length >
                                        0 &&
                                    setFollowList({
                                        show: true,
                                        follows:
                                            userInfo.user?.follow[0].followed,
                                    });
                            }}
                        >
                            {`${userInfo.user?.follow[0].followed.length} followed`}
                        </button>
                    </div>
                    {userInfo.user?.posts && (
                        <Post
                            postsList={{
                                userList: [user],
                                posts: userInfo.user?.posts,
                            }}
                        />
                    )}
                </div>
            ) : isLoading ? (
                <></>
            ) : (
                <NotFound message={userInfo.message || ""} />
            )}
        </div>
    );
};

export default User;
