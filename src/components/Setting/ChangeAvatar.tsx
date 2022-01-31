import axios from "axios";
import React, { useState } from "react";
import styles from "./ChangeAvatar.module.scss";
import { serverUrl } from "../../app/env";

interface Props {
    close: () => void;
}

const ChangeAvatar: React.FC<Props> = function ({ close }) {
    const [url, setUrl] = useState<string>("");

    const changeAvatar = async () => {
        if (url !== "") {
            const response = await axios
                .put(
                    `${serverUrl}/auth/changeAvatar`,
                    { avatarUrl: url },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem(
                                "token",
                            )}`,
                        },
                    },
                )
                .then((res) => res.data);
            if (response.success) {
                close();
            }
        }
    };

    return (
        <div className={styles.changeAvatarBlock}>
            <p className={styles.changeAvatarTitle}>Change avatar</p>
            <input
                type="url"
                placeholder="Enter avatar URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={styles.avatarInput}
            />
            <button className={styles.changeAvatarBtn} onClick={changeAvatar}>
                Change password
            </button>
        </div>
    );
};

export default ChangeAvatar;
