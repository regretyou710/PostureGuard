import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { usePetStore } from './src/store';
import { usePostureSensor } from './src/usePostureSensor';
import { useKeepAwake } from 'expo-keep-awake';

export default function App() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webTitle}>📱 請使用手機測試</Text>
        <Text style={styles.webDescription}>
          PostureGuard 需要調用手機底層的「加速計 (Accelerometer)」與「震動馬達 (Haptics)」，這些硬體感測器無法在電腦網頁瀏覽器中運行。
        </Text>
        <View style={styles.webInstructionBox}>
          <Text style={styles.webInstructionText}>1. 請在終端機執行 npx expo start</Text>
          <Text style={styles.webInstructionText}>2. 下載 iOS / Android 版的 Expo Go App</Text>
          <Text style={styles.webInstructionText}>3. 掃描終端機上的 QR Code 進行實機體驗</Text>
        </View>
      </View>
    );
  }

  useKeepAwake();
  usePostureSensor();
  const { postureState, currentAngle } = usePetStore();
  const animationRef = useRef(null);

  // 當狀態改變時，確保新動畫從頭開始播放
  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, [postureState]);

  const getBackgroundColor = () => {
    switch (postureState) {
      case 'HAPPY': return '#E8F5E9';
      case 'WARNING': return '#FFF3E0';
      case 'SICK': return '#FFEBEE';
      default: return '#fff';
    }
  };

  const getStatusText = () => {
    switch (postureState) {
      case 'HAPPY': return '姿勢很棒！繼續保持 ✨';
      case 'WARNING': return '小心脖子，有點低頭囉 👀';
      case 'SICK': return '太低啦！快把手機拿高 🚑';
      default: return '';
    }
  };

  // 核心邏輯：根據狀態決定要載入哪一個 JSON 動畫檔
  const getLottieSource = () => {
    switch (postureState) {
      case 'HAPPY': return require('./assets/lottie/happy.json');
      case 'WARNING': return require('./assets/lottie/warning.json');
      case 'SICK': return require('./assets/lottie/sick.json');
      default: return require('./assets/lottie/happy.json');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.header}>
        <Text style={styles.angleText}>目前傾角: {currentAngle}°</Text>
      </View>

      <View style={styles.petContainer}>
        {/* Lottie 動畫區塊 */}
        <LottieView
          ref={animationRef}
          source={getLottieSource()}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // RN 中的顏色漸變通常需要 Reanimated 處理，這裡先以乾淨的 View 為主
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  angleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  petContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 300,
    height: 300,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#444',
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  webTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  webDescription: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    maxWidth: 500,
    lineHeight: 24,
    marginBottom: 30,
  },
  webInstructionBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3, // 給 Android 網頁版的陰影
  },
  webInstructionText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    fontWeight: '500',
  },
});