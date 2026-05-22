const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase v10+ uses the "exports" field in package.json to expose different
// builds per environment. Expo's default Metro config enables package-exports
// but leaves conditionNames empty, so every Firebase package falls through to
// "default" — which is the ESM *browser* build. That bundle's side-effect
// (registerAuth / registerFirestore) can fail in Hermes, producing:
//   "Component auth has not been registered yet"
//   "Service firestore is not available"
//
// Setting these conditions tells Metro to prefer:
//   1. "react-native" — the RN-specific CJS builds shipped in @firebase/auth
//      and @firebase/firestore (dist/rn/index.js and dist/index.rn.js).
//   2. "require"      — the generic CJS build used by @firebase/app and others
//                       that don't ship a dedicated RN bundle.
//   3. "default"      — fallback for anything else.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['react-native', 'require', 'default'];

module.exports = config;
