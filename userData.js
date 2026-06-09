// User Data Management System for GreenQuest
class UserDataManager {
    constructor() {
        this.userData = {};
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
    }

    loadUserData() {
        const currentUser = authSystem.getCurrentUser();
        if (!currentUser) return;

        const allUserData = JSON.parse(localStorage.getItem('greenQuestUserData')) || {};
        this.userData = allUserData[currentUser.id] || this.getDefaultUserData();
        this.updateUI();
    }

    saveUserData() {
        const currentUser = authSystem.getCurrentUser();
        if (!currentUser) return;

        const allUserData = JSON.parse(localStorage.getItem('greenQuestUserData')) || {};
        allUserData[currentUser.id] = this.userData;
        localStorage.setItem('greenQuestUserData', JSON.stringify(allUserData));
    }

    getDefaultUserData() {
        return {
            streak: 0,
            lastActiveDate: null,
            progress: {
                total: 25,
                completed: 0,
                percentage: 0
            },
            modules: {
                ecology: { completed: 0, total: 5, percentage: 0 },
                climateJustice: { completed: 0, total: 5, percentage: 0 },
                sustainableLiving: { completed: 0, total: 5, percentage: 0 },
                wasteManagement: { completed: 0, total: 5, percentage: 0 },
                fairTrade: { completed: 0, total: 5, percentage: 0 }
            },
            badges: [],
            challenges: {
                completed: [],
                current: null
            },
            stats: {
                learningTime: 0,
                quizzesTaken: 0,
                quizScore: 0,
                communityPosts: 0,
                treesPlanted: 0,
                co2Reduced: 0
            }
        };
    }

    bindEvents() {
        document.getElementById('startChallengeBtn')?.addEventListener('click', () => {
            if (!authSystem.isLoggedIn()) return;
            
            const challengeId = 'quest_' + new Date().toDateString();
            this.completeChallenge(challengeId);
        });
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastActive = this.userData.lastActiveDate;
        
        if (!lastActive) {
            this.userData.streak = 1;
        } else {
            const lastActiveDate = new Date(lastActive);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastActiveDate.toDateString() === yesterday.toDateString()) {
                this.userData.streak += 1;
            } else if (lastActiveDate.toDateString() !== today) {
                this.userData.streak = 1;
            }
        }
        
        this.userData.lastActiveDate = today;
        this.saveUserData();
        this.updateUI();
        
