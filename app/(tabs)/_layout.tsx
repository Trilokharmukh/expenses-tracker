import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import {
  Chrome as Home,
  CirclePlus as PlusCircle,
  ChartBar as BarChart2,
  Settings,
} from 'lucide-react-native';
import { ExpenseProvider } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function TabLayout() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ExpenseProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            elevation: 0,
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            height: Platform.OS === 'ios' ? 90 : 70,
            paddingBottom: Platform.OS === 'ios' ? 30 : 10,
            paddingTop: 10,
          },
          tabBarActiveTintColor: '#06B6D4',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerRight: () => (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      >
        <Tabs.Screen
          name="add"
          options={{
            title: 'Add Expense',
            tabBarIcon: ({ color, size }) => (
              <PlusCircle size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ color, size }) => (
              <BarChart2 size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ExpenseProvider>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 15,
    padding: 8,
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
});
