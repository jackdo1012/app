import React, { memo, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import useAvatarList, {
    UseAvatarListReturnType,
} from "../../hooks/useAvatarList";
import styles from "./FollowList.module.scss";

interface Props {
    list: string[] | undefined;
    close: () => void;
}

const FollowList: React.FC<Props> = memo(function ({ list, close }) {
    const avatarListHook = useAvatarList();

    const navigate = useNavigate();

    const [avatarList, setAvatarList] = useState<UseAvatarListReturnType>({});

    useEffect(() => {
        (async () => {
            const avatars = await avatarListHook(list);
            setAvatarList(avatars);
        })();
    }, [list]);
    return (
        <>
            <div className={styles.overlay} onClick={close}></div>
            {list !== undefined && list.length > 0 && (
                <ul className={styles.followList}>
                    {list.map((user) => (
                        <li
                            className={styles.followItem}
                            onClick={() => {
                                close();
                                navigate(`/u/${user}`);
                            }}
                            key={uuidv4()}
                        >
                            <img
                                className={styles.avatar}
                                src={avatarList[user]}
                                alt=""
                            />
                            <p className={styles.username}>{user}</p>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
});

export default FollowList;
