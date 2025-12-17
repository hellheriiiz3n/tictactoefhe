// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TicTacToeMock
 * @dev Мок контракт для игры в крестики-нолики БЕЗ использования FHEVM
 * Это упрощенная версия для тестирования логики игры
 * 
 * Как работает:
 * - Два игрока играют на поле 3x3
 * - Игрок 1 (X) начинает первым
 * - Игрок 2 (O) ходит вторым
 * - Победа определяется по стандартным правилам (3 в ряд)
 * - Все ходы хранятся в открытом виде (не зашифрованы)
 */
contract TicTacToeMock {
    // Структура игры
    struct Game {
        address player1;      // Игрок X (начинает первым)
        address player2;      // Игрок O
        address currentPlayer; // Текущий игрок, который должен ходить
        uint8[9] board;       // Поле 3x3 (0 = пусто, 1 = X, 2 = O)
        bool isActive;        // Игра активна?
        address winner;       // Победитель (address(0) если ничья или игра не закончена)
        uint256 createdAt;   // Время создания игры
    }

    // Маппинг: gameId => Game
    mapping(uint256 => Game) public games;
    
    // Счетчик игр
    uint256 public gameCounter;
    
    // Маппинг для отслеживания активных игр игрока
    mapping(address => uint256[]) public playerActiveGames;

    // События
    event GameCreated(uint256 indexed gameId, address indexed player1, address indexed player2);
    event MoveMade(uint256 indexed gameId, address indexed player, uint8 position, uint8 symbol);
    event GameEnded(uint256 indexed gameId, address indexed winner);
    event PlayerJoined(uint256 indexed gameId, address indexed player2);

    /**
     * @dev Создать новую игру
     * @return gameId ID созданной игры
     * 
     * Функция:
     * - Создает новую игру с вызывающим адресом как player1
     * - Инициализирует пустое поле
     * - player2 должен присоединиться позже через joinGame
     */
    function createGame() external returns (uint256) {
        uint256 gameId = gameCounter;
        
        games[gameId] = Game({
            player1: msg.sender,
            player2: address(0),
            currentPlayer: msg.sender,
            board: [uint8(0), 0, 0, 0, 0, 0, 0, 0, 0],
            isActive: true,
            winner: address(0),
            createdAt: block.timestamp
        });
        
        gameCounter++;
        playerActiveGames[msg.sender].push(gameId);
        
        emit GameCreated(gameId, msg.sender, address(0));
        return gameId;
    }

    /**
     * @dev Присоединиться к существующей игре как player2
     * @param gameId ID игры, к которой хотим присоединиться
     * 
     * Функция:
     * - Позволяет второму игроку присоединиться к игре
     * - Проверяет, что игра существует и player2 еще не присоединился
     * - Нельзя присоединиться к своей же игре
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
     * @dev Сделать ход
     * @param gameId ID игры
     * @param position Позиция на поле (0-8, где 0 = верхний левый, 8 = нижний правый)
     * 
     * Функция:
     * - Проверяет, что игра активна и это ваш ход
     * - Проверяет, что позиция свободна
     * - Ставит ваш символ (X или O) на поле
     * - Проверяет победу после хода
     * - Переключает очередь на другого игрока
     * 
     * Позиции на поле:
     * 0 | 1 | 2
     * ---------
     * 3 | 4 | 5
     * ---------
     * 6 | 7 | 8
     */
    function makeMove(uint256 gameId, uint8 position) external {
        require(position < 9, "Invalid position");
        
        Game storage game = games[gameId];
        require(game.isActive, "Game is not active");
        require(game.player2 != address(0), "Waiting for second player");
        require(game.currentPlayer == msg.sender, "Not your turn");
        require(game.board[position] == 0, "Position already taken");
        
        // Определяем символ игрока (1 = X, 2 = O)
        uint8 symbol = (msg.sender == game.player1) ? 1 : 2;
        game.board[position] = symbol;
        
        // Проверяем победу
        address winnerCheck = checkWinner(game.board);
        if (winnerCheck != address(0)) {
            // Есть победитель - определяем кто именно
            game.winner = msg.sender; // Текущий игрок победил
            game.isActive = false;
            emit GameEnded(gameId, msg.sender);
        } else if (isBoardFull(game.board)) {
            // Ничья
            game.isActive = false;
            emit GameEnded(gameId, address(0));
        } else {
            // Переключаем очередь
            game.currentPlayer = (game.currentPlayer == game.player1) 
                ? game.player2 
                : game.player1;
        }
        
        emit MoveMade(gameId, msg.sender, position, symbol);
    }

    /**
     * @dev Проверить победителя
     * @param board Текущее состояние поля
     * @return winner Адрес победителя (address(0) если нет победителя)
     * 
     * Проверяет все возможные комбинации для победы:
     * - Горизонтальные линии (3 ряда)
     * - Вертикальные линии (3 столбца)
     * - Диагонали (2 диагонали)
     */
    function checkWinner(uint8[9] memory board) internal pure returns (address) {
        // Проверяем все возможные комбинации для победы
        // Массив из 8 линий, каждая содержит 3 позиции
        uint8[3][8] memory lines = [
            [uint8(0), 1, 2], // Верхняя горизонталь
            [uint8(3), 4, 5], // Средняя горизонталь
            [uint8(6), 7, 8], // Нижняя горизонталь
            [uint8(0), 3, 6], // Левая вертикаль
            [uint8(1), 4, 7], // Средняя вертикаль
            [uint8(2), 5, 8], // Правая вертикаль
            [uint8(0), 4, 8], // Главная диагональ
            [uint8(2), 4, 6]  // Побочная диагональ
        ];
        
        for (uint i = 0; i < 8; i++) {
            uint8 a = lines[i][0];
            uint8 b = lines[i][1];
            uint8 c = lines[i][2];
            
            if (board[a] != 0 && board[a] == board[b] && board[b] == board[c]) {
                // Есть победитель - возвращаем специальное значение
                // В makeMove мы определим, кто именно победил
                return address(1); // Временное значение, указывающее на победу
            }
        }
        
        return address(0);
    }

    /**
     * @dev Проверить, заполнено ли поле (ничья)
     * @param board Текущее состояние поля
     * @return full true если все клетки заняты
     */
    function isBoardFull(uint8[9] memory board) internal pure returns (bool) {
        for (uint i = 0; i < 9; i++) {
            if (board[i] == 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev Получить информацию об игре
     * @param gameId ID игры
     * @return player1 Адрес первого игрока
     * @return player2 Адрес второго игрока
     * @return currentPlayer Текущий игрок
     * @return board Состояние поля
     * @return isActive Активна ли игра
     * @return winner Победитель
     */
    function getGame(uint256 gameId) external view returns (
        address player1,
        address player2,
        address currentPlayer,
        uint8[9] memory board,
        bool isActive,
        address winner
    ) {
        Game memory game = games[gameId];
        return (
            game.player1,
            game.player2,
            game.currentPlayer,
            game.board,
            game.isActive,
            game.winner
        );
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
     * @dev Проверить, является ли адрес победителем в игре
     * @param gameId ID игры
     * @param player Адрес игрока
     * @return isWinner true если игрок победил
     */
    function isWinner(uint256 gameId, address player) external view returns (bool) {
        Game memory game = games[gameId];
        return game.winner == player;
    }
}

