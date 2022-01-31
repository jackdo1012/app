import { io, Socket } from "socket.io-client";
import { serverUrl } from "./env";

type SocketIOClient = Socket | undefined;
class SocketIO {
    // Store
    private privatePostSocket: SocketIOClient = undefined;
    private privateFollowSocket: SocketIOClient = undefined;
    private privateCommentSocket: SocketIOClient = undefined;
    private publicLikeSocket: SocketIOClient = undefined;
    private publicCommentSocket: SocketIOClient = undefined;
    private publicFollowSocket: SocketIOClient = undefined;

    // Init
    public initPrivatePost(): void {
        this.privatePostSocket = io(`${serverUrl}/post`, {
            path: "/private/",
            auth: { token: localStorage.getItem("token") },
        });
    }

    public initPrivateFollow(): void {
        this.privateFollowSocket = io(`${serverUrl}/follow`, {
            path: "/private/",
            auth: { token: localStorage.getItem("token") },
        });
    }

    public initPrivateComment(): void {
        this.privateCommentSocket = io(`${serverUrl}/comment`, {
            path: "/private/",
            auth: { token: localStorage.getItem("token") },
        });
    }
    public initPublicLike(postIdList: string[]): void {
        const list = JSON.stringify(postIdList);

        this.publicLikeSocket = io(`${serverUrl}/like`, {
            path: "/public/",
            extraHeaders: {
                rooms: list,
            },
        });
    }
    public initPublicComment(postIdList: string[]): void {
        const list = JSON.stringify(postIdList);
        this.publicCommentSocket = io(`${serverUrl}/comment`, {
            path: "/public/",
            extraHeaders: {
                rooms: list,
            },
        });
    }
    public initPublicFollow(user: string): void {
        this.publicFollowSocket = io(`${serverUrl}/follow`, {
            path: "/public/",
            auth: { token: localStorage.getItem("token") },
            extraHeaders: {
                rooms: JSON.stringify(user),
            },
        });
    }

    // Getters
    public getPrivatePost() {
        return this.privatePostSocket;
    }

    public getPrivateFollow() {
        return this.privateFollowSocket;
    }

    public getPrivateComment() {
        return this.privateCommentSocket;
    }
    public getPublicLike() {
        return this.publicLikeSocket;
    }
    public getPublicComment() {
        return this.publicCommentSocket;
    }
    public getPublicFollow() {
        return this.publicFollowSocket;
    }
}

export default new SocketIO();
