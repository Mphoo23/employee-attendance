import AntDesign from '@expo/vector-icons/AntDesign';
import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function Tab_Layout() {
  return (
    <Tabs screenOptions={{
        tabBarActiveTintColor: '#5B6EF7',
        tabBarInactiveTintColor: 'gray',}}
>
      <Tabs.Screen name="index" options={{ headerShown: false,
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={20} color={color} />
          ),
        }} />
      <Tabs.Screen name="report" options={{ headerShown: false,
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <Foundation name="list-bullet" size={20} color={color} />
          ),
        }} />
        <Tabs.Screen name="profile" options={{ 
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
     
            <Ionicons name="person-outline" size={19} color={color} />
          ),
        }} />
    </Tabs>
    )
}
