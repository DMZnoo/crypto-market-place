// Configure custom chains and active chain
import { Chain } from 'wagmi'

const TENDERLY_TESTNET_V2_RPC_URL =
  'https://virtual.mainnet.rpc.tenderly.co/632f67e9-9709-4fcb-b7d4-6dadb536fdca'
const TENDERLY_TESTNET_V2_CHAIN_ID = 12345
export const tenderlyTestnetV2: Chain = {
  id: TENDERLY_TESTNET_V2_CHAIN_ID,
  name: 'Ion Protocol Testnet V2',
  network: 'Ion',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      // TODO: can this be flashbots instead? Change rpcUrl of mainnet, or just add another chain option that's flashbots?
      http: [TENDERLY_TESTNET_V2_RPC_URL],
    },
    public: {
      http: [TENDERLY_TESTNET_V2_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'Ion Protocol Testnet V2 Explorer',
      url: `https://dashboard.tenderly.co/explorer/vnet/632f67e9-9709-4fcb-b7d4-6dadb536fdca/transactions`,
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  testnet: true,
}
