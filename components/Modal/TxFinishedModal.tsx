import { TxStatusState } from '@/hooks/useTransaction'
import SvgAlert from '@/libs/icons/src/lib/icons/Alert'
import { Tabs } from '@/pages/borrow'
import { Dialog, Transition } from '@headlessui/react'
import React, { Fragment, useEffect, useRef } from 'react'
import { Asset } from '../../config'
import { useTheme } from '../../contexts/ThemeProvider'
import { UserPositionInfo } from '../../hooks/useUserPositionInfo'
import { Error, Success } from '../../libs/icons/src/lib/icons'
import Button from '../common/Button'

type TxType = Tabs | 'Deposit' | 'Withdraw'

interface TxFinishedModalProps {
  txStatus: TxStatusState
  asset?: Asset
  currUserPositionInfo?: UserPositionInfo
  newUserPositionInfo?: UserPositionInfo
  txType: TxType
  numbers: number[]
  onClose: () => void // Callback function to close the modal
}

const TxFinishedModal: React.FC<TxFinishedModalProps> = ({
  txStatus,
  asset,
  currUserPositionInfo,
  newUserPositionInfo,
  txType,
  numbers,
  onClose,
}) => {
  const { theme } = useTheme()

  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [modalRef, onClose])

  const getTitle = (): string => {
    return txStatus.status === 'Error'
      ? 'Transaction Error'
      : txStatus.status === 'Warning'
      ? 'Warning'
      : 'Transaction Success'
  }

  const getParagraph = (): string => {
    switch (txType) {
      case 'Earn':
        return 'You successfully leveraged your position to your target multiplier! Now continue managing your position through the manage position interface!'
      // return 'Congratulations on opening your borrow position. Now continue managing your position through the manage position interface!'
      case 'Leverage':
        return 'You successfully leveraged your position to your target multiplier!'
      case 'Deleverage':
        return 'You successfully deleveraged your position to your target multiplier!'
      case 'Borrow':
        return 'You successfully deposited collateral and borrowed WETH!'
      case 'Repay':
        return 'You successfully repaid debt and withdrew collateral!'
      case 'Deposit':
        return 'You successfully supplied lender liquidity to the pool. Observe your position to track the yields you earn from borrowers!'
      case 'Withdraw':
        return 'You successfully withdrew your claimable liquidity from the pool!'
      default:
        return 'Transaction details...'
    }
  }

  // if (txStatus.status === 'Error' || txStatus.status === 'Success') {
  // <div className="bg-white p-5 w-1/3 h-1/2 z-50 overflow-auto" ref={modalRef}>
  //     <h1>{getTitle()}</h1>
  //     <p>{getParagraph()}</p>
  //     {
  //         txStatus.status === 'Success' && (
  //             <p>
  //                 {/* TODO: hyperlink this to tenderly testnet explorer */}
  //                 {txStatus.txHash}
  //             </p>
  //         )
  //     }
  //     <ul>
  //         {numbers.map((number, index) => (
  //             <li key={index}>{number}</li>
  //         ))}
  //     </ul>
  //     <div>
  //         User Vault Info

  //     </div>
  // </div>

  return (
    <Transition.Root
      show={
        txStatus.status === 'Success' ||
        txStatus.status === 'Error' ||
        txStatus.status === 'Warning'
      }
      as={Fragment}
    >
      <Dialog
        as="div"
        className="relative z-50"
        // initialFocus={cancelButtonRef}
        onClose={(val: boolean) => onClose()}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel>
                {(txStatus.status === 'Error' ||
                  txStatus.status === 'Success' ||
                  txStatus.status === 'Warning') && (
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-xl h-auto relative bg-white dark:bg-dark-primary-900 rounded-2xl p-6 overflow-hidden">
                      <div className="flex flex-col items-center mb-4">
                        {txStatus.status === 'Success' && (
                          <div className="bg-green rounded-[100%] bg-opacity-[10%] p-2 mb-1">
                            <div className="bg-green rounded-[100%] bg-opacity-[30%] p-3">
                              <Success />
                            </div>
                          </div>
                        )}
                        {txStatus.status === 'Error' && (
                          <div className="bg-red-500 rounded-[100%] bg-opacity-[10%] p-2 mb-1">
                            <div className="bg-red-500 rounded-[100%] bg-opacity-[30%] p-3">
                              <Error />
                            </div>
                          </div>
                        )}
                        {txStatus.status === 'Warning' && (
                          <div className="bg-red-500 rounded-[100%] bg-opacity-[10%] p-2 mb-1">
                            <div className="bg-red-500 rounded-[100%] bg-opacity-[30%] p-3">
                              {/* <SvgAlert fill={themes.colors.warning['100']} /> */}
                              <SvgAlert />
                            </div>
                          </div>
                        )}
                        <p className="text-center text-2xl font-normal leading-10">
                          {getTitle()}
                        </p>
                        {/* <Link
                          //TODO:replace with the correct url
                          href={
                            txStatus.txHash
                              ? `https://etherscan.io/tx/${txStatus.txHash}`
                              : ''
                          }
                          className="shadow-sm rounded p-1 w-1/2 h-1/2 flex items-center text-center"
                          target="_blank"
                          rel="noopener"
                        >
                        <div className="shadow-sm rounded p-1 w-1/2 h-1/2 flex items-center text-center">
                          <Clip height={12} width={12} />
                          <p className="ml-2 text-gray-300 text-sm overflow-hidden truncate">
                            {txStatus.txHash}
                          </p>

                        </div>
                        </Link> */}
                      </div>

                      {(txStatus.status === 'Error' ||
                        txStatus.status === 'Warning') && (
                        <div className="text-center">
                          {typeof txStatus.message != 'string' ? (
                            <>
                              <p>{txStatus.message.name}</p>
                              <p>{txStatus.message.description}</p>
                            </>
                          ) : (
                            <>
                              We&apos;re sorry, but it seems there was an issue
                              processing your transaction. Please double-check
                              your details and try again.
                            </>
                          )}
                        </div>
                      )}

                      {txStatus.status === 'Success' && (
                        <>
                          <div className="text-center text-gray-300 text-sm">
                            {getParagraph()}
                          </div>
                        </>
                      )}

                      {txStatus.status === 'Success' && (
                        <Button
                          variant={'static'}
                          className="w-full hover:text-white leading-loose py-2 mt-8"
                          onClick={(e) => {
                            onClose()
                          }}
                        >
                          Confirm
                        </Button>
                      )}
                      {txStatus.status === 'Error' && (
                        <div className="flex space-x-4 justify-center">
                          <Button
                            variant={'warning'}
                            className="w-24 hover:text-white leading-loose py-2 mt-8"
                            onClick={(e) => {
                              onClose()
                            }}
                          >
                            Go Back
                          </Button>
                        </div>
                      )}
                      {txStatus.status === 'Warning' && (
                        <div className="flex space-x-4 justify-center">
                          <Button
                            variant={'yellow-warning'}
                            className="w-24 hover:text-white leading-loose py-2 mt-8"
                            onClick={(e) => {
                              onClose()
                            }}
                          >
                            Go Back
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
  // }

  // return null
}

export default TxFinishedModal
