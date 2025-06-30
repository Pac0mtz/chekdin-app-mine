import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Image } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Profile from '../screens/Profile';
import Home from '../screens/Home/home';
import User from '../../assets/images/user.png';
import BackIcon from '../../assets/icons/arrowleft.png';
import SettingIcon from '../../assets/icons/setting2.png';
import Menu from '../../assets/icons/menu.png';
import Edit from '../../assets/icons/edit.png';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/native';
import MerchentList from '../screens/MerchentListing';
import FilterScreen from '../screens/MerchantFilter';
import DetailMerchantScreen from '../screens/merchantDetail';
import CouponsList from '../screens/MyCoupon';
import DetailCouponScreen from '../screens/couponDetails';
import { useSelector } from 'react-redux';
import Setting from '../screens/Setting';
import PrivacyPolicy from '../screens/PrivacyPolicy';
import TermsAndCondition from '../screens/TermsAndConditions';
import AboutUs from '../screens/AboutUs';
import ProfileView from '../screens/ProfileView';
import EditProfile from '../screens/EditProfile';
import Scanner from '../screens/qrScanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile, pushNoti } from '../../slices/authSlice';
import { useDispatch } from 'react-redux';
import Map from '../screens/Map';
import { request, PERMISSIONS } from 'react-native-permissions';
import HomeIcon from '../../assets/icons/home.png';
import SettingIconDraw from '../../assets/icons/setting.png';
import UserIcon from '../../assets/icons/user.png';
import CheckIcon from '../../assets/icons/check.png';
import SearchIcon from '../../assets/icons/search.png';
import CouponsIcon from '../../assets/icons/coupons.png';
import logout from '../../assets/icons/logout.png';
import RollingScreen from '../screens/RollQr';
import ShareDetails from '../screens/ShareDetail';
import RedeemScanner from '../screens/redeemQr';
import GetNewCoupon from '../screens/GetNewCoupon';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import { CouponView } from '../../slices/couponSlice';
import back from '../../assets/icons/back.png';
import Loader from '../elements/Loader';
import Toast from 'react-native-toast-message';
import { navigationRef } from './navigationRef';



const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const drawerItemStyles = {
  drawerLabelStyle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  drawerActiveTintColor: 'white',
  drawerInactiveTintColor: 'white',
  drawerActiveBackgroundColor: '#458F87',
  drawerInactiveBackgroundColor: 'transparent',
  drawerItemStyle: {
    marginVertical: 5,
  },
};

const UserProfileImage = ({ onPress }) => {
  const profile = useSelector(state => state.auth.profile);
  const data = profile?.data

  return (
    <TouchableOpacity style={styles.userProfileImageContainer} onPress={onPress}>
      {
        data?.profile_img_url ?
          <Image source={{ uri: data?.profile_img_url }} style={styles.userImage} resizeMode="cover" />
          :
          <Image source={User} style={styles.userImage} resizeMode="cover" />

      }
    </TouchableOpacity>
  )
};

