/**
 * Aplicación Principal - Portal Atlético de Madrid
 * Maneja el dashboard, gestión de sesiones y funcionalidades principales
 */

class TrainingPortalApp {
    constructor() {
        this.currentUser = null;
        this.sessions = [];
        this.filteredSessions = [];
        this.currentEditingSession = null;
    }

    // Sincronización automática con Firebase
    syncToFirebase() {
        try {
            if (auth.saveToFirebase) {
                const sessions = auth.getSessions();
                auth.saveToFirebase('sessions', sessions);
            }
        } catch (error) {
            console.log('ℹ️ Error sincronizando con Firebase:', error.message);
        }
    }

    setupFirebaseListener() {
        // Escuchar actualizaciones desde otros dispositivos
        window.addEventListener('atmDataUpdated', () => {
            console.log('🔄 Actualizando desde otro dispositivo...');
            this.sessions = auth.getSessions();
            this.filteredSessions = [...this.sessions];
            this.renderSessions();
            this.updateStats();
        });
    }

    init() {
        console.log('🚀 Iniciando aplicación...');
        
        // Verificar autenticación
        if (!auth.isAuthenticated()) {
            console.log('❌ Usuario no autenticado, redirigiendo...');
            window.location.href = 'login.html';
            return;
        }

        // Obtener usuario actual
        this.currentUser = auth.getCurrentUser();
        console.log('👤 Usuario actual:', this.currentUser);
        
        // Cargar datos
        this.loadSessions();
        
        // Inicializar interfaz
        this.initializeUI();
        
        // Actualizar estadísticas
        this.updateStats();
        
        // Renderizar sesiones
        this.renderSessions();
        
        // Configurar listener para sincronización online
        this.setupFirebaseListener();
        
        console.log(`✅ Aplicación inicializada para: ${this.currentUser.name}`);
    }

    initializeUI() {
        // Mostrar información del usuario
        document.getElementById('userDisplayName').textContent = this.currentUser.name;
        
        // Mostrar/ocultar panel de admin
        if (this.currentUser.role === 'admin') {
            document.querySelector('[onclick="showAdmin()"]').style.display = 'block';
        } else {
            document.querySelector('[onclick="showAdmin()"]').style.display = 'none';
        }
    }

    loadSessions() {
        this.sessions = auth.getSessions();
        this.filteredSessions = [...this.sessions];
        console.log('📊 Sesiones cargadas:', this.sessions.length);
        console.log('📋 Lista de sesiones:', this.sessions.map(s => `${s.title} (ID: ${s.id})`));
    }

