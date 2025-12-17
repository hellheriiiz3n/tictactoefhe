import hre from "hardhat";
const { ethers } = hre;

/**
 * Скрипт деплоя контрактов для игры в крестики-нолики
 * 
 * Что делает:
 * - Деплоит TicTacToeMock контракт (упрощенная версия без FHEVM)
 * - Деплоит TicTacToeFHE контракт (версия с FHEVM)
 * - Выводит адреса контрактов для добавления в .env
 */
async function main() {
  console.log("Deploying Tic-Tac-Toe contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Деплой Mock контракта
  console.log("\n=== Deploying TicTacToeMock ===");
  const TicTacToeMock = await ethers.getContractFactory("TicTacToeMock");
  const ticTacToeMock = await TicTacToeMock.deploy();
  await ticTacToeMock.waitForDeployment();
  const mockAddress = await ticTacToeMock.getAddress();
  console.log("TicTacToeMock deployed to:", mockAddress);

  // Деплой FHE контракта
  console.log("\n=== Deploying TicTacToeFHE ===");
  const TicTacToeFHE = await ethers.getContractFactory("TicTacToeFHE");
  const ticTacToeFHE = await TicTacToeFHE.deploy();
  await ticTacToeFHE.waitForDeployment();
  const fheAddress = await ticTacToeFHE.getAddress();
  console.log("TicTacToeFHE deployed to:", fheAddress);

  // Сохраняем информацию о деплое
  console.log("\n=== Deployment Info ===");
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("\nContract Addresses:");
  console.log("TicTacToeMock:", mockAddress);
  console.log("TicTacToeFHE:", fheAddress);

  console.log("\n=== Add these to your .env.local file ===");
  console.log(`NEXT_PUBLIC_TICTACTOE_MOCK_ADDRESS=${mockAddress}`);
  console.log(`NEXT_PUBLIC_TICTACTOE_FHE_ADDRESS=${fheAddress}`);

  // Проверяем работоспособность контрактов
  console.log("\n=== Testing Contracts ===");
  
  // Тест Mock контракта
  try {
    const gameId = await ticTacToeMock.createGame();
    const tx = await gameId.wait();
    console.log("✓ TicTacToeMock: createGame() works");
    
    // Получаем gameId из события
    if (tx && tx.logs) {
      const event = tx.logs.find((log: any) => {
        try {
          const parsed = ticTacToeMock.interface.parseLog(log);
          return parsed?.name === 'GameCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = ticTacToeMock.interface.parseLog(event);
        const testGameId = parsed?.args.gameId;
        console.log("✓ TicTacToeMock: Game created with ID", testGameId.toString());
      }
    }
  } catch (error: any) {
    console.error("✗ TicTacToeMock test failed:", error.message);
  }

  // Тест FHE контракта
  try {
    const gameId = await ticTacToeFHE.createGame();
    const tx = await gameId.wait();
    console.log("✓ TicTacToeFHE: createGame() works");
    
    if (tx && tx.logs) {
      const event = tx.logs.find((log: any) => {
        try {
          const parsed = ticTacToeFHE.interface.parseLog(log);
          return parsed?.name === 'GameCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = ticTacToeFHE.interface.parseLog(event);
        const testGameId = parsed?.args.gameId;
        console.log("✓ TicTacToeFHE: Game created with ID", testGameId.toString());
      }
    }
  } catch (error: any) {
    console.error("✗ TicTacToeFHE test failed:", error.message);
  }

  console.log("\n=== Deployment Complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

