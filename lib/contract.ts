import { ethers } from 'ethers'
import { CHAT_ROOM_ABI } from './contractABI'

// contract address on sepolia
export const CHAT_CONTRACT_ADDRESS = 
  process.env.NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS || 
  '0xb3Bb917C435D3c14DD84b85993Cd6561def9F782'

// make sure address is valid (only in browser/client, not during build)
if (typeof window !== 'undefined') {
  if (!CHAT_CONTRACT_ADDRESS || !ethers.isAddress(CHAT_CONTRACT_ADDRESS)) {
    console.error('Invalid contract address:', CHAT_CONTRACT_ADDRESS)
    // Don't throw during build, just log
  }
}

export const getChatContract = (signer: ethers.Signer) => {
  if (!CHAT_CONTRACT_ADDRESS) {
    throw new Error('Contract address is not configured')
  }
  return new ethers.Contract(CHAT_CONTRACT_ADDRESS, CHAT_ROOM_ABI, signer)
}

export const getChatContractReadOnly = (provider: ethers.Provider) => {
  if (!CHAT_CONTRACT_ADDRESS) {
    throw new Error('Contract address is not configured')
  }
  return new ethers.Contract(CHAT_CONTRACT_ADDRESS, CHAT_ROOM_ABI, provider)
}

