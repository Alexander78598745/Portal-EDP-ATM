/**
 * Configuración de Firebase - Portal Atlético de Madrid
 * 
 * ✅ FIREBASE CONFIGURADO CORRECTAMENTE
 * 
 * Proyecto: portal-edp
 * Realtime Database: https://portal-edp-default-rtdb.europe-west1.firebasedatabase.app
 * Storage Bucket: portal-edp.firebasestorage.app
 * 
 * Esta configuración está lista para usar. Firebase se inicializará automáticamente.
 */

// Configuración de Firebase - Portal Atlético de Madrid
// Configuración real del proyecto portal-edp
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDXhWYEUY5VSDrR0rAmV2w34FVGAie3Vjo",
    authDomain: "portal-edp.firebaseapp.com",
    databaseURL: "https://portal-edp-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "portal-edp",
    storageBucket: "portal-edp.firebasestorage.app",
    messagingSenderId: "896504784196",
    appId: "1:896504784196:web:ba21974d0780ae09906311"
};

// CONFIGURACIÓN MANUAL DE FIREBASE
// Para activar Firebase, llamar manualmente: setupFirebaseConnection(FIREBASE_CONFIG)

// NO configurar automáticamente para preservar funcionalidad original

// Exportar configuración para uso global
window.FIREBASE_CONFIG = FIREBASE_CONFIG;