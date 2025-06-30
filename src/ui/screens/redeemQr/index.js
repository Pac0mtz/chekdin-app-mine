import React, {useEffect, useRef, useState} from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  View,
  Button,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {addRedeemCoupon} from '../../../slices/couponSlice';
import {useNavigation} from '@react-navigation/native';
import CustomModal from '../../modules/Modal';
let isMounted;
const RedeemScanner = () => {
  const navigation = useNavigation();
  const errorMessage = useSelector(state => state.coupon.error);
  const Status = useSelector(state => state.coupon.addRedeemCouponStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');

  const dispatch = useDispatch();
  const cancelRequestRef = useRef(false); // Flag to cancel the API request if the component unmounts.

  const handleQRCodeScanned = ({data}) => {
    isMounted = false;
    let id;
    const keyValuePairs = data.slice(1, -1).split(',');
    keyValuePairs.forEach(pair => {
      const [key, value] = pair.split(':').map(part => part.trim());
      if (key === 'id') {
        id = parseFloat(value);
      }
    });
    handleCouponRedemption(id);
    setIsLoading(true);
  };

  const handleCouponRedemption = async id => {
    try {
      // Dispatch the action and wait for it to complete
      await dispatch(addRedeemCoupon(id));
      isMounted = true;
      console.log('isMounted', isMounted);

      // Check the updated status in the Redux store

      if (Status === 'succeeded' && isMounted) {
        setModalText('Coupon Redeemed Successfully!');
        setModalVisible(true);
        setIsLoading(false);
        isMounted = false;

        return;
      } else if (Status === 'failed' && isMounted) {
        setModalText(errorMessage || 'Coupon Redemption Failed.');
        setIsLoading(false);
        setModalVisible(true);
        isMounted = false;

        return;
      }
    } catch (error) {
      console.error('Coupon Redemption Error:', error);
    }
  };

  const closeModal = () => {
    setModalText('');
    setModalVisible(false);
    navigation.goBack();
  };

  return (
    <React.Fragment>
      <QRCodeScanner
        onRead={data => handleQRCodeScanned(data)}
        showMarker={true}
      />
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalText}</Text>
            <Button title="OK" onPress={closeModal} />
          </View>
        </View>
      </Modal>
    </React.Fragment>
  );
};

export default RedeemScanner;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#000',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
});
