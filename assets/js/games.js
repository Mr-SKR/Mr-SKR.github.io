const CONFIG = {
    WIN_CONDITIONS: [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ],
    MAX_JOIN_RETRIES: 10
};

const MSG_TYPE = {
    VISIBILITY: 'visibility',
    SYNC: 'sync',
    START: 'start',
    MOVE: 'move',
    NEXT_GAME: 'nextGame',
    REQUEST_NEXT: 'requestNext',
    RESET_SERIES: 'resetSeries',
    GAME_FULL: 'game-full',
    END_GAME: 'end-game'
};

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
        this.joinRetryCount = 0;
        this.reconnectRetryCount = 0;
        this.connectionTimeout = null;
        this.serverReconnectCount = 0;

        this.dom = {};
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('join')) {
            this.dom.initialScreen.style.display = 'none';
            this.dom.connectingScreen.style.display = 'block';
            this.dom.connectingText.innerText = "Connecting to host...";
        }
        
        this.initPeer();
    }

    cacheDOM() {
        this.dom.initialScreen = document.getElementById('initial-screen');
        this.dom.waitingScreen = document.getElementById('waiting-screen');
        this.dom.connectingScreen = document.getElementById('connecting-screen');
        this.dom.connectedScreen = document.getElementById('connected-screen');
        this.dom.connectingText = document.getElementById('connecting-text');
        this.dom.joinGameId = document.getElementById('join-game-id');
        this.dom.displayGameId = document.getElementById('display-game-id');
        this.dom.shareUrl = document.getElementById('share-url');
        this.dom.status = document.getElementById('status');
        this.dom.myScore = document.getElementById('my-score');
        this.dom.opScore = document.getElementById('op-score');
        this.dom.targetScore = document.getElementById('target-score');
        this.dom.seriesLength = document.getElementById('series-length');
        this.dom.restartBtn = document.getElementById('restart-btn');
        this.dom.endGameBtn = document.getElementById('end-game-btn');
        this.dom.opContainer = document.getElementById('op-container');
        this.dom.opLabel = document.getElementById('op-label');
        this.dom.cells = document.querySelectorAll('.cell');
        this.dom.gameOverModal = document.getElementById('gameOverModal');
        this.dom.gameOverMessage = document.getElementById('gameOverMessage');
        
        // Buttons
        this.dom.createGameBtn = document.getElementById('create-game-btn');
        this.dom.joinGameBtn = document.getElementById('join-game-btn');
        this.dom.copyIdBtn = document.getElementById('copy-id-btn');
        this.dom.copyLinkBtn = document.getElementById('copy-link-btn');
        
        // Social Share Buttons
        this.dom.shareWhatsappBtn = document.getElementById('share-whatsapp-btn');
        this.dom.shareTelegramBtn = document.getElementById('share-telegram-btn');
        this.dom.shareTwitterBtn = document.getElementById('share-twitter-btn');
    }

    bindEvents() {
        this.dom.createGameBtn.addEventListener('click', () => this.createGame());
        this.dom.joinGameBtn.addEventListener('click', () => this.joinGame());
        this.dom.copyIdBtn.addEventListener('click', (e) => this.copyToClipboard(this.dom.displayGameId, e.target));
        this.dom.copyLinkBtn.addEventListener('click', (e) => this.copyToClipboard(this.dom.shareUrl, e.target));
        
        this.dom.shareWhatsappBtn.addEventListener('click', () => this.shareGame('whatsapp'));
        this.dom.shareTelegramBtn.addEventListener('click', () => this.shareGame('telegram'));
        this.dom.shareTwitterBtn.addEventListener('click', () => this.shareGame('twitter'));

        this.dom.restartBtn.addEventListener('click', () => this.handleRestart());
        this.dom.endGameBtn.addEventListener('click', () => this.endGame());

        this.dom.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });

        document.addEventListener("visibilitychange", () => {
            if (this.conn) {
                this.conn.send({
                    type: MSG_TYPE.VISIBILITY,
                    status: document.hidden ? 'hidden' : 'visible' 
                });
            }
        });
    }

    initPeer() {
        if (this.peer) {
            this.peer.removeAllListeners();
            if (!this.peer.destroyed) {
                this.peer.destroy();
            }
        }

        if (this.myId) {
            this.peer = new Peer(this.myId);
        } else {
            this.peer = new Peer();
        }

        this.peer.on('open', (id) => {
            this.myId = id;
            this.reconnectRetryCount = 0;
            this.serverReconnectCount = 0;
            console.log('My peer ID is: ' + id);
            
            this.dom.createGameBtn.disabled = false;
            this.dom.joinGameBtn.disabled = false;
            
            const urlParams = new URLSearchParams(window.location.search);
            const joinId = urlParams.get('join');
            if (joinId) {
                this.dom.joinGameId.value = joinId;
                setTimeout(() => this.joinGame(), 1000);
            } else if (this.isHost) {
                this.dom.displayGameId.innerText = this.myId;
                const url = new URL(window.location.href);
                url.searchParams.set('join', this.myId);
                this.dom.shareUrl.innerText = url.toString();

                if (this.gameActive || this.myScore > 0 || this.opponentScore > 0) {
                    this.dom.connectingScreen.style.display = 'none';
                    this.dom.connectedScreen.style.display = 'block';
                    this.dom.status.innerText = "Waiting for opponent...";
                } else {
                    this.dom.connectingScreen.style.display = 'none';
                    this.dom.waitingScreen.style.display = 'block';
                }
            }
        });

        this.peer.on('connection', (c) => {
            if (this.conn && this.conn.open) {
                const oldConn = this.conn;
                this.conn = c;
                oldConn.close();
            } else {
                this.conn = c;
            }
            this.opponentId = this.conn.peer;
            this.isHost = true;
            this.setupConnection();
            
            if (this.gameActive || this.myScore > 0 || this.opponentScore > 0) {
                const gameState = {
                    type: MSG_TYPE.SYNC,
                    symbol: this.mySymbol === 'X' ? 'O' : 'X',
                    targetWins: this.targetWins,
                    board: this.board,
                    currentTurn: this.currentTurn,
                    myScore: this.opponentScore,
                    opponentScore: this.myScore,
                    gameActive: this.gameActive
                };

                this._sendWhenReady(this.conn, gameState);
                this.handleVisibilityChange('visible');
            } else {
                this.mySymbol = 'X';
                this.currentTurn = 'X';
                const seriesLength = parseInt(this.dom.seriesLength.value) || 1;
                this.targetWins = Math.ceil(seriesLength / 2);
                this.startGame();

                this._sendWhenReady(this.conn, { type: MSG_TYPE.START, symbol: 'O', targetWins: this.targetWins });
            }
        });
        
        this.peer.on('disconnected', () => {
            console.log('Connection to PeerServer disconnected. It will reconnect automatically.');
        });
        
        this.peer.on('error', (err) => {
            console.error(err);
            if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
            if (err.type === 'unavailable-id') {
                this.reconnectRetryCount++;
                console.log(`ID taken. Retrying... (${this.reconnectRetryCount})`);
                this.dom.connectingText.innerText = `Reconnecting... (${this.reconnectRetryCount})`;
                
                this.peer.removeAllListeners();
                this.peer.destroy();
                setTimeout(() => this.initPeer(), 500);
                return;
            }
            if (err.type === 'peer-unavailable') {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('join')) {
                    if (this.joinRetryCount < CONFIG.MAX_JOIN_RETRIES) {
                        this.joinRetryCount++;
                        console.log(`Host unavailable. Retrying... (${this.joinRetryCount})`);
                        this.dom.connectingText.innerText = `Connecting to host... (${this.joinRetryCount}/${CONFIG.MAX_JOIN_RETRIES})`;
                        setTimeout(() => this.joinGame(), 2000);
                        return;
                    }
                    alert('The game you are trying to join does not exist or host is offline.');
                    window.location.href = window.location.pathname;
                    return;
                }
            }
            if (err.type === 'network' || err.type === 'server-error') {
                const MAX_SERVER_RECONNECTS = 5;
                if (this.serverReconnectCount < MAX_SERVER_RECONNECTS) {
                    this.serverReconnectCount++;
                    this.dom.connectedScreen.style.display = 'none';
                    this.dom.connectingScreen.style.display = 'block';
                    this.dom.connectingText.innerText = `Reconnecting to server... (${this.serverReconnectCount}/${MAX_SERVER_RECONNECTS})`;
                    setTimeout(() => this.initPeer(), 2000);
                } else {
                    alert('Could not connect to the server. Please refresh the page to try again.');
                }
                return;
            }
            alert('Connection error: ' + err.type);
            this.dom.waitingScreen.style.display = 'none';
            this.dom.connectingScreen.style.display = 'none';
            this.dom.connectedScreen.style.display = 'none';
            this.dom.initialScreen.style.display = 'block';
        });
    }

    createGame() {
        this.isHost = true;
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

        if (this.conn) {
            this.conn.close();
        }

        this.conn = this.peer.connect(joinId);
        
        this.conn.on('error', (err) => {
            console.error('Connection error:', err);
            if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
            this.peer.emit('error', { type: 'peer-unavailable' });
        });

        if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
        this.connectionTimeout = setTimeout(() => {
            if (this.conn && !this.conn.open) {
                console.log('Connection timed out.');
                this.peer.emit('error', { type: 'peer-unavailable' });
            }
        }, 5000);

        this.setupConnection();
        
        this.dom.initialScreen.style.display = 'none';
        this.dom.waitingScreen.style.display = 'none';
        this.dom.connectedScreen.style.display = 'none';
        this.dom.connectingScreen.style.display = 'block';
        this.dom.connectingText.innerText = `Connecting to host...${this.joinRetryCount > 0 ? ` (${this.joinRetryCount}/${CONFIG.MAX_JOIN_RETRIES})` : ''}`;
    }

    setupConnection() {
        const connection = this.conn;
        connection.on('open', () => {
            if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
            console.log('Connected to: ' + connection.peer);
            this.joinRetryCount = 0;
        });

        connection.on('data', (data) => this.handleData(data));
        
        connection.on('close', () => {
            if (this.awayInterval) clearInterval(this.awayInterval);
            if (this.awayTimeout) clearTimeout(this.awayTimeout);
            if (this.conn === connection && !this.connectionRejected) {
                alert('Connection lost');
                window.location.href = window.location.pathname;
            }
        });
    }

    _sendWhenReady(connection, data) {
        if (connection.open) {
            connection.send(data);
        } else {
            // Use 'once' to avoid potential multiple sends on a flaky connection
            connection.once('open', () => {
                connection.send(data);
            });
        }
    }

    handleData(data) {
        switch (data.type) {
            case MSG_TYPE.START:
                this.mySymbol = data.symbol;
                this.targetWins = data.targetWins;
                this.currentTurn = 'X';
                this.myScore = 0;
                this.opponentScore = 0;
                this.startGame();
                break;
            case MSG_TYPE.SYNC:
                this.mySymbol = data.symbol;
                this.targetWins = data.targetWins;
                this.board = data.board;
                this.currentTurn = data.currentTurn;
                this.myScore = data.myScore;
                this.opponentScore = data.opponentScore;
                this.gameActive = data.gameActive;
                
                this.dom.waitingScreen.style.display = 'none';
                this.dom.connectingScreen.style.display = 'none';
                this.dom.connectedScreen.style.display = 'block';
                
                this.updateScoreboard();
                this.renderBoard();
                
                if (this.gameActive) {
                    this.updateStatus();
                } else {
                    let winner = null;
                    for (const condition of CONFIG.WIN_CONDITIONS) {
                        const [a, b, c] = condition;
                        if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                            winner = this.board[a];
                            break;
                        }
                    }
                    
                    if (winner) {
                        const isWin = winner === this.mySymbol;
                        this.dom.status.innerText = isWin ? 'You Win!' : 'You Lose!';
                        this.dom.status.style.color = isWin ? '#28a745' : '#dc3545';
                        this.checkSeriesEnd();
                    } else {
                        this.dom.status.innerText = 'Draw!';
                        this.dom.status.style.color = '#ffc107';
                    }
                }
                this.updateButtonState();
                break;
            case MSG_TYPE.MOVE:
                this.makeMove(data.index, data.symbol);
                break;
            case MSG_TYPE.NEXT_GAME:
                this.mySymbol = data.symbol;
                this.resetBoard();
                break;
            case MSG_TYPE.REQUEST_NEXT:
                if (this.isHost) this.handleRestart();
                break;
            case MSG_TYPE.RESET_SERIES:
                this.fullReset();
                break;
            case MSG_TYPE.GAME_FULL:
                this.connectionRejected = true;
                alert('The game is already full.');
                const url = new URL(window.location.href);
                url.searchParams.delete('join');
                window.history.replaceState({}, document.title, url.toString());
                location.reload();
                break;
            case MSG_TYPE.VISIBILITY:
                this.handleVisibilityChange(data.status);
                break;
            case MSG_TYPE.END_GAME:
                alert('Opponent ended the game.');
                window.location.href = window.location.pathname;
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
            const symbol = this.board[index];
            if (symbol) cell.classList.add(symbol.toLowerCase(), 'taken');
        });
    }

    updateCell(index, symbol) {
        const cell = this.dom.cells[index];
        cell.innerText = symbol;
        cell.classList.add(symbol.toLowerCase(), 'taken');
    }

    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '' || this.currentTurn !== this.mySymbol) return;

        this.makeMove(index, this.mySymbol);
        this.conn.send({ type: MSG_TYPE.MOVE, index: index, symbol: this.mySymbol });
    }

    makeMove(index, symbol) {
        this.board[index] = symbol;
        this.updateCell(index, symbol);
        
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
        return CONFIG.WIN_CONDITIONS.some(condition => {
            return condition.every(index => {
                return this.board[index] === this.currentTurn;
            });
        });
    }

    checkSeriesEnd() {
        if (this.myScore >= this.targetWins) {
            this.dom.status.innerText = 'Series Won!';
            this.dom.status.style.color = '#28a745';
            this.showGameOverModal('You Won!', true);
        } else if (this.opponentScore >= this.targetWins) {
            this.dom.status.innerText = 'Series Lost!';
            this.dom.status.style.color = '#dc3545';
            this.showGameOverModal('You Lost!', false);
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
            this.conn.send({ type: MSG_TYPE.REQUEST_NEXT });
            return;
        }

        if (this.myScore >= this.targetWins || this.opponentScore >= this.targetWins) {
            this.conn.send({ type: MSG_TYPE.RESET_SERIES });
            this.fullReset();
        } else {
            this.mySymbol = this.mySymbol === 'X' ? 'O' : 'X';
            const opSymbol = this.mySymbol === 'X' ? 'O' : 'X';
            this.conn.send({ type: MSG_TYPE.NEXT_GAME, symbol: opSymbol });
            this.resetBoard();
        }
    }

    showGameOverModal(message, isWin) {
        if (this.dom.gameOverMessage) {
            this.dom.gameOverMessage.innerText = message;
            this.dom.gameOverMessage.className = 'modal-body ' + (isWin ? 'text-success' : 'text-danger') + ' font-weight-bold';
            this.dom.gameOverMessage.style.fontSize = '1.5rem';
        }
        if (this.dom.gameOverModal) {
            $(this.dom.gameOverModal).modal('show');
        }
    }

    endGame() {
        if (this.conn && this.conn.open) {
            this.conn.send({ type: MSG_TYPE.END_GAME });
        }
        alert('Game ended.');
        window.location.href = window.location.pathname;
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
                let timeLeft = 120;
                this.dom.opLabel.innerHTML = `Opponent <span style="font-size: 0.75em">(Away ${timeLeft}s)</span>`;
                
                if (this.awayInterval) clearInterval(this.awayInterval);
                
                this.awayInterval = setInterval(() => {
                    timeLeft--;
                    this.dom.opLabel.innerHTML = `Opponent <span style="font-size: 0.75em">(Away ${timeLeft}s)</span>`;
                    if (timeLeft <= 0) {
                        clearInterval(this.awayInterval);
                        if (this.conn) this.conn.close();
                        alert('Opponent timed out.');
                        window.location.href = window.location.pathname;
                    }
                }, 1000);
            }, 60000);
        } else {
            if (this.awayTimeout) clearTimeout(this.awayTimeout);
            if (this.awayInterval) clearInterval(this.awayInterval);
            this.dom.opContainer.classList.remove('op-away');
            this.dom.opLabel.innerText = 'Opponent';
        }
    }

    shareGame(platform) {
        const url = encodeURIComponent(this.dom.shareUrl.innerText);
        const text = encodeURIComponent("Join my Tic-Tac-Toe game!");
        let shareUrl = '';

        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${text}%20${url}`;
                break;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank');
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
