import React, { useState } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'

const Dashboard = () => {

    
    const {currency, user, getToken, axios, isOwner} = useAppContext();
    const [dashboardData, setDashboardData] = useState({
        bookings: [],
        totalBookings: 0,
        totalRevenue: 0,
    });

    const fetchDashboardData = async () => {
        const token = await getToken({ template: 'backend' });
        try {
            
            const {data} = await axios.get('/api/bookings/hotel', {
                
            headers: {
            Authorization: `Bearer ${token}`
            }})
            if(data.success){
                // server returns dashboardData and bookings separately
                setDashboardData({
                    bookings: data.bookings || [],
                    totalBookings: data.dashboardData?.totalBookings || 0,
                    totalRevenue: data.dashboardData?.totalRevenue || 0,
                });
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (user && isOwner) {
            fetchDashboardData();
        }
    }, [user, isOwner])

  return (
    <div>
        <Title align='left' font='Be Vietnam Pro' title='Dashboard' subTitle='Quản lý danh sách phòng, theo dõi đặt phòng và phân tích doanh thu — tất cả trong một nơi duy nhất. Luôn nắm bắt thông tin theo thời gian thực để vận hành suôn sẻ.' />

        <div className='flex gap-4 my-8'>
            {/* Total Bookings */}
            <div className='bg-primary/3 border border-primary/10 rounded flex p-4
            pr-8'>
                <img src={assets.totalBookingIcon} alt="total-booking-icon"
                className='max-sm:hidden h-10' />
                <div className='flex flex-col sm:ml-4 font-bold'>
                    <p className='text-blue-500 text-lg font-lora'>Tổng lượt đặt phòng</p>
                    <p className='text-neutral-400 text-base'>{dashboardData.totalBookings}</p>
                </div>
            </div>
            {/* Total Revenue */}
            <div className='bg-primary/3 border border-primary/10 rounded flex p-4
            pr-8'>
                <img src={assets.totalRevenueIcon} alt="total-booking-icon"
                className='max-sm:hidden h-10' />
                <div className='flex flex-col sm:ml-4 font-bold'>
                    <p className='text-blue-500 text-lg font-lora'>Tổng doanh thu</p>
                    <p className='text-neutral-400 text-base'>{currency} {dashboardData.totalRevenue}</p>
                </div>
            </div>
        </div>

        {/* Recent Bookings */}
        <h2 className='text-xl text-blue-950/70 font-medium mb-5'>
            Lịch sử đặt phòng
        </h2>
        <div className='w-full max-w-3xl text-left border border-gray-300
        rounded-lg max-h-80 overflow-y-scroll'>
            <table className='w-full'>
                <thead className='bg-gray-50'>
                    <tr>
                        <th className='py-3 px-4 text-gray-800 font-bold'>Tên User</th>
                        <th className='py-3 px-4 text-gray-800 font-bold
                        max-sm:hidden'>Tên Phòng</th>
                        <th className='py-3 px-4 text-gray-800 font-bold
                        text-center'>Giá phòng</th>
                        <th className='py-3 px-4 text-gray-800 font-bold
                        text-center'>Tình trạng thanh toán</th>
                    </tr>
                </thead>


                <tbody className='text-sm font-medium'>
                    {dashboardData.bookings.map((item, index) =>(
                        <tr key={index}>
                            <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                                {item.user.username}
                            </td>

                            <td className='py-3 px-4 text-gray-700 border-t border-gray-300
                            max-sm:hidden'>
                                {item.room.roomType}
                            </td>

                            <td className='py-3 px-4 text-gray-700 border-t border-gray-300
                            text-center'>
                               {currency} {item.totalPrice}
                            </td>

                            <td className='py-3 px-4 border-t border-gray-300 flex'>
                                <button className={`py-1 px-3 text-xs rounded-full mx-auto ${
                                item.isPaid 
                                    ? 'bg-green-200 text-green-600' 
                                    : 'bg-amber-200 text-yellow-600'
                                }`}>
                                {item.isPaid ? 'Hoàn tất' : 'Chưa hoàn tất'}
                                </button>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>

    </div>
  )
}

export default Dashboard