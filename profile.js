[file name]: profile.js
[file content begin]
// Profile Page Management System for GreenQuest
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.init();
    }

    init() {
        this.currentUser = authSystem.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }

        this.loadUserData();
        this.bindEvents();
        this.updateProfileUI();
    }

    loadUserData() {
        const allUserData = JSON.parse(localStorage.getItem('greenQuestUserData')) || {};
        this.userData = allUserData[this.currentUser.id] || userDataManager.getDefaultUserData();
    }

    updateProfileUI() {
        // Update basic profile info
        document.getElementById('profileUserAvatar').textContent = this.currentUser.avatar.text;
        document.getElementById('profileUserName').textContent = this.currentUser.name;
        document.getElementById('profileUserEmail').textContent = this.currentUser.email;
        
        // Calculate join date
        const joinDate = new Date(this.currentUser.joinDate || new Date());
        document.getElementById('profileJoinDate').textContent = `Joined: ${joinDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}`;

        // Update stats
        this.updateStats();
        
        // Update quest progress
        this.updateQuestProgress();
        
        // Update badges
        this.updateBadgesDisplay();
        
        // Update environmental impact
        this.updateEnvironmentalImpact();
        
        // Update activity feed
        this.updateActivityFeed();
    }

    updateStats() {
        document.getElementById('questsCompleted').textContent = this.userData.progress.completed;
        document.getElementById('currentStreak').textContent = this.userData.streak;
        document.getElementById('badgesEarned').textContent = this.userData.badges.length;
        document.getElementById('communityPosts').textContent = this.userData.stats.communityPosts;
    }

    updateQuestProgress() {
        const modules = ['ecology', 'climateJustice', 'sustainableLiving', 'wasteManagement', 'fairTrade'];
        
        modules.forEach(module => {
            const progress = this.userData.modules[module];
            document.getElementById(`${module}Percent`).textContent = `${progress.percentage}%`;
            document.getElementById(`${module}ProgressBar`).style.width = `${progress.percentage}%`;
        });
    }

    updateBadgesDisplay() {
        const badgesContainer = document.getElementById('profileBadgesContainer');
        const badgeCount = document.getElementById('badgeCount');
        
        badgeCount.textContent = `${this.userData.badges.length}/12`;
        
        if (this.userData.badges.length === 0) {
            badgesContainer.innerHTML = `
                <div class="badge-placeholder">
                    <i class="fas fa-lock"></i>
                    <span>Complete quests to unlock badges</span>
                </div>
            `;
            return;
        }

        badgesContainer.innerHTML = '';
        
        // Create badges grid
        for (let i = 0; i < 12; i++) {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'profile-badge';
            
            if (i < this.userData.badges.length) {
                const badge = this.userData.badges[i];
                badgeElement.classList.add('unlocked');
                badgeElement.innerHTML = `
                    ${badge.icon}
                    <div class="badge-tooltip">${badge.name}</div>
                `;
            } else {
                badgeElement.innerHTML = '<i class="fas fa-lock"></i>';
            }
            
            badgesContainer.appendChild(badgeElement);
        }
    }

    updateEnvironmentalImpact() {
        // Calculate environmental impact based on user activities
        const impactMultipliers = {
            treesPlanted: this.userData.stats.quizzesTaken * 0.1,
            co2Reduced: this.userData.progress.completed * 2.5,
            waterSaved: this.userData.stats.learningTime * 10,
            energySaved: this.userData.challenges.completed.length * 15
        };

        document.getElementById('treesPlanted').textContent = Math.round(impactMultipliers.treesPlanted);
        document.getElementById('co2Reduced').textContent = Math.round(impactMultipliers.co2Reduced) + ' kg';
        document.getElementById('waterSaved').textContent = Math.round(impactMultipliers.waterSaved) + ' L';
        document.getElementById('energySaved').textContent = Math.round(impactMultipliers.energySaved) + ' kWh';
    }

    updateActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        
        if (this.userData.progress.completed === 0) {
            activityFeed.innerHTML = `
                <div class="activity-item empty-activity">
                    <i class="fas fa-compass"></i>
                    <span>Begin your GreenQuest to see activity here</span>
                </div>
            `;
            return;
        }

        const activities = this.generateRecentActivities();
        activityFeed.innerHTML = '';
        
        activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.innerHTML = `
                <i class="fas fa-${activity.icon}"></i>
                <span>${activity.text}</span>
            `;
            activityFeed.appendChild(activityElement);
        });
    }

    generateRecentActivities() {
        const activities = [];
        
        // Add quest completion activities
        Object.entries(this.userData.modules).forEach(([module, data]) => {
            if (data.completed > 0) {
                const moduleNames = {
                    ecology: 'Ecology & Ecosystems',
                    climateJustice: 'Climate Justice',
                    sustainableLiving: 'Sustainable Living',
                    wasteManagement: 'Waste Management',
                    fairTrade: 'Fair Trade'
                };
                
                activities.push({
                    icon: 'check-circle',
                    text: `Completed ${data.completed} lessons in ${moduleNames[module]}`
                });
            }
        });

        // Add streak activity
        if (this.userData.streak > 0) {
            activities.push({
                icon: 'fire',
                text: `Maintained ${this.userData.streak}-day quest streak`
            });
        }

        // Add badge activities
        if (this.userData.badges.length > 0) {
            const recentBadges = this.userData.badges.slice(-3);
            recentBadges.forEach(badge => {
                activities.push({
                    icon: 'award',
                    text: `Earned "${badge.name}" badge`
                });
            });
        }

        // Add community activities
        if (this.userData.stats.communityPosts > 0) {
            activities.push({
                icon: 'users',
                text: `Shared ${this.userData.stats.communityPosts} quest updates`
            });
        }

        return activities.slice(-5).reverse(); // Show 5 most recent activities
    }

    bindEvents() {
        // Edit avatar button
        document.getElementById('editAvatarBtn').addEventListener('click', () => {
            this.showAvatarModal();
        });

        // Avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');
            });
        });

        // Save avatar
        document.getElementById('saveAvatarBtn').addEventListener('click', () => {
            this.saveAvatar();
        });

        // Export data
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportUserData();
        });

        // Reset progress
        document.getElementById('resetProgressBtn').addEventListener('click', () => {
            this.showResetConfirmation();
        });

        // Settings toggles
        document.getElementById('notificationsToggle').addEventListener('change', (e) => {
            this.saveSetting('notifications', e.target.checked);
        });

        document.getElementById('emailUpdatesToggle').addEventListener('change', (e) => {
            this.saveSetting('emailUpdates', e.target.checked);
        });

        document.getElementById('communityToggle').addEventListener('change', (e) => {
            this.saveSetting('community', e.target.checked);
        });
    }

    showAvatarModal() {
        document.getElementById('avatarModal').style.display = 'flex';
    }

    saveAvatar() {
        const selectedAvatar = document.querySelector('.avatar-option.selected');
        if (!selectedAvatar) {
            alert('Please select an avatar');
            return;
        }

        const newAvatar = selectedAvatar.dataset.avatar;
        this.currentUser.avatar.text = newAvatar;
        
        // Update in localStorage
        const users = JSON.parse(localStorage.getItem('greenQuestUsers')) || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].avatar.text = newAvatar;
            localStorage.setItem('greenQuestUsers', JSON.stringify(users));
        }

        // Update current user
        localStorage.setItem('currentGreenQuestUser', JSON.stringify(this.currentUser));
        
        // Update UI
        this.updateProfileUI();
        authSystem.updateUI();
        
        // Close modal
        document.getElementById('avatarModal').style.display = 'none';
        
        // Show success message
        this.showNotification('Avatar updated successfully!');
    }

    exportUserData() {
        const data = {
            user: this.currentUser,
            progress: this.userData,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `greenquest-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Quest data exported successfully!');
    }

    showResetConfirmation() {
        if (confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
            userDataManager.resetData();
            this.loadUserData();
            this.updateProfileUI();
            this.showNotification('Progress reset successfully. Your new quest begins now!');
        }
    }

    saveSetting(setting, value) {
        const settings = JSON.parse(localStorage.getItem('greenQuestSettings')) || {};
        settings[this.currentUser.id] = settings[this.currentUser.id] || {};
        settings[this.currentUser.id][setting] = value;
        localStorage.setItem('greenQuestSettings', JSON.stringify(settings));
        
        this.showNotification('Settings updated!');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize profile manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});
[file content end]