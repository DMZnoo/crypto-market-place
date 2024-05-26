import { useApp } from '@/contexts/AppProvider'
import Errors from '@/contracts/Errors.json'
import { useState } from 'react'
import {
  Abi,
  BaseError,
  ContractFunctionRevertedError,
  WriteContractErrorType,
  decodeErrorResult,
} from 'viem'
export type TxStatusType = 'Idle' | 'Loading' | 'Error' | 'Success' | 'Warning'
export type TxStatusError = {
  name: string
  description: string
}
export type TxStatusState = {
  status: TxStatusType
  message: string | TxStatusError
  txHash?: string // returned if the transaction was successful
}
// pass in when using handleTransaction
export type TxStatusMessages = {
  loadingMessage: string
  successMessage: string
}
export type TxArgs = {
  abi: Abi
  address: `0x${string}`
  account: `0x${string}`
  functionName: string
  args: any
  value?: bigint
}

export type HandleSendTransaction = (
  txArgs: TxArgs,
  statusMessages: TxStatusMessages,
  showSuccessModal: boolean
) => Promise<void>

const useTransaction = () => {
  const [txStatus, setTxStatus] = useState<TxStatusState>({
    status: 'Idle',
    message: '',
  })

  const { publicClient, walletClient } = useApp()

  function parseErrorMessage(errorMessage: string) {
    // Split the error message by newline
    const parts = errorMessage.split('\n')

    let relevantMessage = ''
    for (const part of parts) {
      if (part.trim() === '') {
        // Stop concatenating when a blank line is encountered
        break
      }
      relevantMessage += part.trim() + ' '
    }

    // Trim the final string to remove any trailing whitespace
    return relevantMessage.trim()
  }

  /**
   * Just matches the hex code
   */
  function parseErrorSignature(message: string): string | null {
    // Regular expression to match a hexadecimal value starting with '0x'
    const hexPattern = /0x[a-fA-F0-9]+/
    // Searching for the pattern in the input string
    const match = message.match(hexPattern)

    // If a match is found, return the first match (the hexadecimal value)
    if (match) {
      return match[0]
    } else {
      // If no match is found, return null
      return null
    }
  }

  const handleSendTransaction = async (
    txArgs: TxArgs,
    statusMessages: TxStatusMessages,
    showSuccessModal: boolean
  ) => {
    if (publicClient === null || walletClient === null) {
      return
    }
    setTxStatus({
      status: 'Loading',
      message: statusMessages.loadingMessage,
    })
    let value = BigInt(0)
    if (txArgs.value !== undefined) {
      value = txArgs.value
    }
    let gas = BigInt(10000000)
    try {
      gas = await publicClient.estimateContractGas({
        address: txArgs.address,
        abi: txArgs.abi,
        functionName: txArgs.functionName,
        account: txArgs.account,
        args: txArgs.args,
        value: value,
      })
    } catch (e) {
      // if estimateContractGas fails, then proceed with default
      // gas limit
      console.error(e)
      console.error('debug estimate contract gas error', e)
    }

    try {
      const { request } = await publicClient.simulateContract({
        abi: txArgs.abi,
        address: txArgs.address,
        account: txArgs.account,
        functionName: txArgs.functionName,
        args: txArgs.args,
        gas: gas * BigInt(2),
        value: value,
      })

      const txHash = await walletClient.writeContract(request)

      try {
        const transaction = await publicClient.waitForTransactionReceipt({
          confirmations: 1,
          hash: txHash,
          pollingInterval: 12_000,
          // retryCount: 12,
          // retryDelay: 10_000,
        })
      } catch (e) {
        const error = e as WriteContractErrorType
        // if a tranaction receipt throws an error,
        // then return
        setTxStatus({
          status: 'Warning',
          message: {
            name: 'Verify Transaction Status Before Proceeding',
            description:
              String(error.cause) +
              "We couldn't verify your transaction status due to long confirmation times. \
                            Please verify that the approve and add operator transactions have succeeded then submit the transaction again",
          },
        })
        return
      }

      if (showSuccessModal === true) {
        setTxStatus({
          status: 'Success',
          message: statusMessages.successMessage,
          txHash: txHash as string,
        })
      } else {
        setTxStatus({ ...txStatus, status: 'Idle' })
      }
    } catch (e) {
      const error = e as WriteContractErrorType
      let errorNameToSet = null
      let errorMessageToSet = null

      if (error instanceof BaseError) {
        const revertError = error.walk(
          (error) => error instanceof ContractFunctionRevertedError
        )
        if (revertError instanceof ContractFunctionRevertedError) {
          // first handle happy case where abi contains error
          if (revertError.data != null) {
            const errorName = revertError.data?.errorName ?? ''
            // do something with `errorName`
            errorNameToSet = 'Contract Function Reverted'
            errorMessageToSet = errorName
          } else {
            const sampleSignature =
              '0xb758934b000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000b68656c6c6f20776f726c64000000000000000000000000000000000000000000'
            let signature = parseErrorSignature(String(error.cause))
            if (signature != null) {
              const desiredLength = sampleSignature.length
              const currentLength = signature.length
              const zerosToAppend = desiredLength - currentLength

              const extendedSignature = signature + '0'.repeat(zerosToAppend)
              let decodedError: any
              try {
                decodedError = decodeErrorResult({
                  abi: Errors.abi,
                  data: extendedSignature as `0x${string}`,
                })
                errorNameToSet = 'Contract Function Reverted'
                errorMessageToSet = decodedError.errorName
              } catch (e) {
                errorNameToSet = 'Contract Function Reverted'
                errorMessageToSet =
                  'We are sorry, but we could not parse the error code. \n Please change your inputs and try again!'
              }
            }
          }
          // Parsed error signatures
          if (errorNameToSet !== null && errorMessageToSet !== null) {
            setTxStatus({
              status: 'Error',
              message: {
                name: errorNameToSet ?? '',
                description: errorMessageToSet,
              },
            })
            throw new Error('Error: handleSendTransaction')
          }
        }
      }
      // If can't parse error signature, dump the cause
      setTxStatus({
        status: 'Error',
        message: {
          name: '',
          description: String(error.cause),
        },
      })
      throw new Error('Error: handleSendTransaction')
      // if no error was thrown, just set to idle
      // setTxStatus({ ...txStatus, status: 'Idle' })

      // if (errorNameToSet == null || errorMessageToSet == null) {
      //     errorNameToSet = "Error"

      //     errorMessageToSet = parseErrorMessage(String(error.cause))
      // }
    }
  }

  return { txStatus, setTxStatus, handleSendTransaction }
}

export default useTransaction
