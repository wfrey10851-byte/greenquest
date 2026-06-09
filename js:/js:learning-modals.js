// js/learning-modals.js
// ====== LEARNING MODAL SYSTEM ======

const LearningModals = {
    // Show learning options modal
    showLearningOptions(topic) {
        const progress = ProgressManager.getProgress();
        const completedCount = progress.completedLessons[topic].length;
        const totalLessons = ProgressManager.learningStructure[topic].lessons;
        const quizScore = progress.quizScores[topic];
        
        const modalHTML = `
            <div class="learning-modal modal-overlay">
                <div class="modal-content">
                    <button class="modal-close" onclick="LearningModals.closeModal()">&times;</button>
                    <h2>Continue Learning: ${ProgressManager.getTopicName(topic)}</h2>
                    
                    <div class="progress-summary">
                        <div class="progress-stats">
                            <div class="stat">
                                <span class="stat-value">${completedCount}/${totalLessons}</span>
                                <span class="stat-label">Lessons</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${quizScore}%</span>
                                <span class="stat-label">Quiz Score</span>
                            </div>
                            <div class="stat">
                                <span class="stat-value">${progress[topic]}%</span>
                                <span class="stat-label">Overall</span>
                            </div>
                        </div>
                        
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress[topic]}%"></div>
                        </div>
                    </div>
                    
                    <div class="learning-options">
                        <h3>Choose what to learn:</h3>
                        
                        ${this.generateLessonOptions(topic)}
                        
                        <div class="option-group">
                            <h4>Assess Your Knowledge</h4>
                            <button class="option-btn quiz-option" onclick="LearningModals.showQuiz('${topic}')">
                                <i class="fas fa-clipboard-check"></i>
                                <span>Take Topic Quiz</span>
                                <small>Test your knowledge (30% of progress)</small>
                            </button>
                        </div>
                        
                        <div class="option-group">
                            <h4>Apply Learning</h4>
                            <button class="option-btn activity-option" onclick="LearningModals.showActivity('${topic}')">
                                <i class="fas fa-tasks"></i>
                                <span>Complete Activity</span>
                                <small>Practical application</small>
                            </button>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="LearningModals.closeModal()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn btn-primary" onclick="window.location.href='pages/${topic}.html'">
                            <i class="fas fa-book-open"></i> Browse All Content
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.createModal(modalHTML);
    },

    // Generate lesson options HTML
    generateLessonOptions(topic) {
        const progress = ProgressManager.getProgress();
        const completedLessons = progress.completedLessons[topic];
        const totalLessons = ProgressManager.learningStructure[topic].lessons;
        
        let optionsHTML = '<div class="option-group"><h4>Continue Lessons</h4>';
        
        for (let i = 1; i <= totalLessons; i++) {
            const isCompleted = completedLessons.includes(i);
            const nextLesson = completedLessons.length + 1;
            
            optionsHTML += `
                <button class="option-btn lesson-option ${isCompleted ? 'completed' : i === nextLesson ? 'next' : ''}" 
                        onclick="LearningModals.completeLesson('${topic}', ${i})" ${isCompleted ? 'disabled' : ''}>
                    <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-book'}"></i>
                    <span>Lesson ${i}: ${ProgressManager.getLessonTitle(topic, i)}</span>
                    <small>${isCompleted ? '✓ Completed' : i === nextLesson ? '● Next Lesson' : 'Click to complete'}</small>
                </button>
            `;
        }
        
        optionsHTML += '</div>';
        return optionsHTML;
    },

    // Complete a lesson
    completeLesson(topic, lessonNumber) {
        const result = ProgressManager.completeLesson(topic, lessonNumber);
        
        if (result.success) {
            NotificationManager.show(
                `✅ Lesson ${lessonNumber} completed in ${ProgressManager.getTopicName(topic)}! +15 Knowledge Points`,
                'success'
            );
            
            // Update UI if on home page
            if (typeof updateAllProgress === 'function') {
                updateAllProgress();
            }
            
            // Close and reopen modal to show updated progress
            this.closeModal();
            setTimeout(() => this.showLearningOptions(topic), 500);
        }
    },

    // Show quiz modal
    showQuiz(topic) {
        const modalHTML = `
            <div class="quiz-modal modal-overlay">
                <div class="modal-content">
                    <button class="modal-close" onclick="LearningModals.closeModal()">&times;</button>
                    <h2>${ProgressManager.getTopicName(topic)} Quiz</h2>
                    
                    <div class="quiz-instructions">
                        <p>Test your knowledge with 5 questions. You need 70% to pass.</p>
                        <p>Your quiz score contributes 30% to your overall progress.</p>
                    </div>
                    
                    <div class="quiz-content">
                        <div class="quiz-question">
                            <h3>Question 1/5</h3>
                            <p>What is the primary goal of ecological conservation?</p>
                            
                            <div class="quiz-options">
                                <label class="quiz-option">
                                    <input type="radio" name="quiz1" value="a" data-correct="true">
                                    <span>To protect biodiversity</span>
                                </label>
                                <label class="quiz-option">
                                    <input type="radio" name="quiz1" value="b">
                                    <span>To increase tourism</span>
                                </label>
                                <label class="quiz-option">
                                    <input type="radio" name="quiz1" value="c">
                                    <span>To reduce government spending</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quiz-navigation">
                        <button class="btn btn-secondary" onclick="LearningModals.closeModal()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn btn-primary" onclick="LearningModals.submitQuiz('${topic}')">
                            <i class="fas fa-paper-plane"></i> Submit Quiz
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.createModal(modalHTML);
    },

    // Submit quiz
    submitQuiz(topic) {
        // Simulate scoring - in real app, calculate based on answers
        const score = Math.floor(Math.random() * 30) + 70; // Random 70-100%
        
        ProgressManager.updateQuizScore(topic, score);
        
        if (typeof updateAllProgress === 'function') {
            updateAllProgress();
        }
        
        this.closeModal();
        NotificationManager.show(`🎯 Quiz completed! Score: ${score}% in ${ProgressManager.getTopicName(topic)}`, 'success');
    },

    // Show activity modal
    showActivity(topic) {
        const modalHTML = `
            <div class="activity-modal modal-overlay">
                <div class="modal-content">
                    <button class="modal-close" onclick="LearningModals.closeModal()">&times;</button>
                    <h2>${ProgressManager.getTopicName(topic)} Activity</h2>
                    
                    <div class="activity-content">
                        <p><strong>Practical Application:</strong> Create a personal action plan for implementing what you've learned about ${ProgressManager.getTopicName(topic)}.</p>
                        
                        <div class="activity-task">
                            <h3>Your Task:</h3>
                            <ol>
                                <li>Identify 3 ways you can apply this knowledge in your daily life</li>
                                <li>Set specific, measurable goals for each</li>
                                <li>Share your plan with someone (optional but recommended)</li>
                            </ol>
                        </div>
                        
                        <div class="form-group">
                            <label>Your Action Plan:</label>
                            <textarea class="activity-input" rows="6" placeholder="Write your action plan here..."></textarea>
                        </div>
                    </div>
                    
                    <div class="activity-navigation">
                        <button class="btn btn-secondary" onclick="LearningModals.closeModal()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button class="btn btn-primary" onclick="LearningModals.completeActivity('${topic}')">
                            <i class="fas fa-check"></i> Complete Activity
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.createModal(modalHTML);
    },

    // Complete activity
    completeActivity(topic) {
        ProgressManager.completeActivity(topic);
        
        if (typeof updateAllProgress === 'function') {
            updateAllProgress();
        }
        
        this.closeModal();
        NotificationManager.show('🌟 Activity completed! +20 Knowledge Points', 'success');
    },

    // Create modal
    createModal(html) {
        this.closeModal(); // Close any existing modal
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer);
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
    },

    // Close modal
    closeModal() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.remove();
        });
        document.body.style.overflow = '';
    }
};