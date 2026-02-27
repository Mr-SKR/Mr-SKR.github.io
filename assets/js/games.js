const WIN_CONDITIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

class TicTacToe {
    constructor() {
        this.peer = null;
        this.conn = null;
        this.myId = null;
        this.opponentId = null;
        this.mySymbol = null;
        this.currentTurn = null;
        this.board = Array(9).fill('');
        this.gameActive = false;
        this.isHost = false;
        this.myScore = 0;
        this.opponentScore = 0;
        this.targetWins = 1;
        this.connectionRejected = false;
        this.awayInterval = null;
        this.awayTimeout = null;

        this.dom = {};
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initPeer();
    }

    cacheDOM() {
        this.dom.initialScreen = document.getElementById('initial-screen');
        this.dom.waitingScreen = document.getElementById('waiting-screen');
        this.dom.connectingScreen = document.getElementById('connecting-screen');
        this.dom.connectedScreen = document.getElementById('connected-screen');
        this.dom.joinGameId = document.getElementById('join-game-id');
        this.dom.displayGameId = document.getElementById('display-game-id');
        this.dom.shareUrl = document.getElementById('share-url');
        this.dom.status = document.getElementById('status');
        this.dom.myScore = document.getElementById('my-score');
        this.dom.opScore = document.getElementById('op-score');
        this.dom.targetScore = document.getElementById('target-score');
        this.dom.seriesLength = document.getElementById('series-length');
        this.dom.restartBtn = document.getElementById('restart-btn');
        this.dom.opContainer = document.getElementById('op-container');
        this.dom.opLabel = document.getElementById('op-label');
        this.dom.cells = document.querySelectorAll('.cell');
        
        // Buttons
        this.dom.createGameBtn = document.getElementById('create-game-btn');
        this.dom.joinGameBtn = document.getElementById('join-game-btn');
        this.dom.copyIdBtn = document.getElementById('copy-id-btn');
        this.dom.copyLinkBtn = document.getElementById('copy-link-btn');
    }

