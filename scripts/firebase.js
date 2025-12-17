/**
 * Firebase Integration - Portal Atlético de Madrid
 * INACTIVADO POR DEFECTO - Se activa solo cuando se llama manualmente
 */

// Configuración de Firebase (deshabilitada por defecto)
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDXhWYEUY5VSDrR0rAmV2w34FVGAie3Vjo",
    authDomain: "portal-edp.firebaseapp.com",
    databaseURL: "https://portal-edp-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "portal-edp",
    storageBucket: "portal-edp.firebasestorage.app",
    messagingSenderId: "896504784196",
    appId: "1:896504784196:web:ba21974d0780ae09906311"
};

/**
 * Activar Firebase manualmente
 * Llamar solo cuando se necesite sincronización
 */
window.activateFirebase = function() {
    console.log('🔥 Activando Firebase manualmente...');
    
    try {
        // Verificar que Firebase esté disponible
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK no encontrado');
            return false;
        }

        // Verificar que ya no esté activado
        if (window.firebaseManager && window.firebaseManager.initialized) {
            console.log('✅ Firebase ya está activado');
            return true;
        }

        // Inicializar Firebase
        firebase.initializeApp(FIREBASE_CONFIG);
        const db = firebase.database();
        
        // Crear manager simple
        window.firebaseManager = {
            db: db,
            initialized: true,
            
            async syncData() {
                try {
                    console.log('🔄 Sincronizando datos...');
                    
                    // Obtener datos locales
                    const localUsers = JSON.parse(localStorage.getItem('atm_users') || '[]');
                    const localSessions = JSON.parse(localStorage.getItem('atm_sessions') || '[]');
                    
                    // Subir a Firebase (opcional - solo para respaldo)
                    if (localUsers.length > 0) {
                        await db.ref('backup_users').set(localUsers);
                    }
                    if (localSessions.length > 0) {
                        await db.ref('backup_sessions').set(localSessions);
                    }
                    
                    // Descargar desde Firebase (opcional)
                    const firebaseUsers = await db.ref('backup_users').once('value');
                    const firebaseSessions = await db.ref('backup_sessions').once('value');
                    
                    const fbUsers = firebaseUsers.val() || [];
                    const fbSessions = firebaseSessions.val() || [];
                    
                    // Usar datos de Firebase si están disponibles, sino local
                    if (fbUsers.length > 0) {
                        localStorage.setItem('atm_users', JSON.stringify(fbUsers));
                    }
                    if (fbSessions.length > 0) {
                        localStorage.setItem('atm_sessions', JSON.stringify(fbSessions));
                    }
                    
                    console.log('✅ Sincronización completada');
                    return true;
                    
                } catch (error) {
                    console.error('❌ Error en sincronización:', error);
                    return false;
                }
            }
        };
        
        console.log('✅ Firebase activado exitosamente');
        return true;
        
    } catch (error) {
        console.error('❌ Error al activar Firebase:', error);
        return false;
    }
};

/**
 * Desactivar Firebase
 */
window.deactivateFirebase = function() {
    if (window.firebaseManager) {
        window.firebaseManager.initialized = false;
        window.firebaseManager = null;
        console.log('🔥 Firebase desactivado');
    }
};

// NO activar automáticamente para preservar funcionalidad original
console.log('🔥 Firebase listo (inactivo por defecto - usar activateFirebase() para activar)');