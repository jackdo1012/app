import React, { useState, useEffect } from "react";
import styles from "./Signup.module.scss";
import axios from "axios";
import { SignupResponse } from "../../app/types";
import { serverUrl } from "../../app/env";
import { NavLink } from "react-router-dom";

const Signup: React.FC = function () {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordAgain, setPasswordAgain] = useState<string>("");
    const [gender, setGender] = useState<"male" | "female">("male");
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const prevTitle = document.title;
        document.title += " Signup";
        return () => {
            document.title = prevTitle;
        };
    }, []);

    const signup: (e: React.FormEvent) => void = async (e) => {
        try {
            const response = await axios
                .post<SignupResponse>(`${serverUrl}/auth/register`, {
                    username,
                    password,
                    confirmPassword: passwordAgain,
                    gender,
                    avatarUrl,
                })
                .then((data) => data.data);

            if (response.success === true) {
                localStorage.setItem("token", response.accessToken || "");
                window.location.href = "/";
            } else {
                setUsername("");
                setPassword("");
                setPasswordAgain("");
                setGender("male");
                setAvatarUrl("");
            }
        } catch (err: any) {
            if (err.response && err.response.status === 400) {
                setError(err.response.data.message);
                setUsername("");
                setPassword("");
                setPasswordAgain("");
                setGender("male");
                setAvatarUrl("");
            }
        }
    };

    return (
        <div className={styles.signup}>
            <div className={styles.signupContainer}>
                <h1 className={styles.signupTitle}>Signup</h1>
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
                <input
                    type="password"
                    value={passwordAgain}
                    placeholder="confirm password"
                    onChange={(e) => setPasswordAgain(e.target.value)}
                    className={styles.password}
                />
                <select
                    value={gender}
                    className={styles.gender}
                    onChange={(e) =>
                        (e.target.value === "male" ||
                            e.target.value === "female") &&
                        setGender(e.target.value)
                    }
                >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <input
                    type="text"
                    value={avatarUrl}
                    placeholder="avatar url (optional)"
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className={styles.avatarUrl}
                />

                <button onClick={(e) => signup(e)} className={styles.signupBtn}>
                    Signup
                </button>
            </div>
            <div className={styles.signin}>
                Already have an account? <NavLink to="/login">Login</NavLink>
            </div>
            <p className={styles.error}>{error}</p>
        </div>
    );
};

export default Signup;
