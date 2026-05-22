// firebaseConfig MUST be the very first require — it sets all browser-global
// polyfills (DOMException, PerformanceEntry, window, …) before any other
// module has a chance to load Firebase code.
require('./firebase/firebaseConfig');

const { registerRootComponent } = require('expo');
const App = require('./App').default;

registerRootComponent(App);
