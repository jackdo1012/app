import React, { memo } from "react";
import styles from "./DropDown.module.scss";

interface Props {
    logout: () => void;
    closeDropDown: () => void;
}

const DropDown: React.FC<Props> = memo(function ({ logout, closeDropDown }) {
    return (
        <div className={styles.dropDown}>
            <div
                className={styles.logout}
                onClick={() => {
                    logout();
                    closeDropDown();
                }}
            >
                Logout
            </div>
        </div>
    );
});

export default DropDown;
