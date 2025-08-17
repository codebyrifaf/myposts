import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  // Show loading indicator while checking auth status
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4DB6AC" />
      </View>
    );
  }

  // Redirect based on authentication status
  if (user) {
    return <Redirect href="/(tabs)/feed" />;
  } else {
    return <Redirect href="/(tabs)/login" />;
  }
}
