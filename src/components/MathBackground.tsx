import useTheme from "@/src/hooks/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const ALL_SYMBOLS = [
  "∫",
  "∑",
  "π",
  "√",
  "∞",
  "+",
  "x²",
  "÷",
  "∂",
  "≠",
  "∆",
  "θ",
  "λ",
  "cos",
  "e",
  "≈",
  "α",
  "β",
  "∀",
  "∃",
  "%",
  "±",
  "lim",
  "log",
  "∅",
  "∩",
  "∴",
  "∪",
];

const N = ALL_SYMBOLS.length;

// Global speed scale (0.0 = stopped, 1.0 = original)
const SPEED_SCALE = 0.2;

function seeded(i: number, salt: number): number {
  "worklet";
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

type PhysicsState = {
  x: number[];
  y: number[];
  vx: number[];
  vy: number[];
  size: number[];
  opacity: number[];
  rotate: number[];
};

function makeInitial(): PhysicsState {
  const x: number[] = [],
    y: number[] = [],
    vx: number[] = [],
    vy: number[] = [],
    size: number[] = [],
    opacity: number[] = [],
    rotate: number[] = [];
  for (let i = 0; i < N; i++) {
    const isFast = seeded(i, 9) > 0.7;
    const base = isFast ? 120 + seeded(i, 3) * 80 : 25 + seeded(i, 3) * 35;
    const speed = base * SPEED_SCALE;
    x.push(seeded(i, 2) * (SCREEN_WIDTH - 60));
    y.push(100 + seeded(i, 7) * (SCREEN_HEIGHT - 200));
    vx.push((seeded(i, 5) - 0.5) * (isFast ? 40 : 15) * SPEED_SCALE);
    vy.push(-speed);
    size.push(20 + Math.floor(seeded(i, 1) * 28));
    opacity.push(0.13 + seeded(i, 6) * 0.1);
    rotate.push(seeded(i, 8) * 60 - 30);
  }
  return { x, y, vx, vy, size, opacity, rotate };
}

interface SymbolProps {
  index: number;
  symbol: string;
  physicsState: SharedValue<PhysicsState>;
  color: string;
}

function FloatingSymbol({ index, symbol, physicsState, color }: SymbolProps) {
  const posX = useDerivedValue(() => physicsState.value.x[index]);
  const posY = useDerivedValue(() => physicsState.value.y[index]);
  const size = useDerivedValue(() => physicsState.value.size[index]);
  const opacity = useDerivedValue(() => physicsState.value.opacity[index]);
  const rotate = useDerivedValue(
    () => `${Math.round(physicsState.value.rotate[index])}deg`,
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value },
      { translateY: posY.value },
      { rotate: rotate.value },
    ],
    opacity: opacity.value,
    fontSize: size.value,
  }));

  return (
    <Animated.Text
      style={[
        {
          position: "absolute",
          left: 0,
          top: 0,
          color,
          fontFamily: "Fredoka_700Bold",
        },
        animStyle,
      ]}
    >
      {symbol}
    </Animated.Text>
  );
}

interface MathBackgroundProps {
  backgroundColor?: string | [string, string];
  symbolColor?: string;
}

export function MathBackground({
  backgroundColor,
  symbolColor,
}: MathBackgroundProps = {}) {
  const { colors } = useTheme();

  const gradientColors: [string, string] = Array.isArray(backgroundColor)
    ? backgroundColor
    : [colors.gradientPrimary, colors.gradientSecondary];

  const finalSymbolColor = symbolColor ?? colors.mathBgSymbol;

  const physicsState = useSharedValue<PhysicsState>(makeInitial());
  const elapsed = useSharedValue(0);

  useFrameCallback(({ timeSincePreviousFrame }) => {
    "worklet";
    const rawDt = timeSincePreviousFrame ?? 16;
    elapsed.value += rawDt;
    // Throttle physics to ~20fps (50ms) to save CPU
    if (elapsed.value < 50) return;
    const dt = Math.min(elapsed.value / 1000, 0.1);
    elapsed.value = 0;
    const s = physicsState.value;
    const x = s.x.slice();
    const y = s.y.slice();
    const vx = s.vx.slice();
    const vy = s.vy.slice();

    // Integrate positions
    for (let i = 0; i < N; i++) {
      x[i] += vx[i] * dt;
      y[i] += vy[i] * dt;
    }

    // Elastic collision detection (O(n²), fine for n=28)
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const minDist = (s.size[i] + s.size[j]) * 0.6;
        const dx = x[j] - x[i];
        const dy = y[j] - y[i];
        const d2 = dx * dx + dy * dy;
        if (d2 < minDist * minDist && d2 > 0.001) {
          const d = Math.sqrt(d2);
          const nx = dx / d;
          const ny = dy / d;
          const dvn = (vx[i] - vx[j]) * nx + (vy[i] - vy[j]) * ny;
          if (dvn > 0) {
            vx[i] -= dvn * nx;
            vy[i] -= dvn * ny;
            vx[j] += dvn * nx;
            vy[j] += dvn * ny;
          }
          const sep = (minDist - d) * 0.5;
          x[i] -= nx * sep;
          y[i] -= ny * sep;
          x[j] += nx * sep;
          y[j] += ny * sep;
        }
      }
    }

    // Clamp velocities and wrap boundaries
    for (let i = 0; i < N; i++) {
      const isFast = seeded(i, 9) > 0.7;
      const baseSpeed =
        (isFast ? 120 + seeded(i, 3) * 80 : 25 + seeded(i, 3) * 35) *
        SPEED_SCALE;
      const maxLat = (isFast ? 80 : 50) * SPEED_SCALE;
      if (vy[i] > -baseSpeed * 0.4) vy[i] = -baseSpeed * 0.4;
      if (vy[i] < -baseSpeed * 3) vy[i] = -baseSpeed * 3;
      if (vx[i] > maxLat) vx[i] = maxLat;
      if (vx[i] < -maxLat) vx[i] = -maxLat;
      // Wrap top → respawn at bottom
      if (y[i] < -100) {
        y[i] = SCREEN_HEIGHT + 80;
        x[i] = seeded(i, 2) * (SCREEN_WIDTH - 60);
        vx[i] = (seeded(i, 5) - 0.5) * (isFast ? 40 : 15);
        vy[i] = -baseSpeed;
      }
      // Wrap sides
      if (x[i] < -60) x[i] = SCREEN_WIDTH + 40;
      if (x[i] > SCREEN_WIDTH + 60) x[i] = -40;
    }

    // Assign a NEW object so Reanimated detects the change and triggers UI update
    physicsState.value = {
      x,
      y,
      vx,
      vy,
      size: s.size,
      opacity: s.opacity,
      rotate: s.rotate,
    };
  });

  return (
    <>
      {Array.isArray(backgroundColor) || !backgroundColor ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor }]} />
      )}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {ALL_SYMBOLS.map((symbol, i) => (
          <FloatingSymbol
            key={i}
            index={i}
            symbol={symbol}
            physicsState={physicsState}
            color={finalSymbolColor}
          />
        ))}
      </View>
    </>
  );
}
