import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import { usePetStore } from './store';

export const usePostureSensor = () => {
  const { setPostureState, setCurrentAngle, postureState } = usePetStore();
  const badPostureTimer = useRef(null);
  const previousState = useRef('HAPPY');

  useEffect(() => {
    // 設定感測器更新頻率為 500 毫秒，避免過度耗電
    Accelerometer.setUpdateInterval(500);

    const subscription = Accelerometer.addListener(({ y, z }) => {
      // 取得絕對角度 (0 ~ 180度)
      const angle = Math.abs(Math.atan2(y, z) * (180 / Math.PI));
      setCurrentAngle(Math.round(angle));

      // 計算與「完美直立 (90度)」的偏差值
      // 偏差值越小，代表越接近 90 度（姿勢越好）
      const deviation = Math.abs(angle - 90);

      // 雙向判斷邏輯 (無論前傾或後仰都完美捕捉)
      if (deviation <= 35) {
        // 偏差在 35 度以內 (約 55度 ~ 125度)：姿勢良好
        clearTimeout(badPostureTimer.current);
        setPostureState('HAPPY');
        previousState.current = 'HAPPY';

      } else if (deviation > 35 && deviation <= 50) {
        // 偏差在 35~50 度之間 (約 40~55度 或 125~140度)：開始低頭或過度後仰 (警告)
        clearTimeout(badPostureTimer.current);
        setPostureState('WARNING');
        previousState.current = 'WARNING';

      } else {
        // 偏差大於 50 度 (小於 40度 或 大於 140度)：嚴重不良姿勢
        if (previousState.current !== 'SICK') {
          badPostureTimer.current = setTimeout(() => {
            setPostureState('SICK');
            previousState.current = 'SICK';

            // 觸發強力震動回饋
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }, 2000); // 2秒防抖
        }
      }
    });

    // 組件卸載時務必清除監聽與計時器，防止 Memory Leak
    return () => {
      subscription.remove();
      clearTimeout(badPostureTimer.current);
    };
  }, []);
};