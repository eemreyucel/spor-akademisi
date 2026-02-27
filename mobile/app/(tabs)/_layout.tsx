import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { getPrimaryRole } from '@/lib/utils/role-helpers';
import { View, ActivityIndicator, Text } from 'react-native';

export default function TabsLayout() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  const role = profile ? getPrimaryRole(profile.roles) : 'parent';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopColor: '#e5e7eb',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: role === 'admin' ? 'Genel Bakış' : 'Ana Sayfa',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🏠</Text>
          ),
          href: role === 'coach' ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Yoklama',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>📋</Text>
          ),
          href: role === 'parent' ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Ödemeler',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>💳</Text>
          ),
          href: role === 'coach' ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="management"
        options={{
          title: 'Yönetim',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>⚙️</Text>
          ),
          href: role !== 'admin' ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
