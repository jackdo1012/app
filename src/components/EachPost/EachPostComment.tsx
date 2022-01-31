import React, { useState, useEffect, memo } from "react";
import styles from "./EachPostComment.module.scss";
import useAvatarList from "../../hooks/useAvatarList";
import { useParams } from "react-router-dom";
import { UseAvatarListReturnType } from "../../hooks/useAvatarList";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { CommentsList } from "../../app/types";
import useAddComment from "../../hooks/useAddComment";

interface Props {
    commentList: CommentsList[];
}

const EachPostComment: React.FC<Props> = memo(function ({ commentList }) {
    const avatarListHook = useAvatarList();
    const addCommentHook = useAddComment();
    const navigate = useNavigate();
    const { postId } = useParams();

    const [avatarList, setAvatarList] = useState<UseAvatarListReturnType>({});
    const [commentText, setCommentText] = useState<string>("");

    useEffect(() => {
        (async () => {
            const userList: string[] = [];
            commentList.forEach((comment) => {
                userList.push(comment.user);
            });
            const list = await avatarListHook(userList);
            setAvatarList(list);
        })();
    }, [commentList]);

    const addComment = async function () {
        if (postId) {
            const res = await addCommentHook(postId, commentText);
            if (res.success) {
                setCommentText("");
            } else if (!res.success && res.status === 401) {
                navigate("/login");
            }
        }
    };

    return (
        <div className={styles.commetAndInput}>
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

            <ul className={styles.commentsList}>
                {commentList
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                    )
                    .map((comment) => (
                        <li className={styles.comment} key={comment._id}>
                            <div
                                className={styles.commentHeading}
                                onClick={() => navigate(`/u/${comment.user}`)}
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
                                        ).toLocaleString("en-us", {
                                            weekday: "short",
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "numeric",
                                        })}
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
        </div>
    );
});

export default EachPostComment;
