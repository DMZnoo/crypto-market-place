import { contractAddresses, markets, tokenAddresses } from '@/config'
import UniswapFlashswapDirectMintHandler from '@/contracts/UniswapFlashswapDirectMintHandler.json'
import { HandleSendTransaction } from '@/hooks/useTransaction'
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json'
import { FeeAmount } from '@uniswap/v3-sdk'
import { Abi } from 'viem'
import { WeETH } from '../asset'
import { checkAllowance, checkOperator } from '../contract'
import { WAD, strToBigInt } from '../number'

export enum Strategies {
  UniswapFlashswap = 'Uniswap Flashswap',
  BalancerFlashloanCollateralDirectMint = 'Balancer Flashloan Collateral + Direct Mint',
  BalancerFlashloanWethDirectMint = 'Balancer Flashloan WETH + Direct Mint',
  UniswapFlashswapDirectMint = 'Uniswap Flashswap + Direct Mint',
}

export enum QUOTE {
  EXACT_OUT = 'quoteExactOutputSingle',
  EXACT_IN = 'quoteExactInputSingle',
}

interface IStrategy {
  calculateCostOfCapital: (
    initialDeposit: bigint,
    resultingAdditionalCollateral: bigint,
    lenderAsset: `0x${string}`,
    mintAsset: `0x${string}`
  ) => Promise<bigint>
  executeLeverage: (leverageUserInput: LeverageUserInput) => void
  handleSendTransaction: HandleSendTransaction
  setCalculateCostOfCapitalLoading: React.Dispatch<
    React.SetStateAction<boolean>
  >
}

interface IAssetStrategyRouter {
  chooseRoute: () => Strategies
}

export type LeverageUserInput = {
  initialDeposit: bigint
  resultingAdditionalDeposit: bigint
  estAdditionalDebt: bigint //
  slippageTolerance: number // gets applied to estAdditionalDebt
  proof: string[]
}

export abstract class UniswapFlashswapDirectMint implements IStrategy {
  public route: Strategies
  public client: any
  private marketId: number
  private chainId: number
  private sender: string
  handleSendTransaction: HandleSendTransaction
  setCalculateCostOfCapitalLoading: React.Dispatch<
    React.SetStateAction<boolean>
  >

  constructor(
    sender: string,
    marketId: number,
    chainId: number,
    client: any,
    handleSendTransaction: HandleSendTransaction,
    setCalculateCostOfCapitalLoading: React.Dispatch<
      React.SetStateAction<boolean>
    >
  ) {
    this.client = client
    this.marketId = marketId
    this.chainId = chainId
    this.sender = sender
    this.handleSendTransaction = handleSendTransaction
    this.setCalculateCostOfCapitalLoading = setCalculateCostOfCapitalLoading
    this.route = Strategies.UniswapFlashswapDirectMint
  }

  async quoteUniswapExactSingle(
    tokenIn: `0x${string}`,
    tokenOut: `0x${string}`,
    feeAmount: FeeAmount,
    quote: QUOTE,
    exactAmount: bigint
  ): Promise<bigint | null> {
    try {
      const result = (await this.client.readContract({
        abi: Quoter.abi,
        address: contractAddresses.uniswapQuoter as `0x${string}`,
        functionName: quote,
        args: [
          tokenIn,
          tokenOut,
          feeAmount,
          exactAmount, // exact mintAssetAmount to buy using borrowAssetAmoount
          0, // sqrtPriceLimitX96
        ],
      })) as bigint
      return result
    } catch (e) {
      return null
    }
  }

  /**
   * Get amount of collateral that can be acquired from
   * additional debt.
   * 1. Get exact mintAsset out from lenderAsset in (Uniswap)
   * 2. Get exact collateralAsset out from mintAsset in (Provider)
   */
  async calculateCollateralAmountFromCost(
    borrowAmount: bigint,
    lenderAsset: `0x${string}`,
    mintAsset: `0x${string}`
  ): Promise<bigint | null> {
    const tokenIn = lenderAsset
    const tokenOut = mintAsset
    const feeAmount = FeeAmount.LOWEST
    const quote = QUOTE.EXACT_IN

    const mintAssetAmountOut = await this.quoteUniswapExactSingle(
      tokenIn,
      tokenOut,
      feeAmount,
      quote,
      borrowAmount // amountIn
    )

    if (mintAssetAmountOut === null) {
      // TODO: Set error modal and tell user to
      // try the inputs again
      // "Failed to fetch price from Uniswap. Please try again"
      return null
    }

    // TODO: Should instantiate class based on what
    // the collateral asset is
    const asset = new WeETH(this.client)
    // mintAsset to collateralAsset
    try {
      return await this.getCollateralAssetOutForMintAssetIn(mintAssetAmountOut)
    } catch (e) {
      throw e
    }
  }

