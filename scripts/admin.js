/**
 * Panel de Administración - Portal Atlético de Madrid
 * Gestiona usuarios, sesiones y configuración del sistema
 */

class AdminPanel {
    constructor() {
        this.currentTab = 'users';
        this.editImageData = null; // Para manejar imagen en edición
    }

    init() {
        console.log('🔧 Iniciando panel de administración...');
        
        // Asegurar que auth esté inicializado primero
        setTimeout(() => {
            console.log('👥 Usuarios desde auth.getUsers():', auth.getUsers().length);
            console.log('📋 Sesiones desde auth.getSessions():', auth.getSessions().length);
            
            this.updateStats();
            this.renderUsers();
            this.renderSessions();
            
            console.log('🔧 Panel de administración inicializado completamente');
            console.log('👥 Usuarios cargados:', auth.getUsers().length);
            console.log('📋 Sesiones cargadas:', auth.getSessions().length);
        }, 100); // Pequeño retraso para asegurar inicialización completa
    }

    updateStats() {
        const userStats = auth.getUserStats();
        const sessions = auth.getSessions();
        
        // Usuarios
        document.getElementById('adminTotalUsers').textContent = userStats.total;
        document.getElementById('adminActiveUsers').textContent = userStats.active;
        
        // Sesiones
        document.getElementById('adminTotalSessions').textContent = sessions.length;
        
        // Sesiones de hoy
        const today = new Date().toDateString();
        const todaySessions = sessions.filter(s => 
            new Date(s.createdAt).toDateString() === today
        ).length;
        document.getElementById('adminTodaySessions').textContent = todaySessions;
    }

