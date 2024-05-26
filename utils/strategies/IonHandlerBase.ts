import { Asset, markets, tokenAddresses } from '@/config'
import { UserVaultInfo } from '@/contexts/MarketsProvider'
import IIonHandlerBase from '@/contracts/IonHandlerBase.json'
import IonPool from '@/contracts/IonPool.json'
import { HandleSendTransaction } from '@/hooks/useTransaction'
import { Abi } from 'viem'
import { checkAllowance, checkOperator } from '../contract'
import { RAY, WAD } from '../number'

interface IIonHandlerBase {
  depositAndBorrow: (
    amountCollateral: bigint,
    amounttoBorrow: bigint,
    proof: string[]
  ) => void
  repayAndWithdraw: (debtToRepay: bigint, collateralToWithdraw: bigint) => void
  repayFullAndWithdraw: (collateralToWithdraw: bigint) => void
}

export class IonHandlerBase implements IIonHandlerBase {
  private client: any
  private marketId: number
  private chainId: number
  private sender: string
  private handleSendTransaction: HandleSendTransaction
  private userVaultInfo: UserVaultInfo
  private lenderAsset: Asset
  private lenderAssetAddr: `0x${string}`
  private collateralAsset: Asset
  private collateralAssetAddr: `0x${string}`
  private contractAddress: `0x${string}` // this contract
  private ionPoolAddr: `0x${string}`

  constructor(
    sender: string,
    marketId: number,
    chainId: number,
    client: any,
    userVaultInfo: UserVaultInfo,
    handleSendTransaction: HandleSendTransaction
  ) {
    this.sender = sender
    this.marketId = marketId
    this.chainId = chainId
    this.client = client
    this.handleSendTransaction = handleSendTransaction
    this.userVaultInfo = userVaultInfo

    this.lenderAsset = markets[this.chainId][this.marketId].lenderAsset
    this.lenderAssetAddr = tokenAddresses[this.lenderAsset] as `0x${string}`
    this.collateralAsset = markets[this.chainId][this.marketId].collateralAsset
    this.collateralAssetAddr = tokenAddresses[
      this.collateralAsset
    ] as `0x${string}`

    this.contractAddress = markets[this.chainId][this.marketId]
      .genericHandler as `0x${string}`
    this.ionPoolAddr = markets[this.chainId][this.marketId]
      .ionPool as `0x${string}`
  }

  async depositAndBorrow(
    amountCollateral: bigint,
    amountToBorrow: bigint,
    proof: string[]
  ): Promise<boolean> {
    const collateralAsset = markets[this.chainId][this.marketId].collateralAsset
    const contractAddress = markets[this.chainId][this.marketId].genericHandler
    const collateralAssetAddr = tokenAddresses[collateralAsset]
    const ionPoolAddr = markets[this.chainId][this.marketId].ionPool
    try {
      await checkAllowance(
        this.handleSendTransaction,
        this.client,
        this.sender,
        collateralAssetAddr,
        contractAddress!,
        amountCollateral
      )
      await checkOperator(
        this.handleSendTransaction,
        this.client,
        this.sender,
        contractAddress,
        ionPoolAddr
      )

      const args = [amountCollateral, amountToBorrow, proof]
      await this.handleSendTransaction(
        {
          address: contractAddress as `0x${string}`,
          abi: IIonHandlerBase.abi as Abi,
          functionName: 'depositAndBorrow',
          account: this.sender as `0x${string}`,
          args: args,
        },
        {
          loadingMessage: 'Sending a Deposit Transaction...',
          successMessage: 'Deposit Success!',
        },
        true
      )
      return true
    } catch (e) {
      return false
    }
  }

  async fetchMostRecentRate() {
    if (this.client !== null) {
      const result = (await this.client.readContract({
        abi: IonPool.abi,
        address: markets[this.chainId][this.marketId].ionPool as `0x${string}`,
        functionName: 'rate',
        args: [0], // ilkIndex always zero
      })) as bigint
      return result
    } else {
      return null
    }
  }

  async getFullRepayAmount() {
    if (this.userVaultInfo === null) {
      return BigInt(0)
    }
    const normalizedDebt = this.userVaultInfo.normalizedDebt
    const rate = await this.fetchMostRecentRate()
    if (rate === null) {
      return BigInt(0)
    }
    const debtRad = normalizedDebt * rate
    let repayAmount = debtRad / RAY
    if (debtRad % RAY > 0) repayAmount++
    return repayAmount
    // return this.userVaultInfo.debt
  }

  async repayAndWithdraw(debtToRepay: bigint, collateralToWithdraw: bigint) {
    try {
      const repayApproveAmt = (debtToRepay * BigInt(1.01e18)) / WAD
      await checkAllowance(
        this.handleSendTransaction,
        this.client,
        this.sender,
        this.lenderAssetAddr,
        this.contractAddress,
        repayApproveAmt
      )
      await checkOperator(
        this.handleSendTransaction,
        this.client,
        this.sender,
        this.contractAddress,
        this.ionPoolAddr
      )
      const args = [debtToRepay, collateralToWithdraw]
      await this.handleSendTransaction(
        {
          address: this.contractAddress as `0x${string}`,
          abi: IIonHandlerBase.abi as Abi,
          functionName: 'repayAndWithdraw',
          account: this.sender as `0x${string}`,
          args: args,
        },
        {
          loadingMessage: 'Sending a Repay and Withdraw Transaction...',
          successMessage: 'Repay and Withdraw Success!',
        },
        true
      )
    } catch (e) {
      return false
    }
  }

  async repayFullAndWithdraw(collateralToWithdraw: bigint) {
    // forgo getting exact repay amount to avoid an rpc call, just do generous approval
    // const fullRepayAmt = await this.getFullRepayAmount() * BigInt(1.01e18) / WAD // adjust for rate changes as debt accrues over time
    const fullRepayAmt = (this.userVaultInfo.debt * BigInt(1.02e18)) / WAD

    const contractAddress = markets[this.chainId][this.marketId].genericHandler

    const lenderAsset = markets[this.chainId][this.marketId].lenderAsset
    const lenderAssetAddr = tokenAddresses[lenderAsset]

    const ionPoolAddr = markets[this.chainId][this.marketId].ionPool

    // allow transfer of lender token
    try {
      await checkAllowance(
        this.handleSendTransaction,
        this.client,
        this.sender,
        lenderAssetAddr,
        contractAddress!,
        fullRepayAmt
      )
      await checkOperator(
        this.handleSendTransaction,
        this.client,
        this.sender,
        contractAddress,
        ionPoolAddr
      )

      const args = [collateralToWithdraw]

      await this.handleSendTransaction(
        {
          address: contractAddress as `0x${string}`,
          abi: IIonHandlerBase.abi as Abi,
          functionName: 'repayFullAndWithdraw',
          account: this.sender as `0x${string}`,
          args: args,
        },
        {
          loadingMessage: 'Sending a Full Repay and Withdraw Transaction...',
          successMessage: 'Full Repay and Withdraw Success!',
        },
        true
      )
    } catch (e) {
      return false
    }
  }
}
