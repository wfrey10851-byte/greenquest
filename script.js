[file name]: script.js
[file content begin]
// DOM Elements for GreenQuest
const loginBtn = document.getElementById('loginBtn');
const streakBtn = document.getElementById('streakBtn');
const startChallengeBtn = document.getElementById('startChallengeBtn');
const loginModal = document.getElementById('loginModal');
const streakModal = document.getElementById('streakModal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const closeStreakModalBtn = document.getElementById('closeStreakModal');
const loginForm = document.getElementById('loginForm');

// Open login modal
if (loginBtn) {
    loginBtn.addEventListener('click', function() {
        loginModal.style.display = 'flex';
    });
}

// Open streak modal
if (streakBtn) {
    streakBtn.addEventListener('click', function() {
        streakModal.style.display = 'flex';
    });
}

// Close modals
if (closeModalBtns) {
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loginModal.style.display = 'none';
        });
    });
}

if (closeStreakModalBtn) {
    closeStreakModalBtn.addEventListener('click', function() {
        streakModal.style.display = 'none';
    });
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target === streakModal) {
        streakModal.style.display = 'none';
    }
});

// Login form submission
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Welcome to GreenQuest! Your adventure begins now.');
        loginModal.style.display = 'none';
    });
}

// Start quest
if (startChallengeBtn) {
    startChallengeBtn.addEventListener('click', function() {
        // Increase streak count
        const streakCount = document.querySelector('.streak-count');
        if (streakCount) {
            const currentStreak = parseInt(streakCount.textContent);
            streakCount.textContent = currentStreak + 1;
        }
        
        // Update quest status
        this.innerHTML = '<i class="fas fa-check"></i> Quest Completed';
        this.classList.remove('btn-primary');
        this.classList.add('btn-disabled');
        this.disabled = true;
        
        // Show success message
        alert('Quest completed! Your dedication is helping create a greener planet!');
        
        // Show streak modal
        if (streakModal) {
            streakModal.style.display = 'flex';
        }
    });
}

// Quest card click events
const moduleCards = document.querySelectorAll('.module-card');
moduleCards.forEach(card => {
    card.addEventListener('click', function() {
        const title = this.querySelector('.module-title').textContent;
        // In actual application, this would navigate to corresponding quest page
        console.log(`Beginning quest: ${title}`);
    });
});

// Community interaction functionality
const likeButtons = document.querySelectorAll('.community-action .fa-heart');
likeButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        const countElement = this.parentElement;
        let count = parseInt(countElement.textContent);
        if (this.classList.contains('far')) {
            this.classList.remove('far');
            this.classList.add('fas');
            countElement.textContent = count + 1;
        } else {
            this.classList.remove('fas');
            this.classList.add('far');
            countElement.textContent = count - 1;
        }
    });
});
[file content end]