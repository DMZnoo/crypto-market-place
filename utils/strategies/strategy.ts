import { HandleSendTransaction } from '@/hooks/useTransaction'
import { UniswapFlashswapDirectMint } from './UniswapFlashswapDirectMint'
import { RsEthUniswapFlashswapDirectMint } from './rsETH/RsEthUniswapFlashswapDirectMint'
import { WeEthUniswapFlashswapDirectMint } from './weETH/WeEthUniswapFlashswapDirectMint'

type StrategyFactoryArgs = {
  sender: string
  marketId: number
  chainId: number
  client: any
  handleSendTransaction: HandleSendTransaction
  setCalculateCostOfCapitalLoading: React.Dispatch<
    React.SetStateAction<boolean>
  >
}

/**
 * Factory for returning the  most optimal leverage strategy.
 * @param assetAddr
 * @returns
 */
export function getLeverageStrategyInstance(
  args: StrategyFactoryArgs
): UniswapFlashswapDirectMint | null {
  if (args.marketId === 0) {
    return new WeEthUniswapFlashswapDirectMint(
      args.sender,
      args.marketId,
      args.chainId,
      args.client,
      args.handleSendTransaction,
      args.setCalculateCostOfCapitalLoading
    )
  } else if (args.marketId === 1) {
    return new RsEthUniswapFlashswapDirectMint(
      args.sender,
      args.marketId,
      args.chainId,
      args.client,
      args.handleSendTransaction,
      args.setCalculateCostOfCapitalLoading
    )
    // return null
  } else {
    return null
  }
}
