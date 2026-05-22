import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth, db, collection, getDocs, setDoc, doc } from '../firebase/firebaseConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function DossierCard({ item, onSave, isSaved }) {
  return (
    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
      <View style={styles.dossierCard}>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.dossierPhoto} resizeMode="cover" />
        ) : (
          <View style={[styles.dossierPhoto, styles.noPhoto]}>
            <Text style={styles.noPhotoText}>NO PHOTO</Text>
          </View>
        )}
        <View style={styles.dossierBody}>
          <Text style={styles.caseLabel}>CASE FILE</Text>
          <Text style={styles.dossierName}>{item.name}</Text>
          <Text style={styles.dossierCrime} numberOfLines={3}>{item.crime}</Text>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(item)}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? '#1a1a1a' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Original() {
  const [criminals, setCriminals] = useState([]);
  const [saved, setSaved] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    getDocs(collection(db, 'wanted'))
      .then((snap) =>
        setCriminals(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    getDocs(collection(db, 'users', user.uid, 'saved'))
      .then((snap) => setSaved(new Set(snap.docs.map((d) => d.id))))
      .catch(console.error);
  }, []);

  const handleSave = async (criminal) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Sign in required', 'Go to the Profile tab to sign in or register.');
      return;
    }
    if (saved.has(criminal.id)) {
      Alert.alert('Already saved', `${criminal.name} is already in your profile.`);
      return;
    }
    try {
      await setDoc(doc(db, 'users', user.uid, 'saved', criminal.id), {
        name: criminal.name,
        crime: criminal.crime,
        photo: criminal.photo || null,
      });
      setSaved((prev) => new Set([...prev, criminal.id]));
    } catch {
      Alert.alert('Error', 'Could not save. Try again.');
    }
  };

  const handleScroll = (e) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActivePage(page);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color="#1a1a1a" />
      </SafeAreaView>
    );
  }

  if (criminals.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>No case files available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Case Dossiers</Text>
          <Text style={styles.sub}>Swipe to browse  ·  Tap  ⊟  to save</Text>
        </View>
        <Text style={styles.pageCount}>
          {activePage + 1} / {criminals.length}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scroller}
        contentContainerStyle={styles.scrollContent}
      >
        {criminals.map((criminal) => (
          <DossierCard
            key={criminal.id}
            item={criminal}
            onSave={handleSave}
            isSaved={saved.has(criminal.id)}
          />
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={styles.dots}>
        {criminals.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, activePage === i && styles.dotActive]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sub: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  pageCount: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '600',
  },
  scroller: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  page: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  dossierCard: {
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  dossierPhoto: {
    width: '100%',
    height: 260,
    backgroundColor: '#f0f0f0',
  },
  noPhoto: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: {
    fontSize: 11,
    color: '#bbb',
    letterSpacing: 2,
  },
  dossierBody: {
    padding: 16,
  },
  caseLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#bbb',
    letterSpacing: 2,
    marginBottom: 6,
  },
  dossierName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  dossierCrime: {
    fontSize: 13,
    color: '#777',
    lineHeight: 19,
  },
  saveBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  dotActive: {
    backgroundColor: '#1a1a1a',
    width: 18,
  },
  emptyText: {
    fontSize: 14,
    color: '#aaa',
  },
});
