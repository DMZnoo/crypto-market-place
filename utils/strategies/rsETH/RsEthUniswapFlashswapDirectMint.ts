import { contractAddresses } from '@/config'
import ILRTDepositPool from '@/contracts/ILRTDepositPool.json'
import ILRTOracle from '@/contracts/ILRTOracle.json'
import { HandleSendTransaction } from '@/hooks/useTransaction'
import { WAD } from '@/utils/number'
import { Abi } from 'viem'
import { UniswapFlashswapDirectMint } from '../UniswapFlashswapDirectMint'

export class RsEthUniswapFlashswapDirectMint extends UniswapFlashswapDirectMint {
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
    // Call the parent class's constructor with all required arguments
    super(
      sender,
      marketId,
      chainId,
      client,
      handleSendTransaction,
      setCalculateCostOfCapitalLoading
    )
  }

  static createInstance(
    sender: string,
    marketId: number,
    chainId: number,
    client: any,
    handleSendTransaction: HandleSendTransaction,
    setCalculateCostOfCapitalLoading: React.Dispatch<
      React.SetStateAction<boolean>
    >
  ): RsEthUniswapFlashswapDirectMint {
    return new this(
      sender,
      marketId,
      chainId,
      client,
      handleSendTransaction,
      setCalculateCostOfCapitalLoading
    )
  }

  /**
   * amountOut.mulDiv(RSETH_LRT_ORACLE.rsETHPrice(), WAD, Math.Rounding.Ceil);
   * @param amountOut
   * @returns
   */
  async getMintAssetInForCollateralAssetOut(
    amountOut: bigint
  ): Promise<bigint> {
    try {
      const result = (await this.client.readContract({
        abi: ILRTOracle.abi as Abi,
        address: contractAddresses.rsEthLrtOracle as `0x${string}`,
        functionName: 'rsETHPrice', // takes shares and gives balance
      })) as bigint
      const amountIn = (amountOut * result) / WAD
      return amountIn
    } catch (e) {
      const error = new Error('getMintAssetInForCollateralAssetOut error')
      error.cause = e
      throw error
    }
  }

  /**
   * RSETH_LRT_DEPOSIT_POOL.getRsETHAmountToMint(ETH_ADDRESS, ethAmount);
   * @param amountIn
   * @returns
   */
  async getCollateralAssetOutForMintAssetIn(amountIn: bigint): Promise<bigint> {
    try {
      const results = (await this.client.readContract({
        abi: ILRTDepositPool.abi as Abi,
        address: contractAddresses.rsEthLrtDepositPool as `0x${string}`,
        functionName: 'getRsETHAmountToMint',
        args: [contractAddresses.nativeEth, amountIn],
      })) as bigint
      return results
    } catch (e) {
      const error = new Error('getCollateralAssetOutForMintAssetIn error')
      error.cause = e
      throw error
    }
  }
}
