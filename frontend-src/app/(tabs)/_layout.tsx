import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="index"
                options={{
                    title: "Map",
                    tabBarIcon: ({ color, focused }) =>
                        <Ionicons name={focused ? 'map' : 'map-outline'} />


                }} />
            <Tabs.Screen name="list" options={{
                title: "List",
                tabBarIcon: ({color, focused})=>
                    <Ionicons name={focused ? 'list' : 'list-outline'}/>
                
            
            }} />
        </Tabs>
    );
}