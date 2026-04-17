import { Stack } from "expo-router";
import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onFinish={() => setIsLoading(false)} />;
  }
  
  return (
     <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}