import React , { useState, useEffect} from 'react'
import { roomsDummyData } from '../../assets/assets';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';

const ListRoom = () => {

  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', address: '', contact: '', city: '' });

  const {axios, getToken, user, currency, navigate} = useAppContext();


  // Fetch rooms of the Hotel Owner
  const fetchRooms = async () => {
    try {
      const token = await getToken({ template: 'backend' });
      const {data} = await axios.get('/api/rooms/owner', {
        headers: {
          Authorization: `Bearer ${token}`}})
          if(data.success){
            setRooms(data.rooms);
          } else {
            toast.error(data.message);
          }
    } catch (error) {
      toast.error(error.message);
    }
  }

  // Fetch hotel information for owner
  const fetchHotel = async () => {
    try {
      const token = await getToken({ template: 'backend' });
      const { data } = await axios.get('/api/hotels/owner', { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setHotel(data.hotel);
        setEditForm({ name: data.hotel.name || '', address: data.hotel.address || '', contact: data.hotel.contact || '', city: data.hotel.city || '' });
      }
    } catch (error) {
      // no hotel yet is OK
    }
  }

  // Toggle Availability of the Room
const toggleRoomAvailability = async (roomId) => {
  try {
    const token = await getToken({ template: 'backend' }); 
    const { data } = await axios.post(
      '/api/rooms/toggle-availability',
      { roomId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (data.success) {
      toast.success(data.message);
      fetchRooms(); 
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

  useEffect(() => {
    if(user){
      fetchRooms();
      fetchHotel();
    }
  }, [user])

  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({ roomType: '', pricePerNight: '', amenities: '' });

  const openEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({ roomType: room.roomType || '', pricePerNight: room.pricePerNight || '', amenities: (room.amenities || []).join(', ') });
  }

  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    setRoomForm(prev => ({ ...prev, [name]: value }));
  }

  const saveRoom = async () => {
    if(!editingRoom) return;
    try {
      const token = await getToken({ template: 'backend' });
      const payload = { roomType: roomForm.roomType, pricePerNight: Number(roomForm.pricePerNight), amenities: roomForm.amenities.split(',').map(s=>s.trim()) };
      const { data } = await axios.put(`/api/rooms/${editingRoom._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success('Cập nhật phòng thành công');
        setEditingRoom(null);
        fetchRooms();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi cập nhật phòng');
    }
  }

  const deleteRoomById = async (roomId) => {
    if(!confirm('Bạn có chắc muốn xóa phòng này?')) return;
    try {
      const token = await getToken({ template: 'backend' });
      const { data } = await axios.delete(`/api/rooms/${roomId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success('Phòng đã được xóa');
        fetchRooms();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi xóa phòng');
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  }

  const saveHotel = async () => {
    try {
      const token = await getToken({ template: 'backend' });
      const { data } = await axios.put(`/api/hotels/${hotel._id}`, editForm, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success('Cập nhật thông tin khách sạn thành công');
        setHotel(data.hotel);
        setEditing(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi cập nhật khách sạn');
    }
  }

  const deleteHotel = async () => {
    if (!hotel) return;
    if (!confirm('Bạn có chắc muốn xóa khách sạn? Tất cả phòng và booking liên quan sẽ bị xóa.')) return;
    try {
      const token = await getToken({ template: 'backend' });
      const { data } = await axios.delete(`/api/hotels/${hotel._id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success('Khách sạn đã được xóa');
        setHotel(null);
        setRooms([]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi xóa khách sạn');
    }
  }

  

  return (
    <div>
        <Title align='left' font='Be Vietnam Pro' title='Danh sách phòng' 
        subTitle='Xem, chỉnh sửa hoặc quản lý tất cả các phòng đã được đăng. 
        Hãy luôn cập nhật thông tin mới nhất để mang đến trải nghiệm tốt nhất cho người dùng.'/>
        <p className='text-gray-500 mt-8'>Thông tin khách sạn</p>

        {hotel ? (
          <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg p-4 mt-3'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-bold text-lg'>{hotel.name}</p>
                <p className='text-sm text-gray-500'>{hotel.address} • {hotel.city}</p>
                <p className='text-sm text-gray-500'>Liên hệ: {hotel.contact}</p>
              </div>
              <div className='flex gap-2'>
                <button className='px-3 py-1 border rounded' onClick={()=>setEditing(true)}>Chỉnh sửa</button>
                <button className='px-3 py-1 border rounded text-red-500' onClick={deleteHotel}>Xóa</button>
              </div>
            </div>
          </div>
        ) : (
          <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg p-4 mt-3'>
            <p className='text-gray-500'>Bạn chưa đăng ký khách sạn. Vui lòng thêm một khách sạn để bắt đầu đăng phòng.</p>
          </div>
        )}

        {editing && (
          <div className='fixed inset-0 flex items-center justify-center bg-black/40'>
            <div className='bg-white p-6 rounded w-full max-w-lg'>
              <h3 className='font-bold mb-4'>Chỉnh sửa thông tin khách sạn</h3>
              <div className='flex flex-col gap-2'>
                <input name='name' value={editForm.name} onChange={handleEditChange} placeholder='Tên' className='p-2 border' />
                <input name='address' value={editForm.address} onChange={handleEditChange} placeholder='Địa chỉ' className='p-2 border' />
                <input name='city' value={editForm.city} onChange={handleEditChange} placeholder='Thành phố' className='p-2 border' />
                <input name='contact' value={editForm.contact} onChange={handleEditChange} placeholder='Liên hệ' className='p-2 border' />
              </div>
              <div className='flex justify-end gap-2 mt-4'>
                <button className='px-4 py-2 border rounded' onClick={()=>setEditing(false)}>Hủy</button>
                <button className='px-4 py-2 bg-blue-600 text-white rounded' onClick={saveHotel}>Lưu</button>
              </div>
            </div>
          </div>
        )}

        <p className='text-gray-500 mt-6'>Các phòng</p>
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
                          {currency} {item.pricePerNight}
                        </td>
                        <td className='py-3 px-4 border-t border-gray-300 text-sm text-center'>
                          <div className='flex items-center justify-center gap-3'>
                            <button onClick={()=>openEditRoom(item)} className='px-2 py-1 border rounded text-sm'>Sửa</button>
                            <button onClick={()=>deleteRoomById(item._id)} className='px-2 py-1 border rounded text-sm text-red-500'>Xóa</button>
                            <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                                <input onChange={() => toggleRoomAvailability(item._id)} 
                                type='checkbox' className='sr-only' checked={item.isAvailable}/>
                                <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${
                                  item.isAvailable ? 'bg-blue-600' : 'bg-slate-300'
                                }`}>
                                  <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full 
                                  transition-transform duration-300 ease-in-out ${
                                    item.isAvailable ? 'translate-x-5' : 'translate-x-0'
                                  }`}></span>
                                </div>
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
          </table>
        </div>

        {editingRoom && (
          <div className='fixed inset-0 flex items-center justify-center bg-black/40'>
            <div className='bg-white p-6 rounded w-full max-w-lg'>
              <h3 className='font-bold mb-4'>Chỉnh sửa phòng</h3>
              <div className='flex flex-col gap-2'>
                <input name='roomType' value={roomForm.roomType} onChange={handleRoomChange} placeholder='Tên phòng' className='p-2 border' />
                <input name='pricePerNight' value={roomForm.pricePerNight} onChange={handleRoomChange} placeholder='Giá / đêm' className='p-2 border' />
                <input name='amenities' value={roomForm.amenities} onChange={handleRoomChange} placeholder='Amenities (comma separated)' className='p-2 border' />
              </div>
              <div className='flex justify-end gap-2 mt-4'>
                <button className='px-4 py-2 border rounded' onClick={()=>setEditingRoom(null)}>Hủy</button>
                <button className='px-4 py-2 bg-blue-600 text-white rounded' onClick={saveRoom}>Lưu</button>
              </div>
            </div>
          </div>
        )}

    </div>
  )
}

export default ListRoom