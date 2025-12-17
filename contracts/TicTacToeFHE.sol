// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Импортируем библиотеку FHEVM от Zama
// В реальном проекте это будет импорт из установленного пакета
// import {FHE} from "fhevm/contracts/FHE.sol";

/**
 * @title TicTacToeFHE
 * @dev Контракт для игры в крестики-нолики с использованием FHEVM от Zama
 * 
 * КАК ЭТО РАБОТАЕТ:
 * - Ходы игроков хранятся в зашифрованном виде (euint8)
 * - Проверка победы происходит на зашифрованных данных
 * - Никто не может увидеть ходы противника до конца игры
 * - Использует релеер Zama для обработки FHE операций
 * 
 * ВАЖНО: Этот контракт требует настройки FHEVM библиотеки и релеера
 * Для работы нужны:
 * - Host contract адрес (ACL contract)
 * - KMS contract адрес
 * - Input verifier contract адрес
 * - Релеер URL
 * 
 * ПРИМЕЧАНИЕ: Это упрощенная версия. В реальном проекте нужно:
 * - Правильно настроить ACL для каждого зашифрованного значения
 * - Использовать fromExternal для валидации входных данных
 * - Правильно обрабатывать attestation от релеера
 */
contract TicTacToeFHE {
    // ВАЖНО: В реальном проекте здесь будет импорт FHE библиотеки
    // import {FHE, euint8, ebool} from "fhevm/contracts/FHE.sol";
    
    // Структура игры с зашифрованными данными
    struct Game {
        address player1;           // Игрок X (начинает первым)
        address player2;           // Игрок O
        address currentPlayer;      // Текущий игрок
        bytes32[9] encryptedBoard; // Зашифрованное поле (bytes32 = handle для euint8)
        bool isActive;             // Игра активна?
        address winner;            // Победитель (раскрывается только в конце)
        uint256 createdAt;         // Время создания
        uint8 moveCount;           // Счетчик ходов (для проверки ничьей)
    }

    // Маппинг: gameId => Game
    mapping(uint256 => Game) public games;
    
    // Счетчик игр
    uint256 public gameCounter;
    
    // Маппинг для отслеживания активных игр
    mapping(address => uint256[]) public playerActiveGames;

    // События
    event GameCreated(uint256 indexed gameId, address indexed player1, address indexed player2);
    event MoveMade(uint256 indexed gameId, address indexed player, uint8 position);
    event GameEnded(uint256 indexed gameId, address indexed winner);
    event PlayerJoined(uint256 indexed gameId, address indexed player2);
    event WinnerRevealed(uint256 indexed gameId, address indexed winner);

    /**
     * @dev Создать новую игру
     * @return gameId ID созданной игры
     * 
     * Функция:
     * - Создает новую игру с вызывающим адресом как player1
     * - Инициализирует пустое зашифрованное поле
     * - player2 должен присоединиться позже
     */
    function createGame() external returns (uint256) {
        uint256 gameId = gameCounter;
        
        // Инициализируем пустое поле (все handles = 0)
        bytes32[9] memory emptyBoard;
        
        games[gameId] = Game({
            player1: msg.sender,
            player2: address(0),
            currentPlayer: msg.sender,
            encryptedBoard: emptyBoard,
            isActive: true,
            winner: address(0),
            createdAt: block.timestamp,
            moveCount: 0
        });
        
        gameCounter++;
        playerActiveGames[msg.sender].push(gameId);
        
        emit GameCreated(gameId, msg.sender, address(0));
        return gameId;
    }

    /**
     * @dev Присоединиться к существующей игре как player2
     * @param gameId ID игры
     */
    function joinGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.isActive, "Game is not active");
        require(game.player2 == address(0), "Game already has two players");
        require(game.player1 != msg.sender, "Cannot join your own game");
        
        game.player2 = msg.sender;
        playerActiveGames[msg.sender].push(gameId);
        
        emit PlayerJoined(gameId, msg.sender);
    }

    /**
     * @dev Сделать зашифрованный ход
     * @param gameId ID игры
     * @param position Позиция на поле (0-8)
     * @param encryptedMove Зашифрованный ход (euint8 handle в виде bytes32)
     * @param attestation Аттестация от релеера (для валидации)
     * 
     * Функция:
     * - Принимает зашифрованный ход от игрока
     * - Валидирует его через attestation
     * - Сохраняет в зашифрованном виде на поле
     * - Проверяет победу на зашифрованных данных (через релеер)
     * 
     * ВАЖНО: В реальной реализации нужно:
     * 1. Использовать FHE.fromExternal для валидации encryptedMove
     * 2. Проверять ACL права
     * 3. Использовать FHE операции для проверки победы
     */
    function makeMove(
        uint256 gameId,
        uint8 position,
        bytes32 encryptedMove,
        bytes calldata attestation
    ) external {
        require(position < 9, "Invalid position");
        
        Game storage game = games[gameId];
        require(game.isActive, "Game is not active");
        require(game.player2 != address(0), "Waiting for second player");
        require(game.currentPlayer == msg.sender, "Not your turn");
        require(game.encryptedBoard[position] == bytes32(0), "Position already taken");
        
        // В реальной реализации здесь будет:
        // euint8 move = FHE.fromExternal(encryptedMove, attestation);
        // FHE.allow(move, address(this)); // Даем контракту доступ
        
        // Сохраняем зашифрованный ход
        game.encryptedBoard[position] = encryptedMove;
        game.moveCount++;
        
        // В реальной реализации проверка победы будет происходить через релеер:
        // ebool hasWon = checkWinnerFHE(game.encryptedBoard, msg.sender == game.player1);
        // Релеер обработает это и вернет результат
        
        // Для упрощения: если сделано 9 ходов, игра заканчивается ничьей
        if (game.moveCount >= 9) {
            game.isActive = false;
            emit GameEnded(gameId, address(0));
        } else {
            // Переключаем очередь
            game.currentPlayer = (game.currentPlayer == game.player1) 
                ? game.player2 
                : game.player1;
        }
        
        emit MoveMade(gameId, msg.sender, position);
    }

    /**
     * @dev Раскрыть победителя (вызывается после проверки через релеер)
     * @param gameId ID игры
     * @param winner Адрес победителя
     * 
     * ВАЖНО: В реальной реализации эта функция будет вызываться релеером
     * после обработки FHE проверки победы. Релеер расшифрует результат
     * и вызовет эту функцию для финализации игры.
     */
    function revealWinner(uint256 gameId, address winner) external {
        Game storage game = games[gameId];
        require(game.isActive, "Game is not active");
        // В реальной реализации здесь будет проверка подписи от релеера
        
        game.winner = winner;
        game.isActive = false;
        
        emit WinnerRevealed(gameId, winner);
        emit GameEnded(gameId, winner);
    }

    /**
     * @dev Получить информацию об игре (без расшифровки ходов)
     * @param gameId ID игры
     * @return player1 Адрес первого игрока
     * @return player2 Адрес второго игрока
     * @return currentPlayer Текущий игрок
     * @return isActive Активна ли игра
     * @return winner Победитель
     * @return moveCount Количество сделанных ходов
     */
    function getGame(uint256 gameId) external view returns (
        address player1,
        address player2,
        address currentPlayer,
        bool isActive,
        address winner,
        uint8 moveCount
    ) {
        Game memory game = games[gameId];
        return (
            game.player1,
            game.player2,
            game.currentPlayer,
            game.isActive,
            game.winner,
            game.moveCount
        );
    }

    /**
     * @dev Получить зашифрованное поле (только handles, не расшифрованные значения)
     * @param gameId ID игры
     * @return encryptedBoard Массив зашифрованных ходов
     */
    function getEncryptedBoard(uint256 gameId) external view returns (bytes32[9] memory) {
        return games[gameId].encryptedBoard;
    }

    /**
     * @dev Получить активные игры игрока
     * @param player Адрес игрока
     * @return activeGames Массив ID активных игр
     */
    function getPlayerActiveGames(address player) external view returns (uint256[] memory) {
        return playerActiveGames[player];
    }

    /**
     * @dev Проверить, является ли адрес победителем
     * @param gameId ID игры
     * @param player Адрес игрока
     * @return isWinner true если игрок победил
     */
    function isWinner(uint256 gameId, address player) external view returns (bool) {
        Game memory game = games[gameId];
        return game.winner == player;
    }
}

