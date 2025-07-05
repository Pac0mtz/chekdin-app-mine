import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {Svg, Circle} from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RadialChart = ({
  series,
  labels,
  maxValue = 10,
  size = 115,
  delay = 0,
}) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const progress = useRef(new Animated.Value(0)).current;
  const strokeDashoffset = useRef(new Animated.Value(circumference)).current;

  useEffect(() => {
    const progressValue = maxValue > 0 ? series[0] / maxValue : 0;
    
    // Reset to start from empty
    strokeDashoffset.setValue(circumference);
    
    Animated.timing(progress, {
      toValue: progressValue,
      duration: 1500,
      delay: delay,
      useNativeDriver: false,
    }).start();

    // Animate the stroke dash offset for the circular fill
    Animated.timing(strokeDashoffset, {
      toValue: circumference - (progressValue * circumference),
      duration: 1500,
      delay: delay,
      useNativeDriver: false,
    }).start();
  }, [series, maxValue, delay, circumference]);

  const getStrokeColor = () => {
    return '#02676C'; // Use Chekdin's color for all charts
  };

  const getBackgroundColor = () => {
    return '#B9D7D4'; // Use Viewer's track color for all charts
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          stroke={getBackgroundColor()}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke={getStrokeColor()}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.valueText, {fontSize: size === 115 ? 24 : 18}]}>
          {series[0]}
        </Text>
        <Text style={[styles.labelText, {fontSize: size === 115 ? 14 : 12}]}>
          {labels[0]}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  labelText: {
    fontSize: 14,
    color: 'gray',
  },
});

export default RadialChart;
