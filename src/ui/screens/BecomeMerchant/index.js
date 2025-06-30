import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { useTheme } from '../../ThemeProvider';
import { RF, RP } from '../../../utils/dim';
import Toast from 'react-native-toast-message';

const BecomeMerchant = ({ navigation }) => {
  const { colors, spacing, typography } = useTheme();
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    address: '',
    description: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.businessName || !formData.contactName || !formData.email || !formData.phone) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in all required fields.',
      });
      return;
    }

    // Here you would typically send the data to your backend
    // For now, we'll show a success message and provide contact info
    Alert.alert(
      'Thank You!',
      'Your merchant application has been submitted. We will contact you within 24-48 hours to discuss partnership opportunities.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleContactUs = () => {
    const email = 'partnerships@chekdinapp.com';
    const subject = 'Merchant Partnership Inquiry';
    const body = `Hello,\n\nI'm interested in becoming a merchant partner with Chekdin.\n\nBusiness Name: ${formData.businessName}\nContact Name: ${formData.contactName}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nBest regards,\n${formData.contactName}`;
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(mailtoUrl).then(supported => {
      if (supported) {
        Linking.openURL(mailtoUrl);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Email Not Available',
          text2: 'Please contact us at partnerships@chekdinapp.com',
        });
      }
    });
  };

  const handleCallUs = () => {
    const phoneNumber = '+1-800-CHEKDIN';
    Linking.canOpenURL(`tel:${phoneNumber}`).then(supported => {
      if (supported) {
        Linking.openURL(`tel:${phoneNumber}`);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Phone Not Available',
          text2: 'Please call us at +1-800-CHEKDIN',
        });
      }
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surfaceLight }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          Become a Merchant
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Hero Section */}
      <View style={[styles.heroSection, { backgroundColor: colors.surfaceLight }]}>
        <Image
          source={require('../../../assets/icons/BecomeaMechant.png')}
          style={styles.heroImage}
        />
        <Text style={[styles.heroTitle, { color: colors.primary }]}>
          Join Chekdin as a Merchant Partner
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          Grow your business with our innovative coupon and check-in platform
        </Text>
      </View>

      {/* Benefits Section */}
      <View style={styles.benefitsSection}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Why Partner with Chekdin?
        </Text>
        
        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.benefitIconText, { color: colors.textOnPrimary }]}>📈</Text>
          </View>
          <View style={styles.benefitContent}>
            <Text style={[styles.benefitTitle, { color: colors.text }]}>
              Increase Customer Traffic
            </Text>
            <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
              Attract new customers with attractive coupons and promotions
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.benefitIconText, { color: colors.textOnPrimary }]}>💰</Text>
          </View>
          <View style={styles.benefitContent}>
            <Text style={[styles.benefitTitle, { color: colors.text }]}>
              Boost Revenue
            </Text>
            <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
              Increase sales through targeted promotions and customer engagement
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.benefitIconText, { color: colors.textOnPrimary }]}>📱</Text>
          </View>
          <View style={styles.benefitContent}>
            <Text style={[styles.benefitTitle, { color: colors.text }]}>
              Digital Presence
            </Text>
            <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
              Get discovered by customers searching for deals in your area
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <View style={[styles.benefitIcon, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.benefitIconText, { color: colors.textOnPrimary }]}>📊</Text>
          </View>
          <View style={styles.benefitContent}>
            <Text style={[styles.benefitTitle, { color: colors.text }]}>
              Analytics & Insights
            </Text>
            <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>
              Track performance and understand your customer behavior
            </Text>
          </View>
        </View>
      </View>

      {/* Application Form */}
      <View style={[styles.formSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Apply Now
        </Text>
        <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
          Fill out the form below and we'll get back to you within 24-48 hours
        </Text>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Business Name *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surfaceLight,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.businessName}
            onChangeText={(text) => handleInputChange('businessName', text)}
            placeholder="Enter your business name"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Contact Name *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surfaceLight,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.contactName}
            onChangeText={(text) => handleInputChange('contactName', text)}
            placeholder="Enter contact person name"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email Address *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surfaceLight,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            placeholder="Enter your email address"
            placeholderTextColor={colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Phone Number *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surfaceLight,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            placeholder="Enter your phone number"
            placeholderTextColor={colors.textLight}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Business Type</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surfaceLight,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.businessType}
            onChangeText={(text) => handleInputChange('businessType', text)}
            placeholder="Restaurant, Retail, Service, etc."
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Business Address</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surfaceLight,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            placeholder="Enter your business address"
            placeholderTextColor={colors.textLight}
            multiline
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Business Description</Text>
          <TextInput
            style={[styles.textArea, { 
              backgroundColor: colors.surfaceLight,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="Tell us about your business..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}>
          <Text style={[styles.submitButtonText, { color: colors.textOnPrimary }]}>
            Submit Application
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contact Section */}
      <View style={[styles.contactSection, { backgroundColor: colors.surfaceLight }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>
          Have Questions?
        </Text>
        <Text style={[styles.contactText, { color: colors.textSecondary }]}>
          Our partnership team is here to help you get started
        </Text>

        <View style={styles.contactButtons}>
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: colors.primary }]}
            onPress={handleContactUs}>
            <Text style={[styles.contactButtonText, { color: colors.textOnPrimary }]}>
              📧 Email Us
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: colors.primaryLight }]}
            onPress={handleCallUs}>
            <Text style={[styles.contactButtonText, { color: colors.textOnPrimary }]}>
              📞 Call Us
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: RP(20),
    paddingVertical: RP(15),
    paddingTop: RP(50),
  },
  backButton: {
    padding: RP(5),
  },
  backButtonText: {
    fontSize: RF(16),
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: RF(18),
    fontWeight: '700',
  },
  placeholder: {
    width: RP(50),
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: RP(30),
    paddingHorizontal: RP(20),
  },
  heroImage: {
    width: RP(80),
    height: RP(80),
    marginBottom: RP(20),
  },
  heroTitle: {
    fontSize: RF(24),
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: RP(10),
  },
  heroSubtitle: {
    fontSize: RF(16),
    textAlign: 'center',
    lineHeight: RF(24),
  },
  benefitsSection: {
    paddingHorizontal: RP(20),
    paddingVertical: RP(30),
  },
  sectionTitle: {
    fontSize: RF(20),
    fontWeight: '700',
    marginBottom: RP(20),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: RP(20),
  },
  benefitIcon: {
    width: RP(40),
    height: RP(40),
    borderRadius: RP(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: RP(15),
  },
  benefitIconText: {
    fontSize: RF(20),
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: RF(16),
    fontWeight: '600',
    marginBottom: RP(5),
  },
  benefitDescription: {
    fontSize: RF(14),
    lineHeight: RF(20),
  },
  formSection: {
    paddingHorizontal: RP(20),
    paddingVertical: RP(30),
    marginHorizontal: RP(20),
    borderRadius: RP(15),
    marginBottom: RP(20),
  },
  formSubtitle: {
    fontSize: RF(14),
    marginBottom: RP(25),
    lineHeight: RF(20),
  },
  formGroup: {
    marginBottom: RP(20),
  },
  label: {
    fontSize: RF(14),
    fontWeight: '600',
    marginBottom: RP(8),
  },
  input: {
    borderWidth: 1,
    borderRadius: RP(10),
    paddingHorizontal: RP(15),
    paddingVertical: RP(12),
    fontSize: RF(16),
  },
  textArea: {
    borderWidth: 1,
    borderRadius: RP(10),
    paddingHorizontal: RP(15),
    paddingVertical: RP(12),
    fontSize: RF(16),
    height: RP(100),
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: RP(25),
    paddingVertical: RP(15),
    alignItems: 'center',
    marginTop: RP(10),
  },
  submitButtonText: {
    fontSize: RF(16),
    fontWeight: '600',
  },
  contactSection: {
    paddingHorizontal: RP(20),
    paddingVertical: RP(30),
    alignItems: 'center',
  },
  contactText: {
    fontSize: RF(16),
    textAlign: 'center',
    marginBottom: RP(25),
    lineHeight: RF(24),
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  contactButton: {
    paddingHorizontal: RP(25),
    paddingVertical: RP(12),
    borderRadius: RP(20),
    minWidth: RP(120),
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: RF(14),
    fontWeight: '600',
  },
});

export default BecomeMerchant; 