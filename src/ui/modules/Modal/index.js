import React, {useEffect, useState} from 'react';
import {View, Text, Modal, TouchableOpacity, Image} from 'react-native';
import fbIcon from '../../../assets/icons/facebook.png';
import messageIcon from '../../../assets/icons/message.png';
import whatsappIcon from '../../../assets/icons/whatsapp.png';
import instagramIcon from '../../../assets/icons/instagram.png';
import linkedinIcon from '../../../assets/icons/linkedin.png';
import BT from '../../../assets/icons/bluet.png';
import LT from '../../../assets/icons/lightT.png';
import WT from '../../../assets/icons/greenT.png';
import Button from '../Button';

const CustomModal = ({
  isVisible,
  type,
  heading,
  message,
  BtnText,
  onConfirm,
  onCancel,
  onSelectPlatform,
  platform,
  onShare,
  setIsChecked,
  isChecked,
  isDisable,
  extraButton,
}) => {
  const [showBtn, setShowBtn] = useState(false);
  console.log('platform', platform);
  const onAction = type => {
    console.warn('type', type);
    onSelectPlatform(type);
  };

  let trueCount;
  useEffect(() => {
    const {isFacebook, isWhatsapp, isSMS, isInstagram, isLinkedIn} =
      platform || {};

    // Count the number of true values
    trueCount = [isFacebook, isWhatsapp, isSMS, isInstagram, isLinkedIn].filter(
      Boolean,
    ).length;
    chk();
    console.log('trueCount', trueCount);
  });

  const chk = () => {
    if (type === 'platform') {
      if (trueCount === 1) {
        setShowBtn(true);
      }
    }
  };

  const onShareS = () => {
    trueCount = 0;
    onShare();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            width: 350,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.36,
            shadowRadius: 6.68,

            elevation: 11,
          }}>
          {heading && (
            <Text
              style={{
                textAlign: 'center',
                color: 'black',
                fontSize: 20,
                fontWeight: 700,
                marginTop: 20,
              }}>
              {heading}
            </Text>
          )}
          <Text
            style={{
              textAlign: 'center',
              color: 'black',
              fontSize: 13,
              paddingVertical: 30, // Add padding vertically
              padding: 20,
            }}>
            {message}
          </Text>
          {extraButton && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
                margin: 5,
              }}>
              <TouchableOpacity
                style={{
                  height: 20,
                  width: 20,
                  borderRadius: 250 / 2,
                  backgroundColor: isChecked ? 'green' : null,
                  borderWidth: 1,
                  margin: 5,
                }}
                onPress={() => setIsChecked(!isChecked)}
              />
              <TouchableOpacity style={{paddingHorizontal: 10}}>
                <Text>Dont show this message again</Text>
              </TouchableOpacity>
            </View>
          )}
          {type !== 'platform' ? (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: 'lightgray',
                flexDirection: 'row',
                justifyContent: 'center', // Center the buttons horizontally
              }}>
              {type === 'action' ? (
                <>
                  <TouchableOpacity onPress={onCancel} style={{flex: 1}}>
                    <Text
                      style={{
                        textAlign: 'center',
                        color: 'black',
                        fontSize: 13,
                        fontWeight: '700',
                        paddingVertical: 10,
                      }}>
                      No
                    </Text>
                  </TouchableOpacity>
                  <View style={{width: 1, backgroundColor: 'lightgray'}} />
                </>
              ) : null}
              <TouchableOpacity onPress={onConfirm} style={{flex: 1}}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: 'black',
                    fontSize: 13,
                    fontWeight: '700',
                    paddingVertical: 10,
                  }}>
                  {type === 'ok' ? BtnText : 'Yes'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 20,
                marginBottom: 10,
              }}>
              <View>
                {!platform?.isFacebook ? (
                  <TouchableOpacity
                    onPress={() => onAction('FACEBOOK')}
                    disabled={isDisable}>
                    <Image source={fbIcon} />
                  </TouchableOpacity>
                ) : (
                  <View>
                    <Image source={BT} style={{width: 50, height: 50}} />
                  </View>
                )}
              </View>
              <View>
                {!platform?.isSMS ? (
                  <TouchableOpacity
                    onPress={() => onAction('SMS')}
                    disabled={isDisable}>
                    <Image source={messageIcon} />
                  </TouchableOpacity>
                ) : (
                  <View>
                    <Image source={LT} style={{width: 50, height: 50}} />
                  </View>
                )}
              </View>
              <View>
                {!platform?.isWhatsapp ? (
                  <TouchableOpacity
                    onPress={() => onAction('WHATSAPP')}
                    disabled={isDisable}>
                    <Image source={whatsappIcon} />
                  </TouchableOpacity>
                ) : (
                  <View>
                    <Image source={WT} style={{width: 50, height: 50}} />
                  </View>
                )}
              </View>
              <View>
                {!platform?.isLinkedIn ? (
                  <TouchableOpacity
                    onPress={() => onAction('LINKEDIN')}
                    disabled={isDisable}>
                    <Image
                      source={linkedinIcon}
                      style={{width: 45, height: 45}}
                    />
                  </TouchableOpacity>
                ) : (
                  <View>
                    <Image source={BT} style={{width: 50, height: 50}} />
                  </View>
                )}
              </View>
              <View>
                {!platform?.isInstagram ? (
                  <TouchableOpacity
                    onPress={() => onAction('INSTAGRAM')}
                    disabled={isDisable}>
                    <Image
                      source={instagramIcon}
                      style={{width: 45, height: 45}}
                    />
                  </TouchableOpacity>
                ) : (
                  <View>
                    <Image source={LT} style={{width: 50, height: 50}} />
                  </View>
                )}
              </View>
            </View>
          )}
          {showBtn && (
            <View style={{paddingHorizontal: 20, marginBottom: 20}}>
              <Button title={'Claim Coupon'} onPress={onShareS} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;
