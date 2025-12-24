import React, { useEffect, useState } from 'react'
import Title from './Title'
import { assets, exclusiveOffers as fallbackOffers } from '../assets/assets'

const ExclusiveOffers = () => {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // Use Vite env VITE_API_URL when provided, otherwise use relative path (same origin)
        const API_BASE = import.meta.env.VITE_API_URL || ''
        const res = await fetch(`${API_BASE}/api/offers`)
        if (!res.ok) {
          // if API returns an error, fall back to static offers
          console.debug('Offers API returned non-ok status, falling back');
          setOffers(fallbackOffers)
          return
        }
        const data = await res.json()
        // If API returned an empty array or invalid data, fallback
        if (!Array.isArray(data) || data.length === 0) {
          setOffers(fallbackOffers)
        } else {
          setOffers(data)
        }
      } catch (err) {
        console.warn('Failed to fetch offers, using fallback data:', err.message)
        setOffers(fallbackOffers)
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  if (loading) {
    return (
      <p className="text-center mt-20 font-medium">
        Đang tải ưu đãi...
      </p>
    )
  }

  if (error) {
    return (
      <p className="text-center mt-20 text-red-500">
        {error}
      </p>
    )
  }

  return (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32 pt-20 pb-30'>
      
      <div className='flex flex-col md:flex-row items-center justify-between w-full'>
        <Title
          align='left'
          title='Ưu đãi độc quyền'
          subTitle='Tận hưởng các ưu đãi có thời hạn và gói dịch vụ đặc biệt của chúng tôi để nâng tầm kỳ nghỉ của bạn và tạo nên những kỷ niệm khó quên.'
        />

        <button className='group flex items-center gap-2 font-bold cursor-pointer max-md:mt-12'>
          Xem thêm các ưu đãi khác
          <img
            src={assets.arrowIcon}
            alt="arrow-icon"
            className='group-hover:translate-x-1 transition-all'
          />
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12'>
        {offers.map(item => (
          <div
            key={item._id}
            className='group relative flex flex-col items-start justify-between gap-1 pt-12 md:pt-18 px-4 rounded-xl text-white bg-no-repeat bg-cover bg-center'
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <p className='px-3 py-1 absolute top-4 left-4 text-xs bg-white text-gray-800 font-bold rounded-full'>
              {item.priceOff}% OFF
            </p>

            <div>
              <p className='text-2xl font-medium font-lora'>
                {item.title}
              </p>
              <p>{item.description}</p>
              <p className='text-xs text-white/70 mt-3'>
                Kết thúc vào {item.expiryDate}
              </p>
            </div>

            <button className='flex items-center gap-2 font-bold cursor-pointer mt-4 mb-5'>
              Xem ưu đãi
              <img
                className='invert group-hover:translate-x-1 transition-all'
                src={assets.arrowIcon}
                alt="arrow-icon"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExclusiveOffers
