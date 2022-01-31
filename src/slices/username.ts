import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const initialState = ""

export const usernameSlice = createSlice({
    name: "commentStatus",
    initialState,
    reducers: {
        setUsername: (_state, action: PayloadAction<string>) => action.payload,
    },
})

export const { setUsername } = usernameSlice.actions

export default usernameSlice.reducer
