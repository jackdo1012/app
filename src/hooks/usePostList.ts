import axios from "axios";
import { Follows, Posts } from "../app/types";
import { serverUrl } from "../app/env";
interface AuthResponseSuccess {
    success: true;
    message: string;
    username: string;
    gender: string;
    avatar: string;
}

interface AuthResponseFail {
    success: false;
    message: string;
}

interface FollowResponse {
    success: true;
    userFollow: Follows;
}

interface PostListResponse {
    success: true;
    postsList: Posts[];
}

export interface UsePostListResponse {
    userList: string[];
    posts: Posts[];
}

// this hooks return a function that can be used inside another hooks
const usePostList = function () {
    return async function (
        token: string,
    ): Promise<UsePostListResponse | undefined> {
        try {
            // if no token is provided, return empty array
            if (token === "") {
                return { userList: [], posts: [] };
            }
            // get username info using /auth
            const userInfo = await axios
                .get<AuthResponseSuccess | AuthResponseFail>(
                    `${serverUrl}/auth`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    },
                )
                .then((data) => data.data);
            // if no user is found, return empty array
            if (!userInfo.success) {
                return { userList: [], posts: [] };
            }
            // get follow list of user
            const user = await axios
                .get<FollowResponse>(
                    `${serverUrl}/follow/get/${userInfo.username}`,
                )
                .then((data) => data.data);

            // follow list
            let followList: string[] = user.userFollow.following;

            if (!followList) return { userList: [], posts: [] };
            // fetch all posts of following user
            const promiseArray: Promise<any>[] = [];
            followList.forEach((postUser) => {
                promiseArray.push(
                    axios
                        .get<PostListResponse>(
                            `${serverUrl}/posts/user/${postUser}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${localStorage.getItem(
                                            "token",
                                        )}` || "",
                                },
                            },
                        )
                        .then((data) => data.data)
                        .catch((err) => err.response.data),
                );
            });
            const post: PostListResponse[] = await Promise.all(promiseArray);
            // return only the post data
            let postsResult: Posts[] = [];
            for (let i = 0; i < post.length; i++) {
                if (!post[i].success) {
                    continue;
                }
                postsResult = postsResult.concat(post[i].postsList);
            }
            postsResult.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
            );
            return { userList: followList, posts: postsResult };
        } catch (error) {
            console.log(error);
        }
    };
};

export default usePostList;