        return this.userData.streak;
    }

    completeChallenge(challengeId) {
        if (!this.userData.challenges.completed.includes(challengeId)) {
            this.userData.challenges.completed.push(challengeId);
            const newStreak = this.updateStreak();
            this.checkBadgeUnlocks();
            this.saveUserData();
            this.updateUI();
            return newStreak;
        }
        return this.userData.streak;
    }

    updateModuleProgress(moduleId, completed, total) {
        if (this.userData.modules[moduleId]) {
            this.userData.modules[moduleId].completed = completed;
            this.userData.modules[moduleId].total = total;
            this.userData.modules[moduleId].percentage = Math.round((completed / total) * 100);
            this.updateTotalProgress();
            this.saveUserData();
            this.updateUI();
        }
    }

    updateTotalProgress() {
        let totalCompleted = 0;
        let totalModules = 0;
        
        Object.values(this.userData.modules).forEach(module => {
            totalCompleted += module.completed;
            totalModules += module.total;
        });
        
        this.userData.progress.completed = totalCompleted;
        this.userData.progress.total = totalModules;
        this.userData.progress.percentage = Math.round((totalCompleted / totalModules) * 100);
    }

    checkBadgeUnlocks() {
        const badgesToCheck = [
            { id: 'first_streak', condition: () => this.userData.streak >= 3, name: 'Quest Beginner', icon: '🔥' },
            { id: 'weekly_streak', condition: () => this.userData.streak >= 7, name: 'Weekly Adventurer', icon: '⭐' },
            { id: 'first_challenge', condition: () => this.userData.challenges.completed.length >= 1, name: 'First Quest', icon: '⚡' },
            { id: 'quiz_master', condition: () => this.userData.stats.quizzesTaken >= 5, name: 'Quiz Champion', icon: '📝' },
            { id: 'eco_learner', condition: () => this.userData.progress.percentage >= 25, name: 'Green Learner', icon: '🌱' },
            { id: 'eco_expert', condition: () => this.userData.progress.percentage >= 50, name: 'Eco Expert', icon: '🌍' },
            { id: 'community_contributor', condition: () => this.userData.stats.communityPosts >= 10, name: 'Community Hero', icon: '👥' },
            { id: 'ecology_expert', condition: () => this.userData.modules.ecology.percentage >= 100, name: 'Ecology Master', icon: '🌿' },
            { id: 'climate_advocate', condition: () => this.userData.modules.climateJustice.percentage >= 100, name: 'Climate Champion', icon: '⚖️' },
            { id: 'sustainability_champion', condition: () => this.userData.modules.sustainableLiving.percentage >= 100, name: 'Sustainability Guardian', icon: '🌞' },
            { id: 'waste_warrior', condition: () => this.userData.modules.wasteManagement.percentage >= 100, name: 'Waste Warrior', icon: '♻️' },
            { id: 'fair_trade_advocate', condition: () => this.userData.modules.fairTrade.percentage >= 100, name: 'Fair Trade Advocate', icon: '🤝' }
        ];
        
        badgesToCheck.forEach(badge => {
            if (badge.condition() && !this.userData.badges.find(b => b.id === badge.id)) {
                this.userData.badges.push({
                    id: badge.id,
                    name: badge.name,
                    icon: badge.icon,
                    unlockedAt: new Date().toISOString()
                });
                this.showBadgeUnlockNotification(badge.name, badge.icon);
            }
        });
    }

    showBadgeUnlockNotification(name, icon) {
        const notification = document.createElement('div');
        notification.className = 'notification badge-unlock';
        notification.innerHTML = `
            <div class="badge-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">Quest Badge Earned!</div>
                <div class="notification-message">Congratulations! You unlocked the "${name}" badge</div>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    updateUI() {
        this.updateStreakDisplay();
        this.updateProgressDisplay();
        this.updateBadgesDisplay();
        this.updateModuleProgressDisplay();
        this.updateStreakModal();
    }

    updateStreakDisplay() {
        const streakCount = document.getElementById('streakCount');
        if (streakCount) {
            streakCount.textContent = this.userData.streak;
        }
    }

    updateProgressDisplay() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const completedText = document.getElementById('completedText');
        const progressPercent = document.getElementById('progressPercent');
        
        if (progressFill) progressFill.style.width = `${this.userData.progress.percentage}%`;
        if (progressText) {
            progressText.textContent = this.userData.progress.percentage > 0 ? 
                `You've completed ${this.userData.progress.percentage}% of your GreenQuest` : 
                'Begin your GreenQuest journey';
        }
        if (completedText) {
            completedText.textContent = `Completed: ${this.userData.progress.completed}/${this.userData.progress.total}`;
        }
        if (progressPercent) {
            progressPercent.textContent = `${this.userData.progress.percentage}%`;
        }
    }

    updateBadgesDisplay() {
        const badgesText = document.getElementById('badgesText');
        const badgesContainer = document.getElementById('badgesContainer');
        
        if (badgesText) {
            badgesText.textContent = this.userData.badges.length > 0 ? 
                `You've earned ${this.userData.badges.length} quest badges` : 
                'Begin your journey to earn badges';
        }
        
        if (badgesContainer) {
            badgesContainer.innerHTML = '';
            this.userData.badges.slice(0, 4).forEach(badge => {
                const badgeElement = document.createElement('div');
                badgeElement.className = 'badge';
                badgeElement.innerHTML = badge.icon;
                badgeElement.title = badge.name;
                badgesContainer.appendChild(badgeElement);
            });
            
            if (this.userData.badges.length > 4) {
                const moreBadge = document.createElement('div');
                moreBadge.className = 'badge more';
                moreBadge.textContent = `+${this.userData.badges.length - 4}`;
                badgesContainer.appendChild(moreBadge);
            }
        }
    }

    updateModuleProgressDisplay() {
        Object.keys(this.userData.modules).forEach(moduleId => {
            const progressElement = document.getElementById(`${moduleId}Progress`);
            if (progressElement) {
                const module = this.userData.modules[moduleId];
                progressElement.textContent = `Completed: ${module.percentage}%`;
            }
        });
    }

    updateStreakModal() {
        const streakModalTitle = document.getElementById('streakModalTitle');
        const streakModalDesc = document.getElementById('streakModalDesc');
        const streakCalendar = document.getElementById('streakCalendar');
        
        if (streakModalTitle) {
            streakModalTitle.textContent = `${this.userData.streak}-Day Quest Streak!`;
        }
        
        if (streakModalDesc) {
            if (this.userData.streak === 0) {
                streakModalDesc.textContent = 'Your adventure begins now!';
            } else if (this.userData.streak < 7) {
                streakModalDesc.textContent = 'Keep going! Every quest brings us closer to a greener planet!';
            } else {
                streakModalDesc.textContent = 'Amazing! You\'re a true GreenQuest champion!';
            }
        }
        
        if (streakCalendar) {
            this.renderStreakCalendar(streakCalendar);
        }
    }

    renderStreakCalendar(container) {
        container.innerHTML = '';
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'streak-day';
            
            if (i === 0) dayElement.classList.add('today');
            if (i < this.userData.streak) dayElement.classList.add('active');
            
            dayElement.textContent = date.getDate();
            container.appendChild(dayElement);
        }
    }

    // Public Methods
    initNewUserData(userId) {
        const allUserData = JSON.parse(localStorage.getItem('greenQuestUserData')) || {};
        allUserData[userId] = this.getDefaultUserData();
        localStorage.setItem('greenQuestUserData', JSON.stringify(allUserData));
        this.userData = allUserData[userId];
        this.updateUI();
    }

    resetData() {
        this.userData = this.getDefaultUserData();
        this.saveUserData();
        this.updateUI();
    }

    getUserData() {
        return this.userData;
    }
}

// Initialize user data manager
const userDataManager = new UserDataManager();

// Global functions
function initUserData() {
    userDataManager.loadUserData();
}

function initNewUserData(userId) {
    userDataManager.initNewUserData(userId);
}

function resetUserData() {
    userDataManager.resetData();
}