  /**
   * 1. get ETH amount in for LRT amount out
   * amountIn = lrtAmount * totalPooledEther / totalShares + 1
   * amountIn = amountforShare(share) + 1
   * 2. get wstETH in for ETH amount out on Uniswap quoter
   * Returns the cost of capital denominated in the lender asset
   * @param client
   * @param initialDeposit
   * @param resultingAdditionalCollateral initialDeposit * leverageMultiplier
   */
  async calculateCostOfCapital(
    initialDeposit: bigint,
    resultingAdditionalCollateral: bigint,
    lenderAsset: `0x${string}`,
    mintAsset: `0x${string}`
  ): Promise<bigint> {
    this.setCalculateCostOfCapitalLoading(true)

    const leverageCollateralAmount =
      resultingAdditionalCollateral - initialDeposit

    // buying ETH with wstETH
    const tokenIn = lenderAsset // lender asset
    const tokenOut = mintAsset // mint asset
    const feeAmount = FeeAmount.LOWEST

    let mintAssetAmount: bigint // asset you are purchasing and using to mint the collateral asset
    try {
      mintAssetAmount = await this.getMintAssetInForCollateralAssetOut(
        leverageCollateralAmount
      )
    } catch (e) {
      throw e
    }

    let lenderAssetAmount: bigint // extra debt taken on in terms of lender asset
    try {
      if (mintAssetAmount === BigInt(0)) {
        lenderAssetAmount = BigInt(0)
      } else {
        const result = (await this.client.readContract({
          abi: Quoter.abi,
          address: contractAddresses.uniswapQuoter as `0x${string}`,
          functionName: 'quoteExactOutputSingle',
          args: [
            tokenIn,
            tokenOut,
            feeAmount,
            mintAssetAmount, // exact mintAssetAmount to buy using borrowAssetAmoount
            0, // sqrtPriceLimitX96
          ],
        })) as bigint
        lenderAssetAmount = result
      }
    } catch (e) {
      const error = new Error(
        'calculateCostOfCapital quoteExactOutputSingle error'
      )
      error.cause = e
      throw error
    }
    this.setCalculateCostOfCapitalLoading(false)
    return lenderAssetAmount
  }

  /**
   * Virtual function that needs to be overriden.
   * Returns the amount of mint asset required to get
   * a specific amount of collateral asset out.
   * @returns
   */
  abstract getMintAssetInForCollateralAssetOut(
    amountOut: bigint
  ): Promise<bigint>

  /**
   * Virtual function that needs to be overridden.
   * Returns the amount of collateral asset minted from
   * depositing a specified mint asset amount.
   */
  abstract getCollateralAssetOutForMintAssetIn(
    amountIn: bigint
  ): Promise<bigint>

  /**
   *
   * @param props Vi
   * @returns
   */

  async executeLeverage(props: LeverageUserInput) {
    if (props.resultingAdditionalDeposit < props.initialDeposit) {
      return false
    }

    // default deadline 24 hours
    // TODO: Handle error when deadline is past
    const unixTimestampInSeconds = Math.floor(Date.now() / 1000)
    const secondsInADay = 86400
    const deadline = unixTimestampInSeconds + secondsInADay

    const slippagePercBigInt = strToBigInt(
      props.slippageTolerance.toString(),
      18
    )
    // 0.01
    // 10000000000000000n
    const maxResultingDebt =
      (props.estAdditionalDebt * (WAD + slippagePercBigInt)) / WAD

    const contractAddress =
      markets[this.chainId][this.marketId].uniswapFlashswapHandler

    // Example array of strings you want to convert
    // const strings = ['hello', 'world', 'example'];
    // Convert each string to bytes32
    // const bytes32Array = strings.map(s => ethers.utils.formatBytes32String(s));
    const args = [
      props.initialDeposit,
      props.resultingAdditionalDeposit,
      maxResultingDebt,
      deadline,
      props.proof,
    ]
    // 1782554736340693532n

    // 1000000000000000000n
    // 3000000000000000000n
    // 1800380283704100467n
    // repaymentAmount
    // 2061676113565978715n
    const collateralAsset = markets[this.chainId][this.marketId].collateralAsset
    const collateralAssetAddr = tokenAddresses[collateralAsset]
    const ionPoolAddr = markets[this.chainId][this.marketId].ionPool

    // TODO: if any of the transactions fail or are rejected, should
    // revert the flow
    // Each handleSendTransaction will handle errors separately
    // but this needs to abandon flow
    try {
      await checkAllowance(
        this.handleSendTransaction,
        this.client,
        this.sender,
        collateralAssetAddr,
        contractAddress!,
        props.initialDeposit
      )
      await checkOperator(
        this.handleSendTransaction,
        this.client,
        this.sender,
        contractAddress!,
        ionPoolAddr
      )

      await this.handleSendTransaction(
        {
          address: contractAddress! as `0x${string}`,
          abi: UniswapFlashswapDirectMintHandler.abi as Abi,
          functionName: 'flashswapAndMint',
          account: this.sender as `0x${string}`,
          args: args,
        },
        {
          loadingMessage: 'Sending Flash Leverage Transaction...',
          successMessage: 'Flash Leverage Success!',
        },
        true
      )

      return true // success
    } catch (e) {
      return false
    }
  }
}
