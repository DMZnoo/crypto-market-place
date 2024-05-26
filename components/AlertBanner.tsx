import { useApp } from '@/contexts/AppProvider'
import Alert from './common/Alert'

interface IAlertBanner {
  showIcon?: boolean
}

const AlertBanner = ({ showIcon = true }: IAlertBanner) => {
  const { loadings, infos, successes, warnings, errors } = useApp()

  return (
    <>
      {errors.size > 0 && (
        <>
          {Array.from(errors).map((error) => (
            <Alert
              showIcon={showIcon}
              className="mb-2"
              key={error}
              variant="Error"
              description={error}
            />
          ))}
        </>
      )}
      {warnings.size > 0 && (
        <>
          {Array.from(warnings).map((error) => (
            <Alert
              showIcon={showIcon}
              className="mb-2"
              key={error}
              variant="Warning"
              description={error}
            />
          ))}
        </>
      )}
      {infos.size > 0 && (
        <>
          {Array.from(infos).map((info) => (
            <Alert
              showIcon={showIcon}
              className="mb-2"
              key={info}
              variant="Info"
              description={info}
            />
          ))}
        </>
      )}
      {successes.size > 0 && (
        <>
          {Array.from(successes).map((info) => (
            <Alert
              showIcon={showIcon}
              className="mb-2"
              key={info}
              variant="Success"
              description={info}
            />
          ))}
        </>
      )}
      {loadings.size > 0 && (
        <>
          {Array.from(loadings).map((error) => (
            <Alert
              showIcon={showIcon}
              className="mb-2"
              key={error}
              variant="Loading"
              description={error}
            />
          ))}
        </>
      )}
    </>
  )
}

export default AlertBanner
