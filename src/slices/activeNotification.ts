import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface State {
    value: number
}

const initialState: State = { value: 0 }

export const activeNotification = createSlice({
    name: "activeNotification",
    initialState,
    reducers: {
        increaseByOne: (state) => {
            state.value++
        },
        increaseByAmount: (state, action: PayloadAction<number>) => {
            state.value += action.payload
        },
        decreaseByOne: (state) => {
            state.value--
        },
        decreateByAmount: (state, action: PayloadAction<number>) => {
            state.value -= action.payload
        },
        setAmount: (state, action: PayloadAction<number>) => {
            state.value = action.payload
        },
        removeAll: (state) => {
            state.value = 0
        },
    },
})

export const {
    increaseByOne,
    increaseByAmount,
    decreaseByOne,
    decreateByAmount,
    setAmount,
    removeAll,
} = activeNotification.actions

export default activeNotification.reducer
