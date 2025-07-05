import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {profileUpdate} from '../../../slices/authSlice';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SMSMarketingService from '../../../services/smsMarketingService';

const MandatoryProfileModal = ({
  visible,
  onClose,
  onComplete,
  userData,
  isMandatory = false,
  loginAttempts = 0,
}) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptOffers, setAcceptOffers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const profileUpdateStatus = useSelector(state => state.auth.profileUpdateStatus);

  useEffect(() => {
    if (visible && userData) {
      // Pre-fill with existing data if available
      setName(userData.name || '');
      setPhone(userData.phone_number || '');
    }
  }, [visible, userData]);

  useEffect(() => {
    if (profileUpdateStatus === 'succeeded') {
      setIsSubmitting(false);
      setError('');
      
      // Mark as completed for this user
      if (userData?.email) {
        AsyncStorage.setItem(`profileCompleted_${userData.email}`, 'true');
      }
      
      Toast.show({
        type: 'success',
        text1: 'Profile Updated Successfully!',
        text2: 'Thank you for completing your profile.',
      });
      
      onComplete();
      onClose();
    } else if (profileUpdateStatus === 'failed') {
      setIsSubmitting(false);
      setError('Failed to update profile. Please try again.');
    }
  }, [profileUpdateStatus]);

  const validateInputs = () => {
    if (!name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    
    // Use SMS marketing service for phone validation
    const phoneValidation = SMSMarketingService.validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      setError(phoneValidation.error);
      return false;
    }
    
    if (!acceptOffers) {
      setError('Please accept to receive offers to continue using the service');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone_number', phone.trim());
      formData.append('marketing_consent', acceptOffers ? '1' : '0');
      
      console.log('Profile update data:', {
        name: name.trim(),
        phone_number: phone.trim(),
        marketing_consent: acceptOffers ? '1' : '0'
      });
      
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      const result = await dispatch(profileUpdate(formData));
      console.log('Profile update result:', result);
      
      // Check if the update was successful
      if (result.error) {
        throw new Error(result.error.message || 'Profile update failed');
      }
      
      // Send to Zapier webhook for SMS marketing
      try {
        const zapierResult = await SMSMarketingService.sendToZapier({
          name: name.trim(),
          phone: phone.trim(),
          email: userData?.email || '',
          marketing_consent: acceptOffers
        });
        
        if (zapierResult.success) {
          console.log('✅ User data sent to SMS marketing system');
        } else {
          console.log('⚠️ Failed to send to SMS marketing:', zapierResult.error);
        }
      } catch (err) {
        console.log('⚠️ SMS marketing webhook error:', err);
        // Don't fail the whole process if webhook fails
      }
      
    } catch (error) {
      console.error('Profile update error:', error);
      setError(`Failed to update profile: ${error.message || 'Please try again.'}`);
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (isMandatory) {
      // If mandatory, show different message
      Alert.alert(
        'Profile Required',
        'You have been reminded multiple times to complete your profile. To continue using ChekdIn and receive exclusive offers, you must provide your name and phone number. Would you like to log out instead?',
        [
          {
            text: 'Continue Later',
            style: 'cancel',
            onPress: () => {
              // Don't allow skipping - force them to complete
              setError('Please complete your profile to continue using the service');
            }
          },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: () => {
              // This would trigger logout - you'll need to implement this
              console.log('User chose to log out');
            }
          }
        ]
      );
    } else {
      // If not mandatory yet, allow skipping
      Alert.alert(
        'Complete Your Profile',
        'You can complete your profile now or later. Would you like to continue later?',
        [
          {
            text: 'Continue Later',
            style: 'cancel',
            onPress: () => {
              onClose();
            }
          },
          {
            text: 'Complete Now',
            style: 'default',
            onPress: () => {
              // Stay on modal to complete
            }
          }
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        if (isMandatory) {
          // Prevent closing by back button if mandatory
          setError('Please complete your profile to continue');
        } else {
          // Allow closing if not mandatory yet
          onClose();
        }
      }}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.modal}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>
                  {isMandatory ? 'Complete Your Profile (Required)' : 'Complete Your Profile'}
                </Text>
                <Text style={styles.subtitle}>
                  {isMandatory 
                    ? 'You have been reminded multiple times. To continue using ChekdIn and receive exclusive offers via text messages, you must provide your information below.'
                    : 'To continue using ChekdIn and receive exclusive offers via text messages, please provide your information below.'
                  }
                </Text>
                {loginAttempts > 0 && (
                  <View style={[
                    styles.attemptsContainer,
                    { backgroundColor: isMandatory ? '#FFEBEE' : '#E3F2FD' }
                  ]}>
                    <Text style={[
                      styles.attemptsText,
                      { color: isMandatory ? '#D32F2F' : '#1976D2' }
                    ]}>
                      {isMandatory 
                        ? `This is your ${loginAttempts}${loginAttempts === 1 ? 'st' : loginAttempts === 2 ? 'nd' : loginAttempts === 3 ? 'rd' : 'th'} login reminder`
                        : `Reminder ${loginAttempts} of 3`
                      }
                    </Text>
                  </View>
                )}
              </View>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isSubmitting}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={15}
                    editable={!isSubmitting}
                  />
                  <Text style={styles.helperText}>
                    We'll send you exclusive offers and updates via text message
                  </Text>
                </View>

                {/* Marketing Consent */}
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity 
                    style={[styles.checkbox, acceptOffers && styles.checkboxChecked]}
                    onPress={() => setAcceptOffers(!acceptOffers)}
                    disabled={isSubmitting}
                  >
                    {acceptOffers && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <View style={styles.checkboxTextContainer}>
                    <Text style={styles.checkboxText}>
                      I agree to receive offers, promotions, and updates from ChekdIn via text message and email
                    </Text>
                    <Text style={styles.checkboxSubtext}>
                      You can unsubscribe at any time. Message & data rates may apply.
                    </Text>
                  </View>
                </View>

                {/* Error Message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Benefits */}
                <View style={styles.benefitsContainer}>
                  <Text style={styles.benefitsTitle}>Why we need this information:</Text>
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>📱</Text>
                    <Text style={styles.benefitText}>Send you exclusive offers via text message</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>🎁</Text>
                    <Text style={styles.benefitText}>Personalized deals based on your location</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>🔔</Text>
                    <Text style={styles.benefitText}>Instant notifications for new coupons</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>💳</Text>
                    <Text style={styles.benefitText}>Secure account verification</Text>
                  </View>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Updating...' : 'Continue to App'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                  disabled={isSubmitting}
                >
                  <Text style={styles.skipButtonText}>
                    {isMandatory ? 'Log Out Instead' : 'Continue Later'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    marginBottom: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#02676C',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  attemptsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  attemptsText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#02676C',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#02676C',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 5,
  },
  checkboxSubtext: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
  },
  benefitsContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 10,
    width: 25,
  },
  benefitText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#02676C',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#02676C',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default MandatoryProfileModal; 