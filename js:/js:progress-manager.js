// js/progress-manager.js
// ====== CENTRAL PROGRESS MANAGEMENT SYSTEM ======

const ProgressManager = {
    // Default progress structure
    defaultProgress: {
        ecology: 0,
        climate: 0,
        living: 0,
        waste: 0,
        trade: 0,
        policy: 0,
        knowledgePoints: 0,
        streakDays: 0,
        lastActivityDate: '',
        completedLessons: {
            ecology: [], climate: [], living: [],
            waste: [], trade: [], policy: []
        },
        quizScores: {
            ecology: 0, climate: 0, living: 0,
            waste: 0, trade: 0, policy: 0
        },
        visitedTopics: {
            ecology: false, climate: false, living: false,
            waste: false, trade: false, policy: false
        }
    },

    // Learning structure for all topics
    learningStructure: {
        ecology: { lessons: 5, quizzes: 1, activities: 2 },
        climate: { lessons: 5, quizzes: 1, activities: 2 },
        living: { lessons: 5, quizzes: 1, activities: 2 },
        waste: { lessons: 5, quizzes: 1, activities: 2 },
        trade: { lessons: 5, quizzes: 1, activities: 2 },
        policy: { lessons: 5, quizzes: 1, activities: 2 }
    },

    // Get progress from localStorage
    getProgress() {
        const saved = localStorage.getItem('greenQuestProgress');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge with defaults to ensure all properties exist
            return { ...this.defaultProgress, ...parsed };
        }
        return { ...this.defaultProgress };
    },

    // Save progress to localStorage
    saveProgress(progress) {
        localStorage.setItem('greenQuestProgress', JSON.stringify(progress));
    },

    // Mark topic as visited
    visitTopic(topic) {
        const progress = this.getProgress();
        progress.visitedTopics[topic] = true;
        this.saveProgress(progress);
        return progress;
    },

    // Complete a lesson
    completeLesson(topic, lessonNumber) {
        const progress = this.getProgress();
        
        if (!progress.completedLessons[topic].includes(lessonNumber)) {
            progress.completedLessons[topic].push(lessonNumber);
            progress.knowledgePoints += 15;
            
            // Update progress calculation
            this.recalculateTopicProgress(progress, topic);
            
            // Update streak
            this.updateStreak(progress);
            
            this.saveProgress(progress);
            return { success: true, progress };
        }
        return { success: false, message: 'Lesson already completed' };
    },

    // Update quiz score
    updateQuizScore(topic, score) {
        const progress = this.getProgress();
        progress.quizScores[topic] = Math.max(progress.quizScores[topic], score);
        progress.knowledgePoints += Math.round(score / 10);
        
        this.recalculateTopicProgress(progress, topic);
        this.updateStreak(progress);
        this.saveProgress(progress);
        
        return progress;
    },

    // Complete an activity
    completeActivity(topic) {
        const progress = this.getProgress();
        progress.knowledgePoints += 20;
        this.updateStreak(progress);
        this.saveProgress(progress);
        
        return progress;
    },

    // Recalculate progress for a topic
    recalculateTopicProgress(progress, topic) {
        const completedCount = progress.completedLessons[topic].length;
        const totalLessons = this.learningStructure[topic].lessons;
        const quizScore = progress.quizScores[topic];
        
        // Calculate: 70% from lessons, 30% from quiz
        const lessonProgress = (completedCount / totalLessons) * 70;
        const quizProgress = (quizScore / 100) * 30;
        
        progress[topic] = Math.min(Math.round(lessonProgress + quizProgress), 100);
    },

    // Update learning streak
    updateStreak(progress) {
        const today = new Date().toDateString();
        
        if (progress.lastActivityDate !== today) {
            if (progress.lastActivityDate) {
                const lastDate = new Date(progress.lastActivityDate);
                const todayDate = new Date(today);
                const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    progress.streakDays++;
                } else if (diffDays > 1) {
                    progress.streakDays = 1;
                }
            } else {
                progress.streakDays = 1;
            }
            progress.lastActivityDate = today;
        }
    },

    // Get topic display name
    getTopicName(topic) {
        const names = {
            ecology: "Ecology & Ecosystems",
            climate: "Climate Justice",
            living: "Sustainable Living",
            waste: "Waste Management",
            trade: "Fair Trade",
            policy: "Policy & Economy"
        };
        return names[topic] || topic;
    },

    // Get lesson title
    getLessonTitle(topic, lessonNumber) {
        const lessonTitles = {
            ecology: ["Introduction to Ecosystems", "Biodiversity", "Conservation Methods", "Habitat Protection", "Case Studies"],
            climate: ["Climate Science Basics", "Social Equity", "Policy Analysis", "Global Agreements", "Local Actions"],
            living: ["Renewable Energy", "Sustainable Food", "Green Transportation", "Energy Efficiency", "Zero-Waste Living"],
            waste: ["Reduce Principles", "Reuse Strategies", "Recycle Systems", "Composting", "Circular Economy"],
            trade: ["Ethical Consumerism", "Fair Labor", "Supply Chains", "Certifications", "Community Impact"],
            policy: ["Environmental Economics", "Green Policies", "SDGs", "Advocacy", "Policy Implementation"]
        };
        return lessonTitles[topic]?.[lessonNumber - 1] || `Lesson ${lessonNumber}`;
    },

    // Reset all progress
    resetProgress() {
        localStorage.removeItem('greenQuestProgress');
        return { ...this.defaultProgress };
    },

    // Export progress data
    exportData() {
        const progress = this.getProgress();
        return {
            profile: progress,
            timestamp: new Date().toISOString(),
            platform: 'GreenQuest'
        };
    }
};