import React, { useState } from 'react'
import Title from '../components/Title'
import { assets, userBookingsDummyData } from '../assets/assets'

const MyBookings = () => {

    const[bookings, setBookings] = useState(userBookingsDummyData);

  return (
    <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
        <Title title='My Bookings' subTitle='Dễ dàng theo dõi lịch sử, kiểm tra đặt phòng hiện tại và chuẩn bị cho những chuyến đi sắp tới. Mọi thứ đều trong tầm tay, chỉ với vài cú nhấp chuột.'
        align='left'/>

        <div className='max-w-6xl mt-8 w-full text-gray-800'>

            <div className='hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b
            border-gray-300 font-bold text-base py-3'>
                <div className='w-1/3'>Hotels</div>
                <div className='w-1/3'>Date & Timings</div>
                <div className='w-1/3'>Payment</div>
            </div>

            {bookings.map((booking)=>(
                <div key={booking._id} className='grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t gap-4'>
                    {/* Hotel Details */}
                    <div className='flex flex-col md:flex-row gap-4'>
                        <img src={booking.room.images[0]} alt="hotel-img"
                        className='w-full md:w-44 h-32 md:h-auto rounded shadow object-cover' />
                        <div className='flex flex-col gap-1.5'>
                            <p className='font-lora text-2xl'>{booking.hotel.name}
                            <span className='font-inter text-sm'>({booking.room.roomType})</span>
                            </p>
                            <div className='flex items-center gap-1 text-sm text-gray-500'>
                                <img src={assets.locationIcon} alt="location-icon"
                                />
                                <span>{booking.room.hotel.address}</span>
                            </div>
                            <div className='flex items-center gap-1 text-sm text-gray-500'>
                                <img src={assets.guestsIcon} alt="guests-icon"
                                />
                                <span>Guests: {booking.guests}</span>
                            </div>
                            <p className='text-base'>Total: ${booking.totalPrice}</p>
                        </div>
                    </div>
                    {/* Date & Timings */}
                    <div className='flex flex-col md:flex-row md:items-center md:gap-12 gap-4'>
                        <div>
                            <p className='font-semibold'>Check-In:</p>
                            <p className='text-gray-500 text-sm'>
                            {new Date(booking.checkInDate).toDateString()}
                            </p>
                        </div>
                        <div>
                            <p className='font-semibold'>Check-Out:</p>
                            <p className='text-gray-500 text-sm'>
                            {new Date(booking.checkOutDate).toDateString()}
                            </p>
                        </div>
                    </div>
                    {/* Payment */}
                    <div className='flex flex-col items-start justify-center pt-3'>
                        <div>
                            <div className={ `h-3 w-3 rounded-full ${booking.isPaid ?
                                "bg-green-500" : "bg-red-500"}`}></div>
                            <p className={ `text-sm ${booking.isPaid ?
                                "text-green-500" : "text-red-500"}`}>
                                    {booking.isPaid ? "Đã trả" : "Chưa trả"}    
                            </p>   
                        </div>
                        {!booking.isPaid && (
                            <button className='px-4 py-1.5 mt-4 text-xs border border-gray-400
                            rounded-full hover:bg-gray-50 transition-all cursor-pointer'>
                                Thanh toán
                            </button>
                        )}
                    </div>
                </div>
            ))}


        </div>
    </div>
  )
}

export default MyBookings