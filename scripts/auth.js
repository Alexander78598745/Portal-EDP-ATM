/**
 * Sistema de Autenticación - Portal Atlético de Madrid
 * Maneja el login, logout y gestión de sesiones de usuario
 * + Sincronización Firebase online multidispositivo
 */

class AuthManager {
    constructor() {
        this.firebaseReady = false;
        this.init();
    }

    init() {
        console.log('🚀 Iniciando AuthManager con sincronización online...');
        
        // Inicializar datos por defecto si no existen
        if (!localStorage.getItem('atm_users')) {
            this.createDefaultUsers();
        }
        
        if (!localStorage.getItem('atm_sessions')) {
            this.createDefaultSessions();
        }
        
        // Inicializar Firebase para sincronización online
        this.initFirebaseSync();
    }

    initFirebaseSync() {
        try {
            // Configuración Firebase
            const firebaseConfig = {
                apiKey: "AIzaSyDXhWYEUY5VSDrR0rAmV2w34FVGAie3Vjo",
                authDomain: "portal-edp.firebaseapp.com",
                databaseURL: "https://portal-edp-default-rtdb.europe-west1.firebasedatabase.app",
                projectId: "portal-edp",
                storageBucket: "portal-edp.firebasestorage.app",
                messagingSenderId: "896504784196",
                appId: "1:896504784196:web:ba21974d0780ae09906311"
            };

            // Inicializar Firebase
            if (typeof firebase !== 'undefined') {
                firebase.initializeApp(firebaseConfig);
                this.db = firebase.database();
                this.firebaseReady = true;
                
                console.log('✅ Firebase inicializado para sincronización online');
                
                // Sincronizar datos existentes
                this.syncFromFirebase();
                
                // Configurar listeners para cambios en tiempo real
                this.setupFirebaseListeners();
            } else {
                console.log('ℹ️ Firebase no disponible, funcionando solo localmente');
            }
        } catch (error) {
            console.log('ℹ️ Error Firebase, funcionando solo localmente:', error.message);
        }
    }

    async syncFromFirebase() {
        if (!this.firebaseReady) return;
        
        try {
            // Leer usuarios de Firebase
            const usersSnapshot = await this.db.ref('users').once('value');
            const firebaseUsers = usersSnapshot.val() || [];
            
            if (firebaseUsers.length > 0) {
                localStorage.setItem('atm_users', JSON.stringify(firebaseUsers));
                console.log('✅ Usuarios sincronizados desde Firebase (online)');
            }
            
            // Leer sesiones de Firebase
            const sessionsSnapshot = await this.db.ref('sessions').once('value');
            const firebaseSessions = sessionsSnapshot.val() || [];
            
            if (firebaseSessions.length > 0) {
                localStorage.setItem('atm_sessions', JSON.stringify(firebaseSessions));
                console.log('✅ Sesiones sincronizadas desde Firebase (online)');
            }
        } catch (error) {
            console.log('ℹ️ Error sincronizando desde Firebase:', error.message);
        }
    }

    setupFirebaseListeners() {
        if (!this.firebaseReady) return;
        
        // Listener para usuarios (para login multidispositivo)
        this.db.ref('users').on('value', (snapshot) => {
            const firebaseUsers = snapshot.val() || [];
            if (firebaseUsers.length > 0) {
                localStorage.setItem('atm_users', JSON.stringify(firebaseUsers));
                console.log('🔄 Usuarios actualizados desde otro dispositivo (online)');
            }
        });
        
        // Listener para sesiones
        this.db.ref('sessions').on('value', (snapshot) => {
            const firebaseSessions = snapshot.val() || [];
            if (firebaseSessions.length > 0) {
                localStorage.setItem('atm_sessions', JSON.stringify(firebaseSessions));
                console.log('🔄 Sesiones actualizadas desde otro dispositivo (online)');
                
                // Disparar evento para actualizar interfaz
                window.dispatchEvent(new CustomEvent('atmDataUpdated'));
            }
        });
    }

    async saveToFirebase(type, data) {
        if (!this.firebaseReady) return;
        
        try {
            await this.db.ref(type).set(data);
            console.log('✅ Datos guardados online (Firebase)');
        } catch (error) {
            console.log('ℹ️ Error guardando en Firebase:', error.message);
        }
    }

