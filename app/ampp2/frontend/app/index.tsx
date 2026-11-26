import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { LoadingView } from '../src/components';

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingView />;
  return <Redirect href={user ? '/(tabs)/plants' : '/(auth)/login'} />;
}
