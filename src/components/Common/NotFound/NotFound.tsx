import React, { useEffect } from "react";
import styles from "./NotFound.module.scss";

interface Props {
    message: string;
}

const NotFound: React.FC<Props> = function ({ message }) {
    useEffect(() => {
        const prevTitle = document.title;
        document.title += " 404 Not Found";
        return () => {
            document.title = prevTitle;
        };
    }, []);
    return (
        <div className={styles.notFound}>
            <h1>404 Not Found</h1>
            <h3>{message}</h3>
        </div>
    );
};

export default NotFound;
