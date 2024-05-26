// CornerToaster.tsx

import Image from 'next/image'

type Props = {
  title: string
  description: string
  variant: 'success' | 'error'
}

const CornerToaster: React.FC<Props> = ({ title, description, variant }) => {
  const iconPath = variant === 'success' ? '/successIcon.svg' : '/errorIcon.svg'
  const borderColor =
    variant === 'success' ? 'border-success-30' : 'border-error-30'

  return (
    <div
      className={`flex flex-row bg-white dark:bg-ebony border ${borderColor} px-6 py-4 shadow-md rounded-2xl`}
    >
      <Image
        src={iconPath}
        width={40}
        height={44}
        alt={variant}
        className="-ml-1"
      />
      <div className="ml-4">
        <p className="font-bold">{title}</p>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default CornerToaster
