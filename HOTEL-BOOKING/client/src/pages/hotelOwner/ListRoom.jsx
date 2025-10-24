import React , { useState } from 'react'
import { roomsDummyData } from '../../assets/assets';
import Title from '../../components/Title';


const ListRoom = () => {

  const [rooms, setRooms] = useState(roomsDummyData);

  return (
    <div>
        <Title align='left' font='Be Vietnam Pro' title='Danh sách phòng' 
        subTitle='Xem, chỉnh sửa hoặc quản lý tất cả các phòng đã được đăng. 
        Hãy luôn cập nhật thông tin mới nhất để mang đến trải nghiệm tốt nhất cho người dùng.'/>
        <p className='text-gray-500 mt-8'>Các phòng</p>
        <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll mt-3'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
                    <tr>
                        <th className='py-3 px-4 text-gray-800 font-bold'>Tên</th>
                        <th className='py-3 px-4 text-gray-800 font-bold
                        max-sm:hidden'>Cơ sở vật chất</th>
                        <th className='py-3 px-4 text-gray-800 font-bold
                        text-center'>Giá / đêm</th>
                        <th className='py-3 px-4 text-gray-800 font-bold
                        text-center'>Thao tác</th>
                    </tr>
                </thead>
                <tbody className='text-sm'>
                  {
                    rooms.map((item, index)=>(
                      <tr key={index}>
                        <td className='py-3 px-4 text-gray-700 border-t border-gray-300'>
                          {item.roomType}
                        </td>
                        <td className='py-3 px-4 text-gray-700 border-t border-gray-300
                        max-sm:hidden'>
                          {item.amenities.join(',')}
                        </td>
                        <td className='py-3 px-4 text-gray-700 border-t border-gray-300 text-center'>
                          {item.pricePerNight}
                        </td>
                        <td className='py-3 px-4 border-t border-gray-300 text-sm text-red-500
                        text-center'>
                            <label className='relative inline-flex items-center cursor-pointer
                            text-gray-900 gap-3'>
                                <input type='checkbox' className='sr-only' checked={item.isAvailable}
                                onChange={() => {
                                  const updatedRooms = rooms.map((room, i) =>
                                    i === index ? { ...room, isAvailable: !room.isAvailable } : room
                                  );
                                  setRooms(updatedRooms);
                                }}/>
                                <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${
                                  item.isAvailable ? 'bg-blue-600' : 'bg-slate-300'
                                }`}>
                                  <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full 
                                  transition-transform duration-300 ease-in-out ${
                                    item.isAvailable ? 'translate-x-5' : 'translate-x-0'
                                  }`}></span>
                                </div>
                                
                            </label>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
          </table>
        </div>
    </div>
  )
}

export default ListRoom