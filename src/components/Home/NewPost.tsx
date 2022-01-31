import axios from "axios";
import React, { useEffect, useState } from "react";
import styles from "./NewPost.module.scss";
import { serverUrl } from "../../app/env";

const NewPost: React.FC = function () {
    const [open, setOpen] = useState<boolean>(false);
    const [body, setBody] = useState<string>("");
    const [imgUrl, setImgUrl] = useState<string>("");
    const [imgUrls, setImgUrls] = useState<string[]>([]);

    const submitPost = async () => {
        try {
            const response = await axios
                .post(
                    `${serverUrl}/posts/new`,
                    {
                        body,
                        imgUrl: imgUrls,
                    },
                    {
                        headers: {
                            authorization: `Bearer ${localStorage.getItem(
                                "token",
                            )}`,
                        },
                    },
                )
                .then((data) => data.data)
                .catch((error) => error.response.data);
            if (response.success) {
                setOpen(false);
            }
        } catch (err) {
            console.dir(err);
        }
    };

    useEffect(() => {
        const newImgUrl = imgUrl.split(" ").filter((url) => url !== "");
        if (newImgUrl[0] !== "") {
            setImgUrls(newImgUrl);
        }
    }, [imgUrl]);

    useEffect(() => {
        if (!open) {
            setBody("");
            setImgUrl("");
            setImgUrls([]);
        }
    }, [open]);

    return (
        <div className={styles.newPost}>
            <div className={styles.openBtn} onClick={() => setOpen(true)}>
                What is in your mind?
            </div>
            {open && (
                <div className={styles.newPostContainer}>
                    <div
                        onClick={() => setOpen(false)}
                        className={styles.overlay}
                    ></div>
                    <div className={styles.inputs}>
                        <p className={styles.newPostTitle}>New Post</p>
                        <input
                            type="text"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className={styles.bodyInput}
                            placeholder="Body"
                        />
                        <input
                            type="text"
                            value={imgUrl}
                            onChange={(e) => setImgUrl(e.target.value)}
                            className={styles.imgUrlInput}
                            placeholder="Image Urls (seprated by space)"
                        />
                        <div className={styles.imgs}>
                            {imgUrls.map((url, index) => (
                                <img
                                    src={url}
                                    alt={`Img ${index + 1}`}
                                    key={index}
                                />
                            ))}
                        </div>
                        <button className={styles.submit} onClick={submitPost}>
                            Post
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewPost;
