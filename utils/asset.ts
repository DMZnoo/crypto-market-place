import { contractAddresses, tokenAddresses } from '@/config'
import IEEth from '@/contracts/IEEth.json'
import IEtherFiLiquidityPool from '@/contracts/IEtherFiLiquidityPool.json'
import WstEth from '@/contracts/WstETH.json'
import { Abi } from 'viem'

// For each new lender asset, this interface needs to be
// implemented. Helper functions for new assets that we
// integrate.
export interface IAsset {
  getExchangeRateCallData(): any
  getPriceCallData(): any // Assuming getPrice returns a promise that resolves to a number
}

export class WstETH implements IAsset {
  getExchangeRateCallData() {
    const calldata = {
      abi: WstEth.abi as Abi,
      address: tokenAddresses.wstETH as `0x${string}`,
      functionName: 'stEthPerToken',
    }
    return calldata
  }
  getPriceCallData() {
    // Implementation for wstETH
    return BigInt(1)
  }
}

// TODO: Deprecate this file?
export class WeETH implements IAsset {
  private client: any
  constructor(client: any) {
    this.client = client
  }
  getExchangeRateCallData() {
    return BigInt(1)
  }
  getPriceCallData() {
    return BigInt(1)
  }
  async getWeEthOutForEthIn(ethAmountIn: bigint) {
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
    const sharesForAmount = (ethAmountIn * totalShares) / totalPooledEther // total shares in eETH

    const newTotalPooledEther = totalPooledEther + ethAmountIn
    const newTotalShares = totalShares + sharesForAmount

    // eETH `balanceOf` minted
    const eEthAmount = (sharesForAmount * newTotalPooledEther) / newTotalShares

    // weETH minted
    const weEthAmount = (eEthAmount * newTotalShares) / newTotalPooledEther

    return weEthAmount
  }

  // uint256 totalPooledEther = pool.getTotalPooledEther();
  // uint256 totalShares = eEth.totalShares();

  // uint256 eEthSharesAmount = _sharesForAmount(totalPooledEther, totalShares, ethAmount);
  // uint256 newTotalPooledEther = totalPooledEther + ethAmount;
  // if (newTotalPooledEther == 0) return 0;

  // uint256 newTotalShares = totalShares + eEthSharesAmount;
  // uint256 eEthAmount = _amountForShares(newTotalPooledEther, newTotalShares, eEthSharesAmount);

  // return _sharesForAmount(newTotalPooledEther, newTotalShares, eEthAmount);
}
