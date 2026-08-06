const CONFIG = {
    WIN_CONDITIONS: [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ],

    // --- Relay (TURN) configuration -------------------------------------
    // STUN alone cannot get packets through a symmetric NAT, which is what many
    // mobile carriers and corporate networks use. Those player pairs need a TURN
    // relay or they simply never connect. Everything below is optional: with no
    // TURN configured the game runs STUN-only, which is its current behaviour.
    //
    // Credentials come from the ExpressTURN dashboard (free tier, 1000GB/month).
    // They are per-account relay credentials meant to be used from the browser.
    // Because this repo is public they are readable by anyone; the worst case is
    // someone consuming the monthly quota, so use "Refresh Credentials" in the
    // dashboard and update them here if that ever happens.
    //
    // Only port 3478 is open on the free tier (verified: UDP and TCP both
    // allocate; ports 80 and 443 are refused), so listing others would just
    // waste ICE gathering time on dead endpoints.
    TURN_USERNAME: '000000002100935529',
    TURN_CREDENTIAL: '4DiGeL9aHj77S0E4PwEdN5qD4Oc=',
    TURN_URLS: [
        'turn:free.expressturn.com:3478',
        'turn:free.expressturn.com:3478?transport=tcp'
    ],

    // Alternative to the static credentials above: a URL returning
    // { iceServers: [...] }. Use this if you move to short-lived credentials
    // minted by a small backend. Takes precedence when set.
    ICE_ENDPOINT: '',
    ICE_ENDPOINT_TIMEOUT_MS: 4000,

    // Always kept, and listed after any TURN servers so ICE still prefers a
    // direct path when one is available.
    STUN_SERVERS: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ],

    // Logs how the connection was actually established (direct / STUN / relay).
    // Leave on until you know whether TURN is needed for your players.
    LOG_ICE_DIAGNOSTICS: true,

    MAX_JOIN_RETRIES: 10,
    // Retrying cannot conjure a network path that does not exist, so a
    // no-route failure gets far fewer attempts than a missing host.
    MAX_PATH_RETRIES: 2,
    MAX_ID_RECLAIM_RETRIES: 5,
    MAX_SERVER_RECONNECTS: 5,
    MAX_PEER_RECONNECTS: 6,
    MAX_REJOIN_ATTEMPTS: 8,

    // ICE gathering over a slow mobile link regularly needs more than 5s.
    CONNECT_TIMEOUT_MS: 15000,
    HEARTBEAT_INTERVAL_MS: 3000,
    HEARTBEAT_TIMEOUT_MS: 12000,
    RECONNECT_BASE_DELAY_MS: 1000,
    RECONNECT_MAX_DELAY_MS: 8000,
    RESYNC_THROTTLE_MS: 3000,

    AWAY_GRACE_MS: 60000,
    AWAY_COUNTDOWN_S: 120
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
    END_GAME: 'end-game',
    HELLO: 'hello',
    PING: 'ping',
    PONG: 'pong',
    RESYNC_REQUEST: 'resyncRequest'
};

// Exponential backoff with a ceiling, so a persistent failure stops hammering
// the broker while a transient one still recovers quickly.
function backoffDelay(attempt) {
    return Math.min(
        CONFIG.RECONNECT_BASE_DELAY_MS * Math.pow(2, Math.max(0, attempt - 1)),
        CONFIG.RECONNECT_MAX_DELAY_MS
    );
}

// Static TURN credentials, if configured.
function staticTurnServers() {
    if (!CONFIG.TURN_USERNAME || !CONFIG.TURN_CREDENTIAL) return [];
    return CONFIG.TURN_URLS.map((urls) => ({
        urls,
        username: CONFIG.TURN_USERNAME,
        credential: CONFIG.TURN_CREDENTIAL
    }));
}

