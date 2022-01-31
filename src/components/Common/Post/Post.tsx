import axios from "axios";
import React, { memo, useEffect, useState } from "react";
import { BsHandThumbsUp } from "react-icons/bs";
import { FaRegCommentAlt } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { useAppSelector } from "../../../app/hooks";
import { RootState } from "../../../app/store";
import {
    Posts,
    PostByIdResponse,
    ToggleLikeResponse,
} from "../../../app/types";
import useAvatarList, {
    UseAvatarListReturnType,
} from "../../../hooks/useAvatarList";
import { UsePostListResponse } from "../../../hooks/usePostList";
import Comment from "../Comment/Comment";
import styles from "./Post.module.scss";
import SocketIO from "../../../app/socket";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../../../app/env";

interface ICommentDisplayStatus {
    show: boolean;
    postId?: string;
}

interface Props {
    postsList: UsePostListResponse;
}

const Post: React.FC<Props> = memo(function ({ postsList: postsListProps }) {
    const avatarListHook = useAvatarList();
    const navigate = useNavigate();

    const [avatarList, setAvatarList] = useState<UseAvatarListReturnType>({});
    const [postsList, setPostsList] = useState<UsePostListResponse>({
        userList: [],
        posts: [],
    });
    const [currentlyComment, setCurrentlyComment] = useState<string>("");
    const [postIdsList, setPostIdsList] = useState<string[]>([]);
    const [commentDisplayStatus, setCommentDisplayStatus] =
        useState<ICommentDisplayStatus>({ show: false });

    const { username } = useAppSelector((state: RootState) => state);

    const close = () => {
        setCommentDisplayStatus({ show: false });
    };

    useEffect(() => {
        if (postIdsList.length > 0) {
            SocketIO.initPublicLike(postIdsList);
            SocketIO.initPublicComment(postIdsList);
        }
        SocketIO.getPublicLike()?.on("new-like", async (postId) => {
            const postById = await axios
                .get<PostByIdResponse>(`${serverUrl}/posts/id/${postId}`)
                .then((data) => data.data.post);
            setPostsList((prevPostList) => {
                const newPostList = [...prevPostList.posts];
                newPostList[
                    prevPostList.posts.indexOf(
                        prevPostList.posts.find(
                            (eachPost) => eachPost._id === postId,
                        ) || ({} as Posts),
                    )
                ] = postById || ({} as Posts);
                return {
                    userList: prevPostList.userList,
                    posts: newPostList,
                };
            });
        });
        SocketIO.getPublicComment()?.on("new-comment", async (postId) => {
            const postById = await axios
                .get(`${serverUrl}/posts/id/${postId}`)
                .then((data) => data.data.post);
            setPostsList((prevPostList) => {
                const newPostList = [...prevPostList.posts];
                newPostList[
                    prevPostList.posts.indexOf(
                        prevPostList.posts.find(
                            (eachPost) => eachPost._id === postId,
                        ) || ({} as Posts),
                    )
                ] = postById;
                return {
                    userList: prevPostList.userList,
                    posts: newPostList,
                };
            });
        });
    }, [postIdsList]);

    useEffect(() => {
        (async () => {
            if (postsListProps.userList.length > 0) {
                const avatars = await avatarListHook(postsListProps.userList);
                setAvatarList(avatars);
                const list = [...postsListProps.posts];
                const ids: string[] = [];
                list.forEach((id) => {
                    ids.push(id._id);
                });
                setPostIdsList([...ids]);
                list.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                );
                setPostsList({
                    userList: postsListProps.userList,
                    posts: list,
                });
            }
        })();
    }, [postsListProps]);

    useEffect(() => {
        (async () => {
            if (commentDisplayStatus.show === true) {
                setCurrentlyComment(commentDisplayStatus.postId || "");
            } else if (
                commentDisplayStatus.show === false &&
                currentlyComment !== ""
            ) {
                const post = await axios
                    .get(`${serverUrl}/posts/id/${currentlyComment}`)
                    .then((data) => data.data.post);
                const { posts: newPostList } = { ...postsList };
                newPostList[
                    postsList.posts.indexOf(
                        postsList.posts.find(
                            (eachPost) => eachPost._id === currentlyComment,
                        ) || ({} as Posts),
                    )
                ] = post;
                setPostsList((prevPostList) => {
                    return {
                        userList: prevPostList.userList,
                        posts: newPostList,
                    };
                });
            }
        })();
    }, [commentDisplayStatus]);

    async function likeToggle(
        postId: string,
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ): Promise<void> {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const target = e.currentTarget;
                const res = await axios
                    .get<ToggleLikeResponse>(
                        `${process.env.REACT_APP_SERVER_URL}/posts/toggleLike/${postId}`,
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
            {commentDisplayStatus.show && (
                <Comment
                    postId={commentDisplayStatus.postId || ""}
                    close={close}
                />
            )}
            <div
                className={styles.posts}
                style={
                    {
                        // overflowY: `${
                        //     commentDisplayStatus.show ? "hidden" : "auto"
                        // }`,
                    }
                }
            >
                {postsListProps.posts.length > 0 &&
                    postsList.posts.map((post) => (
                        <div className={styles.post} key={post._id}>
                            <div
                                className={styles.postHeading}
                                onClick={() => navigate(`/u/${post.author}`)}
                            >
                                <img
                                    className={styles.avatar}
                                    src={avatarList[post.author]}
                                    alt=""
                                />
                                <div className={styles.authorAndTime}>
                                    <p className={styles.author}>
                                        {post.author}
                                    </p>
                                    <p className={styles.time}>
                                        {new Date(
                                            post.createdAt,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <p
                                className={styles.body}
                                onClick={() => navigate(`/p/${post._id}`)}
                            >
                                {post.body}
                            </p>
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
                            <div className={styles.likeAndCom}>
                                <button
                                    className={`${styles.likeBtn} ${
                                        post.like.includes(username)
                                            ? styles.liked
                                            : styles.notLiked
                                    }`}
                                    onClick={(e) => {
                                        likeToggle(post._id, e);
                                    }}
                                >
                                    <BsHandThumbsUp />
                                </button>
                                {
                                    <button
                                        className={styles.commentBtn}
                                        onClick={() =>
                                            setCommentDisplayStatus({
                                                show: true,
                                                postId: post._id,
                                            })
                                        }
                                    >
                                        <FaRegCommentAlt />
                                    </button>
                                }
                            </div>
                        </div>
                    ))}
            </div>
        </>
    );
});

export default Post;
