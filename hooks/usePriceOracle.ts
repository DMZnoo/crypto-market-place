import { useApp } from '@/contexts/AppProvider'
import Chainlink from '@/contracts/Chainlink.json'
import { useEffect, useState } from 'react'
import { contractAddresses } from '../config'

const CHAINLINK_ADDRESS = contractAddresses.chainlink

const usePriceOracle = () => {
  const [price, setPrice] = useState<bigint | null>(null)
  const { publicClient: client } = useApp()

  useEffect(() => {
    ;(async () => {
      if (client !== null) {
        try {
          const result = (await client.readContract({
            abi: Chainlink.abi,
            address: CHAINLINK_ADDRESS as `0x${string}`,
            functionName: 'latestRoundData',
            args: [],
          })) as Array<bigint>
          const ethPrice = result[1] as bigint
          setPrice(ethPrice)
        } catch (e) {
          console.error(e)
        }
      }
    })()
  }, [client])

  const getEthPrice = () => {
    ;(async function () {
      if (client !== null) {
        const ethPrice: any = await client.readContract({
          abi: Chainlink.abi,
          address: CHAINLINK_ADDRESS as `0x${string}`,
          functionName: 'latestRoundData',
          args: [],
        })
        setPrice(ethPrice)
      }
    })
  }

  return {
    price,
  }
}
export default usePriceOracle
