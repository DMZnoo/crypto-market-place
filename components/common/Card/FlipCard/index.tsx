import React, { useState } from 'react'
import ReactCardFlip from 'react-card-flip'

interface IFlipCard {
  frontCard: React.ReactNode
  backCard: React.ReactNode
}

const FlipCard = ({ frontCard, backCard }: IFlipCard) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false)
  return (
    <div
      onMouseEnter={(e) => {
        setIsFlipped(true)
      }}
      onMouseLeave={(e) => {
        setIsFlipped(false)
      }}
    >
      <ReactCardFlip isFlipped={isFlipped}>
        {frontCard}
        {backCard}
      </ReactCardFlip>
    </div>
  )
}
export default FlipCard
