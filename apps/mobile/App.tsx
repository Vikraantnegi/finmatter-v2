import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <Text className="text-heading-large font-semibold text-text">
        FinMatter
      </Text>
      <Text className="mt-2 text-caption text-text-secondary">
        Know which card to use. Always.
      </Text>
    </View>
  );
}
