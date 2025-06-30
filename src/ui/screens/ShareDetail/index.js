import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Modal as RNModal,
  TouchableOpacity,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Button from '../../modules/Button';
import {useDispatch, useSelector} from 'react-redux';
import Share from 'react-native-share';
import {
  checkIsCoupon,
  checkinCount,
  getCouponStats,
} from '../../../slices/couponSlice';
import CustomModal from '../../modules/Modal';
import {ShareDialog} from 'react-native-fbsdk-next';
import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-clipboard/clipboard';
import Geolocation from 'react-native-geolocation-service';
import {request, PERMISSIONS} from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';

const FBSDK = require('react-native-fbsdk');
const {ShareApi} = FBSDK;

const ShareDetails = ({route, navigation}) => {
  const inputRef = useRef();
  const [location, setLocation] = useState(null);
  const [text, setText] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDisable, setIsDisabled] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [height, setHeight] = useState(48);
  const maxHeight = 50; // Maximum height of the TextInput

  const [isChecked, setIsChecked] = useState(false);

  const [isshareModalVisible, setShareModalVisible] = useState(false);
  const [platform, setPlatform] = useState({
    isFacebook: false,
    isWhatsapp: false,
    isSMS: false,
    isInstagram: false,
    isLinkedIn: false,
  });

  const [sharedPlatforms, setSharedPlatforms] = useState([]); // Keep track of shared platforms
  const dispatch = useDispatch();
  const checkdin = useSelector(state => state.coupon.checkdin);
  const couponList = useSelector(state => state.coupon.couponScan);
  const {link, id, name} = route.params;

  useEffect(() => {
    getCurrentLocation();
  }, []);
  useEffect(() => {
    // Register for remote messages when the component mounts
    requestUserPermission();
  }, []);
  async function requestUserPermission() {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    console.warn('fcm token', token);
    setFcmToken(token);
    // dispatch(pushNoti({ title: "ChekdIN", body: "Welcome to ChekdIN", token: token }));
  }
  const getCurrentLocation = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      if (auth === 'granted') {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            setLocation({latitude, longitude});
          },
          error => {
            console.error(error);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    }

    if (Platform.OS === 'android') {
      request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        .then(result => {
          Geolocation.getCurrentPosition(
            position => {
              const {latitude, longitude} = position.coords;
              console.warn('latitude, longitude', latitude, longitude);
              setLocation({latitude, longitude});
            },
            error => {
              console.error(error);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        })
        .catch(e => {
          console.log('e', e);
        });
    }
  };
  const onShare = async () => {
    const checkCoupon = await dispatch(checkIsCoupon(id));
    const data = checkCoupon?.payload?.data;
    if (data?.is_chekdin === false) {
      const checkinFormData = new FormData();
      checkinFormData.append('coupon', id);
      dispatch(checkinCount(checkinFormData));
      dispatch(
        getCouponStats({
          lat: location.latitude,
          long: location.longitude,
          fcm_token: fcmToken,
        }),
      );
      setPlatform({
        isFacebook: false,
        isWhatsapp: false,
        isSMS: false,
        isInstagram: false,
        isLinkedIn: false,
      });
      Toast.show({
        type: 'success',
        text1: 'The Coupon is Chekdin',
      });
      navigation?.navigate('Home');
    } else {
      Toast.show({
        type: 'error',
        text1: 'You have already checked in this coupon',
      });
      navigation?.navigate('Home');
    }
  };
  const shareToLinkedIn = async () => {
    if (Platform.OS === 'android') {
      try {
        // Your existing logic to fetch image URL
        const imageUrl = checkdin?.data?.checkin_img;

        // Fetch the image as a Blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Convert the Blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result?.split(';base64,').pop();
          const shareOptions = {
            title: 'Share via',
            message: `${text}\n \nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from ${couponList.data.merchant} \n \n${link}`,
            url: `data:image/png;base64, ${base64Image}`,
            social: Share.Social.LINKEDIN,
          };
          const clipboardText = `${text}\n \nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from  ${couponList.data.merchant} \n \n${link}`;
          Clipboard.setString(clipboardText);

          Share.shareSingle(shareOptions)
            .then(res => {
              console.warn('res sharing to LinkedIn:', res);
              if (res.success === true) {
                setPlatform({...platform, isLinkedIn: true});
              }
              setIsDisabled(false);
            })
            .catch(err => {
              console.error('Error sharing to LinkedIn:', err);
              setIsDisabled(false);
            });
        };

        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error sharing:', error);
        setIsDisabled(false);
      }
    } else {
      setIsDisabled(true);
      try {
        // Your existing logic to fetch image URL
        const imageUrl = checkdin?.data?.checkin_img;

        // Fetch the image as a Blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Convert the Blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result?.split(';base64,').pop();
          const shareOptions = {
            title: 'Share via',
            message: `${text}\n \nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from  ${couponList.data.merchant} \n \n${link}`,
            url: `data:image/png;base64, ${base64Image}`,
            social: Share.Social.LINKEDIN,
          };
          const clipboardText = `${text}\n \nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from  ${couponList.data.merchant} \n \n${link}`;
          Clipboard.setString(clipboardText);
          Share.open(shareOptions)
            .then(res => {
              console.warn('res', res);
              if (res.success === true) {
                setPlatform({...platform, isLinkedIn: true});
              }
              setIsDisabled(false);
            })
            .catch(err => {
              setPlatform({...platform, isLinkedIn: true});
              setIsDisabled(false);
            });
        };

        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error sharing :', error);
        setIsDisabled(false);
      }
    }
  };
  // const shareToLinkedIn = async () => {
  //   setIsDisabled(true)
  //   try {
  //     // Your existing logic to fetch image URL
  //     const imageUrl = checkdin?.data?.checkin_img;

  //     // Fetch the image as a Blob
  //     const response = await fetch(imageUrl);
  //     const blob = await response.blob();

  //     // Convert the Blob to base64
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const base64Image = reader.result?.split(';base64,').pop();
  //       const shareOptions = {
  //         title: 'Share via',
  //         message: `${text}\n \nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from  ${couponList.data.merchant} \n \n${link}`,
  //         url: `data:image/png;base64, ${base64Image}`,
  //         social: Share.Social.LINKEDIN,
  //       };
  //       const clipboardText = `${text}\n \nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from ${couponList.data.merchant} \n \n${link}`;
  //       Clipboard.setString(clipboardText);
  //       Share.open(shareOptions)
  //         .then((res) => {
  //           console.warn('res', res)
  //           if (res.success === true) {
  //             setPlatform({ ...platform, isLinkedIn: true });
  //           }
  //           setIsDisabled(false);
  //         })
  //         .catch((err) => {
  //           setPlatform({ ...platform, isLinkedIn: true });
  //           setIsDisabled(false);
  //         });
  //     };

  //     reader.readAsDataURL(blob);
  //   } catch (error) {
  //     console.error('Error sharing :', error);
  //     setIsDisabled(false);
  //   }
  // };
  const onSelectPlatform = async type => {
    setIsDisabled(true);
    if (type === 'FACEBOOK') {
      try {
        setModalVisible(false);
        const imageUrl = checkdin?.data?.checkin_img;

        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Convert the Blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result?.split(';base64,').pop();

          const clipboardText = `${text}\n\nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from  ${couponList.data.merchant}\n\n${link}\n`;
          Clipboard.setString(clipboardText);

          if (Platform.OS === 'ios') {
            const sharePhotoContent = {
              contentType: 'photo',
              photos: [
                {
                  imageUrl: `data:image/png;base64,${base64Image}`,
                  userGenerated: false,
                },
              ],
            };
            ShareDialog.canShow(sharePhotoContent)
              .then(canShow => {
                if (canShow) {
                  return ShareDialog.show(sharePhotoContent);
                }
              })
              .then(result => {
                console.warn('result on facebook', result);
                if (result.isCancelled) {
                  console.log('Share cancelled');
                  setIsDisabled(false);
                } else {
                  setPlatform({...platform, isFacebook: true});
                  setIsDisabled(false);
                  console.log('Share success');
                }
              })
              .catch(error => {
                console.log('Share fail with error: ' + error);
              });
          } else {
            const options = {
              social: Share.Social.FACEBOOK,
              url: `data:image/png;base64, ${base64Image}`, // Use the base64 image data here
            };
            const clipboardText = `${text}\n \nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from  ${couponList.data.merchant} \n \n${link}`;
            Clipboard.setString(clipboardText);

            Share.shareSingle(options)
              .then(res => {
                console.log('res', res);
                if (res.success === true) {
                  setPlatform({...platform, isFacebook: true});
                }
                setIsDisabled(false);
              })
              .catch(err => {
                err && console.log('err', err);
                setIsDisabled(false);
              });
          }
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.log('error.message', error.message);
      }
    } else if (type === 'WHATSAPP') {
      try {
        setModalVisible(false);
        const imageUrl = checkdin?.data?.checkin_img; // Replace with your image URL

        // Fetch the image as a Blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Convert the Blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result?.split(';base64,').pop();
          const shareOptions = {
            title: "'Share via'",
            message: `${text}\n \nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from  ${couponList.data.merchant} \n \n${link}`,
            url: '',
            social: Share.Social.WHATSAPP,
          };

          const clipboardText = `${text}\n \nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from  ${couponList.data.merchant} \n \n${link}`;
          Clipboard.setString(clipboardText);

          Share.shareSingle(shareOptions)
            .then(res => {
              setPlatform({...platform, isWhatsapp: true});
              setIsDisabled(false);
            })
            .catch(err => {
              err && console.log('err', err);
              setIsDisabled(false);
            });
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.log('error.message', error.message);
      }
    } else if (type === 'SMS') {
      try {
        setModalVisible(false);
        const imageUrl = checkdin?.data?.checkin_img; // Replace with your image URL

        // Fetch the image as a Blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Convert the Blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result?.split(';base64,').pop();
          const options = {
            social: Share.Social.SMS,
            message: `Chekdin Mobile: \n  \n${text}\n \nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from  ${couponList.data.merchant}`,
            url: link,
            recipient: '',
          };

          Share.shareSingle(options)
            .then(res => {
              setPlatform({...platform, isSMS: true});
              setIsDisabled(false);
            })
            .catch(err => {
              err && console.log(err);
              setIsDisabled(false);
            });
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.log('error.message', error.message);
      }
    } else if (type === 'LINKEDIN') {
      shareToLinkedIn();
    } else if (type === 'INSTAGRAM') {
      try {
        setModalVisible(false);
        const imageUrl = checkdin?.data?.checkin_img;
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result?.split(';base64,').pop();
          const shareOptions = {
            title: 'Share via',
            // message: `${text}\n \nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from  ${couponList.data.merchant} \n \n${link}`,
            url: `data:image/png;base64, ${base64Image}`, // Use the base64 image data here
            social: Share.Social.INSTAGRAM,
            type: 'image/png', // Adjust the MIME type as needed.
          };
          const clipboardText = `${text}\n \nHello  friends! Be sure to download the Chekdin App to unlock this exclusive deal, from  ${couponList.data.merchant} \n \n${link}`;
          Clipboard.setString(clipboardText);
          Share.shareSingle(shareOptions)
            .then(res => {
              console.log('Share result: on insta', res);
              if (res.action === Share.sharedAction) {
                setPlatform({...platform, isInstagram: true});
              } else if (res.action === Share.dismissedAction) {
                console.log('Share dismissed');
              }
              setIsDisabled(false);
            })
            .catch(err => {
              console.error('Error sharing to Insta:', err);
              setIsDisabled(false);
              setPlatform({...platform, isInstagram: false});
            });
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error sharing to Instagram:', error);
        setPlatform({...platform, isInstagram: false});
      }
    }
  };

  const timeoutRef = useRef(null);

  const handleContentSizeChange = useCallback(event => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      const newHeight = event.nativeEvent?.contentSize?.height;
      if (newHeight <= maxHeight) {
        setHeight(newHeight);
      } else {
        setHeight(maxHeight);
      }
    }, 100); // Debounce delay of 100ms
  }, []);
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Image
            source={{uri: checkdin?.data?.checkin_img}}
            style={styles.uploadImage}
            resizeMode="cover"
          />
          <AutoGrowingTextInput
            ref={inputRef}
            style={[
              styles.textInput,
              {maxHeight: 100, height: Math.min(height, maxHeight) + 20},
            ]}
            // multiline
            // onContentSizeChange={handleContentSizeChange}
            placeholderTextColor={'black'}
            // scrollEnabled={height > maxHeight}
            placeholder="Enter comment here"
            onChangeText={text => setText(text)}
          />
          <Button
            title="Continue"
            onPress={async () => {
              const isShow = await AsyncStorage.getItem('dontShow');
              if (isShow == 'yes') {
                setShareModalVisible(true);
              } else {
                setModalVisible(true);
              }
            }}
          />
        </View>

        <CustomModal
          isVisible={isModalVisible}
          type={'ok'}
          message={
            "Your message and viewer offer link have been successfully copied! Don't forget to paste it on your preferred social media platform to share the deal with your friends and spread the word. Thank you!"
          }
          onCancel={() => setModalVisible(false)}
          onConfirm={async () => {
            if (isChecked) {
              await AsyncStorage.setItem('dontShow', 'yes');
              setModalVisible(false);
              setShareModalVisible(true);
            } else {
              setModalVisible(false);
              setShareModalVisible(true);
            }
          }}
          BtnText={'Check and Post'}
          heading={'Message Copied'}
          extraButton={true}
          isChecked={isChecked}
          setIsChecked={setIsChecked}
        />
        <CustomModal
          isVisible={isshareModalVisible}
          type={'platform'}
          message={
            'Press the button below and share on your favorite Social Media Platform'
          }
          onCancel={() => setShareModalVisible(false)}
          onSelectPlatform={onSelectPlatform}
          platform={platform}
          onShare={onShare}
          isDisable={isDisable}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'white',
    // justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  contentContainer: {
    alignItems: 'center',
    // justifyContent:'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.48,
    shadowRadius: 11.95,
    elevation: 18,
    height: 500,
    borderRadius: 30,
    backgroundColor: 'white',
    width: '90%',
    padding: 20,
  },
  textInput: {
    width: '100%',

    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'black',
    color: 'black',
    padding: 10,
    fontSize: 16,
    shadowColor: '#00000012',
    shadowOpacity: 0.27,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingBottom: 20,
  },
  uploadImage: {
    width: '100%',
    height: '50%',
    borderRadius: 15,
    marginTop: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  number: {
    fontSize: 18,
    marginBottom: 20,
  },
  BtnWrap: {
    paddingHorizontal: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    paddingHorizontal: 15,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    // textAlign: 'center',
    color: 'black',
  },
  btnShareWrap: {
    width: '100%',
    // backgroundColor:"red"
  },
});

export default ShareDetails;
