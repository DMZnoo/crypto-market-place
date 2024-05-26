import { Chain, mainnet } from 'wagmi'
import { tenderlyTestnetV2 } from './chain'
import { IAsset, WstETH } from './utils/asset'

export const DEBOUNCE_TIME = 1000

interface Tokens {
  index: number
  name: String
  description: String
  address: String
  joinAddress: String
}

interface TokensConfig {
  [chain: string]: {
    [token: string]: Tokens
  }
}

// For collateral types
// Define the assets as a const assertion
export const allAssets = [
  'wstETH',
  'weETH',
  'ezETH',
  'rsETH',
  'rswETH',
] as const

// Derive the Asset type from the allAssets array
export type Asset = (typeof allAssets)[number]

// export type Asset =
//   | 'wstETH'
//   | 'weETH'
//   | 'ezETH'
//   | 'rsETH'
//   | 'rswETH'

// For all types of tokens
export type Token = Asset | 'WETH'

export type Market = {
  collateralAsset: Asset
  lenderAsset: Asset
  mintAsset: Token
  ionPool: string
  liquidation: string
  yieldOracle: string
  interestRate: string
  whitelist: string
  spotOracle: string
  reserveOracle: string
  gemJoin: string
  genericHandler: string
  uniswapFlashswapHandler?: string
}

export type Markets = {
  [chainId: number]: Market[]
}

export const assetClassMap: { [K in Asset]?: IAsset } = {
  wstETH: new WstETH(),
  // 'weETH': new WeETH()
}

// configure for allowing multiple chain selection for dev environments
export const chainsToShow: Chain[] = [
  {
    ...mainnet,
  },
]

if (process.env.NEXT_PUBLIC_SHOW_TESTNET)
  chainsToShow.push({ ...tenderlyTestnetV2 })

export const targetChainId = 1

export const tokenAddresses = {
  weETH: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
  eETH: '0x35fA164735182de50811E8e2E824cFb9B6118ac2',
  wstETH: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  rsETH: '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7',
  ezETH: '',
  rswETH: '',
}