const CustomDrawerContent = ({ props, onLogout }) => {
  const profile = useSelector(state => state.auth.profile);
  const data = profile?.data

  return (
    <ImageBackground
      source={require('../../assets/images/drawerbg.png')}
      style={styles.drawerBackground}
    >
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={styles.closeDrawerButton}
          onPress={() => props.navigation.closeDrawer()}
        >
          <Image source={BackIcon} />
        </TouchableOpacity>
        <View style={styles.userContainer}>
          <View style={styles.userImageContainer}>
            {
              data?.profile_img_url ?
                <Image source={{ uri: data?.profile_img_url }} style={styles.userImage} />
                :
                <Image source={User} style={styles.userImage} />

            }
          </View>
          <View style={styles.userDetailsContainer}>
            {data?.name != "null" ?
              <Text style={styles.userName}>{data?.name}</Text>
              :
              null
            }
            <Text style={styles.userNumber}>{data?.email}</Text>
          </View>
        </View>
        <DrawerContentScrollView {...props}>
          <DrawerItemList {...props} {...drawerItemStyles} />
        </DrawerContentScrollView>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Image source={logout} />
          <Text style={styles.logoutButtonText}> Logout</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};


const AppDrawer = ({ onLogout }) => {
  const stats = useSelector((state) => state.coupon.couponStats);
  const data = stats?.data

  return (
    <View style={styles.container}>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent props={props} onLogout={onLogout} />}
        drawerPosition="right"
        drawerType="front"
        overlayColor="transparent"
        screenOptions={{ swipeEnabled: false }}
        drawerStyle={styles.drawerStyles}
      >
        <Drawer.Screen
          name="Home"
          component={Home}
          options={({ navigation }) => ({
            ...drawerItemStyles,
            headerStyle: { backgroundColor: '#E8F0F9' },
            headerTintColor: 'black',
            headerTitleAlign: 'center',
            headerTitle: 'Chekdin',
            drawerLabel: ({ focused, color }) => (
              <View style={{ ...styles.drawerItemContainer, flexDirection:'row',backgroundColor: focused ? drawerItemStyles.drawerActiveBackgroundColor : drawerItemStyles.drawerInactiveBackgroundColor }}>
                  <Image source={HomeIcon} style={{ width: 25, height: 25 }} />  
                <Text style={{ fontSize: 18, color: color, fontWeight: '600',marginLeft:10 }}>
                Home
                   </Text>
              </View>
            ),
            headerRight: () => (
              <UserProfileImage onPress={() => navigation.navigate('Profile')} />
            ),
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <Image source={Menu} style={{ marginLeft: 20, width: 50, height: 50 }} />
              </TouchableOpacity>
            )
          })}
        />
        <Drawer.Screen
          name="Profile"
          component={ProfileView}
          options={({ navigation }) => ({
            ...drawerItemStyles,
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: '#E8F0F9' },
            headerTintColor: 'black',
            headerTitle: 'Profile',
            drawerLabel: ({ focused, color }) => (
              <View style={{ ...styles.drawerItemContainer,flexDirection:'row', backgroundColor: focused ? drawerItemStyles.drawerActiveBackgroundColor : drawerItemStyles.drawerInactiveBackgroundColor }}>
               <Image source={UserIcon} style={{ width: 25, height: 25 }} /> 
                <Text style={{ fontSize: 18, color: color, fontWeight: '600' ,marginLeft:10}}> Profile</Text>
              </View>
            ),
            headerRight: () => (
              <View style={styles.IconsMainContainer}>
                <TouchableOpacity style={styles.IconsContainer} onPress={() => navigation.navigate('Setting')}>
                  <Image source={SettingIcon} style={styles.iconss} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.IconsContainer} onPress={() => navigation.navigate('EditProfile')}>
                  <Image source={Edit} style={styles.iconss} />
                </TouchableOpacity>
              </View>
            ),
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <Image source={Menu} style={{ marginLeft: 10, width: 30, height: 30 }} />
              </TouchableOpacity>
            )
          })}
        />
        <Drawer.Screen name="Setting" component={Setting} options={({ navigation }) => ({
          ...drawerItemStyles, 
          headerShown: false, 
          headerTitleAlign: 'center', 
          drawerLabel: ({ focused, color }) => (
            <View style={{ ...styles.drawerItemContainer,flexDirection:'row', backgroundColor: focused ? drawerItemStyles.drawerActiveBackgroundColor : drawerItemStyles.drawerInactiveBackgroundColor }}>
              <Image source={SettingIconDraw} style={{ width: 25, height: 25 }} />
              <Text style={{ fontSize: 18, color: color, fontWeight: '600',marginLeft:10 }}>  Settings</Text>
            </View>
          ),
        })} />
        <Drawer.Screen
          name="AroundMe"
          component={MerchentList}
          options={({ navigation }) => ({
            ...drawerItemStyles,
            headerStyle: { 
              backgroundColor: '#E8F0F9',
              borderBottomWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: 'black',
            headerTitleAlign: 'center',
            headerTitle: "Around Me",
            drawerLabel: ({ focused, color }) => (
              <TouchableOpacity 
              onPress={()=>navigation.navigate('AroundMe',{filter:false,filter50:true})} 
              style={{ ...styles.drawerItemContainer,flexDirection:'row', backgroundColor: focused ? drawerItemStyles.drawerActiveBackgroundColor : drawerItemStyles.drawerInactiveBackgroundColor }}>
               <Image source={SearchIcon} style={{ width: 25, height: 25 }} /> 
                <Text style={{ fontSize: 18, color: color, fontWeight: '600',marginLeft:10 }}> Around me</Text>
              </TouchableOpacity>
            ),
            headerRight: () => (
              <UserProfileImage onPress={() => navigation.navigate('Profile')} />
            ),
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={back} style={{ marginLeft: 20, width: 35, height: 35 }} />
              </TouchableOpacity>
            )
          })}
        />
        <Drawer.Screen name="Scanner" component={Scanner} options={({ navigation }) => ({
          headerShown: true,
          headerTitleAlign: 'center',
          headerTitle: 'QR Scanner',
          headerStyle: { backgroundColor: '#E8F0F9' },
          headerTintColor: 'black',
          drawerLabel: ({ focused, color }) => (
            <TouchableOpacity style={{ ...styles.drawerItemContainer,flexDirection:'row', backgroundColor: focused ? drawerItemStyles.drawerActiveBackgroundColor : drawerItemStyles.drawerInactiveBackgroundColor }} onPress={() => {
              request(PERMISSIONS.IOS.CAMERA).then((result) => {
                navigation.navigate("Scanner")
              });
            }}>
              <Image style={{ width: 25, height: 25 }} source={CheckIcon} />  
              <Text style={{ fontSize: 18, color: color, fontWeight: '600',marginLeft:15 }}>Check in</Text>
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 16 }}
              onPress={() => navigation.navigate("Home")}
            >
              <Image style={{height:35,width:35}} source={back} />
            </TouchableOpacity>
          ),
        })} />

        <Drawer.Screen
          name="MyCoupons"
          component={CouponsList}
          options={({ navigation }) => ({
            ...drawerItemStyles,
            headerTitle: "My Coupons",
            headerStyle: { backgroundColor: '#E8F0F9' },
            headerTintColor: 'black',
            headerTitleAlign: 'center',
            drawerLabel: ({ focused, color }) => (
              <View style={{ ...styles.drawerItemContainer, flexDirection:'row',backgroundColor: focused ? drawerItemStyles.drawerActiveBackgroundColor : drawerItemStyles.drawerInactiveBackgroundColor }} >
                <Image style={{ width: 25, height: 25 }} source={CouponsIcon} /> 
                <Text style={{ fontSize: 18, color: color, fontWeight: '600' ,marginLeft:10}}> My coupons</Text>
              </View>
            ),  
            headerRight: () => (
              <UserProfileImage onPress={() => navigation.navigate('Profile')} />
            ),
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={back} style={{ marginLeft: 20, width: 35, height: 35 }} />
              </TouchableOpacity>
            )
          })}
        />

      </Drawer.Navigator>
    </View>
  );
};

