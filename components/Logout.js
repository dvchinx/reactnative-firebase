import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { auth, signOut } from '../firebase/firebaseConfig';

export default function Logout() {
  const handleLogout = () => {
    signOut(auth).catch(console.error);
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={handleLogout}>
      <Text style={styles.text}>Sign Out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderRadius: 4,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
});
