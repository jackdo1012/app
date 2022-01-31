import axios from "axios";
import React, { useState, useEffect } from "react";
import styles from "./Login.module.scss";
import { LoginResponse } from "../../app/types";
import { NavLink } from "react-router-dom";
import { serverUrl } from "../../app/env";

const Login: React.FC = function () {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const prevTitle = document.title;
        document.title += " Login";
        return () => {
            document.title = prevTitle;
        };
    }, []);

    const login: (e: React.FormEvent) => void = async (e) => {
        try {
            const response = await axios
                .post<LoginResponse>(`${serverUrl}/auth/login`, {
                    username,
                    password,
                })
                .then((data) => data.data);

            if (response.success === true) {
                localStorage.setItem("token", response.accessToken || "");
                window.location.href = "/";
            } else {
                setUsername("");
                setPassword("");
            }
        } catch (e: any) {
            if (e.response && e.response.status === 401) {
                setError("Invalid username or password");
            }
            setUsername("");
            setPassword("");
        }
    };

    return (
        <div className={styles.login}>
            <div className={styles.loginContainer}>
                <h1 className={styles.loginTitle}>Login</h1>
                <input
                    type="text"
                    value={username}
                    placeholder="username"
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.username}
                />
                <input
                    type="password"
                    value={password}
                    placeholder="password"
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.password}
                />
                <button onClick={(e) => login(e)} className={styles.loginBtn}>
                    Login
                </button>
            </div>
            <div className={styles.signup}>
                Don't have an account? <NavLink to="/signup">Signup</NavLink>
            </div>
            <p className={styles.error}>{error}</p>
        </div>
    );
};

export default Login;