    createDefaultUsers() {
        const defaultUsers = [
            {
                id: 'admin001',
                name: 'Administrador Principal',
                category: 'JUVENIL',
                password: 'admin123',
                role: 'admin',
                email: 'admin@clubatletico.com',
                specialty: 'Administrador del Sistema',
                created: new Date().toISOString(),
                lastAccess: new Date().toISOString(),
                active: true
            },
            {
                id: 'trainer001',
                name: 'Entrenador Principal',
                category: 'CADETE',
                password: 'entrenador123',
                role: 'trainer',
                email: 'entrenador@clubatletico.com',
                specialty: 'Entrenador de Porteros Senior',
                created: new Date().toISOString(),
                lastAccess: new Date().toISOString(),
                active: true
            }
        ];
        
        localStorage.setItem('atm_users', JSON.stringify(defaultUsers));
        
        // Sincronizar usuarios por defecto con Firebase
        this.saveToFirebase('users', defaultUsers);
        
        console.log('✅ Usuarios por defecto creados y sincronizados online');
    }

    createDefaultSessions() {
        const defaultSessions = [
            {
                id: 'session_001',
                title: 'Técnica de Salidas en Centro del Campo',
                description: 'Ejercicio focalizado en mejorar las salidas rápidas del portero cuando el balón está en el centro del campo. Se trabaja la comunicación con la defensa y la anticipación al juego aéreo.',
                mainObjective: 'Mejorar la coordinación entre la salida del portero y el posicionamiento defensivo',
                secondaryObjectives: [
                    'Reflejos en situaciones de peligro',
                    'Comunicación verbal clara con la defensa',
                    'Lectura de juego anticipada'
                ],
                difficulty: 'Intermedio',
                duration: 45,
                materials: ['Conos', 'Balones', 'Petos de colores', 'Portería móvil'],
                imageData: null,
                imageUrl: null,
                creatorId: 'trainer001',
                creatorName: 'Entrenador Principal',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                active: true
            },
            {
                id: 'session_002',
                title: 'Penales: Control Mental y Técnica',
                description: 'Sesión especializada en el entrenamiento de penales desde la perspectiva psicológica y técnica. Se trabaja la concentración, lectura del lenguaje corporal del lanzador y las técnicas de lanzamiento.',
                mainObjective: 'Desarrollar la confianza y técnica en situaciones de penales',
                secondaryObjectives: [
                    'Control emocional bajo presión',
                    'Lectura del lenguaje corporal',
                    'Técnica de lanzamiento precisa'
                ],
                difficulty: 'Avanzado',
                duration: 60,
                materials: ['Balones', 'Portería', 'Conos', 'Cronómetro'],
                imageData: null,
                imageUrl: null,
                creatorId: 'trainer001',
                creatorName: 'Entrenador Principal',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                active: true
            },
            {
                id: 'session_003',
                title: 'Coordinación y Agilidad Básica',
                description: 'Sesión introductoria enfocada en desarrollar la coordinación básica del portero. Se trabajan ejercicios fundamentales de movimiento, equilibrio y reacciones rápidas.',
                mainObjective: 'Desarrollar la coordinación básica y agilidad inicial',
                secondaryObjectives: [
                    'Equilibrio y estabilidad',
                    'Reacciones rápidas',
                    'Movimientos fluidos'
                ],
                difficulty: 'Principiante',
                duration: 30,
                materials: ['Conos', 'Escaleras de agilidad', 'Balones pequeños'],
                imageData: null,
                imageUrl: null,
                creatorId: 'trainer001',
                creatorName: 'Entrenador Principal',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                active: true
            }
        ];
        
        localStorage.setItem('atm_sessions', JSON.stringify(defaultSessions));
        console.log('✅ Sesiones por defecto creadas');
    }

    authenticate(password) {
        if (!password) {
            return null;
        }

        const users = this.getUsers();
        const user = users.find(u => u.password === password && u.active);

        if (user) {
            // Actualizar último acceso de forma simple y confiable
            const updatedUser = {
                ...user,
                lastAccess: new Date().toISOString()
            };
            
            // Guardar directamente en localStorage (sin depender de updateUser)
            const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
            localStorage.setItem('atm_users', JSON.stringify(updatedUsers));
            
            // Log de acceso
            console.log(`🔐 Usuario autenticado: ${user.name} (${user.role})`);
            return {
                id: user.id,
                name: user.name,
                category: user.category,
                role: user.role,
                email: user.email,
                specialty: user.specialty,
                lastAccess: updatedUser.lastAccess
            };
        }

        console.log(`❌ Intento de acceso fallido con contraseña: ${password}`);
        return null;
    }

