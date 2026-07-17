import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    currentDetails: null,
    users: [], 
};

const liveSessionSlice = createSlice({
    name: 'liveSession',
    initialState,
    reducers: {
        setCurrentDetails: (state, action) => {
            state.currentDetails = action.payload;
        },
        setUsers: (state, action) => {
            state.users = action.payload;
        },
        clearLiveSession: (state) => {
            state.currentDetails = null;
            state.users = [];
        },
    },
});

export const { setCurrentDetails, setUsers, clearLiveSession } = liveSessionSlice.actions;
export default liveSessionSlice.reducer;
