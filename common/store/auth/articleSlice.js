import { createSlice } from '@reduxjs/toolkit';

const articleSlice = createSlice({
  name: 'articles',
  initialState: {
    list: [],
    total: 0,
    isLoading:false,
  },
  reducers: {
    setArticles: (state, action) => {
      state.list = action.payload.list;
      state.total = action.payload.total;
    },
    addArticle: (state, action) => {
      state.list.unshift(action.payload); 
      state.total += 1;
    },
  },
});

export const { setArticles, addArticle } = articleSlice.actions;
export default articleSlice.reducer;
