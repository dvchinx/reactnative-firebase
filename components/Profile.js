import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db, onAuthStateChanged, collection, getDocs } from '../firebase/firebaseConfig';
import Logout from './Logout';

export default function Profile({ navigation }) {
  const [user,         setUser]         = useState(null);
  const [saved,        setSaved]        = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedError,   setSavedError]   = useState(null);

  const loadSaved = (uid) => {
    setLoadingSaved(true);
    setSavedError(null);
    getDocs(collection(db, 'users', uid, 'saved'))
      .then((snap) =>
        setSaved(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      )
      .catch((err) => {
        console.error('Profile getDocs error:', err);
        setSavedError('Could not load saved cases. Tap to retry.');
      })
      .finally(() => setLoadingSaved(false));
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        navigation.navigate('Login');
      } else {
        loadSaved(u.uid);
      }
    });
    return unsub;
  }, [navigation]);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      <Text style={styles.email}>{user.email}</Text>

      <Text style={styles.section}>Saved Criminals</Text>

      {loadingSaved ? (
        <ActivityIndicator style={{ marginTop: 16 }} color="#1a1a1a" />
      ) : savedError ? (
        <View style={styles.feedbackBox}>
          <Text style={styles.errorText}>{savedError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadSaved(user.uid)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : saved.length === 0 ? (
        <Text style={styles.empty}>
          No saved criminals yet.{'\n'}Bookmark some in the Original tab.
        </Text>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.photo} />
              ) : (
                <View style={[styles.photo, styles.noPhoto]} />
              )}
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.crime} numberOfLines={2}>{item.crime}</Text>
              </View>
            </View>
          )}
        />
      )}

      <Logout />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: '#888',
    marginBottom: 28,
  },
  section: {
    fontSize: 12,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  empty: {
    fontSize: 13,
    color: '#aaa',
    lineHeight: 20,
    marginTop: 8,
  },
  feedbackBox: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#c0392b',
    marginBottom: 12,
    lineHeight: 18,
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 4,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  photo: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  noPhoto: {
    backgroundColor: '#e8e8e8',
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  crime: {
    fontSize: 12,
    color: '#888',
  },
});
