import { API_METHOD, callApi } from '@/utils/backend'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

export enum HistoryType {
  Borrow = 'Borrow',
  Lend = 'Lend',
}

export enum LenderTxEventName {
  Supply = 'Supply',
  Withdraw = 'Withdraw',
}

type LendTx = {
  address: `0x${string}`
  eventName: LenderTxEventName
  amount: bigint
  totalDeposit: bigint
  timestamp: number
  txHash: `0x${string}`
}

type BorrowTx = {}

export type LendTxHistory = LendTx[] | null
export type BorrowTxHistory = BorrowTx[] | null

export interface TxHistoryProps {
  lendTxHistory?: LendTxHistory
  borrowTxHistory?: BorrowTxHistory
}

/**
 * Query historical lender and borrow transactions for a single address
 */
export const useTxHistory = (historyType: HistoryType): TxHistoryProps => {
  const [lendTxHistory, setLendHistory] = useState<LendTxHistory>(null)
  const [borrowTxHistory, setBorrowTxs] = useState<BorrowTxHistory>(null)
  const { address } = useAccount()

  // TODO: This should be refactored to query based on marketId in later deployments
  useEffect(() => {
    ;(async function () {
      if (historyType === HistoryType.Lend) {
        try {
          const borrowerResponse = await callApi(
            'v1/bigbrother/lenderTxHistory',
            API_METHOD.GET,
            {
              address: address,
              // address: '0x83d8295AE2e3c423E7962446fF1B3e51FdE41AFF'
            }
          )
          let lendTxHistory: LendTxHistory = null
          if (borrowerResponse.status === 200) {
            // rows successfully returned
            const json = await borrowerResponse.json()
            const mapped = json.map((tx: any) => ({
              address: tx.lender ? tx.lender : null,
              eventName: tx.event_name
                ? (tx.event_name as LenderTxEventName)
                : null,
              amount: tx.amount ? BigInt(tx.amount) : null,
              totalDeposit: tx.new_debt ? BigInt(tx.new_debt) : null,
              timestamp: tx.time_stamp ? Number(tx.time_stamp) : null,
              txHash: tx.tx_hash ? tx.tx_hash : null,
            }))
            lendTxHistory = mapped
          } else if (borrowerResponse.status === 404) {
            // no rows found
            lendTxHistory = []
          } else if (borrowerResponse.status === 500) {
            // server error
            lendTxHistory = null
          }
          setLendHistory(lendTxHistory)
          return
        } catch (e) {
          return
        }
      }
      // if (historyType === HistoryType.Lend) {

      // }
    })()
  }, [historyType])

  return {
    lendTxHistory,
    borrowTxHistory,
  }
}