    renderSessions() {
        const grid = document.getElementById('sessionsGrid');
        
        console.log('🔄 Renderizando sesiones:', this.filteredSessions.length);
        console.log('📋 Sesiones a mostrar:', this.filteredSessions.map(s => s.title));
        
        if (!grid) {
            console.error('❌ No se encontró el elemento sessionsGrid');
            return;
        }
        
        if (this.filteredSessions.length === 0) {
            console.log('📭 No hay sesiones, mostrando mensaje vacío');
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <h3>📋 No hay sesiones disponibles</h3>
                    <p>¡Sé el primero en crear una sesión de entrenamiento!</p>
                    <button class="btn btn-primary" onclick="showCreateSession()">
                        <span class="btn-icon">+</span>
                        Crear Primera Sesión
                    </button>
                </div>
            `;
            return;
        }

        try {
            const sessionCards = this.filteredSessions.map(session => this.createSessionCard(session)).join('');
            grid.innerHTML = sessionCards;
            console.log('✅ Sesiones renderizadas en el DOM');
            console.log('🖼️ Se renderizaron', this.filteredSessions.length, 'sesiones');
            console.log('📋 Sesiones en el DOM:', this.filteredSessions.map(s => s.title));
        } catch (error) {
            console.error('❌ Error al renderizar sesiones:', error);
        }
    }

    createSessionCard(session) {
        const isOwner = session.creatorId === this.currentUser.id;
        const formattedDate = new Date(session.createdAt).toLocaleDateString('es-ES');
        
        // Determinar la URL de la imagen: usar imagen local si existe, sino usar imagen por defecto
        const imageSrc = session.imageData || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNER0RER0Q7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjpDQTBDMEM7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iSW50ZXIiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2Qzc1N0QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5CsIMKpcmE8L3RleHQ+PC9zdmc+';
        
        return `
            <div class="session-card" onclick="app.viewSession('${session.id}')">
                <div class="session-image-container">
                    <img src="${imageSrc}" 
                         alt="${session.title}" class="session-image"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNER0RER0Q7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjpDQTBDMEM7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iSW50ZXIiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2Qzc1N0QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5CsIMKpcmE8L3RleHQ+PC9zdmc+'">
                    <div class="session-badges">
                        <span class="badge badge-difficulty">${session.difficulty}</span>
                        <span class="badge badge-duration">${session.duration}min</span>
                    </div>
                </div>
                <div class="session-content">
                    <h3 class="session-title">${session.title}</h3>
                    <div class="session-meta">
                        <span class="meta-item">👤 ${session.creatorName}</span>
                        <span class="meta-item">📅 ${formattedDate}</span>
                    </div>
                    <div class="objectives-section">
                        <p class="objective-text"><strong>🎯 ${session.mainObjective}</strong></p>
                        ${session.secondaryObjectives && session.secondaryObjectives.length > 0 ? 
                            `<ul class="objectives-list">
                                ${session.secondaryObjectives.slice(0, 2).map(obj => 
                                    `<li>${obj}</li>`
                                ).join('')}
                            </ul>` : ''
                        }
                    </div>
                    
                    ${isOwner || this.currentUser.role === 'admin' ? `
                    <div class="session-card-actions" onclick="event.stopPropagation();">
                        <button class="btn btn-secondary btn-sm" onclick="app.editSession('${session.id}')">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="app.deleteSession('${session.id}')">
                            🗑️ Eliminar
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    updateStats() {
        const users = auth.getUsers();
        const totalSessions = auth.getSessions().length;
        const mySessions = auth.getSessions().filter(s => s.creatorId === this.currentUser.id).length;
        
        document.getElementById('totalSessions').textContent = totalSessions;
        document.getElementById('totalUsers').textContent = users.filter(u => u.active).length;
        document.getElementById('mySessions').textContent = mySessions;
    }

    filterSessions() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const difficultyFilter = document.getElementById('difficultyFilter').value;
        
        this.filteredSessions = this.sessions.filter(session => {
            const matchesSearch = !searchTerm || 
                session.title.toLowerCase().includes(searchTerm) ||
                session.description.toLowerCase().includes(searchTerm) ||
                session.mainObjective.toLowerCase().includes(searchTerm);
            
            const matchesDifficulty = !difficultyFilter || session.difficulty === difficultyFilter;
            
            return matchesSearch && matchesDifficulty;
        });
        
        this.renderSessions();
    }

    viewSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Llenar datos de la sesión
        document.getElementById('viewSessionTitle').textContent = session.title;
        document.getElementById('viewSessionImage').src = session.imageData || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNER0RER0Q7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjpDQTBDMEM7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iSW50ZXIiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2Qzc1N0QiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7wn5CsIMKpcmE8L3RleHQ+PC9zdmc+';
        document.getElementById('viewSessionDifficulty').textContent = session.difficulty;
        document.getElementById('viewSessionDuration').textContent = `${session.duration} min`;
        document.getElementById('viewSessionCreator').textContent = session.creatorName;
        document.getElementById('viewSessionDate').textContent = new Date(session.createdAt).toLocaleDateString('es-ES');
        document.getElementById('viewMainObjective').textContent = session.mainObjective;
        document.getElementById('viewTaskDescription').textContent = session.description;

        // Objetivos secundarios
        if (session.secondaryObjectives && session.secondaryObjectives.length > 0) {
            document.getElementById('viewSecondaryObjectives').style.display = 'block';
            document.getElementById('viewSecondaryList').innerHTML = 
                session.secondaryObjectives.map(obj => `<li>${obj}</li>`).join('');
        } else {
            document.getElementById('viewSecondaryObjectives').style.display = 'none';
        }

        // Materiales
        if (session.materials) {
            document.getElementById('viewMaterials').style.display = 'block';
            document.getElementById('viewMaterialsText').textContent = session.materials;
        } else {
            document.getElementById('viewMaterials').style.display = 'none';
        }

        // Botones de acción
        const isOwner = session.creatorId === this.currentUser.id;
        const editButton = document.getElementById('editCurrentSession');
        const deleteButton = document.getElementById('deleteSessionButton');
        
        if (isOwner) {
            editButton.style.display = 'inline-block';
            editButton.onclick = () => {
                this.closeViewSessionModal();
                this.editSession(sessionId);
            };
            deleteButton.style.display = 'inline-block';
            deleteButton.onclick = () => this.deleteSession(sessionId);
        } else {
            // Ocultar botones si no es propietario
            editButton.style.display = 'none';
            deleteButton.style.display = 'none';
        }

        // Mostrar modal
        document.getElementById('viewSessionModal').classList.add('show');
    }

    showCreateSession() {
        this.currentEditingSession = null;
        document.getElementById('modalTitle').textContent = 'Crear Nueva Sesión';
        document.getElementById('saveButtonText').textContent = 'Crear Sesión';
        
        // Limpiar formulario
        document.getElementById('sessionForm').reset();
        
        // Mostrar modal
        document.getElementById('sessionModal').classList.add('show');
    }

    editSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Verificar permisos
        if (session.creatorId !== this.currentUser.id && this.currentUser.role !== 'admin') {
            alert('Solo puedes editar tus propias sesiones');
            return;
        }

        this.currentEditingSession = session;
        document.getElementById('modalTitle').textContent = 'Editar Sesión';
        document.getElementById('saveButtonText').textContent = 'Actualizar Sesión';
        
        // Llenar formulario
        document.getElementById('sessionTitle').value = session.title;
        document.getElementById('sessionDifficulty').value = session.difficulty;
        document.getElementById('sessionDuration').value = session.duration;
        document.getElementById('mainObjective').value = session.mainObjective;
        document.getElementById('secondaryObjectives').value = 
            session.secondaryObjectives ? session.secondaryObjectives.join(', ') : '';
        document.getElementById('taskDescription').value = session.description;
        document.getElementById('materials').value = session.materials || '';
        
        // Cargar imagen si existe
        if (session.imageData) {
            currentImageData = session.imageData;
            showImagePreview(session.imageData);
        } else {
            currentImageData = null;
            document.getElementById('imagePreview').style.display = 'none';
            document.getElementById('imageFile').value = '';
        }
        
        // Cerrar modal de vista y abrir de edición
        document.getElementById('viewSessionModal').classList.remove('show');
        document.getElementById('sessionModal').classList.add('show');
    }

    saveSession(event) {
        event.preventDefault();
        
        console.log('💾 Iniciando guardado de sesión...');
        
        const sessionData = {
            title: document.getElementById('sessionTitle').value,
            difficulty: document.getElementById('sessionDifficulty').value,
            duration: parseInt(document.getElementById('sessionDuration').value),
            mainObjective: document.getElementById('mainObjective').value,
            secondaryObjectives: this.parseSecondaryObjectives(
                document.getElementById('secondaryObjectives').value
            ),
            description: document.getElementById('taskDescription').value,
            materials: document.getElementById('materials').value,
            imageData: getCurrentImage() !== null ? getCurrentImage() : null // Obtener imagen local
        };

        console.log('📋 Datos de la sesión:', sessionData);
        console.log('🖼️ getCurrentImage():', getCurrentImage() ? 'Imagen presente' : 'Sin imagen');
        console.log('🔍 Valor actual de currentImageData:', typeof getCurrentImage());

        // Validaciones mejoradas
        if (!sessionData.title || sessionData.title.trim() === '') {
            alert('El título de la sesión es obligatorio');
            document.getElementById('sessionTitle').focus();
            return;
        }
        
        if (!sessionData.difficulty || sessionData.difficulty.trim() === '') {
            alert('La dificultad es obligatoria');
            document.getElementById('sessionDifficulty').focus();
            return;
        }
        
        if (!sessionData.duration || sessionData.duration <= 0) {
            alert('La duración debe ser un número mayor a 0');
            document.getElementById('sessionDuration').focus();
            return;
        }
        
        if (!sessionData.mainObjective || sessionData.mainObjective.trim() === '') {
            alert('El objetivo principal es obligatorio');
            document.getElementById('mainObjective').focus();
            return;
        }
        
        if (!sessionData.description || sessionData.description.trim() === '') {
            alert('La descripción de la tarea es obligatoria');
            document.getElementById('taskDescription').focus();
            return;
        }

        console.log('✅ Todas las validaciones pasaron');
        console.log('📋 Datos finales a guardar:', sessionData);
        console.log('📷 Imagen a guardar:', sessionData.imageData ? '✅ Imagen presente' : '❌ Sin imagen');

        console.log('🔍 Estado de currentEditingSession:', this.currentEditingSession ? `Editando sesión: ${this.currentEditingSession.id}` : 'Creando nueva sesión');
        
        if (this.currentEditingSession) {
            this.updateExistingSession(sessionData);
        } else {
            this.createNewSession(sessionData);
        }
    }

    parseSecondaryObjectives(text) {
        if (!text.trim()) return [];
        return text.split(',').map(obj => obj.trim()).filter(obj => obj.length > 0);
    }

    createNewSession(sessionData) {
        console.log('🚀 Creando nueva sesión...');
        console.log('🔍 Estado currentEditingSession:', this.currentEditingSession);
        
        const sessions = auth.getSessions();
        console.log('📋 Sesiones actuales:', sessions.length);
        
        const newSession = {
            id: this.generateSessionId(),
            title: sessionData.title.trim(),
            description: sessionData.description.trim(),
            mainObjective: sessionData.mainObjective.trim(),
            secondaryObjectives: sessionData.secondaryObjectives || [],
            difficulty: sessionData.difficulty,
            duration: sessionData.duration,
            materials: sessionData.materials ? sessionData.materials.trim() : '',
            imageData: sessionData.imageData !== null ? sessionData.imageData : null, // Imagen local con null check estricto
            imageUrl: null, // No usar URL externa
            creatorId: this.currentUser.id,
            creatorName: this.currentUser.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            active: true
        };

        console.log('🆕 Nueva sesión creada:', newSession);
        console.log('🖼️ Imagen a guardar:', newSession.imageData ? 'Sí' : 'No');

        try {
            // Agregar nueva sesión
            sessions.push(newSession);
            
            // Guardar en localStorage
            localStorage.setItem('atm_sessions', JSON.stringify(sessions));
            console.log('✅ Sesión guardada en localStorage');
            console.log('📋 Total de sesiones:', sessions.length);
            console.log('📋 Todas las sesiones:', sessions.map(s => s.title));
            console.log('🔍 Verificando localStorage directamente:', JSON.parse(localStorage.getItem('atm_sessions')).length);

            // Actualizar arrays locales inmediatamente
            this.sessions = [...sessions];
            this.filteredSessions = [...sessions];
            
            console.log('🔄 Sesiones locales actualizadas:', this.sessions.length);
            
            // Sincronizar online automáticamente
            this.syncToFirebase();
            
            // Renderizar inmediatamente
            this.renderSessions();
            console.log('🖥️ Sesiones renderizadas');
            
            // Actualizar estadísticas
            this.updateStats();
            console.log('📊 Estadísticas actualizadas');
            
            // Cerrar modal
            this.closeSessionModal();
            console.log('🔒 Modal cerrado');
            
            // Mostrar mensaje de éxito
            this.showNotification('✅ ¡Sesión creada exitosamente! Ya aparece en el panel principal.', 'success');
            
            console.log(`✅ ¡Proceso completado! Nueva sesión: ${newSession.title}`);
        } catch (error) {
            console.error('❌ Error al crear sesión:', error);
            this.showNotification('❌ Error al crear la sesión: ' + error.message, 'error');
        }
    }

    updateExistingSession(sessionData) {
        console.log('🔄 Actualizando sesión existente...');
        
        const sessions = auth.getSessions();
        const index = sessions.findIndex(s => s.id === this.currentEditingSession.id);
        
        if (index === -1) {
            console.error('❌ Sesión no encontrada para actualizar');
            this.showNotification('❌ Error: Sesión no encontrada', 'error');
            return;
        }

        const updatedSession = {
            ...sessions[index],
            title: sessionData.title.trim(),
            description: sessionData.description.trim(),
            mainObjective: sessionData.mainObjective.trim(),
            secondaryObjectives: sessionData.secondaryObjectives,
            difficulty: sessionData.difficulty,
            duration: sessionData.duration,
            materials: sessionData.materials.trim(),
            imageData: sessionData.imageData !== null ? sessionData.imageData : sessions[index].imageData, // Mantener imagen actual si no hay nueva
            updatedAt: new Date().toISOString()
        };

        console.log('📋 Sesión actualizada:', updatedSession);
        console.log('🖼️ Imagen en sesión actualizada:', updatedSession.imageData ? 'Presente' : 'No presente');

        try {
            // Actualizar en localStorage
            sessions[index] = updatedSession;
            localStorage.setItem('atm_sessions', JSON.stringify(sessions));
            
            // Sincronizar online automáticamente
            this.syncToFirebase();
            
            // Actualizar arrays locales
            this.sessions = [...sessions];
            this.filteredSessions = [...sessions];
            
            // Actualizar interfaz
            this.renderSessions();
            this.updateStats();
            
            // Cerrar modal
            this.closeSessionModal();
            
            // Mostrar mensaje de éxito
            this.showNotification('✅ ¡Sesión actualizada exitosamente!', 'success');
            
            console.log(`✅ Sesión actualizada: ${updatedSession.title}`);
        } catch (error) {
            console.error('❌ Error al actualizar sesión:', error);
            this.showNotification('❌ Error al actualizar la sesión: ' + error.message, 'error');
        }
    }

    deleteSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) {
            this.showNotification('❌ Sesión no encontrada', 'error');
            return;
        }

        // Verificar permisos
        if (session.creatorId !== this.currentUser.id && this.currentUser.role !== 'admin') {
            this.showNotification('❌ Solo puedes eliminar tus propias sesiones', 'error');
            return;
        }

        // Mostrar confirmación personalizada
        const confirmation = confirm(
            `⚠️ CONFIRMACIÓN DE ELIMINACIÓN\n\n` +
            `¿Estás seguro de que quieres eliminar la sesión?\n\n` +
            `📋 Título: ${session.title}\n` +
            `👤 Creador: ${session.creatorName}\n` +
            `📅 Fecha: ${new Date(session.createdAt).toLocaleDateString('es-ES')}\n\n` +
            `⚠️ Esta acción no se puede deshacer.`
        );

        if (!confirmation) {
            return;
        }

        console.log(`🗑️ Eliminando sesión: ${session.title}`);

        try {
            const sessions = auth.getSessions();
            const index = sessions.findIndex(s => s.id === sessionId);
            
            if (index !== -1) {
                // Eliminar sesión
                sessions.splice(index, 1);
                localStorage.setItem('atm_sessions', JSON.stringify(sessions));
                
                console.log('✅ Sesión eliminada de localStorage');

                // Sincronizar online automáticamente
                this.syncToFirebase();

                // Actualizar interfaz inmediatamente
                this.sessions = [...sessions]; // Actualizar array local
                this.filteredSessions = [...sessions]; // Actualizar filtro
                
                this.renderSessions();
                this.updateStats();
                
                // Cerrar modal si está abierto
                const viewModal = document.getElementById('viewSessionModal');
                if (viewModal && viewModal.classList.contains('show')) {
                    this.closeViewSessionModal();
                }
                
                // Mostrar mensaje de éxito
                this.showNotification('✅ ¡Sesión eliminada exitosamente!', 'success');
                
                console.log(`✅ Sesión eliminada: ${session.title}`);
            } else {
                throw new Error('Sesión no encontrada en localStorage');
            }
        } catch (error) {
            console.error('❌ Error al eliminar sesión:', error);
            this.showNotification('❌ Error al eliminar la sesión. Inténtalo de nuevo.', 'error');
        }
    }

    closeSessionModal() {
        const modal = document.getElementById('sessionModal');
        if (modal) {
            modal.classList.remove('show');
        }
        
        this.currentEditingSession = null;
        
        // Reset form
        const form = document.getElementById('sessionForm');
        if (form) {
            form.reset();
        }
        
        // Limpiar imagen
        if (typeof currentImageData !== 'undefined') {
            currentImageData = null;
        }
        
        const preview = document.getElementById('imagePreview');
        if (preview) {
            preview.style.display = 'none';
        }
        
        const fileInput = document.getElementById('imageFile');
        if (fileInput) {
            fileInput.value = '';
        }
        
        console.log('🔒 Modal cerrado y formulario limpiado');
    }

    closeViewSessionModal() {
        document.getElementById('viewSessionModal').classList.remove('show');
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Añadir estilos si no existen
        if (!document.getElementById('notificationStyles')) {
            const styles = document.createElement('style');
            styles.id = 'notificationStyles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    min-width: 300px;
                    animation: slideInRight 0.3s ease-out;
                }
                
                .notification-success { border-left: 4px solid #28A745; }
                .notification-error { border-left: 4px solid #DC3545; }
                .notification-info { border-left: 4px solid #17A2B8; }
                
                .notification-content {
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .notification-message {
                    flex: 1;
                    font-size: 14px;
                    color: #333;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    margin-left: 8px;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    expandImage(imageSrc) {
        console.log('🖼️ Método expandImage llamado con:', imageSrc);
        
        if (!imageSrc) {
            console.log('⚠️ No hay imagen para expandir');
            return;
        }
        
        console.log('✅ Creando modal de imagen expandida...');
        
        const modal = document.createElement('div');
        modal.className = 'image-expanded';
        modal.innerHTML = `
            <img src="${imageSrc}" alt="Imagen expandida" style="cursor: default; max-width: 90vw; max-height: 90vh; object-fit: contain;">
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(0,0,0,0.7);
                color: white;
                border: none;
                padding: 10px;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            ">×</button>
        `;
        
        // Función para cerrar el modal
        const closeModal = () => {
            console.log('🔒 Cerrando modal de imagen expandida...');
            modal.remove();
            document.body.style.overflow = 'auto';
        };
        
        modal.onclick = (e) => {
            console.log('🖼️ Click en modal, cerrando...');
            if (e.target === modal) {
                closeModal();
            }
        };
        
        // Agregar botón de cerrar y evento de teclado
        const closeBtn = modal.querySelector('button');
        closeBtn.onclick = closeModal;
        
        // Agregar evento ESC para cerrar
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Crear y agregar modal al DOM
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Modal de imagen creado y añadido al DOM');
    }
}

// Funciones globales para el HTML
function showCreateSession() {
    app.showCreateSession();
}

function closeSessionModal() {
    app.closeSessionModal();
}

function closeViewSessionModal() {
    app.closeViewSessionModal();
}

function editCurrentSession() {
    // Esta función será establecida dinámicamente cuando se vea una sesión
}

function deleteCurrentSession() {
    // Esta función será establecida dinámicamente cuando se vea una sesión
}

function filterSessions() {
    app.filterSessions();
}

function showAdmin() {
    window.location.href = 'admin.html';
}

function logout() {
    auth.logout();
}

// Inicializar aplicación
const app = new TrainingPortalApp();

// Función global para el HTML (necesaria para onsubmit)
function saveSession(event) {
    event.preventDefault();
    app.saveSession(event);
}

// Función global para cerrar modal de vista de sesión
function closeViewSessionModal() {
    const modal = document.getElementById('viewSessionModal');
    if (modal) {
        modal.classList.remove('show');
    }
}