// User Authentication System for GreenQuest
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('greenQuestUsers')) || [];
        this.init();
    }

    init() {
        this.checkSavedUser();
        this.bindEvents();
        this.createDemoUsers();
    }

    checkSavedUser() {
        const savedUser = localStorage.getItem('currentGreenQuestUser') || 
                         sessionStorage.getItem('currentGreenQuestUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUI();
        }
    }

    bindEvents() {
        // Form submissions
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Modal navigation
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterModal();
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginModal();
        });

        // User interactions
        document.getElementById('userAvatar')?.addEventListener('click', () => {
            this.currentUser ? this.showUserMenu() : this.showLoginModal();
        });

        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Modal controls
        this.bindModalEvents();
    }

    bindModalEvents() {
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.hideAllModals());
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
    }

    login() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember')?.checked || false;

        if (!this.validateLoginForm(email, password)) return false;

        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.handleSuccessfulLogin(user, remember);
            return true;
        } else {
            this.showError('Email or password is incorrect. Please try again!');
            return false;
        }
    }

    validateLoginForm(email, password) {
        if (!email || !password) {
            this.showError('Please fill in all fields');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        return true;
    }

    register() {
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (!this.validateRegisterForm(name, email, password, confirmPassword)) return false;

        const newUser = this.createNewUser(name, email, password);
        this.users.push(newUser);
        localStorage.setItem('greenQuestUsers', JSON.stringify(this.users));

        this.handleSuccessfulRegistration(newUser);
        return true;
    }

    validateRegisterForm(name, email, password, confirmPassword) {
        if (!name || !email || !password || !confirmPassword) {
            this.showError('Please fill in all fields');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return false;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match!');
            return false;
        }

        if (this.users.find(u => u.email === email)) {
            this.showError('This email is already registered for GreenQuest!');
            return false;
        }

        return true;
    }

    createNewUser(name, email, password) {
        return {
            id: this.generateId(),
            name: name,
            email: email,
            password: password,
            avatar: this.generateAvatar(name),
            joinDate: new Date().toISOString()
        };
    }

    handleSuccessfulLogin(user, remember) {
        this.currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            joinDate: user.joinDate
        };

        this.saveLoginStatus(remember);
        this.updateUI();
        this.hideLoginModal();
        this.showWelcomeMessage();
        this.initializeUserData();
    }

    handleSuccessfulRegistration(newUser) {
        this.currentUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar,
            joinDate: newUser.joinDate
        };

        localStorage.setItem('currentGreenQuestUser', JSON.stringify(this.currentUser));
        this.updateUI();
        this.hideRegisterModal();
        this.showWelcomeMessage('register');
        this.initializeNewUserData();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentGreenQuestUser');
        sessionStorage.removeItem('currentGreenQuestUser');
        this.updateUI();
        this.hideUserMenu();
        this.resetUserData();
        this.showNotification('You have been logged out successfully.');
    }

    updateUI() {
        const elements = {
            userAvatar: document.getElementById('userAvatar'),
            welcomeTitle: document.getElementById('welcomeTitle'),
            welcomeSubtitle: document.getElementById('welcomeSubtitle'),
            menuUserAvatar: document.getElementById('menuUserAvatar'),
            menuUserName: document.getElementById('menuUserName'),
            menuUserEmail: document.getElementById('menuUserEmail')
        };

        if (this.currentUser) {
            this.updateLoggedInUI(elements);
        } else {
            this.updateLoggedOutUI(elements);
        }
    }

    updateLoggedInUI(elements) {
        const avatarText = this.currentUser.avatar?.text || this.currentUser.name.charAt(0);
        const avatarColor = this.currentUser.avatar?.color || '#3498db';

        if (elements.userAvatar) {
            elements.userAvatar.textContent = avatarText;
            elements.userAvatar.style.backgroundColor = avatarColor;
        }
        
        if (elements.menuUserAvatar) {
            elements.menuUserAvatar.textContent = avatarText;
            elements.menuUserAvatar.style.backgroundColor = avatarColor;
        }
        
        if (elements.menuUserName) elements.menuUserName.textContent = this.currentUser.name;
        if (elements.menuUserEmail) elements.menuUserEmail.textContent = this.currentUser.email;
        
        if (elements.welcomeTitle) {
            elements.welcomeTitle.textContent = `Welcome back, ${this.currentUser.name}!`;
        }
        if (elements.welcomeSubtitle) {
            elements.welcomeSubtitle.textContent = 'Continue your GreenQuest adventure and make a difference for our planet.';
        }
    }

    updateLoggedOutUI(elements) {
        if (elements.userAvatar) {
            elements.userAvatar.textContent = 'Begin Quest';
            elements.userAvatar.style.backgroundColor = '#95a5a6';
        }
        
        if (elements.menuUserAvatar) {
            elements.menuUserAvatar.textContent = '?';
            elements.menuUserAvatar.style.backgroundColor = '#95a5a6';
        }
        
        if (elements.menuUserName) elements.menuUserName.textContent = 'Adventurer';
        if (elements.menuUserEmail) elements.menuUserEmail.textContent = 'Begin your quest';
        
        if (elements.welcomeTitle) {
            elements.welcomeTitle.textContent = 'Welcome to GreenQuest!';
        }
        if (elements.welcomeSubtitle) {
            elements.welcomeSubtitle.textContent = 'Embark on your environmental learning adventure and become a champion for our planet.';
        }
    }

    // Modal Management
    showLoginModal() {
        this.hideAllModals();
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('email').focus();
    }

    showRegisterModal() {
        this.hideAllModals();
        document.getElementById('registerModal').style.display = 'flex';
        document.getElementById('regName').focus();
    }

    showUserMenu() {
        this.hideAllModals();
        document.getElementById('userMenuModal').style.display = 'flex';
    }

    hideLoginModal() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('loginForm').reset();
        this.clearErrors();
    }

    hideRegisterModal() {
        document.getElementById('registerModal').style.display = 'none';
        document.getElementById('registerForm').reset();
        this.clearErrors();
    }

    hideUserMenu() {
        document.getElementById('userMenuModal').style.display = 'none';
    }

    hideAllModals() {
        this.hideLoginModal();
        this.hideRegisterModal();
        this.hideUserMenu();
        document.getElementById('streakModal').style.display = 'none';
    }

    // Utility Methods
    generateId() {
        return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    generateAvatar(name) {
        const colors = ['#2ecc71', '#27ae60', '#3498db', '#f39c12', '#9b59b6', '#1abc9c'];
        const color = colors[name.length % colors.length];
        return { 
            text: name.charAt(0).toUpperCase(), 
            color: color 
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    saveLoginStatus(remember) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('currentGreenQuestUser', JSON.stringify(this.currentUser));
    }

    initializeUserData() {
        if (typeof initUserData === 'function') {
            initUserData();
        }
    }

    initializeNewUserData() {
        if (typeof initNewUserData === 'function') {
            initNewUserData(this.currentUser.id);
        }
    }

    resetUserData() {
        if (typeof resetUserData === 'function') {
            resetUserData();
        }
    }

    // Notification System
    showWelcomeMessage(type = 'login') {
        const messages = {
            login: `Welcome back to GreenQuest, ${this.currentUser.name}!`,
            register: `Your GreenQuest begins now, ${this.currentUser.name}! Prepare for an amazing adventure!`
        };
        this.showNotification(messages[type]);
    }

    showError(message) {
        this.clearErrors();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #e74c3c;
            color: white;
            padding: 12px 15px;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
            font-weight: 500;
        `;
        errorDiv.textContent = message;

        const activeForm = document.getElementById('loginModal').style.display !== 'none' ? 
            document.getElementById('loginForm') : document.getElementById('registerForm');
        
        if (activeForm) {
            activeForm.insertBefore(errorDiv, activeForm.firstChild);
        }
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(error => error.remove());
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        this.ensureNotificationStyles();
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    ensureNotificationStyles() {
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: white;
                    border-radius: 10px;
                    padding: 15px 20px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 10000;
                    transform: translateX(400px);
                    transition: transform 0.3s ease;
                    max-width: 350px;
                    border-left: 4px solid #2ecc71;
                }
                .notification.success { border-left-color: #2ecc71; }
                .notification.error { border-left-color: #e74c3c; }
                .notification.show { transform: translateX(0); }
                .notification i { font-size: 20px; }
                .notification.success i { color: #2ecc71; }
                .notification.error i { color: #e74c3c; }
                @media (max-width: 768px) {
                    .notification {
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Demo Users
    createDemoUsers() {
        const users = JSON.parse(localStorage.getItem('greenQuestUsers')) || [];
        if (users.length === 0) {
            const demoUsers = [
                {
                    id: 'demo_user_1',
                    name: 'Eco Explorer',
                    email: 'demo@greenquest.com',
                    password: 'demo123',
                    avatar: { text: '🌿', color: '#2ecc71' },
                    joinDate: new Date().toISOString()
                },
                {
                    id: 'demo_user_2',
                    name: 'Climate Champion',
                    email: 'test@greenquest.com',
                    password: 'test123',
                    avatar: { text: '🌍', color: '#3498db' },
                    joinDate: new Date().toISOString()
                }
            ];
            
            localStorage.setItem('greenQuestUsers', JSON.stringify(demoUsers));
            console.log('Demo users created. Use: demo@greenquest.com / demo123');
        }
    }

    // Public Methods
    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    userExists(email) {
        return this.users.find(u => u.email === email);
    }
}

// Initialize authentication system
const authSystem = new AuthSystem();

// Global functions
function showLogin() {
    authSystem.showLoginModal();
}

function isUserLoggedIn() {
    return authSystem.isLoggedIn();
}