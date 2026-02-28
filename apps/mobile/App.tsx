import { Text, View, Animated, Easing } from "react-native";
import { useEffect, useRef, useState } from "react";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { LinearGradient } from "expo-linear-gradient";

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_800ExtraBold,
  });

  const floatAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;

  const [percentage, setPercentage] = useState(0);
  const [statusText, setStatusText] = useState("Establishing Connection");

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cardAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(cardAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 665,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 0,
          duration: 665,
          useNativeDriver: true,
        })
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 4000,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();

    const listenerId = progressAnim.addListener(({ value }) => {
      if (value < 33) setStatusText("Establishing Connection");
      else if (value < 66) setStatusText("Securing Environment");
      else setStatusText("Building Trust...");

      if (value < 10) setPercentage(0);
      else if (value < 30) setPercentage(12);
      else if (value < 50) setPercentage(35);
      else if (value < 70) setPercentage(62);
      else if (value < 100) setPercentage(88);
      else setPercentage(100);
    });

    return () => progressAnim.removeListener(listenerId);
  }, []);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const cardY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -40],
  });
  
  const cardRotate = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '2deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
        <View className="flex-1 w-full items-center justify-between py-16 px-8 overflow-hidden relative">
          
          <View className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-primary opacity-10 rounded-full" />
          <View className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[30%] bg-primary opacity-5 rounded-full" />

          <View className="flex-1 flex items-center justify-center w-full">
            <Animated.View 
              style={{ transform: [{ translateY: floatY }] }}
              className="relative w-64 h-64 flex items-center justify-center pt-8"
            >
              
              <View 
                className="absolute bottom-10 w-48 h-32 rounded-[32px] bg-charcoal" 
                style={{ opacity: 0.8, transform: [{ scale: 0.95 }] }} 
              />
              
              <View 
                className="absolute bottom-0 w-48 h-12 bg-primary/20 rounded-full" 
                style={{
                  shadowColor: "#00B14F",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              />

              <Animated.View 
                className="absolute bottom-12 w-40 h-28 bg-primary rounded-xl shadow-lg z-10 flex-col p-4 justify-between"
                style={{
                  transform: [
                    { translateY: cardY },
                    { rotate: cardRotate }
                  ]
                }}
              >
                <View className="w-8 h-6 bg-yellow-400 rounded-sm opacity-80" />
                <View className="space-y-1 mt-auto">
                  <View className="w-12 h-1 bg-white opacity-40 rounded-full" />
                  <View className="w-24 h-1 bg-white opacity-40 rounded-full" />
                </View>
              </Animated.View>

              <LinearGradient
                colors={['#1A1A1A', '#000000']}
                className="absolute bottom-4 w-48 h-32 rounded-[32px] z-20 overflow-hidden shadow-2xl"
              >
                <View className="absolute top-0 left-0 w-full h-2 bg-white opacity-10" />
                <View className="absolute top-8 left-1/2 -ml-20 w-40 h-1 bg-white opacity-5 rounded-full" />
              </LinearGradient>

            </Animated.View>
          </View>

          <View className="w-full flex-col items-center">
            
            <View className="flex-col items-center text-center space-y-2 mb-12">
              <Text className="text-charcoal text-[38px] font-display font-extrabold tracking-tight leading-none">
                Finmatter
              </Text>
              <Text className="text-charcoal-muted text-[16px] font-body font-medium mt-1">
                Know which card to use. Always.
              </Text>
            </View>

            <View className="w-full max-w-[280px] flex-col items-center">
              <View className="mb-2 w-full items-center">
                <Text className="text-primary font-display font-bold text-sm tabular-nums tracking-widest">
                  {percentage}%
                </Text>
              </View>
              
              <View className="w-full h-[3px] bg-slate-100 rounded-full overflow-hidden">
                <Animated.View 
                  className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(0,177,79,0.4)]"
                  style={{ width: progressWidth }}
                />
              </View>

              <View className="mt-4 h-6 flex items-center justify-center">
                <Animated.Text 
                  className="text-charcoal text-[13px] font-body font-semibold tracking-wide"
                  style={{ opacity: textFadeAnim }}
                >
                  {statusText}
                </Animated.Text>
              </View>
            </View>

          </View>

        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
