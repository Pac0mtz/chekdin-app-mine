import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  visible: false,
  type: '',
  message: '',
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.visible = true;
      state.type = action.payload.type;
      state.message = action.payload.message;
    },
    hideToast: state => {
      state.visible = false;
      state.type = '';
      state.message = '';
    },
  },
});

export const {showToast, hideToast} = toastSlice.actions;
export default toastSlice.reducer;
