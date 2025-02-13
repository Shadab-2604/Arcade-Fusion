// sessionManager.js
class SessionManager {
    constructor() {
        this.initializeSession();
    }

    initializeSession() {
        if (!sessionStorage.getItem('gameStats')) {
            sessionStorage.setItem('gameStats', JSON.stringify({
                currentScore: 0,
                highScore: 0,
                gamesPlayed: 0
            }));
        }
    }

    updateScore(score) {
        const stats = this.getStats();
        stats.currentScore = score;
        if (score > stats.highScore) {
            stats.highScore = score;
        }
        this.saveStats(stats);
    }

    incrementGamesPlayed() {
        const stats = this.getStats();
        stats.gamesPlayed++;
        this.saveStats(stats);
    }

    getStats() {
        return JSON.parse(sessionStorage.getItem('gameStats'));
    }

    saveStats(stats) {
        sessionStorage.setItem('gameStats', JSON.stringify(stats));
    }

    resetCurrentScore() {
        const stats = this.getStats();
        stats.currentScore = 0;
        this.saveStats(stats);
    }
}

export default SessionManager;