    isAuthenticated() {
        const user = sessionStorage.getItem('currentUser');
        return user !== null;
    }

    getCurrentUser() {
        const user = sessionStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    logout() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            console.log(`👋 Usuario desconectado: ${currentUser.name}`);
        }
        
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    getUsers() {
        const users = localStorage.getItem('atm_users');
        const parsed = users ? JSON.parse(users) : [];
        console.log('🔍 auth.getUsers() devuelve:', parsed.length, 'usuarios');
        console.log('🔍 Datos en localStorage atm_users:', users ? 'Presente' : 'Ausente');
        return parsed;
    }

    getUserById(id) {
        const users = this.getUsers();
        return users.find(u => u.id === id);
    }

    addUser(userData) {
        const users = this.getUsers();
        
        // Verificar que no exista ya un usuario con la misma contraseña
        const existingUser = users.find(u => u.password === userData.password);
        if (existingUser) {
            throw new Error('Ya existe un usuario con esta contraseña');
        }

        // Verificar que el email sea único si se proporciona
        if (userData.email) {
            const existingEmail = users.find(u => u.email === userData.email);
            if (existingEmail) {
                throw new Error('Ya existe un usuario con este email');
            }
        }

        const newUser = {
            id: this.generateId(),
            name: userData.name.trim(),
            category: userData.category.trim(),
            password: userData.password.trim(),
            role: userData.role,
            email: userData.email || '',
            specialty: userData.specialty || '',
            created: new Date().toISOString(),
            lastAccess: new Date().toISOString(),
            active: true
        };

        users.push(newUser);
        localStorage.setItem('atm_users', JSON.stringify(users));
        
        // Sincronizar usuarios con Firebase para acceso multidispositivo
        this.saveToFirebase('users', users);
        
        console.log(`✅ Usuario creado y sincronizado online: ${newUser.name} (${newUser.role})`);
        return newUser;
    }

    updateUser(updatedUser) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedUser };
            localStorage.setItem('atm_users', JSON.stringify(users));
            
            // Sincronizar usuarios con Firebase para acceso multidispositivo
            this.saveToFirebase('users', users);
            
            return true;
        }
        
        return false;
    }

    deleteUser(userId) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            const user = users[userIndex];
            users.splice(userIndex, 1);
            localStorage.setItem('atm_users', JSON.stringify(users));
            
            // Sincronizar usuarios con Firebase para acceso multidispositivo
            this.saveToFirebase('users', users);
            
            console.log(`🗑️ Usuario eliminado: ${user.name}`);
            return true;
        }
        
        return false;
    }

    getUserStats() {
        const users = this.getUsers();
        const sessions = this.getSessions();
        
        const today = new Date().toDateString();
        const todayUsers = users.filter(u => 
            new Date(u.lastAccess).toDateString() === today
        );

        return {
            total: users.length,
            active: users.filter(u => u.active).length,
            admins: users.filter(u => u.role === 'admin').length,
            trainers: users.filter(u => u.role === 'trainer').length,
            todayAccess: todayUsers.length,
            withSessions: [...new Set(sessions.map(s => s.creatorId))].length
        };
    }

    getSessions() {
        const sessions = localStorage.getItem('atm_sessions');
        return sessions ? JSON.parse(sessions) : [];
    }

    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    exportData() {
        return {
            users: this.getUsers(),
            sessions: this.getSessions(),
            exported: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    importData(data) {
        try {
            if (data.users && Array.isArray(data.users)) {
                localStorage.setItem('atm_users', JSON.stringify(data.users));
            }
            
            if (data.sessions && Array.isArray(data.sessions)) {
                localStorage.setItem('atm_sessions', JSON.stringify(data.sessions));
            }
            
            console.log('✅ Datos importados correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error al importar datos:', error);
            return false;
        }
    }

    clearAllData() {
        localStorage.removeItem('atm_users');
        localStorage.removeItem('atm_sessions');
        sessionStorage.clear();
        
        // Recrear datos por defecto
        this.createDefaultUsers();
        this.createDefaultSessions();
        
        console.log('🗑️ Todos los datos han sido limpiados y recreados');
    }
}

// Instancia global del sistema de autenticación
const auth = new AuthManager();