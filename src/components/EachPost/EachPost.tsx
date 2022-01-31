import axios from "axios";
import React, { useEffect, useState } from "react";
import { BsHandThumbsUp } from "react-icons/bs";
import { v4 as uuidv4 } from "uuid";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import { Posts, PostByIdResponse, ToggleLikeResponse } from "../../app/types";
import useAvatarList from "../../hooks/useAvatarList";
import styles from "./EachPost.module.scss";
import SocketIO from "../../app/socket";
import { useNavigate, useParams } from "react-router-dom";
import EachPostComment from "./EachPostComment";
import NotFound from "../Common/NotFound/NotFound";
import { serverUrl } from "../../app/env";

const EachPost: React.FC = function () {
    const avatarListHook = useAvatarList();
    const navigate = useNavigate();
    const { postId } = useParams();

    const [avatar, setAvatar] = useState<string>("");
    const [post, setPost] = useState<Posts>({} as Posts);
    const [is404, setIs404] = useState<boolean>(false);

    const { username } = useAppSelector((state: RootState) => state);

    useEffect(() => {
        const prevTitle = document.title;
        document.title += " Post";
        if (postId !== undefined) {
            (async () => {
                try {
                    const postResponse = await axios
                        .get<PostByIdResponse>(
                            `${serverUrl}/posts/id/${postId}`,
                        )
                        .then((data) => data.data);
                    if (!postResponse.success) {
                        setIs404(true);
                    }
                    if (postResponse.post) {
                        const avatars = await avatarListHook([
                            postResponse.post?.author || "",
                        ]);
                        setAvatar(avatars[postResponse.post?.author || ""]);
                        setPost(postResponse.post);
                    }

                    SocketIO.initPublicLike([postId]);
                    SocketIO.initPublicComment([postId]);

                    SocketIO.getPublicLike()?.on("new-like", async (postId) => {
                        const postById = await axios
                            .get<PostByIdResponse>(
                                `${serverUrl}/posts/id/${postId}`,
                            )
                            .then((data) => data.data);
                        postById.post && setPost(postById.post);
                    });
                    SocketIO.getPublicComment()?.on(
                        "new-comment",
                        async (postId) => {
                            const postById = await axios
                                .get<PostByIdResponse>(
                                    `${serverUrl}/posts/id/${postId}`,
                                )
                                .then((data) => data.data);
                            postById.post && setPost(postById.post);
                        },
                    );
                } catch (err) {
                    setIs404(true);
                }
            })();
        }
        return () => {
            document.title = prevTitle;
        };
    }, [postId]);
    async function likeToggle(
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ): Promise<void> {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const target = e.currentTarget;
                const res = await axios
                    .get<ToggleLikeResponse>(
                        `${serverUrl}/posts/toggleLike/${postId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        },
                    )
                    .then((data) => data.data);
                // * send notification to public channel
                SocketIO.getPublicLike()?.emit("public-new-like", postId);
                if (res.success) {
                    switch (res.message) {
                        case "Liked":
                            target.classList.remove(styles.notLiked);
                            target.classList.add(styles.liked);
                            break;
                        case "Unliked":
                            target.classList.remove(styles.liked);
                            target.classList.add(styles.notLiked);
                            break;
                        default:
                            break;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            {is404 && <NotFound message="No posts found" />}
            <div className={styles.posts}>
                {Object.entries(post).length > 0 && (
                    <div className={styles.post} key={post._id}>
                        <div
                            className={styles.postHeading}
                            onClick={() => navigate(`/u/${post.author}`)}
                        >
                            <img
                                className={styles.avatar}
                                src={avatar}
                                alt=""
                            />
                            <div className={styles.authorAndTime}>
                                <p className={styles.author}>{post.author}</p>
                                <p className={styles.time}>
                                    {new Date(post.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <p className={styles.body}>{post.body}</p>
                        {post.imgUrl.length > 0 && (
                            <div className={styles.imgContainer}>
                                {post.imgUrl.map((img) => (
                                    <img alt="" key={uuidv4()} src={img} />
                                ))}
                            </div>
                        )}
                        <ul className={styles.stats}>
                            <li className={styles.likeCount}>
                                {post.like.length <= 1
                                    ? `${post.like.length} like`
                                    : `${post.like.length} likes`}
                            </li>
                            <li className={styles.commentCount}>
                                {post.comments.commentsList.length <= 1
                                    ? `${post.comments.commentsList.length} comment`
                                    : `${post.comments.commentsList.length} comments`}
                            </li>
                        </ul>
                        <div className={styles.likeContainer}>
                            <button
                                className={`${styles.likeBtn} ${
                                    post.like.includes(username)
                                        ? styles.liked
                                        : styles.notLiked
                                }`}
                                onClick={(e) => {
                                    likeToggle(e);
                                }}
                            >
                                <BsHandThumbsUp />
                            </button>
                        </div>
                        {post.comments && (
                            <EachPostComment
                                commentList={post.comments.commentsList}
                            />
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default EachPost;
