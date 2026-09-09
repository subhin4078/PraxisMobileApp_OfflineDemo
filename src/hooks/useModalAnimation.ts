import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export function useModalAnimation(visible: boolean) {
  const anim = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (visible) {
      setShown(true);
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }).start();
    } else if (shown) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => setShown(false));
    }
  }, [visible, anim, shown]);

  return { shown, anim };
}