const AppNavigator = ({ onLogout, profile }) => {
  const dispatch = useDispatch();
  const [isNavigating, setIsNavigating] = useState(false);
  const user = useSelector(state => state.auth.user);
  const couponStatus = useSelector(state => state.coupon.status);

  useLayoutEffect(() => {
    dispatch(getProfile());
  }, []);

  const data = profile?.data;

  const handleDeepLink = async link => {
    console.log('handleDeepLink called', link);
    let couponID = link.url.split('=')[1] || link.url.split('/').pop();
    console.warn('couponID', couponID);
    const formData = new FormData();
    formData.append('coupon', couponID);
    try {
      const couponCheck = await dispatch(CouponView(formData));
      console.log('couponCheck result:', JSON.stringify(couponCheck, null, 2));
      console.log('couponCheck.meta:', couponCheck.meta);
      console.log('couponCheck.payload:', couponCheck.payload);
      console.log('couponCheck.error:', couponCheck.error);
      
      // Simple check: if there's a payload, it's successful
      if (couponCheck.payload) {
        console.log('Coupon added successfully!');
        Toast.show({ type: 'success', text1: 'Viewer coupon added!' });
        navigationRef.current?.navigate('GetNewCoupon', { isViewerCoupon: true });
      } else if (couponCheck.error) {
        console.log('Coupon addition failed:', couponCheck.error);
        // Check for 422 or 'already' in error message
        const errorMsg = couponCheck.error?.message?.toLowerCase() || '';
        const isAlready = errorMsg.includes('already') || errorMsg.includes('422');
        if (isAlready) {
          Toast.show({ type: 'success', text1: 'Coupon already added to viewer' });
          navigationRef.current?.navigate('GetNewCoupon', { isViewerCoupon: true });
        } else {
          Toast.show({ type: 'error', text1: 'Failed to add coupon' });
        }
      } else {
        console.log('No payload or error found');
        Toast.show({ type: 'error', text1: 'Failed to add coupon' });
      }
    } catch (error) {
      console.error('Deep link error:', error);
      Toast.show({ type: 'error', text1: 'Failed to add coupon' });
    }
  };

  useEffect(() => {
    // Handle cold start
    dynamicLinks()
      .getInitialLink()
      .then(link => {
        if (link) handleDeepLink(link);
      });
    // Handle when app is already open/backgrounded
    const unsubscribe = dynamicLinks().onLink(handleDeepLink);
    return () => unsubscribe();
  }, []);

  const isProfile =
    data?.address &&
    data?.email &&
    data?.name &&
    data?.phone_number &&
    data?.profile_img_url;

  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" options={{ headerShown: false }}>
        {() => <AppDrawer onLogout={onLogout} />}
      </Stack.Screen>

      <Stack.Screen name="GetNewCoupon" component={GetNewCoupon} options={{ headerShown: false }} />
      <Stack.Screen
        name="ShareDetails"
        component={ShareDetails}
        options={{
          headerTitle: '',
          headerStyle: {
            borderBottomWidth: 0,
            borderBottomColor: 'transparent',
          },
        }}
      />

      <Stack.Screen name='Rolling' component={RollingScreen} options={{ headerShown: false }} />
      <Stack.Screen name='RedeemScanner' component={RedeemScanner} options={{ headerShown: false }} />

      <Stack.Screen name="MerchantDetails" component={DetailMerchantScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfile}
        options={{
          headerStyle: { backgroundColor: '#E8F0F9' },
          headerTintColor: 'black',
          headerTitleAlign: 'center',
          headerTitle: "Edit Profile",
        }} />
      <Stack.Screen name="CouponDetails" component={DetailCouponScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Filter" component={FilterScreen} options={{ headerStyle: { backgroundColor: '#E8F0F9' } }} />
      <Stack.Screen name="Map" component={Map} options={{ headerShown: false }} />

      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy}
        options={{
          headerStyle: { backgroundColor: '#E8F0F9' },
          headerTintColor: 'black',
          headerTitleAlign: 'center',
          headerTitle: "Privacy Policy",
        }} />
      <Stack.Screen name="TermsAndCondition" component={TermsAndCondition}
        options={{
          headerStyle: { backgroundColor: '#E8F0F9' },
          headerTintColor: 'black',
          headerTitleAlign: 'center',
          headerTitle: "Terms And Conditions",
        }} />
      <Stack.Screen name="AboutUs" component={AboutUs}
        options={{
          headerStyle: { backgroundColor: '#E8F0F9' },
          headerTintColor: 'black',
          headerTitleAlign: 'center',
          headerTitle: "About Us",
        }} />
    </Stack.Navigator>
  );
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 40,
    paddingRight: 10,
    flex: 1,
  },
  drawerBackground: {
    flex: 1,
    resizeMode: 'cover',
  },
  closeDrawerButton: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 40,
  },
  userImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'lightgray',
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userProfileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'lightgray',
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  userImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userDetailsContainer: {
    paddingLeft: 10,
    width: '80%',
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userNumber: {
    color: 'white',
    fontSize: 16,
  },
  logoutButton: {
    padding: 16,
    borderColor: 'white',
    backgroundColor: 'white',
    borderBottomRightRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 10,
    width: '80%',
    marginBottom: 10,
    gap: 5,
    alignItems: 'center',
    flexDirection: 'row'
  },
  logoutButtonText: {
    color: '#458F87',
    fontSize: 16,
    fontWeight: 'bold',
  },
  drawerStyles: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  IconsMainContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginRight: 20
  },
  IconsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F0F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconss: {
    width: 20,
    height: 20,
    tintColor: '#02676C',
  },
  drawerItemContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 2,
  },
});

export default AppNavigator;
