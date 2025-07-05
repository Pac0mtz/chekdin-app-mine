import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  canClaimCouponAction,
  getRequiredPlatformsAction,
  submitVerificationProofAction,
} from '../../../slices/couponSlice';
import Toast from 'react-native-toast-message';
import Share from 'react-native-share';
import {ShareDialog} from 'react-native-fbsdk-next';
import Clipboard from '@react-native-clipboard/clipboard';
import Button from '../Button';

const SocialMediaVerificationModal = ({
  visible,
  onClose,
  couponData,
  onVerificationSuccess,
  navigation,
}) => {
  const dispatch = useDispatch();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [postUrl, setPostUrl] = useState('');
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStep, setVerificationStep] = useState('platform'); // platform, post, verify

  const canClaimStatus = useSelector(state => state.coupon.canClaimStatus);
  const canClaimResult = useSelector(state => state.coupon.canClaimResult);
  const requiredPlatforms = useSelector(state => state.coupon.requiredPlatforms);
  const verificationStatus = useSelector(state => state.coupon.verificationStatus);

  useEffect(() => {
    if (visible && couponData?.id) {
      checkClaimEligibility();
      getRequiredPlatforms();
    }
  }, [visible, couponData]);

  useEffect(() => {
    if (canClaimStatus === 'succeeded' && canClaimResult?.data?.can_claim) {
      // User can already claim, no verification needed
      onVerificationSuccess();
      onClose();
    }
  }, [canClaimStatus, canClaimResult]);

  const checkClaimEligibility = async () => {
    try {
      await dispatch(canClaimCouponAction(couponData.id));
    } catch (error) {
      console.error('Error checking claim eligibility:', error);
    }
  };

  const getRequiredPlatforms = async () => {
    try {
      await dispatch(getRequiredPlatformsAction(couponData.id));
    } catch (error) {
      console.error('Error getting required platforms:', error);
    }
  };

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
    setVerificationStep('post');
  };

  const handleShareToPlatform = async (platform) => {
    try {
      const shareText = `${postText}\n\nHello friends! Be sure to download the Chekdin App to unlock this exclusive deal from ${couponData?.merchant_name}\n\n${couponData?.share_link || ''}`;
      
      switch (platform) {
        case 'facebook':
          await shareToFacebook(shareText);
          break;
        case 'twitter':
          await shareToTwitter(shareText);
          break;
        case 'linkedin':
          await shareToLinkedIn(shareText);
          break;
        case 'whatsapp':
          await shareToWhatsApp(shareText);
          break;
        default:
          // Copy to clipboard for other platforms
          Clipboard.setString(shareText);
          Toast.show({
            type: 'success',
            text1: 'Text copied to clipboard',
            text2: 'Please paste and post on your selected platform',
          });
      }
    } catch (error) {
      console.error('Error sharing to platform:', error);
      Toast.show({
        type: 'error',
        text1: 'Sharing failed',
        text2: 'Please try again or copy the text manually',
      });
    }
  };

  const shareToFacebook = async (text) => {
    if (Platform.OS === 'ios') {
      const shareContent = {
        contentType: 'text',
        text: text,
      };
      
      const canShow = await ShareDialog.canShow(shareContent);
      if (canShow) {
        const result = await ShareDialog.show(shareContent);
        if (!result.isCancelled) {
          Toast.show({
            type: 'success',
            text1: 'Posted to Facebook!',
            text2: 'Please provide the post URL for verification',
          });
        }
      }
    } else {
      const shareOptions = {
        title: 'Share via Facebook',
        message: text,
        social: Share.Social.FACEBOOK,
      };
      
      const result = await Share.shareSingle(shareOptions);
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Posted to Facebook!',
          text2: 'Please provide the post URL for verification',
        });
      }
    }
  };

  const shareToTwitter = async (text) => {
    const shareOptions = {
      title: 'Share via Twitter',
      message: text,
      social: Share.Social.TWITTER,
    };
    
    const result = await Share.shareSingle(shareOptions);
    if (result.action === Share.sharedAction) {
      Toast.show({
        type: 'success',
        text1: 'Posted to Twitter!',
        text2: 'Please provide the post URL for verification',
      });
    }
  };

  const shareToLinkedIn = async (text) => {
    const shareOptions = {
      title: 'Share via LinkedIn',
      message: text,
      social: Share.Social.LINKEDIN,
    };
    
    const result = await Share.shareSingle(shareOptions);
    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Posted to LinkedIn!',
        text2: 'Please provide the post URL for verification',
      });
    }
  };

  const shareToWhatsApp = async (text) => {
    const shareOptions = {
      title: 'Share via WhatsApp',
      message: text,
      social: Share.Social.WHATSAPP,
    };
    
    const result = await Share.shareSingle(shareOptions);
    if (result.success || result.app) {
      Toast.show({
        type: 'success',
        text1: 'Shared via WhatsApp!',
        text2: 'Please provide the post URL for verification',
      });
    }
  };

  const handleSubmitVerification = async () => {
    if (!postUrl.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Post URL required',
        text2: 'Please provide the URL of your social media post',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const proofData = {
        couponId: couponData.id,
        platform: selectedPlatform,
        postUrl: postUrl.trim(),
        postText: postText,
        postedAt: new Date().toISOString(),
      };

      const result = await dispatch(submitVerificationProofAction(proofData));
      
      if (result.payload?.success) {
        Toast.show({
          type: 'success',
          text1: 'Verification submitted!',
          text2: 'Your post will be reviewed shortly',
        });
        onVerificationSuccess();
        onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification failed',
          text2: result.payload?.message || 'Please try again',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification failed',
        text2: error.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPlatformSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Social Media Platform</Text>
      <Text style={styles.stepDescription}>
        Choose a platform to share and verify your post
      </Text>
      
      <ScrollView style={styles.platformList}>
        {requiredPlatforms.map((platform, index) => (
          <TouchableOpacity
            key={index}
            style={styles.platformItem}
            onPress={() => handlePlatformSelect(platform)}
          >
            <View style={styles.platformIcon}>
              <Text style={styles.platformIconText}>
                {platform === 'facebook' ? '📘' : 
                 platform === 'twitter' ? '🐦' : 
                 platform === 'linkedin' ? '💼' : 
                 platform === 'whatsapp' ? '💬' : '📱'}
              </Text>
            </View>
            <Text style={styles.platformName}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPostStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Share Your Post</Text>
      <Text style={styles.stepDescription}>
        Share the coupon on {selectedPlatform} and provide the post URL
      </Text>
      
      <TextInput
        style={styles.textInput}
        placeholder="Enter your post text (optional)"
        value={postText}
        onChangeText={setPostText}
        multiline
        numberOfLines={3}
      />
      
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => handleShareToPlatform(selectedPlatform)}
      >
        <Text style={styles.shareButtonText}>
          Share on {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
        </Text>
      </TouchableOpacity>
      
      <TextInput
        style={styles.urlInput}
        placeholder="Paste your post URL here"
        value={postUrl}
        onChangeText={setPostUrl}
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setVerificationStep('platform')}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmitVerification}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Verification'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Social Media Verification</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {verificationStep === 'platform' && renderPlatformSelection()}
            {verificationStep === 'post' && renderPostStep()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#02676C',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  platformList: {
    flex: 1,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#02676C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  platformIconText: {
    fontSize: 20,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  shareButton: {
    backgroundColor: '#02676C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#02676C',
    alignItems: 'center',
    marginRight: 10,
  },
  backButtonText: {
    color: '#02676C',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#02676C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SocialMediaVerificationModal; 