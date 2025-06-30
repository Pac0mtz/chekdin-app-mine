import React, {useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Text, View} from 'react-native';
import Pattern from '../../elements/pattern';
import Button from '../../modules/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch} from 'react-redux';
import {clearUser, deleteAccount} from '../../../slices/authSlice';
import Toast from 'react-native-toast-message';
import CustomModal from '../../modules/Modal';

const Setting = ({navigation}) => {
  const [notificationSwitch, setNotificationSwitch] = useState(false);
  const [isModalVisible, seIstModalVisible] = useState(false);

  const [loader, setLoader] = useState(false);

  const dispatch = useDispatch();

  const handleNotificationToggle = () => {
    setNotificationSwitch(prevState => !prevState);
  };

  const clearUserDataFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      dispatch(clearUser());
    } catch (error) {
      console.error('Error clearing user data from AsyncStorage:', error);
    }
  };

  const deleteApp = async () => {
    setLoader(true);
    const deleteData = await dispatch(deleteAccount());

    if (deleteData?.payload?.data) {
      Toast.show({
        type: 'success',
        text1: 'Account Deleted Successfully.',
      });
      dispatch(clearUser());
    }
    setLoader(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pattern navigation={navigation} isSetting={true} isGoBack={true} />
      <View style={styles.contentContainer}>
        <View
          style={styles.button}
          onPress={() => {
            /* Handle Name Button Press */
          }}>
          <Text style={styles.buttonText}>Notifications</Text>
          <Switch
            trackColor={{false: '#767577', true: '#60C0B1'}}
            thumbColor={notificationSwitch ? '#02676C' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleNotificationToggle}
            value={notificationSwitch}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={styles.buttonText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('TermsAndCondition')}>
          <Text style={styles.buttonText}>Terms and Conditions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AboutUs')}>
          <Text style={styles.buttonText}>About Us</Text>
        </TouchableOpacity>
        {loader ? (
          <Button title={<ActivityIndicator size="small" color="#ffff" />} />
        ) : (
          <Button
            title={'Delete Account'}
            onPress={() => seIstModalVisible(true)}
          />
        )}
      </View>
      <View style={styles.logoutButtonContainer}>
        <Button title={'Logout'} onPress={clearUserDataFromStorage} />
      </View>

      <CustomModal
        isVisible={isModalVisible}
        type={'action'}
        message={'Are you sure you want to Delete your Account?'}
        onCancel={() => seIstModalVisible(false)}
        onConfirm={deleteApp}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    position: 'relative',
  },
  contentContainer: {
    position: 'absolute',
    top: 90,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 80, // Add paddingBottom to make space for the Logout button
  },
  button: {
    width: '100%',
    backgroundColor: '#fff',
    height: 48,
    borderRadius: 28,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    marginTop: 10,
    justifyContent: 'space-between',
    flexDirection: 'row', // Add flexDirection to place the switch on the right-hand side
    alignItems: 'center', // Align items to center vertically
  },
  buttonText: {
    color: 'black',
    fontSize: 13,
  },
  logoutButtonContainer: {
    position: 'absolute',
    bottom: 70, // Adjust the bottom position as per your requirement
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
});

export default Setting;
