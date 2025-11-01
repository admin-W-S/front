import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { classroomAPI } from '../api/classroom';
import { reservationAPI } from '../api/reservation';
import { authAPI } from '../api/auth';
import { waitlistAPI } from '../api/waitlist';

const Reservation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classroomIdParam = searchParams.get('classroomId');

  const [classrooms, setClassrooms] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [nonMemberParticipants, setNonMemberParticipants] = useState([]); // 비회원 참여 인원 (학번 등)
  const [nonMemberInput, setNonMemberInput] = useState(''); // 비회원 입력 필드
  const [formData, setFormData] = useState({
    classroomId: classroomIdParam || '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    participants: [],
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  useEffect(() => {
    fetchClassrooms();
    fetchMyReservations();
    fetchStudents();
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

  const fetchMyReservations = async () => {
    try {
      const response = await reservationAPI.getMyReservations();
      setMyReservations(response.data);
    } catch (error) {
      console.error('내 예약 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await authAPI.getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('학생 목록을 불러오는데 실패했습니다:', error);
    }
  };

  // 미래 예약 개수 확인
  const getFutureReservationCount = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    return myReservations.filter(reservation => {
      if (reservation.status !== 'confirmed') return false;
      
      // 날짜가 미래거나, 오늘이면 시간이 미래여야 함
      if (reservation.date > todayStr) return true;
      if (reservation.date === todayStr && reservation.startTime > currentTime) return true;
      return false;
    }).length;
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

    // 예약 개수 확인
    const futureReservationCount = getFutureReservationCount();
    if (futureReservationCount >= 3) {
      setError('1인당 최대 3개의 미래 예약만 가능합니다. 기존 예약을 취소한 후 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);

    // 디버깅: formData 확인
    console.log("제출 전 formData:", formData);
    console.log("formData.purpose:", formData.purpose);

    try {
      // 참여 인원 포함하여 전송 (회원 ID + 비회원 정보)
      const allParticipants = [...selectedParticipants, ...nonMemberParticipants];
      const reservationData = {
        ...formData,
        participants: allParticipants,
      };
      await reservationAPI.create(reservationData);
      alert('예약이 완료되었습니다!');
      navigate('/my-reservations');
    } catch (err) {
      const errorMessage = err.response?.data?.message || '예약에 실패했습니다.';
      setError(errorMessage);
      
      // 예약이 이미 있어서 실패한 경우, 대기 신청 옵션 제공
      if (errorMessage.includes('예약이 이미') || errorMessage.includes('겹치는') || errorMessage.includes('이미 예약')) {
        setIsCheckingAvailability(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWaitlistSubmit = async () => {
    if (!formData.classroomId || !formData.date || !formData.startTime || !formData.endTime) {
      alert('강의실, 날짜, 시간을 모두 입력해주세요.');
      return;
    }

    try {
      await waitlistAPI.create({
        roomId: formData.classroomId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      });
      alert('대기 신청이 완료되었습니다!');
      setShowWaitlistModal(false);
      navigate('/my-reservations');
    } catch (err) {
      alert(err.response?.data?.message || '대기 신청에 실패했습니다.');
    }
  };

  const handleSlotClick = (startTime, endTime) => {
    setFormData({
      ...formData,
      startTime,
      endTime,
    });
  };

  const handleParticipantToggle = (studentId) => {
    if (selectedParticipants.includes(studentId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== studentId));
    } else {
      setSelectedParticipants([...selectedParticipants, studentId]);
    }
  };

  const handleAddNonMember = () => {
    const trimmed = nonMemberInput.trim();
    if (trimmed && !nonMemberParticipants.includes(trimmed)) {
      setNonMemberParticipants([...nonMemberParticipants, trimmed]);
      setNonMemberInput('');
    }
  };

  const handleRemoveNonMember = (value) => {
    setNonMemberParticipants(nonMemberParticipants.filter(v => v !== value));
  };

  const getSelectedClassroom = () => {
    return classrooms.find(c => c.id === parseInt(formData.classroomId));
  };

  const selectedClassroom = getSelectedClassroom();
  const maxParticipants = selectedClassroom ? selectedClassroom.capacity - 1 : 0; // 예약자 제외
  const totalParticipants = 1 + selectedParticipants.length + nonMemberParticipants.length; // 예약자 + 회원 참여 인원 + 비회원 참여 인원

  const futureReservationCount = getFutureReservationCount();
  const canMakeReservation = futureReservationCount < 3;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">강의실 예약</h1>

      {/* 예약 개수 알림 */}
      <div className={`mb-4 p-4 rounded-lg ${
        canMakeReservation 
          ? 'bg-blue-50 border border-blue-200 text-blue-800' 
          : 'bg-red-50 border border-red-200 text-red-800'
      }`}>
        <p className="font-semibold">
          {canMakeReservation 
            ? `현재 미래 예약: ${futureReservationCount}개 / 최대 3개 (예약 가능: ${3 - futureReservationCount}개)`
            : '현재 미래 예약이 3개입니다. 예약을 하려면 기존 예약을 취소해주세요.'}
        </p>
      </div>

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

          {/* 참여 인원 선택 (그룹 예약) */}
          {formData.classroomId && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                참여 인원 (선택사항)
                {selectedClassroom && (
                  <span className="text-xs text-gray-500 ml-2">
                    (최대 {maxParticipants}명, 현재: {selectedParticipants.length + nonMemberParticipants.length}명 / 총 {totalParticipants}명)
                  </span>
                )}
              </label>
              {selectedClassroom && totalParticipants > selectedClassroom.capacity && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                  ⚠️ 참여 인원({totalParticipants}명)이 강의실 최대 수용인원({selectedClassroom.capacity}명)을 초과합니다.
                </div>
              )}
              
              {/* 회원 참여 인원 선택 */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  회원 참여 인원
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {students.length === 0 ? (
                    <p className="text-sm text-gray-500">학생 목록을 불러오는 중...</p>
                  ) : (
                    students.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(student.id)}
                          onChange={() => handleParticipantToggle(student.id)}
                          disabled={!selectedParticipants.includes(student.id) && (selectedParticipants.length + nonMemberParticipants.length) >= maxParticipants}
                          className="mr-2"
                        />
                        <span className="text-sm">
                          {student.name} ({student.email})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* 비회원 참여 인원 입력 */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  비회원 참여 인원 (학번 등)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={nonMemberInput}
                    onChange={(e) => setNonMemberInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNonMember();
                      }
                    }}
                    placeholder="학번 또는 이름 입력"
                    disabled={(selectedParticipants.length + nonMemberParticipants.length) >= maxParticipants}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={handleAddNonMember}
                    disabled={!nonMemberInput.trim() || (selectedParticipants.length + nonMemberParticipants.length) >= maxParticipants}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    추가
                  </button>
                </div>
                {nonMemberParticipants.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {nonMemberParticipants.map((value, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {value}
                        <button
                          type="button"
                          onClick={() => handleRemoveNonMember(value)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading || !canMakeReservation}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? '예약 중...' 
                : !canMakeReservation 
                  ? '예약 불가 (최대 3개 초과)'
                  : '예약하기'}
            </button>

            {/* 대기 신청 버튼 - 예약이 불가능한 경우 또는 예약 실패 시 */}
            {formData.classroomId && formData.date && formData.startTime && formData.endTime && (
              <button
                type="button"
                onClick={() => setShowWaitlistModal(true)}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 font-semibold"
              >
                ⏳ 대기 신청하기
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 대기 신청 모달 */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">대기 신청</h3>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">강의실</p>
                <p className="font-bold">{selectedClassroom?.name || '강의실'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">날짜</p>
                <p className="font-bold">{formData.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">시간</p>
                <p className="font-bold">{formData.startTime} - {formData.endTime}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ 예약이 꽉 찬 시간대에만 대기 신청이 가능합니다.
                  <br />
                  현재 예약이 3개면 대기 신청이 불가합니다.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleWaitlistSubmit}
                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 font-semibold"
              >
                신청하기
              </button>
              <button
                onClick={() => setShowWaitlistModal(false)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservation;

