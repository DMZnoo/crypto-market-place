import { Asset, markets } from '@/config'
import { useApp } from '@/contexts/AppProvider'
import IonHandlerBase from '@/contracts/IonHandlerBase.json'
import { checkAllowance, checkOperator } from '@/utils/contract'
import { Abi } from 'viem'
import { mainnet, useNetwork } from 'wagmi'
import useAccountInfo from './useAccountInfo'
import { TxArgs, TxStatusMessages } from './useTransaction'

// TODO: This custom hook can just become util function if we don't need to store any more state
const useBorrow = (
  handleSendTransaction: (
    transactionArgs: TxArgs,
    statusMessages: TxStatusMessages,
    showSuccessModal: boolean
  ) => Promise<void>
) => {
  const { publicClient, walletClient } = useApp()
  const { signer, address } = useAccountInfo()
  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  const getHandlerAddress = (asset: Asset): string => {
    return ''
  }

  const depositAndBorrow = async (
    depositAmt: bigint,
    borrowAmt: bigint,
    asset: Asset,
    marketId: number
  ): Promise<Error | null> => {
    const handlerAddress = getHandlerAddress(asset)
    const ionPoolAddr = markets[chain.id][marketId].ionPool

    await checkAllowance(
      handleSendTransaction,
      publicClient,
      address,
      asset,
      handlerAddress, // spender
      depositAmt
    )

    await checkOperator(
      handleSendTransaction,
      publicClient,
      address,
      handlerAddress,
      ionPoolAddr
    )

    await handleSendTransaction(
      {
        abi: IonHandlerBase.abi as Abi,
        address: handlerAddress as `0x${string}`,
        account: address as `0x${string}`,
        functionName: 'depositAndBorrow',
        args: [BigInt(depositAmt), BigInt(borrowAmt), []],
      },
      {
        loadingMessage: 'Deposit and Borrow...',
        successMessage: 'Deposit and Borrow Success!',
      },
      true
    )

    return null
  }

  const repayAndWithdraw = async (
    repayAmount: bigint,
    withdrawAmt: bigint,
    asset: Asset,
    marketId: number
  ): Promise<Error | null> => {
    const handlerAddress = getHandlerAddress(asset)
    const ionPoolAddr = markets[chain.id][marketId].ionPool

    // TODO: After contract fix: repay and withdraw using ETH zapRepay
    // for now, just repay in WETH

    await checkAllowance(
      handleSendTransaction,
      publicClient,
      address,
      'WETH',
      handlerAddress,
      repayAmount
    )

    await checkOperator(
      handleSendTransaction,
      publicClient,
      address,
      handlerAddress,
      ionPoolAddr
    )

    await handleSendTransaction(
      {
        abi: IonHandlerBase.abi as Abi,
        address: handlerAddress as `0x${string}`,
        account: address as `0x${string}`,
        functionName: 'repayAndWithdraw',
        args: [BigInt(repayAmount), BigInt(withdrawAmt)],
      },
      {
        loadingMessage: 'Repaying and Withdrawing... ',
        successMessage: 'Repay and Withdraw Success!',
      },
      true
    )
    return null
  }

  return {
    depositAndBorrow,
    repayAndWithdraw,
  }
}

export default useBorrow
