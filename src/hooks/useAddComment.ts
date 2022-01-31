import axios from "axios";
import { PostCommentResponse } from "../app/types";
import SocketIO from "../app/socket";
import { serverUrl } from "../app/env";

interface AddCommentResponse {
    success: boolean;
    message?: string;
    status?: number;
}

const useAddComment: () => (
    postId: string,
    commentContent: string,
) => Promise<AddCommentResponse> = () => async (postId, commentContent) => {
    try {
        const res = await axios
            .post<PostCommentResponse>(
                `${serverUrl}/posts/comment/${postId}`,
                { comment: commentContent },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token",
                        )}`,
                    },
                },
            )
            .then((data) => data.data);
        if (res.success) {
            // * send notification to private channel
            SocketIO.getPrivateComment()?.emit(
                "new-comment",
                commentContent,
                postId,
            );
            // * send notification to public channel
            SocketIO.getPublicComment()?.emit("public-new-comment", postId);
            return { success: true };
        } else {
            return { success: false, message: res.message };
        }
    } catch (err: any) {
        if (err.response && err.response.status === 401) {
            return {
                success: false,
                status: 401,
                message: "User is not logged in",
            };
        }
        return { success: false, message: err.message };
    }
};
export default useAddComment;
