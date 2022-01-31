import React, { useEffect, useState } from "react";
import styles from "./Setting.module.scss";
import axios from "axios";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import { PublicUserInfoResponse, PublicUsers } from "../../app/types";
import { BsCamera } from "react-icons/bs";
import ChangeAvatar from "./ChangeAvatar";
import { serverUrl } from "../../app/env";

const Setting: React.FC = function () {
    const { username } = useAppSelector((state: RootState) => state);

    const [publicUserInfo, setPublicUserInfo] = useState<PublicUsers>(
        {} as PublicUsers,
    );
    const [changingAvatar, setChangingAvatar] = useState<boolean>(false);

    useEffect(() => {
        const prevTitle = document.title;
        document.title += " Setting";

        return () => {
            document.title = prevTitle;
        };
    }, []);

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

    const close: () => void = () => {
        setChangingAvatar(false);
    };

    return (
        <>
            {changingAvatar && (
                <>
                    <div
                        className={styles.changeAvatarOverlay}
                        onClick={() => {
                            setChangingAvatar(false);
                        }}
                    ></div>
                    <ChangeAvatar close={close} />
                </>
            )}
            <div className={styles.setting}>
                <p className={styles.settingTitle}>Setting</p>
                {Object.entries(publicUserInfo).length > 0 && (
                    <div className={styles.settingAvatarAndName}>
                        <div className={styles.settingAvatar}>
                            <div
                                className={styles.avatarOverlay}
                                onClick={() => setChangingAvatar(true)}
                            >
                                <BsCamera />
                            </div>
                            <img
                                className={styles.settingAvatarSource}
                                src={publicUserInfo.public.avatarUrl}
                                alt=""
                            />
                        </div>
                        <p className={styles.settingUsername}>
                            {publicUserInfo.public.username}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Setting;
