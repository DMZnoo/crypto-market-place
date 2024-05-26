import { twMerge } from 'tailwind-merge'

interface IChip extends React.PropsWithChildren {
  className: string
  icon?: React.ReactElement
}

const Chip: React.FunctionComponent<IChip> = ({
  className,
  icon,
  children,
}) => {
  return (
    <div
      className={twMerge(
        `inline-flex items-center py-1 px-4 rounded ${className ?? ''}`
      )}
    >
      {icon}
      {children}
    </div>
  )
}
export default Chip
