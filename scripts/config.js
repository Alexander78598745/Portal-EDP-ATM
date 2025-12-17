/**
 * Configuración del Portal Atlético de Madrid
 * Archivo de configuración centralizada para personalización fácil
 */

const PortalConfig = {
    // Información del Club
    club: {
        name: "Atlético de Madrid",
        fullName: "Club Atlético de Madrid",
        colors: {
            primary: "#CE1126",    // Rojo Atlético
            secondary: "#202F5E",  // Azul Atlético
            accent: "#FFFFFF"      // Blanco
        },
        logo: "images/escudo_atletico.png"
    },

    // Configuración de la Aplicación
    app: {
        name: "Portal de Entrenamiento de Porteros",
        version: "1.0.0",
        description: "Portal colaborativo para entrenadores de porteros",
        language: "es",
        timezone: "Europe/Madrid"
    },

    // Configuración de Autenticación
    auth: {
        sessionTimeout: 8 * 60 * 60 * 1000, // 8 horas en milisegundos
        autoLogout: true,
        rememberSession: true,
        passwordMinLength: 6
    },

    // Configuración de Sesiones
    sessions: {
        defaultDuration: 60, // minutos
        maxDuration: 180,    // minutos
        minDuration: 15,     // minutos
        difficulties: ["Principiante", "Intermedio", "Avanzado"],
        maxImageSize: 2048,  // KB
        allowedImageTypes: ["image/jpeg", "image/png", "image/webp"]
    },

    // Configuración de Usuarios
    users: {
        maxUsers: 100, // límite teórico
        roles: {
            admin: {
                name: "Administrador",
                permissions: ["manage_users", "manage_sessions", "admin_panel", "export_data"]
            },
            trainer: {
                name: "Entrenador",
                permissions: ["create_sessions", "edit_own_sessions", "view_sessions"]
            }
        }
    },

    // Configuración de UI
    ui: {
        animations: true,
        compactMode: false,
        darkMode: false,
        defaultView: "grid", // grid, list
        itemsPerPage: 12
    },

    // Configuración de Desarrollo
    development: {
        enabled: false,
        showDebugInfo: false,
        mockData: true,
        consoleLogging: true
    },

    // Mensajes Personalizados
    messages: {
        es: {
            welcome: "Bienvenido al Portal de Entrenamiento",
            goodbye: "¡Hasta luego!",
            sessionCreated: "¡Sesión creada exitosamente!",
            sessionUpdated: "¡Sesión actualizada exitosamente!",
            sessionDeleted: "¡Sesión eliminada exitosamente!",
            userCreated: "¡Usuario creado exitosamente!",
            userUpdated: "¡Usuario actualizado exitosamente!",
            userDeleted: "¡Usuario eliminado exitosamente!",
            accessDenied: "Acceso denegado",
            errorOccurred: "Ha ocurrido un error",
            confirmDelete: "¿Estás seguro de que quieres eliminar esto?",
            fillRequired: "Por favor completa todos los campos obligatorios",
            passwordWeak: "La contraseña es demasiado débil",
            unauthorizedAction: "No tienes permisos para realizar esta acción"
        }
    },

    // URLs y Endpoints (para futuras integraciones)
    api: {
        baseUrl: "",
        endpoints: {
            users: "/api/users",
            sessions: "/api/sessions",
            upload: "/api/upload"
        }
    },

    // Configuración de Estadísticas
    stats: {
        trackUserActivity: true,
        trackSessionViews: true,
        trackCreationDates: true,
        retentionDays: 365 // días para mantener estadísticas
    },

    // Configuración de Backup
    backup: {
        autoBackup: false,
        backupInterval: 24 * 60 * 60 * 1000, // 24 horas
        maxBackups: 10,
        includeImages: true
    },

    // Funciones de utilidad
    getMessage(key, defaultMessage = "") {
        const lang = this.app.language;
        return this.messages[lang] && this.messages[lang][key] || defaultMessage || key;
    },

    getDifficultyColor(difficulty) {
        const colors = {
            "Principiante": "#28A745",
            "Intermedio": "#FFC107", 
            "Avanzado": "#DC3545"
        };
        return colors[difficulty] || "#6C757D";
    },

    getRoleName(role) {
        return this.users.roles[role] ? this.users.roles[role].name : role;
    },

    hasPermission(role, permission) {
        return this.users.roles[role] && 
               this.users.roles[role].permissions.includes(permission);
    },

    formatDate(date, format = "short") {
        const d = new Date(date);
        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
            time: { hour: '2-digit', minute: '2-digit' }
        };
        return d.toLocaleDateString('es-ES', options[format] || options.short);
    },

    validateSession(session) {
        const errors = [];
        
        if (!session.title || session.title.trim().length < 3) {
            errors.push("El título debe tener al menos 3 caracteres");
        }
        
        if (!session.description || session.description.trim().length < 10) {
            errors.push("La descripción debe tener al menos 10 caracteres");
        }
        
        if (!session.mainObjective || session.mainObjective.trim().length < 5) {
            errors.push("El objetivo principal debe tener al menos 5 caracteres");
        }
        
        if (!session.difficulty || !this.sessions.difficulties.includes(session.difficulty)) {
            errors.push("Selecciona un nivel de dificultad válido");
        }
        
        if (!session.duration || session.duration < this.sessions.minDuration || session.duration > this.sessions.maxDuration) {
            errors.push(`La duración debe estar entre ${this.sessions.minDuration} y ${this.sessions.maxDuration} minutos`);
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    validateUser(user) {
        const errors = [];
        
        if (!user.name || user.name.trim().length < 2) {
            errors.push("El nombre debe tener al menos 2 caracteres");
        }
        
        if (!user.password || user.password.length < this.auth.passwordMinLength) {
            errors.push(`La contraseña debe tener al menos ${this.auth.passwordMinLength} caracteres`);
        }
        
        if (!user.role || !this.users.roles[user.role]) {
            errors.push("Selecciona un rol válido");
        }
        
        if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            errors.push("El formato del email no es válido");
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Función para cambiar el modo de desarrollo
    toggleDevMode() {
        this.development.enabled = !this.development.enabled;
        localStorage.setItem('portal_dev_mode', this.development.enabled);
        return this.development.enabled;
    },

    // Función para aplicar configuraciones
    applySettings() {
        // Aplicar modo oscuro si está habilitado
        if (this.ui.darkMode) {
            document.body.classList.add('dark-mode');
        }
        
        // Aplicar animaciones si están deshabilitadas
        if (!this.ui.animations) {
            document.documentElement.style.setProperty('--transition-fast', '0ms');
            document.documentElement.style.setProperty('--transition-normal', '0ms');
            document.documentElement.style.setProperty('--transition-slow', '0ms');
        }
        
        // Configurar logging de desarrollo
        if (this.development.consoleLogging) {
            console.log(`🏆 ${this.app.name} v${this.app.version} inicializado`);
            console.log(`🔧 Modo desarrollo: ${this.development.enabled ? 'Activado' : 'Desactivado'}`);
        }
    },

    // Función para obtener estadísticas del portal
    getPortalStats() {
        const users = JSON.parse(localStorage.getItem('atm_users') || '[]');
        const sessions = JSON.parse(localStorage.getItem('atm_sessions') || '[]');
        
        return {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.active).length,
            totalSessions: sessions.length,
            sessionsToday: sessions.filter(s => {
                const today = new Date().toDateString();
                return new Date(s.createdAt).toDateString() === today;
            }).length,
            averageDuration: sessions.length > 0 ? 
                Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length) : 0,
            difficultyBreakdown: this.sessions.difficulties.reduce((acc, diff) => {
                acc[diff] = sessions.filter(s => s.difficulty === diff).length;
                return acc;
            }, {})
        };
    }
};

// Aplicar configuraciones al cargar
document.addEventListener('DOMContentLoaded', () => {
    PortalConfig.applySettings();
    
    // Cargar configuración guardada
    const savedDevMode = localStorage.getItem('portal_dev_mode');
    if (savedDevMode === 'true') {
        PortalConfig.development.enabled = true;
    }
});

// Exportar configuración globalmente
window.PortalConfig = PortalConfig;