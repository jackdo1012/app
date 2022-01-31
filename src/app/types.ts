export interface Posts {
    _id: string;
    body: string;
    author: string;
    imgUrl: string[];
    like: string[];
    comments: Comments;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Follows {
    _id: string;
    following: string[];
    followed: string[];
    username: string;
    __v: number;
}

export interface FullUsers {
    public: {
        username: string;
        gender: string;
        avatarUrl: string;
    };
    _id: string;
    follow: Follows[];
    posts: Posts[];
    id: string;
}

export interface PublicUsers {
    public: {
        username: string;
        gender: string;
        avatarUrl: string;
    };
    _id: string;
    id: string;
}
export interface Notification {
    title: string;
    body: string;
    read: boolean;
    _id: string;
    createdAt: Date;
}

export interface Notifications {
    _id: string;
    username: string;
    notificationList: Notification[];
    __v: number;
}

export interface Comments {
    _id: string;
    commentsList: CommentsList[];
    __v: number;
}

export interface CommentsList {
    comment: string;
    user: string;
    _id: string;
    createdAt: Date;
}

export interface PublicUserInfoResponse {
    success: boolean;
    message?: string;
    user?: PublicUsers;
}

export interface FullUserInfoResponse {
    success: boolean;
    user?: FullUsers;
    message?: string;
}

export interface PostByIdResponse {
    success: boolean;
    message?: string;
    post?: Posts;
}

export interface ToggleLikeResponse {
    success: boolean;
    message: string;
}

export interface GetCommentResponse {
    success: boolean;
    comments?: Comments;
}

export interface PostCommentResponse {
    success: boolean;
    message: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    accessToken?: string;
}

export interface SignupResponse {
    success: boolean;
    message: string;
    accessToken?: string;
}

export interface FollowResponse {
    success: boolean;
    message?: string;
    userFollow?: Follows;
}
