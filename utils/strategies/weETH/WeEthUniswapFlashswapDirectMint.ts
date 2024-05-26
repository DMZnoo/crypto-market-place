import { contractAddresses, tokenAddresses } from '@/config'
import IEEth from '@/contracts/IEEth.json'
import IEtherFiLiquidityPool from '@/contracts/IEtherFiLiquidityPool.json'
import { HandleSendTransaction } from '@/hooks/useTransaction'
import { Abi } from 'viem'
import { UniswapFlashswapDirectMint } from '../UniswapFlashswapDirectMint'

export class WeEthUniswapFlashswapDirectMint extends UniswapFlashswapDirectMint {
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
  ): WeEthUniswapFlashswapDirectMint {
    return new this(
      sender,
      marketId,
      chainId,
      client,
      handleSendTransaction,
      setCalculateCostOfCapitalLoading
    )
  }

  async getMintAssetInForCollateralAssetOut(
    amountOut: bigint
  ): Promise<bigint> {
    try {
      const result = (await this.client.readContract({
        abi: IEtherFiLiquidityPool.abi as Abi,
        address: contractAddresses.etherFiLiquidityPool as `0x${string}`,
        functionName: 'amountForShare', // takes shares and gives balance
        args: [amountOut],
      })) as bigint
      return result
    } catch (e) {
      const error = new Error('calculateCostOfCapital amountForShare error')
      error.cause = e
      throw error
    }
  }

  async getCollateralAssetOutForMintAssetIn(amountIn: bigint): Promise<bigint> {
    try {
      const results = await this.client.multicall({
        contracts: [
          {
            abi: IEtherFiLiquidityPool.abi as Abi,
            address: contractAddresses.etherFiLiquidityPool as `0x${string}`,
            functionName: 'getTotalPooledEther',
          },
          {
            abi: IEEth.abi as Abi,
            address: tokenAddresses.eETH as `0x${string}`,
            functionName: 'totalShares',
          },
        ],
      })
      const totalPooledEther = results[0].result
      const totalShares = results[1].result

      // eETH 'shares' minted
      const sharesForAmount = (amountIn * totalShares) / totalPooledEther // total shares in eETH

      const newTotalPooledEther = totalPooledEther + amountIn
      const newTotalShares = totalShares + sharesForAmount

      // eETH `balanceOf` minted
      const eEthAmount =
        (sharesForAmount * newTotalPooledEther) / newTotalShares

      // weETH minted
      const weEthAmount = (eEthAmount * newTotalShares) / newTotalPooledEther

      return weEthAmount
    } catch (e) {
      const error = new Error('getCollateralAssetOutForMintAssetIn error')
      error.cause = e
      throw error
    }
  }
}
