import IonPool from '@/contracts/IonPool.json'
import { TxArgs, TxStatusMessages } from '@/hooks/useTransaction'
import { Abi } from 'viem'
import { erc20ABI } from 'wagmi'

/**
 * If current allowance is less than the amount, then send approval request.
 */
export const checkAllowance = async (
  handleSendTransaction: (
    transactionArgs: TxArgs,
    statusMessages: TxStatusMessages,
    showSuccessModal: boolean
  ) => Promise<void>,
  publicClient: any,
  account: string,
  contractAddress: string,
  spender: string,
  amount: bigint
) => {
  let allowance = 0
  try {
    allowance = await publicClient.readContract({
      abi: erc20ABI,
      address: contractAddress as `0x${string}`,
      account: account as `0x${string}`,
      functionName: 'allowance',
      args: [account as `0x${string}`, spender as `0x${string}`],
    })
  } catch (e) {
    console.error(e)
  }
  try {
    if (allowance < amount) {
      await handleSendTransaction(
        {
          address: contractAddress! as `0x${string}`,
          abi: erc20ABI as Abi,
          functionName: 'approve'!,
          account: account as `0x${string}`,
          args: [spender, amount],
          //gas: 50000
        },
        {
          loadingMessage: 'Sending Approve Transaction...',
          successMessage: 'Approval Success!',
        },
        false
      )
    }
  } catch (e) {
    throw new Error('Error: checkAllowance handleSendTransaction')
  }
}

export const checkOperator = async (
  handleSendTransaction: (
    transactionArgs: TxArgs,
    statusMessages: TxStatusMessages,
    showSuccessModal: boolean
  ) => Promise<void>,
  publicClient: any,
  account: string,
  operator: string,
  ionPool: string
) => {
  let operatorAdded
  try {
    operatorAdded = await publicClient.readContract({
      abi: IonPool.abi,
      address: ionPool as `0x${string}`,
      account: account as `0x${string}`,
      functionName: 'isOperator',
      args: [account as `0x${string}`, operator as `0x${string}`],
    })
  } catch (e) {
    console.error(e)
  }
  if (!operatorAdded) {
    await handleSendTransaction(
      {
        abi: IonPool.abi as Abi,
        address: ionPool as `0x${string}`,
        functionName: 'addOperator',
        account: account as `0x${string}`,
        args: [operator as `0x${string}`],
        //gas: 50000
      },
      {
        loadingMessage: 'Sending Add Operator Transaction...',
        successMessage: 'Add Operator Success!',
      },
      false
    )
  }
}
