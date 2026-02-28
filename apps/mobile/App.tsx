import { Image, Text, View } from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

/**
 * Splash Screen 1 — matches Figma "Splash Screen 1" frame.
 * Will be moved to a dedicated Splash screen later.
 * Clean white background, centered logo mark, wordmark + tagline.
 */

import logoMark from "./assets/logo-mark.png";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center px-6">
          {/* Finmatter logo mark (green squircle + F/wallet shape) */}
          <Image
            source={logoMark}
            resizeMode="contain"
            className="h-20 w-20"
            accessibilityLabel="Finmatter logo"
          />
          {/* Wordmark */}
          <Text className="mt-6 text-display-large font-bold tracking-tight text-text">
            Finmatter
          </Text>
          {/* Tagline */}
          <Text className="mt-2 text-center text-body text-text-secondary">
            Know which card to use. Always.
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
