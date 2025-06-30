import React from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';
import Toast from 'react-native-toast-message';

const ToastComponent = () => {
  const toastVisible = useSelector(state => state.toast.visible);
  const toastType = useSelector(state => state.toast.type);
  const toastMessage = useSelector(state => state.toast.message);

  return (
    <View>
      <Toast
        visible={toastVisible}
        // type={toastType}
        text1={toastMessage}
        autoHide={true}
        topOffset={40}
      />
    </View>
  );
};

export default ToastComponent;
