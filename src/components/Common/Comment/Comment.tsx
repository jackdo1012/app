import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import React, { memo, useEffect, useState } from "react";
import useAvatarList, {
    UseAvatarListReturnType,
} from "../../../hooks/useAvatarList";
import styles from "./Comment.module.scss";
import SocketIO from "../../../app/socket";
import { useNavigate } from "react-router-dom";
import { CommentsList, GetCommentResponse } from "../../../app/types";
import useAddComment from "../../../hooks/useAddComment";

interface CommentProps {
    postId: string;
    close: () => void;
}

const Comment: React.FC<CommentProps> = memo(function ({ postId, close }) {
    const avatarListHook = useAvatarList();
    const navigate = useNavigate();

    const addCommentHook = useAddComment();

    const [commentText, setCommentText] = useState<string>("");
    const [avatarList, setAvatarList] = useState<UseAvatarListReturnType>({});
    const [comments, setComments] = useState<CommentsList[]>([]);

    const updateCommentAndAvatar = async function () {
        const newCommentList = await axios
            .get<GetCommentResponse>(
                `${process.env.REACT_APP_SERVER_URL}/posts/comment/${postId}`,
            )
            .then((data) => data.data.comments?.commentsList);
        newCommentList?.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        );

        setComments(newCommentList || []);
        let user: string[] = [];
        newCommentList &&
            newCommentList.forEach((comment) => {
                user.push(comment.user);
            });
        const avatars = await avatarListHook(user);
        setAvatarList(avatars);
    };

    useEffect(() => {
        updateCommentAndAvatar();
        SocketIO.initPrivateComment();
        SocketIO.getPublicComment()?.on("new-comment", () => {
            updateCommentAndAvatar();
        });
    }, []);

    const addComment = async function () {
        const res = await addCommentHook(postId, commentText);
        if (res.success) {
            setCommentText("");
        } else if (!res.success && res.status === 401) {
            navigate("/login");
        }
    };

    return (
        <div className={styles.comments}>
            <div
                onClick={() => {
                    close();
                }}
                className={styles.overlay}
            ></div>
            <div className={styles.listAndInput}>
                <ul className={styles.commentsList}>
                    {comments.map((comment) => (
                        <li className={styles.comment} key={comment._id}>
                            <div
                                className={styles.commentHeading}
                                onClick={() => {
                                    close();
                                    navigate(`/u/${comment.user}`);
                                }}
                            >
                                <img
                                    className={styles.avatar}
                                    src={avatarList[comment.user]}
                                    alt=""
                                />
                                <div className={styles.userAndTime}>
                                    <p className={styles.user}>
                                        {comment.user}
                                    </p>
                                    <p className={styles.time}>
                                        {new Date(
                                            comment.createdAt,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <p className={styles.commentValue}>
                                {comment.comment.split("\n").map((eachCom) => (
                                    <React.Fragment key={uuidv4()}>
                                        {eachCom}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </p>
                        </li>
                    ))}
                </ul>
                <div className={styles.inputContainer}>
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className={styles.commentInput}
                        placeholder="Write a comment..."
                    />
                    <button onClick={addComment} className={styles.addComment}>
                        Comment
                    </button>
                </div>
            </div>
        </div>
    );
});

export default Comment;
