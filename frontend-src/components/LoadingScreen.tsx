import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Image } from 'react-native';

const LoadingScreen = ({ onFinish }: { onFinish: () => void }) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    // Fade in
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(3000),
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity }}>
        <Image
          source={require('../assets/images/CLTLogo.png')} // update path to your logo
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});