    bindEvents() {
        this.dom.createGameBtn.addEventListener('click', () => this.createGame());
        this.dom.joinGameBtn.addEventListener('click', () => this.joinGame());
        this.dom.copyIdBtn.addEventListener('click', (e) => this.copyToClipboard(this.dom.displayGameId, e.target));
        this.dom.copyLinkBtn.addEventListener('click', (e) => this.copyToClipboard(this.dom.shareUrl, e.target));
        this.dom.restartBtn.addEventListener('click', () => this.handleRestart());

        this.dom.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });

        document.addEventListener("visibilitychange", () => {
            if (this.conn && this.conn.open) {
                this.conn.send({ 
                    type: 'visibility', 
                    status: document.hidden ? 'hidden' : 'visible' 
                });
            }
        });
    }

    initPeer() {
        this.peer = new Peer();

        this.peer.on('open', (id) => {
            this.myId = id;
            console.log('My peer ID is: ' + id);
            
            const urlParams = new URLSearchParams(window.location.search);
            const joinId = urlParams.get('join');
            if (joinId) {
                this.dom.joinGameId.value = joinId;
                this.joinGame();
            }
        });

        this.peer.on('connection', (c) => {
            if (this.conn && this.conn.open) {
                c.on('open', () => {
                    c.send({ type: 'game-full' });
                    setTimeout(() => { c.close(); }, 500);
                });
                return;
            }
            this.conn = c;
            this.opponentId = this.conn.peer;
            this.isHost = true;
            this.setupConnection();
            
            this.mySymbol = 'X';
            this.currentTurn = 'X';
            const seriesLength = parseInt(this.dom.seriesLength.value) || 1;
            this.targetWins = Math.ceil(seriesLength / 2);
            this.startGame();
            
            setTimeout(() => {
                 this.conn.send({ type: 'start', symbol: 'O', targetWins: this.targetWins });
            }, 500);
        });
        
        this.peer.on('error', (err) => {
            console.error(err);
            if (err.type === 'peer-unavailable') {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('join')) {
                    alert('The game you are trying to join does not exist.');
                    window.location.href = window.location.pathname;
                    return;
                }
            }
            alert('Connection error: ' + err.type);
            this.dom.waitingScreen.style.display = 'none';
            this.dom.connectingScreen.style.display = 'none';
            this.dom.connectedScreen.style.display = 'none';
            this.dom.initialScreen.style.display = 'block';
        });
    }

    createGame() {
        this.dom.initialScreen.style.display = 'none';
        this.dom.waitingScreen.style.display = 'block';
        this.dom.displayGameId.innerText = this.myId;
        
        const url = new URL(window.location.href);
        url.searchParams.set('join', this.myId);
        this.dom.shareUrl.innerText = url.toString();
    }

    joinGame() {
        const joinId = this.dom.joinGameId.value.trim();
        if (!joinId) return alert('Please enter a Game ID');
        if (joinId === this.myId) return alert('You cannot play with yourself!');

        this.conn = this.peer.connect(joinId);
        this.setupConnection();
        
        this.dom.initialScreen.style.display = 'none';
        this.dom.connectingScreen.style.display = 'block';
    }

    setupConnection() {
        this.conn.on('open', () => {
            console.log('Connected to: ' + this.conn.peer);
        });

        this.conn.on('data', (data) => this.handleData(data));
        
        this.conn.on('close', () => {
            if (this.awayInterval) clearInterval(this.awayInterval);
            if (this.awayTimeout) clearTimeout(this.awayTimeout);
            if (!this.connectionRejected) {
                alert('Connection lost');
                location.reload();
            }
        });
    }

    handleData(data) {
        switch (data.type) {
            case 'start':
                this.mySymbol = data.symbol;
                this.targetWins = data.targetWins;
                this.currentTurn = 'X';
                this.myScore = 0;
                this.opponentScore = 0;
                this.startGame();
                break;
            case 'move':
                this.makeMove(data.index, data.symbol);
                break;
            case 'nextGame':
                this.mySymbol = data.symbol;
                this.resetBoard();
                break;
            case 'requestNext':
                if (this.isHost) this.handleRestart();
                break;
            case 'resetSeries':
                this.fullReset();
                break;
            case 'game-full':
                this.connectionRejected = true;
                alert('The game is already full.');
                const url = new URL(window.location.href);
                url.searchParams.delete('join');
                window.history.replaceState({}, document.title, url.toString());
                location.reload();
                break;
            case 'visibility':
                this.handleVisibilityChange(data.status);
                break;
        }
    }

    startGame() {
        this.dom.waitingScreen.style.display = 'none';
        this.dom.connectingScreen.style.display = 'none';
        this.dom.connectedScreen.style.display = 'block';
        this.updateScoreboard();
        this.gameActive = true;
        this.updateStatus();
        this.renderBoard();
        this.updateButtonState();
    }

    updateStatus() {
        if (this.currentTurn === this.mySymbol) {
            this.dom.status.innerText = `Your Turn (${this.mySymbol})`;
            this.dom.status.style.color = '#007bff';
        } else {
            this.dom.status.innerText = `Opponent's Turn (${this.mySymbol === 'X' ? 'O' : 'X'})`;
            this.dom.status.style.color = '#6c757d';
        }
    }

    updateScoreboard() {
        this.dom.myScore.innerText = this.myScore;
        this.dom.opScore.innerText = this.opponentScore;
        this.dom.targetScore.innerText = this.targetWins;
    }

    renderBoard() {
        this.dom.cells.forEach((cell, index) => {
            cell.innerText = this.board[index];
            cell.className = 'cell';
            if (this.board[index] === 'X') cell.classList.add('x', 'taken');
            if (this.board[index] === 'O') cell.classList.add('o', 'taken');
        });
    }

    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '' || this.currentTurn !== this.mySymbol) return;

        this.makeMove(index, this.mySymbol);
        this.conn.send({ type: 'move', index: index, symbol: this.mySymbol });
    }

    makeMove(index, symbol) {
        this.board[index] = symbol;
        this.renderBoard();
        
        if (this.checkWin()) {
            this.gameActive = false;
            const isWin = symbol === this.mySymbol;
            this.dom.status.innerText = isWin ? 'You Win!' : 'You Lose!';
            this.dom.status.style.color = isWin ? '#28a745' : '#dc3545';
            
            if (isWin) this.myScore++; else this.opponentScore++;
            this.updateScoreboard();
            this.checkSeriesEnd();
        } else if (this.board.every(cell => cell !== '')) {
            this.gameActive = false;
            this.dom.status.innerText = 'Draw!';
            this.dom.status.style.color = '#ffc107';
            this.updateButtonState();
        } else {
            this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
            this.updateStatus();
        }
    }

    checkWin() {
        return WIN_CONDITIONS.some(condition => {
            return condition.every(index => {
                return this.board[index] === this.currentTurn;
            });
        });
    }

    checkSeriesEnd() {
        if (this.myScore >= this.targetWins) {
            this.dom.status.innerText = 'Series Won!';
            this.dom.status.style.color = '#28a745';
        } else if (this.opponentScore >= this.targetWins) {
            this.dom.status.innerText = 'Series Lost!';
            this.dom.status.style.color = '#dc3545';
        }
        this.updateButtonState();
    }

    updateButtonState() {
        this.dom.restartBtn.disabled = this.gameActive;
        if (this.myScore >= this.targetWins || this.opponentScore >= this.targetWins) {
            this.dom.restartBtn.innerText = 'New Series';
            this.dom.restartBtn.className = 'btn btn-primary mt-4';
        } else {
            this.dom.restartBtn.innerText = 'Next Game';
            this.dom.restartBtn.className = 'btn btn-info mt-4';
        }
    }

    handleRestart() {
        if (!this.conn) return;

        if (!this.isHost) {
            this.conn.send({ type: 'requestNext' });
            return;
        }

        if (this.myScore >= this.targetWins || this.opponentScore >= this.targetWins) {
            this.conn.send({ type: 'resetSeries' });
            this.fullReset();
        } else {
            this.mySymbol = this.mySymbol === 'X' ? 'O' : 'X';
            const opSymbol = this.mySymbol === 'X' ? 'O' : 'X';
            this.conn.send({ type: 'nextGame', symbol: opSymbol });
            this.resetBoard();
        }
    }

    fullReset() {
        this.myScore = 0;
        this.opponentScore = 0;
        this.mySymbol = this.isHost ? 'X' : 'O';
        this.resetBoard();
    }

    resetBoard() {
        this.board = Array(9).fill('');
        this.gameActive = true;
        this.currentTurn = 'X';
        this.updateStatus();
        this.renderBoard();
        this.updateScoreboard();
        this.updateButtonState();
    }

    handleVisibilityChange(status) {
        if (status === 'hidden') {
            if (this.awayTimeout) clearTimeout(this.awayTimeout);
            this.awayTimeout = setTimeout(() => {
                this.dom.opContainer.classList.add('op-away');
                let timeLeft = 60;
                this.dom.opLabel.innerHTML = `Opponent <span style="font-size: 0.75em">(Away ${timeLeft}s)</span>`;
                
                if (this.awayInterval) clearInterval(this.awayInterval);
                
                this.awayInterval = setInterval(() => {
                    timeLeft--;
                    this.dom.opLabel.innerHTML = `Opponent <span style="font-size: 0.75em">(Away ${timeLeft}s)</span>`;
                    if (timeLeft <= 0) {
                        clearInterval(this.awayInterval);
                        if (this.conn) this.conn.close();
                        alert('Opponent timed out.');
                        location.reload();
                    }
                }, 1000);
            }, 10000);
        } else {
            if (this.awayTimeout) clearTimeout(this.awayTimeout);
            if (this.awayInterval) clearInterval(this.awayInterval);
            this.dom.opContainer.classList.remove('op-away');
            this.dom.opLabel.innerText = 'Opponent';
        }
    }

    copyToClipboard(element, btn) {
        navigator.clipboard.writeText(element.innerText).then(() => {
            if (btn) {
                const originalText = btn.innerText;
                btn.innerText = 'Copied!';
                btn.disabled = true;
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                }, 2000);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