// STUN only tells each peer its public address; it cannot punch through a
// symmetric NAT. TURN relays the traffic and is what makes those pairs connect.
async function fetchIceServers() {
    if (!CONFIG.ICE_ENDPOINT) {
        const turn = staticTurnServers();
        if (turn.length) {
            console.log(`ICE: ${turn.length} TURN entries + ${CONFIG.STUN_SERVERS.length} STUN.`);
        } else {
            console.warn('ICE: STUN only, no TURN configured. Players behind a symmetric NAT will not be able to connect.');
        }
        return turn.concat(CONFIG.STUN_SERVERS);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.ICE_ENDPOINT_TIMEOUT_MS);
    try {
        const res = await fetch(CONFIG.ICE_ENDPOINT, {
            cache: 'no-store',
            signal: controller.signal
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        // Accept either a bare object or an array, since the upstream shape has
        // varied between Cloudflare API versions.
        const raw = data.iceServers !== undefined ? data.iceServers : data;
        const servers = (Array.isArray(raw) ? raw : [raw]).filter(
            (s) => s && (s.urls || s.url)
        );

        if (!servers.length) throw new Error('no iceServers in response');
        console.log(`ICE: ${servers.length} entries from credential endpoint.`);
        return servers.concat(CONFIG.STUN_SERVERS);
    } catch (err) {
        console.warn('TURN credential fetch failed, falling back to static/STUN:', err);
        return staticTurnServers().concat(CONFIG.STUN_SERVERS);
    } finally {
        clearTimeout(timer);
    }
}

// Reports how the connection was actually established. 'host' means a direct
// LAN path, 'srflx'/'prflx' means STUN hole-punching worked, and 'relay' means
// TURN was required. If failures correlate with no relay being available, TURN
// is the fix; if connections succeed as srflx, it is not needed.
async function logIceDiagnostics(connection) {
    if (!CONFIG.LOG_ICE_DIAGNOSTICS) return;
    const pc = connection && connection.peerConnection;
    if (!pc || typeof pc.getStats !== 'function') return;

    try {
        const stats = await pc.getStats();
        let pair = null;
        const candidates = new Map();

        stats.forEach((report) => {
            if (report.type === 'local-candidate' || report.type === 'remote-candidate') {
                candidates.set(report.id, report);
            }
            if (report.type === 'candidate-pair' && report.state === 'succeeded' && report.nominated !== false) {
                pair = report;
            }
        });

        if (!pair) {
            console.log('ICE diagnostics: no succeeded candidate pair yet.');
            return;
        }

        const local = candidates.get(pair.localCandidateId);
        const remote = candidates.get(pair.remoteCandidateId);
        const localType = local ? local.candidateType : '?';
        const remoteType = remote ? remote.candidateType : '?';
        const usedRelay = localType === 'relay' || remoteType === 'relay';

        console.log(
            `ICE diagnostics: connected via local=${localType} remote=${remoteType}` +
            (usedRelay ? ' (TURN relay was required)' : ' (direct/STUN path, no relay needed)')
        );
    } catch (err) {
        console.warn('ICE diagnostics unavailable:', err);
    }
}

class TicTacToe {
    constructor() {
        this.peer = null;
        this.conn = null;
        this.myId = null;
        this.hostId = null;
        this.opponentId = null;
        this.mySymbol = null;
        this.currentTurn = null;
        this.board = Array(9).fill('');
        this.gameActive = false;
        this.isHost = false;
        this.myScore = 0;
        this.opponentScore = 0;
        this.targetWins = 1;

        // Set when we are deliberately leaving, so teardown does not get
        // mistaken for a dropped connection.
        this.intentionalExit = false;

        this.sessionToken = null;
        this.iceServers = null;

        this.awayInterval = null;
        this.awayTimeout = null;
        this.heartbeatInterval = null;
        this.lastPongAt = 0;
        this.connectionTimeout = null;
        this.rejoinTimer = null;

        this.joinRetryCount = 0;
        this.idReclaimCount = 0;
        this.serverReconnectCount = 0;
        this.peerReconnectCount = 0;
        this.rejoinAttempts = 0;
        this.lastResyncAt = 0;
        this.restartRequested = false;
        this.pathFailures = 0;

        this.dom = {};
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();

        const joinId = new URLSearchParams(window.location.search).get('join');
        if (joinId) {
            this.hostId = joinId;
            this.sessionToken = this.loadToken(joinId);
            this.showScreen('connecting', 'Connecting to host...');
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

        document.addEventListener('visibilitychange', () => {
            if (this.conn && this.conn.open) {
                this._sendWhenReady(this.conn, {
                    type: MSG_TYPE.VISIBILITY,
                    status: document.hidden ? 'hidden' : 'visible'
                });
            }
        });
    }

    // --- Screens ---

    showScreen(name, message) {
        this.dom.initialScreen.style.display = name === 'initial' ? 'block' : 'none';
        this.dom.waitingScreen.style.display = name === 'waiting' ? 'block' : 'none';
        this.dom.connectingScreen.style.display = name === 'connecting' ? 'block' : 'none';
        this.dom.connectedScreen.style.display = name === 'connected' ? 'block' : 'none';
        if (name === 'connecting' && message) this.dom.connectingText.innerText = message;
    }

    hasGameInProgress() {
        return this.gameActive || this.myScore > 0 || this.opponentScore > 0;
    }

    // --- Session token ---
    // Proves to the host that a reconnecting peer is the same player, so a
    // stranger holding the share link cannot take over a game in progress.

    tokenKey(hostId) {
        return `ttt-token-${hostId}`;
    }

    loadToken(hostId) {
        try {
            return window.localStorage.getItem(this.tokenKey(hostId));
        } catch (e) {
            return null;
        }
    }

    saveToken(hostId, token) {
        try {
            window.localStorage.setItem(this.tokenKey(hostId), token);
        } catch (e) {
            /* private mode, storage full: token simply will not survive a reload */
        }
    }

    newToken() {
        if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
        return 'tok-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }

    // --- Peer lifecycle ---

    async initPeer() {
        if (this.peer) {
            this.peer.removeAllListeners();
            if (!this.peer.destroyed) this.peer.destroy();
        }

        if (!this.iceServers) this.iceServers = await fetchIceServers();

        const peerConfig = {
            config: { iceServers: this.iceServers },
            pingInterval: 5000
        };

        this.peer = this.myId ? new Peer(this.myId, peerConfig) : new Peer(peerConfig);

        this.peer.on('open', (id) => {
            this.myId = id;
            this.idReclaimCount = 0;
            this.serverReconnectCount = 0;
            this.peerReconnectCount = 0;
            console.log('My peer ID is: ' + id);

            this.dom.createGameBtn.disabled = false;
            this.dom.joinGameBtn.disabled = false;

            const joinId = new URLSearchParams(window.location.search).get('join');
            if (joinId) {
                this.dom.joinGameId.value = joinId;
                this.hostId = joinId;
                setTimeout(() => this.joinGame(), 300);
            } else if (this.isHost) {
                this.publishHostLinks();
                if (this.hasGameInProgress()) {
                    this.showScreen('connected');
                    this.dom.status.innerText = 'Waiting for opponent to rejoin...';
                } else {
                    this.showScreen('waiting');
                }
            }
        });

        this.peer.on('connection', (c) => this.handleIncomingConnection(c));

        // PeerJS does NOT reconnect to the signalling server on its own. Without
        // this the host silently stops being joinable while its UI still says
        // it is waiting for an opponent.
        this.peer.on('disconnected', () => {
            if (this.intentionalExit) return;
            if (this.peerReconnectCount >= CONFIG.MAX_PEER_RECONNECTS) {
                console.warn('Giving up reconnecting to the signalling server.');
                return;
            }
            this.peerReconnectCount++;
            const delay = backoffDelay(this.peerReconnectCount);
            console.log(`Disconnected from PeerServer. Reconnecting in ${delay}ms (${this.peerReconnectCount}/${CONFIG.MAX_PEER_RECONNECTS})`);
            setTimeout(() => {
                if (this.peer && !this.peer.destroyed && this.peer.disconnected) {
                    try {
                        this.peer.reconnect();
                    } catch (e) {
                        console.error('reconnect() failed:', e);
                    }
                }
            }, delay);
        });

        this.peer.on('error', (err) => this.handlePeerError(err));
    }

    handlePeerError(err) {
        console.error(err);
        if (this.connectionTimeout) clearTimeout(this.connectionTimeout);

        if (err.type === 'unavailable-id') {
            // The broker still holds our old ID. Retry a bounded number of times,
            // then fall back to a fresh random ID rather than looping forever.
            if (this.idReclaimCount >= CONFIG.MAX_ID_RECLAIM_RETRIES) {
                console.warn('Could not reclaim previous peer ID; taking a new one.');
                this.myId = null;
                this.idReclaimCount = 0;
                if (this.isHost) {
                    this.showScreen('connecting', 'Rebuilding game link...');
                }
                setTimeout(() => this.initPeer(), 500);
                return;
            }
            this.idReclaimCount++;
            this.showScreen('connecting', `Reconnecting... (${this.idReclaimCount}/${CONFIG.MAX_ID_RECLAIM_RETRIES})`);
            setTimeout(() => this.initPeer(), backoffDelay(this.idReclaimCount));
            return;
        }

        if (err.type === 'peer-unavailable') {
            if (this.joinRetryCount < CONFIG.MAX_JOIN_RETRIES) {
                this.joinRetryCount++;
                console.log(`Host unavailable. Retrying... (${this.joinRetryCount})`);
                this.showScreen('connecting', `Connecting to host... (${this.joinRetryCount}/${CONFIG.MAX_JOIN_RETRIES})`);
                setTimeout(() => this.joinGame(), backoffDelay(this.joinRetryCount));
                return;
            }
            this.joinRetryCount = 0;
            alert('The game you are trying to join does not exist or the host is offline.');
            this.leaveToStart();
            return;
        }

        if (err.type === 'network' || err.type === 'server-error') {
            if (this.serverReconnectCount < CONFIG.MAX_SERVER_RECONNECTS) {
                this.serverReconnectCount++;
                this.showScreen('connecting', `Reconnecting to server... (${this.serverReconnectCount}/${CONFIG.MAX_SERVER_RECONNECTS})`);
                setTimeout(() => this.initPeer(), backoffDelay(this.serverReconnectCount));
            } else {
                alert('Could not connect to the server. Please refresh the page to try again.');
            }
            return;
        }

        alert('Connection error: ' + err.type);
        this.showScreen('initial');
    }

    publishHostLinks() {
        this.dom.displayGameId.innerText = this.myId;
        const url = new URL(window.location.href);
        url.searchParams.set('join', this.myId);
        this.dom.shareUrl.innerText = url.toString();
    }

    createGame() {
        this.isHost = true;
        this.hostId = this.myId;
        this.showScreen('waiting');
        this.publishHostLinks();
    }

    joinGame() {
        if (!this.peer || this.peer.destroyed) return;

        const joinId = this.dom.joinGameId.value.trim();
        if (!joinId) return alert('Please enter a Game ID');
        if (joinId === this.myId) return alert('You cannot play with yourself!');

        this.hostId = joinId;
        if (!this.sessionToken) this.sessionToken = this.loadToken(joinId);

        if (this.conn) {
            const stale = this.conn;
            this.conn = null;
            try { stale.close(); } catch (e) { /* already gone */ }
        }

        this.conn = this.peer.connect(joinId, { reliable: true });

        this.conn.on('error', (err) => {
            console.error('Connection error:', err);
            if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
            this.peer.emit('error', { type: 'peer-unavailable' });
        });

        if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
        this.connectionTimeout = setTimeout(() => {
            if (this.conn && !this.conn.open) {
                // Detach before closing, so the close handler does not mistake a
                // failed dial for a dropped game and abort the retry.
                const dead = this.conn;
                const pc = dead.peerConnection;
                // If the host answered our offer, signalling worked and the host
                // is definitely there; the failure is the network path between
                // the two browsers, which is a different problem to report.
                const hostAnswered = !!(pc && pc.remoteDescription);
                this.conn = null;
                try { dead.close(); } catch (e) { /* nothing to close */ }

                if (hostAnswered) {
                    console.log(`Connection timed out with no usable network path (ice=${pc.iceConnectionState}).`);
                    this.handleNoNetworkPath();
                } else {
                    console.log('Connection timed out; host never answered.');
                    this.peer.emit('error', { type: 'peer-unavailable' });
                }
            }
        }, CONFIG.CONNECT_TIMEOUT_MS);

        this.setupConnection(this.conn);

        this.showScreen('connecting',
            `Connecting to host...${this.joinRetryCount > 0 ? ` (${this.joinRetryCount}/${CONFIG.MAX_JOIN_RETRIES})` : ''}`);
    }

    // Signalling reached the host but no media path could be negotiated. This is
    // the symmetric-NAT case: without a TURN relay there is nothing to retry into,
    // so say so honestly instead of blaming the host for being offline.
    handleNoNetworkPath() {
        this.pathFailures++;
        if (this.pathFailures < CONFIG.MAX_PATH_RETRIES) {
            this.showScreen('connecting',
                `Negotiating connection... (${this.pathFailures}/${CONFIG.MAX_PATH_RETRIES})`);
            setTimeout(() => this.joinGame(), backoffDelay(this.pathFailures));
            return;
        }

        const relayConfigured = !!(CONFIG.TURN_USERNAME && CONFIG.TURN_CREDENTIAL) || !!CONFIG.ICE_ENDPOINT;
        alert(
            'Found the game, but could not open a direct connection between the two browsers.\n\n' +
            'This usually happens when one player is on a mobile network, or on a ' +
            'restricted corporate or public Wi-Fi.\n\n' +
            (relayConfigured
                ? 'Try again in a moment, or switch networks.'
                : 'Trying again from ordinary home Wi-Fi usually works.')
        );
        this.leaveToStart();
    }

    // Host side. A newly arriving connection is not trusted until it says HELLO,
    // so we can check its session token before handing over the game.
    handleIncomingConnection(candidate) {
        this.isHost = true;
        if (!this.hostId) this.hostId = this.myId;

        candidate.on('data', (data) => {
            // Any inbound traffic proves the link is alive, not just PONGs.
            this.lastPongAt = Date.now();

            if (this.conn === candidate) {
                this.handleData(data);
                return;
            }
            if (!data || typeof data !== 'object' || data.type !== MSG_TYPE.HELLO) return;

            const gameInProgress = this.hasGameInProgress() && this.sessionToken;
            const tokenMatches = data.token && data.token === this.sessionToken;

            if (gameInProgress && !tokenMatches) {
                console.warn('Rejecting connection from a peer that is not the current opponent.');
                this._sendWhenReady(candidate, { type: MSG_TYPE.GAME_FULL });
                setTimeout(() => {
                    try { candidate.close(); } catch (e) { /* already closed */ }
                }, 300);
                return;
            }

            this.promoteConnection(candidate);
            this.handleData(data);
        });

        candidate.on('close', () => {
            if (this.conn === candidate) this.handleConnectionLost();
        });

        candidate.on('error', (err) => console.error('Incoming connection error:', err));
    }

    promoteConnection(candidate) {
        const previous = this.conn;
        this.conn = candidate;
        this.opponentId = candidate.peer;
        if (previous && previous !== candidate) {
            try { previous.close(); } catch (e) { /* already closed */ }
        }
        this.rejoinAttempts = 0;
        this.startHeartbeat(candidate);
        setTimeout(() => logIceDiagnostics(candidate), 1500);
    }

    setupConnection(connection) {
        connection.on('open', () => {
            if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
            console.log('Connected to: ' + connection.peer);
            this.joinRetryCount = 0;
            this.rejoinAttempts = 0;

            this.startHeartbeat(connection);
            setTimeout(() => logIceDiagnostics(connection), 1500);

            if (!this.isHost) {
                this._sendWhenReady(connection, {
                    type: MSG_TYPE.HELLO,
                    token: this.sessionToken || undefined
                });
            }
        });

        connection.on('data', (data) => {
            this.lastPongAt = Date.now();
            this.handleData(data);
        });

        connection.on('close', () => {
            if (this.conn === connection) this.handleConnectionLost();
        });
    }

    // --- Liveness ---

    startHeartbeat(connection) {
        this.stopHeartbeat();
        this.lastPongAt = Date.now();
        this.heartbeatInterval = setInterval(() => {
            if (!connection || !connection.open) return;

            // A half-open connection (peer's machine slept, network vanished
            // without a FIN) never fires 'close'. Silence is the only signal.
            if (Date.now() - this.lastPongAt > CONFIG.HEARTBEAT_TIMEOUT_MS) {
                console.warn('Heartbeat timed out; treating the connection as dead.');
                this.stopHeartbeat();
                try { connection.close(); } catch (e) { /* already closed */ }
                if (this.conn === connection) this.handleConnectionLost();
                return;
            }
            this._sendWhenReady(connection, { type: MSG_TYPE.PING });
        }, CONFIG.HEARTBEAT_INTERVAL_MS);
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    clearAwayTimers() {
        if (this.awayInterval) { clearInterval(this.awayInterval); this.awayInterval = null; }
        if (this.awayTimeout) { clearTimeout(this.awayTimeout); this.awayTimeout = null; }
    }

    // --- Recovery ---

    handleConnectionLost() {
        if (this.intentionalExit) return;

        this.stopHeartbeat();
        this.clearAwayTimers();
        this.conn = null;

        if (!this.hasGameInProgress()) {
            alert('Connection lost');
            this.leaveToStart();
            return;
        }

        // The game state is worth keeping. The host waits to be rejoined; the
        // guest dials back and resumes from the host's SYNC.
        if (this.isHost) {
            this.showScreen('connected');
            this.dom.status.innerText = 'Opponent disconnected. Waiting for them to rejoin...';
            this.dom.status.style.color = '#dc3545';
            this.dom.restartBtn.disabled = true;
        } else {
            this.attemptRejoin();
        }
    }

    attemptRejoin() {
        if (this.intentionalExit) return;
        if (this.rejoinTimer) clearTimeout(this.rejoinTimer);

        if (this.rejoinAttempts >= CONFIG.MAX_REJOIN_ATTEMPTS) {
            alert('Lost connection to your opponent and could not reconnect.');
            this.leaveToStart();
            return;
        }

        this.rejoinAttempts++;
        const delay = backoffDelay(this.rejoinAttempts);
        this.showScreen('connecting',
            `Connection lost. Reconnecting... (${this.rejoinAttempts}/${CONFIG.MAX_REJOIN_ATTEMPTS})`);

        this.rejoinTimer = setTimeout(() => {
            if (this.intentionalExit) return;
            if (!this.peer || this.peer.destroyed) {
                this.initPeer();
                return;
            }
            if (this.peer.disconnected) {
                try { this.peer.reconnect(); } catch (e) { console.error(e); }
            }
            this.dom.joinGameId.value = this.hostId || '';
            this.joinGame();
        }, delay);
    }

    leaveToStart() {
        this.intentionalExit = true;
        window.location.href = window.location.pathname;
    }

    _sendWhenReady(connection, data) {
        if (!connection) return;
        if (connection.open) {
            try {
                connection.send(data);
            } catch (e) {
                console.error('Failed to send data:', e);
            }
        } else {
            // 'once' so a queued message is not re-sent on every future open.
            connection.once('open', () => {
                try {
                    connection.send(data);
                } catch (e) {
                    console.error('Failed to send data:', e);
                }
            });
        }
    }

    // --- Validation of inbound peer messages ---
    // The opponent is untrusted: a stale, buggy or tampered client can send
    // anything. Reject malformed messages instead of corrupting local state.

    isValidSymbol(symbol) {
        return symbol === 'X' || symbol === 'O';
    }

    isValidMove(data) {
        return (
            Number.isInteger(data.index) &&
            data.index >= 0 &&
            data.index < 9 &&
            this.isValidSymbol(data.symbol) &&
            this.gameActive &&
            this.board[data.index] === '' &&
            // Only the opponent's symbol may arrive over the wire, and only on their turn.
            data.symbol !== this.mySymbol &&
            data.symbol === this.currentTurn
        );
    }

    isValidSyncState(data) {
        return (
            this.isValidSymbol(data.symbol) &&
            this.isValidSymbol(data.currentTurn) &&
            Array.isArray(data.board) &&
            data.board.length === 9 &&
            data.board.every(cell => cell === '' || this.isValidSymbol(cell)) &&
            Number.isInteger(data.targetWins) &&
            data.targetWins > 0 &&
            Number.isInteger(data.myScore) &&
            data.myScore >= 0 &&
            Number.isInteger(data.opponentScore) &&
            data.opponentScore >= 0 &&
            typeof data.gameActive === 'boolean'
        );
    }

    // Rejecting a bad message protects local state, but without this the two
    // sides would stay diverged forever, silently dropping every later move.
    requestResync() {
        const now = Date.now();
        if (now - this.lastResyncAt < CONFIG.RESYNC_THROTTLE_MS) return;
        this.lastResyncAt = now;

        if (this.isHost) {
            console.warn('State mismatch; pushing authoritative state to opponent.');
            this.sendSync();
        } else {
            console.warn('State mismatch; asking host to resync.');
            this._sendWhenReady(this.conn, { type: MSG_TYPE.RESYNC_REQUEST });
        }
    }

    sendSync() {
        if (!this.isHost || !this.conn) return;
        this._sendWhenReady(this.conn, {
            type: MSG_TYPE.SYNC,
            symbol: this.mySymbol === 'X' ? 'O' : 'X',
            targetWins: this.targetWins,
            board: this.board,
            currentTurn: this.currentTurn,
            myScore: this.opponentScore,
            opponentScore: this.myScore,
            gameActive: this.gameActive,
            token: this.sessionToken
        });
    }

    handleData(data) {
        if (!data || typeof data !== 'object') return;

        switch (data.type) {
            case MSG_TYPE.PING:
                this._sendWhenReady(this.conn, { type: MSG_TYPE.PONG });
                break;

            case MSG_TYPE.PONG:
                this.lastPongAt = Date.now();
                break;

            case MSG_TYPE.HELLO: {
                if (!this.isHost) break;
                if (this.hasGameInProgress()) {
                    this.sendSync();
                    this.showScreen('connected');
                    // Only reassert a turn prompt if a game is actually running;
                    // otherwise leave the win/lose/draw text as it stands.
                    if (this.gameActive) this.updateStatus();
                    this.updateButtonState();
                    this.handleVisibilityChange('visible');
                } else {
                    this.sessionToken = this.newToken();
                    this.mySymbol = 'X';
                    this.currentTurn = 'X';
                    const seriesLength = parseInt(this.dom.seriesLength.value, 10) || 1;
                    this.targetWins = Math.ceil(seriesLength / 2);
                    this.startGame();
                    this._sendWhenReady(this.conn, {
                        type: MSG_TYPE.START,
                        symbol: 'O',
                        targetWins: this.targetWins,
                        token: this.sessionToken
                    });
                }
                break;
            }

            case MSG_TYPE.START: {
                if (!this.isValidSymbol(data.symbol) || !Number.isInteger(data.targetWins) || data.targetWins < 1) {
                    console.warn('Ignoring malformed start message', data);
                    break;
                }
                if (data.token) {
                    this.sessionToken = data.token;
                    if (this.hostId) this.saveToken(this.hostId, data.token);
                }
                this.mySymbol = data.symbol;
                this.targetWins = data.targetWins;
                this.currentTurn = 'X';
                this.myScore = 0;
                this.opponentScore = 0;
                this.startGame();
                break;
            }

            case MSG_TYPE.SYNC: {
                if (!this.isValidSyncState(data)) {
                    console.warn('Ignoring malformed sync message', data);
                    break;
                }
                if (data.token) {
                    this.sessionToken = data.token;
                    if (this.hostId) this.saveToken(this.hostId, data.token);
                }
                this.mySymbol = data.symbol;
                this.targetWins = data.targetWins;
                this.board = data.board.slice();
                this.currentTurn = data.currentTurn;
                this.myScore = data.myScore;
                this.opponentScore = data.opponentScore;
                this.gameActive = data.gameActive;

                this.showScreen('connected');
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
            }

            case MSG_TYPE.RESYNC_REQUEST:
                if (this.isHost) this.sendSync();
                break;

            case MSG_TYPE.MOVE:
                if (!this.isValidMove(data)) {
                    console.warn('Ignoring invalid move from opponent', data);
                    this.requestResync();
                    break;
                }
                this.makeMove(data.index, data.symbol);
                break;

            case MSG_TYPE.NEXT_GAME:
                if (!this.isValidSymbol(data.symbol)) {
                    console.warn('Ignoring malformed nextGame message', data);
                    break;
                }
                this.mySymbol = data.symbol;
                this.resetBoard();
                break;

            case MSG_TYPE.REQUEST_NEXT:
                if (this.isHost) this.handleRestart();
                break;

            case MSG_TYPE.RESET_SERIES:
                this.fullReset();
                break;

            case MSG_TYPE.GAME_FULL: {
                this.intentionalExit = true;
                alert('That game already has two players.');
                const url = new URL(window.location.href);
                url.searchParams.delete('join');
                window.location.href = url.toString();
                break;
            }

            case MSG_TYPE.VISIBILITY:
                if (data.status !== 'visible' && data.status !== 'hidden') {
                    console.warn('Ignoring malformed visibility message', data);
                    break;
                }
                this.handleVisibilityChange(data.status);
                break;

            case MSG_TYPE.END_GAME:
                this.intentionalExit = true;
                alert('Opponent ended the game.');
                this.leaveToStart();
                break;
        }
    }

    startGame() {
        this.showScreen('connected');
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

    // The visible glyph is the only thing that says what is in a square, so the
    // accessible name has to carry the same information for anyone who cannot
    // see it, and be refreshed every time the square changes.
    labelCell(cell, index, symbol) {
        const where = `Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}`;
        cell.setAttribute('aria-label', symbol ? `${where}, ${symbol}` : `${where}, empty`);
        cell.setAttribute('aria-disabled', symbol ? 'true' : 'false');
    }

    renderBoard() {
        this.dom.cells.forEach((cell, index) => {
            cell.innerText = this.board[index];
            cell.className = 'cell';
            const symbol = this.board[index];
            if (symbol) cell.classList.add(symbol.toLowerCase(), 'taken');
            this.labelCell(cell, index, symbol);
        });
    }

    updateCell(index, symbol) {
        const cell = this.dom.cells[index];
        if (!cell) return;
        cell.innerText = symbol;
        cell.classList.add(symbol.toLowerCase(), 'taken');
        this.labelCell(cell, index, symbol);
    }

    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '' || this.currentTurn !== this.mySymbol) return;
        if (!this.conn || !this.conn.open) return;

        this.makeMove(index, this.mySymbol);
        this._sendWhenReady(this.conn, { type: MSG_TYPE.MOVE, index: index, symbol: this.mySymbol });
    }

    makeMove(index, symbol) {
        this.board[index] = symbol;
        this.updateCell(index, symbol);

        if (this.checkWin(symbol)) {
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

    checkWin(symbol) {
        return CONFIG.WIN_CONDITIONS.some(condition => {
            return condition.every(index => {
                return this.board[index] === symbol;
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
        const connected = !!(this.conn && this.conn.open);
        this.dom.restartBtn.disabled = this.gameActive || !connected;
        if (this.myScore >= this.targetWins || this.opponentScore >= this.targetWins) {
            this.dom.restartBtn.innerText = 'New Series';
            this.dom.restartBtn.className = 'btn btn-primary mt-4';
        } else {
            this.dom.restartBtn.innerText = 'Next Game';
            this.dom.restartBtn.className = 'btn btn-info mt-4';
        }
    }

    handleRestart() {
        if (!this.conn || !this.conn.open) return;

        if (!this.isHost) {
            // Guard in state, not just on the button: repeated clicks must not
            // queue several requests while we wait for the host to answer.
            if (this.restartRequested) return;
            this.restartRequested = true;
            this.dom.restartBtn.disabled = true;
            this._sendWhenReady(this.conn, { type: MSG_TYPE.REQUEST_NEXT });
            return;
        }

        if (this.myScore >= this.targetWins || this.opponentScore >= this.targetWins) {
            this._sendWhenReady(this.conn, { type: MSG_TYPE.RESET_SERIES });
            this.fullReset();
        } else {
            this.mySymbol = this.mySymbol === 'X' ? 'O' : 'X';
            const opSymbol = this.mySymbol === 'X' ? 'O' : 'X';
            this._sendWhenReady(this.conn, { type: MSG_TYPE.NEXT_GAME, symbol: opSymbol });
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
        this.intentionalExit = true;
        this.stopHeartbeat();
        if (this.conn && this.conn.open) {
            this._sendWhenReady(this.conn, { type: MSG_TYPE.END_GAME });
        }
        // Give the data channel a moment to flush before tearing the page down,
        // otherwise the opponent may never receive the message.
        setTimeout(() => {
            window.location.href = window.location.pathname;
        }, 150);
    }

    fullReset() {
        this.myScore = 0;
        this.opponentScore = 0;
        this.mySymbol = this.isHost ? 'X' : 'O';
        this.resetBoard();
    }

    resetBoard() {
        this.restartRequested = false;
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
            this.clearAwayTimers();
            this.awayTimeout = setTimeout(() => {
                this.dom.opContainer.classList.add('op-away');
                let timeLeft = CONFIG.AWAY_COUNTDOWN_S;
                this.renderAwayLabel(timeLeft);

                if (this.awayInterval) clearInterval(this.awayInterval);
                this.awayInterval = setInterval(() => {
                    timeLeft--;
                    this.renderAwayLabel(timeLeft);
                    if (timeLeft <= 0) {
                        clearInterval(this.awayInterval);
                        this.awayInterval = null;
                        this.intentionalExit = true;
                        if (this.conn) {
                            try { this.conn.close(); } catch (e) { /* already closed */ }
                        }
                        alert('Opponent timed out.');
                        window.location.href = window.location.pathname;
                    }
                }, 1000);
            }, CONFIG.AWAY_GRACE_MS);
        } else {
            this.clearAwayTimers();
            this.dom.opContainer.classList.remove('op-away');
            this.dom.opLabel.innerText = 'Opponent';
        }
    }

    renderAwayLabel(timeLeft) {
        this.dom.opLabel.innerHTML =
            `Opponent <span style="font-size: 0.75em">(Away ${timeLeft}s)</span>`;
    }

    shareGame(platform) {
        const url = encodeURIComponent(this.dom.shareUrl.innerText);
        const text = encodeURIComponent('Join my Tic-Tac-Toe game!');
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
            window.open(shareUrl, '_blank', 'noopener');
        }
    }

    copyToClipboard(element, btn) {
        const text = element.innerText;
        const flash = (label) => {
            if (!btn) return;
            const originalText = btn.innerText;
            btn.innerText = label;
            btn.disabled = true;
            setTimeout(() => {
                btn.innerText = originalText;
                btn.disabled = false;
            }, 2000);
        };

        // navigator.clipboard is undefined on insecure origins, and can reject
        // even where it exists, so both paths need handling.
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            window.prompt('Copy this:', text);
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => flash('Copied!'))
            .catch((err) => {
                console.error('Clipboard write failed:', err);
                window.prompt('Copy this:', text);
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