    renderUsers() {
        console.log('👥 Renderizando usuarios admin...');
        const usersList = document.getElementById('usersList');
        const users = auth.getUsers();
        
        console.log('👥 Usuarios encontrados para renderizar:', users.length);
        
        if (users.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <p>No hay usuarios registrados</p>
                </div>
            `;
            this.updateStats(); // Actualizar estadísticas aunque no haya usuarios
            return;
        }

        usersList.innerHTML = users.map(user => this.createUserCard(user)).join('');
        
        // Actualizar estadísticas después de renderizar
        this.updateStats();
    }

    createUserCard(user) {
        const lastAccess = new Date(user.lastAccess).toLocaleDateString('es-ES');
        const roleBadge = user.role === 'admin' ? 
            '<span class="badge badge-difficulty">Admin</span>' :
            '<span class="badge" style="background: var(--base-blue);">Entrenador</span>';

        return `
            <div class="user-card">
                <div class="user-info">
                    <div class="user-name-admin">${user.name}</div>
                    <div class="user-meta">
                        <span>📧 ${user.email || 'Sin email'}</span> • 
                        <span>🎯 ${user.specialty || 'Sin especialidad'}</span> • 
                        <span>🕒 Último acceso: ${lastAccess}</span>
                    </div>
                    <div class="user-meta">
                        ${roleBadge}
                        <span style="margin-left: 8px;">Estado: ${user.active ? '🟢 Activo' : '🔴 Inactivo'}</span>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn btn-secondary" onclick="admin.editUser('${user.id}')">
                        ✏️ Editar
                    </button>
                    ${user.id !== auth.getCurrentUser().id ? `
                        <button class="btn ${user.active ? 'btn-warning' : 'btn-primary'}" 
                                onclick="admin.toggleUserStatus('${user.id}')">
                            ${user.active ? '🔒 Desactivar' : '🔓 Activar'}
                        </button>
                        <button class="btn btn-danger" onclick="admin.confirmDeleteUser('${user.id}')">
                            🗑️ Eliminar
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderSessions() {
        console.log('📋 Renderizando sesiones admin...');
        const sessionsList = document.getElementById('sessionsAdminList');
        const sessions = auth.getSessions();
        
        console.log('📋 Sesiones encontradas para renderizar:', sessions.length);
        
        if (sessions.length === 0) {
            sessionsList.innerHTML = `
                <div class="empty-state">
                    <p>No hay sesiones registradas</p>
                </div>
            `;
            this.updateStats(); // Actualizar estadísticas aunque no haya sesiones
            return;
        }

        sessionsList.innerHTML = sessions.map(session => this.createSessionAdminCard(session)).join('');
        
        // Actualizar estadísticas después de renderizar
        this.updateStats();
    }

    createSessionAdminCard(session) {
        const creator = auth.getUserById(session.creatorId);
        const createdDate = new Date(session.createdAt).toLocaleDateString('es-ES');
        
        return `
            <div class="session-card admin-session-card" style="margin-bottom: 1rem;">
                <div class="session-content">
                    <h4 class="session-title">${session.title}</h4>
                    <div class="session-meta">
                        <span>👤 ${session.creatorName}</span> • 
                        <span>📊 ${session.difficulty}</span> • 
                        <span>⏱️ ${session.duration}min</span> • 
                        <span>📅 ${createdDate}</span>
                    </div>
                    <p class="objective-text">
                        <strong>🎯 ${session.mainObjective}</strong>
                    </p>
                    <div class="session-actions">
                        <button class="btn btn-primary" onclick="admin.viewSession('${session.id}')">
                            👁️ Ver
                        </button>
                        <button class="btn btn-secondary" onclick="admin.editSession('${session.id}')">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-danger" onclick="admin.confirmDeleteSession('${session.id}')">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    filterAdminSessions() {
        const filter = document.getElementById('adminSessionFilter').value;
        const search = document.getElementById('adminSessionSearch').value.toLowerCase().trim();
        
        let sessions = auth.getSessions();
        
        // Filtro por fecha
        if (filter === 'today') {
            const today = new Date().toDateString();
            sessions = sessions.filter(s => new Date(s.createdAt).toDateString() === today);
        } else if (filter === 'thisWeek') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            sessions = sessions.filter(s => new Date(s.createdAt) >= weekAgo);
        }
        
        // Filtro por búsqueda
        if (search) {
            sessions = sessions.filter(s => 
                s.title.toLowerCase().includes(search) ||
                s.description.toLowerCase().includes(search) ||
                s.creatorName.toLowerCase().includes(search)
            );
        }
        
        // Renderizar filtradas
        const sessionsList = document.getElementById('sessionsAdminList');
        sessionsList.innerHTML = sessions.map(session => this.createSessionAdminCard(session)).join('');
    }

    showAddUserModal() {
        document.getElementById('addUserModal').classList.add('show');
        document.getElementById('addUserForm').reset();
    }

    closeAddUserModal() {
        document.getElementById('addUserModal').classList.remove('show');
    }

    addUser(event) {
        event.preventDefault();
        
        const userData = {
            name: document.getElementById('userName').value.trim(),
            category: document.getElementById('userCategory').value,
            password: document.getElementById('userPassword').value.trim(),
            role: document.getElementById('userRole').value,
            email: document.getElementById('userEmail').value.trim(),
            specialty: document.getElementById('userSpecialty').value.trim()
        };

        // Validaciones
        if (!userData.name || !userData.category || !userData.password || !userData.role) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        if (userData.password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            const newUser = auth.addUser(userData);
            
            this.closeAddUserModal();
            this.updateStats();
            this.renderUsers();
            
            // Mostrar credenciales
            alert(`¡Usuario creado exitosamente!\n\nCredenciales de acceso:\nNombre: ${newUser.name}\nCategoría: ${newUser.category}\nContraseña: ${newUser.password}\n\n¡Guárda estas credenciales para compartir con el usuario!`);
            
        } catch (error) {
            alert(`Error al crear usuario: ${error.message}`);
        }
    }

    generatePassword() {
        const password = auth.generatePassword();
        document.getElementById('userPassword').value = password;
        
        // Mostrar feedback visual
        const button = document.querySelector('.generate-password');
        const originalText = button.textContent;
        button.textContent = '✅ Generada';
        button.style.background = 'var(--success)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = 'var(--primary-red)';
        }, 2000);
    }

    editUser(userId) {
        const user = auth.getUserById(userId);
        if (!user) return;

        // Llenar formulario de edición
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserCategory').value = user.category;
        document.getElementById('editUserPassword').value = user.password;
        document.getElementById('editUserRole').value = user.role;
        document.getElementById('editUserEmail').value = user.email || '';
        document.getElementById('editUserSpecialty').value = user.specialty || '';
        document.getElementById('editUserStatus').value = user.active.toString();
        
        // Mostrar modal
        document.getElementById('editUserModal').classList.add('show');
    }

    toggleUserStatus(userId) {
        const user = auth.getUserById(userId);
        if (!user) return;

        user.active = !user.active;
        auth.updateUser(user);
        this.renderUsers();
        this.updateStats();
        
        alert(`Usuario ${user.active ? 'activado' : 'desactivado'} exitosamente`);
    }

    confirmDeleteUser(userId) {
        const user = auth.getUserById(userId);
        if (!user) return;

        this.showConfirmModal(
            'Eliminar Usuario',
            `¿Estás seguro de que quieres eliminar el usuario "${user.name}"?\n\nEsta acción no se puede deshacer.`,
            () => {
                auth.deleteUser(userId);
                this.updateStats();
                this.renderUsers();
                this.renderSessions();
                alert('Usuario eliminado exitosamente');
            }
        );
    }

    confirmDeleteSession(sessionId) {
        const sessions = auth.getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        this.showConfirmModal(
            'Eliminar Sesión',
            `¿Estás seguro de que quieres eliminar la sesión "${session.title}"?\n\nEsta acción no se puede deshacer.`,
            () => {
                const index = sessions.findIndex(s => s.id === sessionId);
                if (index !== -1) {
                    sessions.splice(index, 1);
                    localStorage.setItem('atm_sessions', JSON.stringify(sessions));
                    
                    this.updateStats();
                    this.renderSessions();
                    alert('Sesión eliminada exitosamente');
                }
            }
        );
    }

    viewSession(sessionId) {
        console.log('👁️ Viendo sesión:', sessionId);
        
        const session = auth.getSessions().find(s => s.id === sessionId);
        if (!session) {
            alert('❌ Sesión no encontrada');
            return;
        }

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

        // Botones de acción (admin siempre puede editar/eliminar)
        const editButton = document.getElementById('editCurrentSession');
        const deleteButton = document.getElementById('deleteSessionButton');
        
        // Admin siempre puede editar y eliminar
        editButton.style.display = 'inline-block';
        editButton.onclick = () => {
            this.closeViewSessionModal();
            this.editSession(sessionId);
        };
        
        deleteButton.style.display = 'inline-block';
        deleteButton.onclick = () => {
            this.confirmDeleteSession(sessionId);
        };

        // Mostrar modal
        document.getElementById('viewSessionModal').classList.add('show');
    }
    
    editSession(sessionId) {
        console.log('✏️ Editando sesión:', sessionId);
        
        const session = auth.getSessions().find(s => s.id === sessionId);
        if (!session) {
            alert('❌ Sesión no encontrada');
            return;
        }

        // Llenar formulario de edición
        document.getElementById('editSessionId').value = session.id;
        document.getElementById('editSessionTitle').value = session.title;
        document.getElementById('editSessionDifficulty').value = session.difficulty;
        document.getElementById('editSessionDuration').value = session.duration;
        document.getElementById('editMainObjective').value = session.mainObjective;
        document.getElementById('editSecondaryObjectives').value = 
            session.secondaryObjectives ? session.secondaryObjectives.join(', ') : '';
        document.getElementById('editTaskDescription').value = session.description;
        document.getElementById('editMaterials').value = session.materials || '';
        
        // Cargar imagen si existe
        if (session.imageData) {
            this.editImageData = session.imageData;
            this.showEditImagePreview(session.imageData);
            console.log('🖼️ Imagen cargada para edición:', session.imageData ? 'Presente' : 'No presente');
        } else {
            this.editImageData = null;
            this.hideEditImagePreview();
            console.log('🖼️ No hay imagen existente para esta sesión');
        }
        
        // Mostrar modal
        document.getElementById('editSessionModal').classList.add('show');
    }
    
    saveEditedSession(event) {
        event.preventDefault();
        
        console.log('💾 Guardando sesión editada...');
        
        const sessionId = document.getElementById('editSessionId').value;
        
        const sessionData = {
            title: document.getElementById('editSessionTitle').value.trim(),
            difficulty: document.getElementById('editSessionDifficulty').value,
            duration: parseInt(document.getElementById('editSessionDuration').value),
            mainObjective: document.getElementById('editMainObjective').value.trim(),
            secondaryObjectives: this.parseSecondaryObjectives(
                document.getElementById('editSecondaryObjectives').value
            ),
            description: document.getElementById('editTaskDescription').value.trim(),
            materials: document.getElementById('editMaterials').value.trim(),
            imageData: this.editImageData // Usar imagen directamente
        };

        console.log('📋 Datos de la sesión editada:', sessionData);
        console.log('🖼️ Imagen a guardar:', this.editImageData ? 'Sí' : 'No');
        console.log('🖼️ Datos de imagen:', this.editImageData ? 'Presente' : 'No presente');

        // Validaciones
        if (!sessionData.title || sessionData.title.trim() === '') {
            alert('El título de la sesión es obligatorio');
            document.getElementById('editSessionTitle').focus();
            return;
        }
        
        if (!sessionData.difficulty || sessionData.difficulty.trim() === '') {
            alert('La dificultad es obligatoria');
            document.getElementById('editSessionDifficulty').focus();
            return;
        }
        
        if (!sessionData.duration || sessionData.duration <= 0) {
            alert('La duración debe ser un número mayor a 0');
            document.getElementById('editSessionDuration').focus();
            return;
        }
        
        if (!sessionData.mainObjective || sessionData.mainObjective.trim() === '') {
            alert('El objetivo principal es obligatorio');
            document.getElementById('editMainObjective').focus();
            return;
        }
        
        if (!sessionData.description || sessionData.description.trim() === '') {
            alert('La descripción de la tarea es obligatoria');
            document.getElementById('editTaskDescription').focus();
            return;
        }

        try {
            // Actualizar sesión
            const sessions = auth.getSessions();
            const index = sessions.findIndex(s => s.id === sessionId);
            
            if (index === -1) {
                alert('❌ Error: Sesión no encontrada');
                return;
            }

            const updatedSession = {
                ...sessions[index],
                title: sessionData.title,
                description: sessionData.description,
                mainObjective: sessionData.mainObjective,
                secondaryObjectives: sessionData.secondaryObjectives,
                difficulty: sessionData.difficulty,
                duration: sessionData.duration,
                materials: sessionData.materials,
                imageData: sessionData.imageData, // Usar la nueva imagen directamente
                updatedAt: new Date().toISOString()
            };

            sessions[index] = updatedSession;
            localStorage.setItem('atm_sessions', JSON.stringify(sessions));
            
            console.log('✅ Sesión actualizada:', updatedSession);
            console.log('🖼️ Imagen guardada en sesión:', updatedSession.imageData ? 'SÍ - Presente' : 'NO - Vacía');
            console.log('🔍 Verificación localStorage:', JSON.parse(localStorage.getItem('atm_sessions'))[index].imageData ? 'SÍ' : 'NO');

            // Cerrar modal y actualizar interfaz
            this.closeEditSessionModal();
            this.renderSessions();
            this.updateStats();
            
            alert('✅ ¡Sesión actualizada exitosamente!');
            
        } catch (error) {
            console.error('❌ Error al actualizar sesión:', error);
            alert('❌ Error al actualizar la sesión: ' + error.message);
        }
    }
    
    closeEditSessionModal() {
        document.getElementById('editSessionModal').classList.remove('show');
        this.editImageData = null;
    }
    
    showEditImagePreview(imageSrc) {
        const preview = document.getElementById('editImagePreview');
        const previewImg = document.getElementById('editPreviewImage');
        
        previewImg.src = imageSrc;
        preview.style.display = 'block';
    }
    
    hideEditImagePreview() {
        const preview = document.getElementById('editImagePreview');
        preview.style.display = 'none';
    }
    
    removeEditImage() {
        this.editImageData = null;
        this.hideEditImagePreview();
        const fileInput = document.getElementById('editImageFile');
        if (fileInput) {
            fileInput.value = '';
        }
    }
    
    parseSecondaryObjectives(text) {
        if (!text.trim()) return [];
        return text.split(',').map(obj => obj.trim()).filter(obj => obj.length > 0);
    }

    showConfirmModal(title, message, onConfirm) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmButton').onclick = () => {
            onConfirm();
            this.closeConfirmModal();
        };
        
        document.getElementById('confirmModal').classList.add('show');
    }

    showEditUserModal() {
        document.getElementById('editUserModal').classList.add('show');
    }

    closeEditUserModal() {
        document.getElementById('editUserModal').classList.remove('show');
    }

    updateUser(event) {
        event.preventDefault();
        
        const userData = {
            id: document.getElementById('editUserId').value,
            name: document.getElementById('editUserName').value.trim(),
            category: document.getElementById('editUserCategory').value,
            password: document.getElementById('editUserPassword').value.trim(),
            role: document.getElementById('editUserRole').value,
            email: document.getElementById('editUserEmail').value.trim(),
            specialty: document.getElementById('editUserSpecialty').value.trim(),
            active: document.getElementById('editUserStatus').value === 'true'
        };

        // Validaciones
        if (!userData.name || !userData.category || !userData.password || !userData.role) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        if (userData.password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            // Verificar que la contraseña no esté siendo usada por otro usuario
            const users = auth.getUsers();
            const existingPassword = users.find(u => u.password === userData.password && u.id !== userData.id);
            if (existingPassword) {
                alert('Ya existe un usuario con esta contraseña');
                return;
            }

            auth.updateUser(userData);
            this.closeEditUserModal();
            this.updateStats();
            this.renderUsers();
            
            alert('Usuario actualizado exitosamente');
            
        } catch (error) {
            alert(`Error al actualizar usuario: ${error.message}`);
        }
    }

    generateEditPassword() {
        const password = auth.generatePassword();
        document.getElementById('editUserPassword').value = password;
        
        // Mostrar feedback visual
        const button = document.querySelector('#editUserModal .generate-password');
        const originalText = button.textContent;
        button.textContent = '✅ Generada';
        button.style.background = 'var(--success)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = 'var(--primary-red)';
        }, 2000);
    }

    closeConfirmModal() {
        document.getElementById('confirmModal').classList.remove('show');
    }

    toggleDevMode() {
        const devMode = document.getElementById('devModeToggle').checked;
        localStorage.setItem('developmentMode', devMode);
        
        if (devMode) {
            alert('Modo de desarrollo activado. Reinicia la página de login para ver las credenciales de prueba.');
        } else {
            alert('Modo de desarrollo desactivado.');
        }
    }

    exportData() {
        const data = auth.exportData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `atm_portal_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        alert('Datos exportados exitosamente');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!confirm('¿Estás seguro de que quieres importar estos datos?\n\nEsto reemplazará todos los datos actuales.')) {
                        return;
                    }

                    auth.importData(data);
                    this.updateStats();
                    this.renderUsers();
                    this.renderSessions();
                    
                    alert('Datos importados exitosamente. Recarga la página para ver todos los cambios.');
                    
                } catch (error) {
                    alert('Error al importar datos: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    clearAllData() {
        this.showConfirmModal(
            'Limpiar Todos los Datos',
            '¿Estás seguro de que quieres eliminar TODOS los datos del sistema?\n\nEsto incluye:\n- Todos los usuarios (excepto admin por defecto)\n- Todas las sesiones de entrenamiento\n- Toda la configuración personalizada\n\nEsta acción NO se puede deshacer.',
            () => {
                if (confirm('última confirmación: ¿Realmente quieres continuar?')) {
                    auth.clearAllData();
                    this.updateStats();
                    this.renderUsers();
                    this.renderSessions();
                    alert('Todos los datos han sido limpiados y restaurados a valores por defecto.');
                }
            }
        );
    }

    closeViewSessionModal() {
        document.getElementById('viewSessionModal').classList.remove('show');
    }

    expandImage(imageSrc) {
        console.log('🖼️ Admin expandImage llamado con:', imageSrc);
        
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
            console.log('🔒 Cerrando modal de imagen expandida en admin...');
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
function showTab(tabName) {
    // Ocultar todas las tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Mostrar tab seleccionada
    document.getElementById(tabName + 'Tab').classList.add('active');
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    
    admin.currentTab = tabName;
    
    // Actualizar estadísticas en cada cambio de tab
    admin.updateStats();
    
    // Actualizar contenido específico de cada tab
    if (tabName === 'users') {
        admin.renderUsers();
    } else if (tabName === 'sessions') {
        admin.renderSessions();
    }
}

function showAddUserModal() {
    admin.showAddUserModal();
}

function closeAddUserModal() {
    admin.closeAddUserModal();
}

function addUser(event) {
    admin.addUser(event);
}

function generatePassword() {
    admin.generatePassword();
}

function toggleDevMode() {
    admin.toggleDevMode();
}

function exportData() {
    admin.exportData();
}

function importData() {
    admin.importData();
}

function clearAllData() {
    admin.clearAllData();
}

function filterAdminSessions() {
    admin.filterAdminSessions();
}

function closeConfirmModal() {
    admin.closeConfirmModal();
}

function showEditUserModal() {
    admin.showEditUserModal();
}

function closeEditUserModal() {
    admin.closeEditUserModal();
}

function updateUser(event) {
    admin.updateUser(event);
}

function generateEditPassword() {
    admin.generateEditPassword();
}

function saveEditedSession(event) {
    admin.saveEditedSession(event);
}

function closeEditSessionModal() {
    admin.closeEditSessionModal();
}

function removeEditImage() {
    admin.removeEditImage();
}

// Inicializar panel de administración
const admin = new AdminPanel();