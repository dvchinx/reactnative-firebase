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
import { db, collection, getDocs } from '../firebase/firebaseConfig';

function CriminalCard({ item }) {
  return (
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
  );
}

export default function Home() {
  const [criminals, setCriminals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getDocs(collection(db, 'wanted'))
      .then((snap) =>
        setCriminals(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      )
      .catch((err) => {
        console.error('Home getDocs error:', err);
        setError('Could not load cases. Tap to retry.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color="#1a1a1a" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>FBI Most Wanted</Text>
      <Text style={styles.sub}>{criminals.length} active cases</Text>

      {criminals.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No cases found.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={criminals}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <CriminalCard item={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  noPhoto: {
    backgroundColor: '#e8e8e8',
  },
  info: {
    marginLeft: 14,
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  crime: {
    fontSize: 12,
    color: '#888',
    lineHeight: 17,
  },
  errorText: {
    fontSize: 14,
    color: '#c0392b',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 16,
  },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 4,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
