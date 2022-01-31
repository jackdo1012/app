import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import usernameReducer from "../slices/username";
import activeNotificationReducer from "../slices/activeNotification";

export const store = configureStore({
    reducer: {
        counter: counterReducer,
        username: usernameReducer,
        activeNotification: activeNotificationReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
