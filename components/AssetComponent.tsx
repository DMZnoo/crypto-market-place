import { Asset } from '@/config'
import { EzETH2, RsEth, WeEth, WstEth2 } from '@/libs/icons/src/lib/icons'
import { twMerge } from 'tailwind-merge'

interface IAssetComponent {
  asset: Asset
  className?: string
}

const AssetComponent = ({ asset, className }: IAssetComponent) => {
  return (
    <>
      {asset === 'wstETH' ? (
        <WstEth2 className={twMerge('scale-[100%]', className)} />
      ) : asset === 'rsETH' ? (
        <RsEth className={className} />
      ) : asset === 'weETH' ? (
        <WeEth className={className} />
      ) : asset === 'ezETH' ? (
        <EzETH2 className={className} />
      ) : (
        <></>
      )}
    </>
  )
}

export default AssetComponent
