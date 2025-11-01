import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { classroomAPI } from '../api/classroom';
import { reservationAPI } from '../api/reservation';

const Reservation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classroomIdParam = searchParams.get('classroomId');

  const [classrooms, setClassrooms] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    classroomId: classroomIdParam || '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (formData.classroomId && formData.date) {
      fetchAvailableSlots();
    }
  }, [formData.classroomId, formData.date]);

  const fetchClassrooms = async () => {
    try {
      const response = await classroomAPI.getAll();
      setClassrooms(response.data);
    } catch (error) {
      console.error('강의실 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await reservationAPI.getAvailableSlots(
        formData.classroomId,
        formData.date
      );
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('예약 가능 시간을 불러오는데 실패했습니다:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.startTime || !formData.endTime) {
      setError('시작 시간과 종료 시간을 선택해주세요.');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setError('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      await reservationAPI.create(formData);
      alert('예약이 완료되었습니다!');
      navigate('/my-reservations');
    } catch (err) {
      setError(err.response?.data?.message || '예약에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotClick = (startTime, endTime) => {
    setFormData({
      ...formData,
      startTime,
      endTime,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">강의실 예약</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강의실 선택
              </label>
              <select
                name="classroomId"
                value={formData.classroomId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">강의실을 선택하세요</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} ({classroom.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                예약 날짜
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작 시간
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종료 시간
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Available Time Slots */}
          {availableSlots.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                예약 가능한 시간대
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableSlots.map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSlotClick(slot.start, slot.end)}
                    className="px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                  >
                    {slot.start} - {slot.end}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사용 목적
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              rows="4"
              placeholder="사용 목적을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? '예약 중...' : '예약하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reservation;

