import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/lib/auth';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      
      {/* Show login tab only if user is not authenticated */}
      <Tabs.Screen
        name="login"
        options={{
          title: 'Login',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person" color={color} />,
          tabBarStyle: user ? { display: 'none' } : undefined,
          href: user ? null : '/login',
        }}
      />
      
      {/* Show main app tabs only if user is authenticated */}
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Octicons name="feed-heart" size={28} color={color} />,
          tabBarStyle: !user ? { display: 'none' } : undefined,
          href: user ? '/feed' : null,
        }}
      />
      <Tabs.Screen
        name="addpost"
        options={{
          title: 'Add Post',
          tabBarIcon: ({ color }) => <Ionicons name="add-sharp" size={28} color={color} />,
          tabBarStyle: !user ? { display: 'none' } : undefined,
          href: user ? '/addpost' : null,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          tabBarStyle: !user ? { display: 'none' } : undefined,
          href: user ? '/home' : null,
        }}
      />
      
      {/* Hide explore tab for now */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide this tab
        }}
      />
      
    </Tabs>
  );
}
