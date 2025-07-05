import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { DrawerActions } from '@react-navigation/native';
import User from '../../assets/images/user.png';
import Menu from '../../assets/icons/menu.png';
import BackIcon from '../../assets/icons/back.png';

const NavigationBar = ({ 
  navigation, 
  title = 'Chekdin', 
  showBack = false, 
  showMenu = true, 
  showProfile = true,
  onBackPress,
  onProfilePress,
  customRightComponent,
  backgroundColor = '#E8F0F9',
  textColor = 'black'
}) => {
  const profile = useSelector(state => state.auth.profile);
  const data = profile?.data;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      navigation.navigate('Profile');
    }
  };

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Image source={BackIcon} style={styles.backIcon} />
          </TouchableOpacity>
        )}
        
        {showMenu && !showBack && (
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={handleMenuPress}
          >
            <Image source={Menu} style={styles.menuIcon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center Section - Title */}
      <View style={styles.centerSection}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {customRightComponent ? (
          customRightComponent
        ) : showProfile ? (
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={handleProfilePress}
          >
            {data?.profile_img_url ? (
              <Image 
                source={{ uri: data.profile_img_url }} 
                style={styles.profileImage} 
                resizeMode="cover" 
              />
            ) : (
              <Image source={User} style={styles.profileImage} resizeMode="cover" />
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // Reduced to give more space for content
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 70 : 40, // Added 20px to both iOS and Android
    paddingBottom: 10, // Match the previous headerStyle paddingBottom: 10
    backgroundColor: '#E8F0F9',
    borderBottomWidth: 0, // Remove border to match previous style
    elevation: 0, // Remove elevation to match previous style
    shadowOpacity: 0, // Remove shadow to match previous style
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 0,
    marginLeft: 0,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    width: 35,
    height: 35,
  },
  menuButton: {
    padding: 0,
    margin: 0,
  },
  menuIcon: {
    width: 50,
    height: 50,
  },
  profileButton: {
    padding: 4,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholder: {
    width: 48,
  },
});

export default NavigationBar; 