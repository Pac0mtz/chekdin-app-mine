import React from 'react';
import {
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  View,
} from 'react-native';
import BackIcon from '../../../assets/icons/back.png';
import User from '../../../assets/images/user.png';
import {useSelector} from 'react-redux';

const Header = ({navigation, isSetting}) => {
  const containerStyle = Platform.select({
    ios: styles.containerIOS,
    android: styles.containerAndroid,
  });
  const profile = useSelector(state => state.auth.profile);

  return (
    <>
      {isSetting ? (
        <View style={containerStyle}>
          <TouchableOpacity onPress={navigation ? navigation.goBack : null}>
            <Image style={{height: 35, width: 35}} source={BackIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View>
            {/* {
                profile?.data?.profile_img_url ?
                <Image source={{ uri: profile?.data?.profile_img_url }} style={styles.userImage} />
                :
                <Image source={User} style={styles.userImage} />

              } */}
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={containerStyle}
          onPress={navigation ? navigation.goBack : null}>
          <Image style={{height: 35, width: 35}} source={BackIcon} />
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  containerIOS: {
    position: 'absolute',
    top: 50,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    width: '100%',
  },
  containerAndroid: {
    position: 'absolute',
    top: 20,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: 'black',
  },
  Headermainwrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  userProfileImageContainer: {
    width: 35,
    height: 35,
    borderRadius: 30,
    backgroundColor: 'lightgray',
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: 10
  },
  userImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default Header;
