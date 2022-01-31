import axios from "axios";
import { PublicUserInfoResponse } from "../app/types";
import { serverUrl } from "../app/env";

export interface UseAvatarListReturnType {
    [key: string]: string;
}

const useAvatarList: () => (
    list: string[] | undefined,
) => Promise<UseAvatarListReturnType> = function () {
    return async function (list) {
        list = Array.from(new Set(list));
        const avatars: UseAvatarListReturnType = {};
        if (list.length === 0) {
            return {};
        }
        const avatar: string[] = await Promise.all(
            list.map((u) =>
                axios
                    .get<PublicUserInfoResponse>(
                        `${serverUrl}/user/public/${u}`,
                    )
                    .then((data) => data.data.user?.public.avatarUrl || ""),
            ),
        );
        list.forEach((u, i) => {
            avatars[u] = avatar[i];
        });
        return avatars;
    };
};

export default useAvatarList;
