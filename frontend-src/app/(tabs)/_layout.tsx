import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({ 

        tabBarItemStyle: {
          paddingBottom: 5
        },
        headerStyle: {
          height: 120
        },
        
        //LOGO
        headerTitle: () => (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: 10 }}>
            <Image
              source={require('../../assets/images/CLTLogo.png')}
              style={{ width: 90, height: 90 }}
            />
          </View>
        ),

        // Title
        /*headerTitle: () => {
          const title = 
            route.name === "index" ? "Map View" : "List View";

          return (
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
              {title}
            </Text>
          );
        },*/

        headerTitleAlign: "center",

        //Bottom tab styling
        tabBarStyle: {
          backgroundColor: '#d4f5d0',
          height: 85,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 0,
        },

        tabBarActiveTintColor: '#2e7d32',
        tabBarInactiveTintColor: '#666',
      })}
    >

{/* MAP TAB */}
<Tabs.Screen
  name="index"
  options={{
    tabBarLabel: ({ focused }) => (
      <Text
        style={{
          fontSize: 15,
          fontWeight: focused ? '600' : '400',
          color: focused ? '#2e7d32' : '#444',
          marginTop: 4,
        }}
      >
        Map
      </Text>
    ),

    tabBarIcon: ({ color, focused }) => (
      <View
        style={{
          backgroundColor: focused ? '#7fbf7f' : 'transparent',
          width: 64,
          height: 32,
          borderRadius: 16,
          //padding: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}

      >
        <Ionicons
          name={focused ? 'location' : 'location-outline'}
          size={22}
          color={focused ? '#ffffff' : '#444'}
        />
      </View>
    ),
  }}
/>

{/* LIST TAB */}
<Tabs.Screen
  name="list"
  options={{
    tabBarLabel: ({ focused }) => (
      <Text
        style={{
          fontSize: 15,
          fontWeight: focused ? '600' : '400',
          color: focused ? '#2e7d32' : '#444', 
          marginTop: 4,
        }}
      >
        List
      </Text>
    ),

    tabBarIcon: ({ color, focused }) => (
      <View
        style={{
          backgroundColor: focused ? '#7fbf7f' : 'transparent',
          width: 64,
          height: 32,
          //padding: 12,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={focused ? 'list' : 'list-outline'}
          size={22}
          color={focused ? '#ffffff' : '#444'}
        />
      </View>
    ),
  }}
/>

    </Tabs>
  );
}