// Ion Protocol contract addresses for each marketId
// index by markets[chainId][marketId]
export const markets: Markets = {
  1: [
    {
      collateralAsset: 'weETH',
      lenderAsset: 'wstETH',
      mintAsset: 'WETH',
      ionPool: '0x0000000000eaEbd95dAfcA37A39fd09745739b78',
      liquidation: '0x00000000002Ddfa58A917ee47c5BbB909A2227C4',
      yieldOracle: '0x437CC840e234C2127f54CD59B0B18aF59c586760',
      interestRate: '0x184Cbe1CeF3452A66C4D09Ba30E1ff5d92A3229B',
      whitelist: '0x7E317f99aA313669AaCDd8dB3927ff3aCB562dAD',
      reserveOracle: '0x78C3ac7F84F5101422DCd89fB387bD0DeEf8d662',
      spotOracle: '0x915fCAd286A194A2B9a63BEe18b30b1C8d6a9ecD',
      gemJoin: '0x3f6119B0328C27190bE39597213ea1729f061876',
      genericHandler: '0xAB3c6236327FF77159B37f18EF85e8AC58034479',
      uniswapFlashswapHandler: '0xAB3c6236327FF77159B37f18EF85e8AC58034479',
    },
    // {
    //   collateralAsset: 'rsETH',
    //   lenderAsset: 'wstETH',
    //   mintAsset: 'WETH',
    //   ionPool: '0x0000000000E33e35EE6052fae87bfcFac61b1da9',
    //   liquidation: '0x00000000009dcfc65Db1b3E209988C7B7846Fe87',
    //   yieldOracle: '0x437CC840e234C2127f54CD59B0B18aF59c586760',
    //   interestRate: '0x184Cbe1CeF3452A66C4D09Ba30E1ff5d92A3229B',
    //   whitelist: '0x7E317f99aA313669AaCDd8dB3927ff3aCB562dAD',
    //   reserveOracle: '0x095FE689AFC3e57bb32Bc06Fd45aD2382f47e2fd',
    //   spotOracle: '0xa15D359d89fDD225c51c22794D6875A563629F30',
    //   gemJoin: '0x3bC3AC09d1ee05393F2848d82cb420f347954432',
    //   genericHandler: '0x335FBFf118829Aa5ef0ac91196C164538A21a45A',
    //   uniswapFlashswapHandler: '0x335FBFf118829Aa5ef0ac91196C164538A21a45A',
    // },
  ],
  12345: [
    {
      collateralAsset: 'weETH',
      lenderAsset: 'wstETH',
      mintAsset: 'WETH',
      ionPool: '0xde38E25eb464540808c900E86A25ba420Eeba0Fb',
      liquidation: '0xfD243ee6cb48AF82426fe33d51aDBF1D9b5219E8',
      yieldOracle: '0xD05a78fE192e2bb8409841f1E9E1ff26600a9d7e',
      interestRate: '0xDdec865ff068AE0927F7C1EB6B5Da63a66c2B1A9',
      whitelist: '0xD00b3a59c362bFC5aCE719e12C6BD95E0Bc0BE5F',
      reserveOracle: '0x6d1e8Bc3922918972b4EdA32b86ed551c332303d',
      spotOracle: '0x40f5CCdfe546c417e42dFbe33144C4FD3De039AF',
      gemJoin: '0xad227Db60B0c0FA6fE5103922f86154cDF0CE32e',
      genericHandler: '0x2fF1C83aC056E50492e68bE7b643Ac229567E125',
      uniswapFlashswapHandler: '0x2fF1C83aC056E50492e68bE7b643Ac229567E125',
    },
    // {
    //   collateralAsset: 'rsETH',
    //   lenderAsset: 'wstETH',
    //   mintAsset: 'WETH',
    //   ionPool: '0x2f61228187f93A61171A32E5fB528F539ca0F711',
    //   liquidation: '0x6ABE91cc405aF1fF18D2b306053b8dD2fB4e9B4F',
    //   yieldOracle: '0x0d30C72AAC64DCD604d10C4f54d682b9a64EC838',
    //   interestRate: '0xF1cbdf4874c791Ec7EfB88DCb916ccEF7764B1f5',
    //   whitelist: '0x5b2cFf2C23D49018c69B666745e1b573a9fa1a7b',
    //   gemJoin: '0x0f4b2438BF62F58E98d4956D7aAb228634546812',
    //   reserveOracle: '0x8A01f5e7dCbC11080e671F16fA3D1de99044E239',
    //   spotOracle: '0x8383bCd44F8ce6856209Fb206155fe7Abbe72ad1',
    //   genericHandler: '0xA6B0Ad3cF650921eccBfD8928D741091A219ab85',
    //   uniswapFlashswapHandler: '0xA6B0Ad3cF650921eccBfD8928D741091A219ab85',
    // },
  ],
}

// Non-ion mainnet addresses
// Same across different chains because testnet and mainnet are both mainnet forks
export const contractAddresses = {
  nativeEth: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  // For weETH
  etherFiLiquidityPool: '0x308861A430be4cce5502d0A12724771Fc6DaF216',
  wEth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  // For rsETH
  rsEthLrtOracle: '0x349A73444b1a310BAe67ef67973022020d70020d',
  rsEthLrtDepositPool: '0x036676389e48133B63a802f8635AD39E752D375D',

  wstEth: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  weETH: '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',

  uniswapPoolFactory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',

  uniswapQuoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',

  wstEthBalancerPoolId:
    '0x93d199263632a4ef4bb438f1feb99e57b4b5f0bd0000000000000000000005c2',
  wstEthBalancerPool: '0x93d199263632a4EF4Bb438F1feB99e57b4b5f0BD',
  wstEthUniswapPool: '0x109830a1AAaD605BbF02a9dFA7B0B92EC2FB7dAa',
  swEthBalancerPoolId:
    '0xe7e2c68d3b13d905bbb636709cf4dfd21076b9d20000000000000000000005ca',
  swEthBalancerPool: '0xE7e2c68d3b13d905BBb636709cF4DfD21076b9D2',

  chainlink: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
}
