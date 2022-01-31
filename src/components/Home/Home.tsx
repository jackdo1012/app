import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import usePostList, { UsePostListResponse } from "../../hooks/usePostList";
import Post from "../Common/Post/Post";
import styles from "./Home.module.scss";
import NewPost from "./NewPost";

const Home: React.FC = function () {
    const postListHook = usePostList();

    const [postsList, setPostsList] = useState<UsePostListResponse>({
        userList: [],
        posts: [],
    });

    const { username } = useAppSelector((state: RootState) => state);

    useEffect(() => {
        const prevTitle = document.title;
        document.title += " Home";
        (async () => {
            try {
                const postUserList = await postListHook(
                    localStorage.getItem("token") || "",
                );
                setPostsList(postUserList || { userList: [], posts: [] });
            } catch (error) {
                console.log(error);
            }
        })();
        return () => {
            document.title = prevTitle;
        };
    }, []);

    return (
        <div className={styles.homepage}>
            <p className={styles.greeting}>Hello {username}</p>
            <NewPost />
            {postsList.posts && <Post postsList={postsList} />}
        </div>
    );
};

export default Home;
