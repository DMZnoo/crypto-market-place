import Alert from './common/Alert'

interface IAlertComponent {
  showIcon?: boolean
  loadings?: Set<string>
  infos?: Set<string>
  successes?: Set<string>
  warnings?: Set<string>
  errors?: Set<string>
}

const AlertComponent = ({
  showIcon = true,
  loadings,
  infos,
  successes,
  warnings,
  errors,
}: IAlertComponent) => {
  return (
    <>
      {errors && errors.size > 0 && (
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
      {warnings && warnings.size > 0 && (
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
      {infos && infos.size > 0 && (
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
      {successes && successes.size > 0 && (
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
      {loadings && loadings.size > 0 && (
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

export default AlertComponent
