import { Asset, markets, tokenAddresses } from '@/config'
import { useApp } from '@/contexts/AppProvider'
import { useWhitelist } from '@/contexts/WhitelistProvider'
import IonPool from '@/contracts/IonPool.json'
import { checkAllowance } from '@/utils/contract'
import { Abi } from 'viem'
import { mainnet, useNetwork } from 'wagmi'
import useAccountInfo from './useAccountInfo'
import { TxArgs, TxStatusMessages } from './useTransaction'

interface LendReturn {
  supply: (supplyAmt: bigint, assetType: Asset) => Promise<Error | null>
  withdraw: (withdrawAmt: bigint) => Promise<Error | null>
}

const useLend = (
  handleSendTransaction: (
    transactionArgs: TxArgs,
    statusMessages: TxStatusMessages,
    showSuccessModal: boolean
  ) => Promise<void>
) => {
  const { signer, address } = useAccountInfo()
  const { walletClient: client } = useApp()
  const { whitelistInfos } = useWhitelist()
  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  const supply = async (
    supplyAmt: bigint,
    assetType: Asset,
    marketId: number
  ): Promise<boolean> => {
    const tokenAddress = tokenAddresses[assetType]
    const ionPoolAddress = markets[chain.id][marketId].ionPool

    if (whitelistInfos === null) return false
    const lenderProof = whitelistInfos[marketId]?.lenderProof ?? []

    // setLoading(true)
    try {
      await checkAllowance(
        handleSendTransaction,
        client,
        address,
        tokenAddress,
        ionPoolAddress,
        supplyAmt
      )

      await handleSendTransaction(
        {
          abi: IonPool.abi as Abi,
          address: ionPoolAddress as `0x${string}`,
          account: address as `0x${string}`,
          functionName: 'supply',
          args: [address, BigInt(supplyAmt), lenderProof],
        },
        {
          loadingMessage: `Supplying ${
            markets[chain.id][marketId].lenderAsset
          }...`,
          successMessage: 'Supply WETH Success!',
        },
        true
      )
      return true
    } catch (e) {
      return false
    }
  }

  const withdraw = async (
    withdrawAmt: bigint,
    lenderAsset: Asset,
    marketId: number
  ): Promise<Error | null> => {
    const ionPoolAddress = markets[chain.id][marketId].ionPool
    try {
      await handleSendTransaction(
        {
          abi: IonPool.abi as Abi,
          address: ionPoolAddress as `0x${string}`,
          account: address as `0x${string}`,
          functionName: 'withdraw',
          args: [address, BigInt(withdrawAmt)],
        },
        {
          loadingMessage: `Withdrawing ${lenderAsset}... `,
          successMessage: 'Withdraw WETH Success!',
        },
        true
      )
    } catch (e) {
      console.error('lender withdraw error', e)
    }
    // setLoading(false)
    return null
  }

  return {
    supply,
    withdraw,
  }
}

export default useLend
