import { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { auth, db, onAuthStateChanged, collection, getDocs, addDoc } from './firebase/firebaseConfig';
import Home from './components/Home';
import Original from './components/Original';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';

const Tab = createBottomTabNavigator();
const ProfileStackNav = createNativeStackNavigator();

async function seedFBIData() {
  const snap = await getDocs(collection(db, 'wanted'));
  if (!snap.empty) return;
  const res = await fetch('https://api.fbi.gov/@wanted?pageSize=10');
  const json = await res.json();
  const items = json.items || [];
  for (const item of items) {
    await addDoc(collection(db, 'wanted'), {
      name:  item.title || 'Unknown',
      crime: item.subjects?.join(', ') || item.description || 'Unknown',
      photo: item.images?.[0]?.thumb || item.images?.[0]?.original || null,
    });
  }
}

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="ProfileMain" component={Profile} />
      <ProfileStackNav.Screen name="Login"       component={Login} />
      <ProfileStackNav.Screen name="Register"    component={Register} />
    </ProfileStackNav.Navigator>
  );
}

const TAB_ICONS = {
  Home:     'home-outline',
  Original: 'file-tray-full-outline',
  Profile:  'person-outline',
};

export default function App() {
  // Keep two independent flags so neither task blocks the other.
  const authReady = useRef(false);
  const seedReady = useRef(false);
  const [ready, setReady] = useState(false);

  const checkReady = () => {
    if (authReady.current && seedReady.current) setReady(true);
  };

  useEffect(() => {
    // 1. Resolve auth state.
    const unsub = onAuthStateChanged(auth, () => {
      authReady.current = true;
      checkReady();
    });

    // 2. Seed FBI data — MUST finish before Home mounts so the FlatList
    //    doesn't query an empty collection and show 0 results.
    seedFBIData()
      .catch(console.error)
      .finally(() => {
        seedReady.current = true;
        checkReady();
      });

    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a1a1a" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name={TAB_ICONS[route.name] || 'ellipse-outline'} size={size} color={color} />
              ),
              tabBarActiveTintColor:   '#1a1a1a',
              tabBarInactiveTintColor: '#aaa',
              tabBarStyle: {
                borderTopWidth:  0.5,
                borderTopColor:  '#e0e0e0',
                backgroundColor: '#fff',
              },
              tabBarLabelStyle: { fontSize: 11 },
            })}
          >
            <Tab.Screen name="Home"     component={Home} />
            <Tab.Screen name="Original" component={Original} />
            <Tab.Screen name="Profile"  component={ProfileStack} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
