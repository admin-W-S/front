import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reservationAPI } from '../api/reservation';
import { classroomAPI } from '../api/classroom';
import { waitlistAPI } from '../api/waitlist';
import { getSocket } from '../utils/socket';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const RoomTimeline = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [waitlistDate, setWaitlistDate] = useState('');
  const [waitlistStartTime, setWaitlistStartTime] = useState('');
  const [waitlistEndTime, setWaitlistEndTime] = useState('');
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  const fetchClassroom = async () => {
    try {
      const response = await classroomAPI.getById(roomId);
      setClassroom(response.data);
    } catch (error) {
      setError('강의실 정보를 불러오는데 실패했습니다.');
      console.error(error);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.getRoomReservations(roomId);
      setReservations(response.data);
      setError('');
    } catch (error) {
      setError('예약 현황을 불러오는데 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchClassroom();
      fetchReservations();
    }

    // Socket.io 실시간 업데이트 구독
    const socket = getSocket();
    
    const handleReservationUpdate = (data) => {
      // 같은 강의실의 예약 업데이트인지 확인
      if (data.roomId === parseInt(roomId)) {
        console.log('🔄 [Socket] Reservation update received:', data);
        // 예약 목록 다시 불러오기
        fetchReservations();
      }
    };

    socket.on('reservationUpdate', handleReservationUpdate);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      socket.off('reservationUpdate', handleReservationUpdate);
    };
  }, [roomId]);

  useEffect(() => {
    if (selectedDate) {
      // 특정 날짜 필터링
      const filtered = reservations.filter(r => r.date === selectedDate);
      setFilteredReservations(filtered);
    } else {
      // 전체 예약 표시 (최근 7일)
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const filtered = reservations.filter(r => {
        const reservationDate = new Date(r.date);
        return reservationDate >= sevenDaysAgo;
      });
      setFilteredReservations(filtered);
    }
  }, [selectedDate, reservations]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const getTimeSlotPosition = (startTime, endTime) => {
    // 시간을 분으로 변환 (예: 09:00 -> 540분)
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    // 하루는 24시간 = 1440분
    // 타임라인의 시작은 08:00 (480분), 끝은 22:00 (1320분)
    const dayStart = 480; // 08:00
    const dayEnd = 1320; // 22:00
    const dayDuration = dayEnd - dayStart; // 840분
    
    const top = ((startMinutes - dayStart) / dayDuration) * 100;
    const height = ((endMinutes - startMinutes) / dayDuration) * 100;
    
    return { top: `${top}%`, height: `${height}%` };
  };

  const getTimeSlots = () => {
    // 08:00부터 22:00까지 시간 슬롯 생성
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return slots;
  };

  // 날짜별로 그룹화
  const groupedByDate = filteredReservations.reduce((acc, reservation) => {
    if (!acc[reservation.date]) {
      acc[reservation.date] = [];
    }
    acc[reservation.date].push(reservation);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2 animate-fade-in">
              {classroom?.name || '강의실'} 예약 현황
            </h1>
            <p className="text-2xl text-gray-800 font-bold">
              {classroom?.location || '위치 정보 없음'}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(`/reserve?classroomId=${roomId}`)}
          >
            예약하기
          </Button>
        </div>

        {/* 날짜 필터 */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            날짜 필터 (선택사항)
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedDate && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedDate('')}
              >
                전체 보기
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Card className="bg-gradient-to-r from-red-100 to-red-200 border-red-500 mb-8">
          <p className="text-xl text-red-800 font-bold">{error}</p>
        </Card>
      )}

      {/* 타임라인 */}
      {sortedDates.length === 0 ? (
        <Card className="p-16 text-center animate-slide-up">
          <div className="text-8xl mb-6">📅</div>
          <p className="text-3xl text-gray-700 font-black mb-4">예약 내역이 없습니다</p>
          <p className="text-xl text-gray-600 font-bold">
            {selectedDate ? '선택한 날짜에는 예약이 없습니다.' : '이 강의실에는 아직 예약이 없습니다.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date, dateIndex) => (
            <Card key={date} className="animate-slide-up" style={{ animationDelay: `${dateIndex * 0.1}s` }}>
              <div className="mb-4">
                <h2 className="text-2xl font-black text-gray-800">
                  {formatDate(date)}
                </h2>
                <p className="text-sm text-gray-500">
                  총 {groupedByDate[date].length}개의 예약
                </p>
              </div>

              {/* 타임라인 시각화 - 가로 스크롤 */}
              <div className="relative bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <div className="flex gap-4 min-w-max">
                  {/* 시간 표시 (위쪽) */}
                  <div className="flex-shrink-0 w-16 pt-8">
                    <div className="flex flex-col h-[600px] justify-between text-sm text-gray-500">
                      {getTimeSlots().map((time, idx) => (
                        <div key={idx} className="text-xs whitespace-nowrap">
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 타임라인 영역 - 가로로 배치 */}
                  <div className="relative flex-1 min-w-[800px] h-[600px]">
                    {groupedByDate[date].map((reservation, idx) => {
                      const position = getTimeSlotPosition(reservation.startTime, reservation.endTime);
                      return (
                        <div
                          key={reservation.id}
                          className="absolute left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow z-10 overflow-hidden"
                          style={{
                            top: position.top,
                            height: position.height,
                            minHeight: '60px',
                          }}
                        >
                          <div className="flex flex-col gap-1 relative h-full">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold whitespace-nowrap">
                                {reservation.startTime} - {reservation.endTime}
                              </span>
                              <span className="text-sm font-semibold whitespace-nowrap">
                                👤 {reservation.userName}
                              </span>
                              {reservation.participants && reservation.participants.length > 0 && (
                                <span className="text-sm whitespace-nowrap">
                                  👥 {reservation.participants.length}명
                                </span>
                              )}
                            </div>
                            {reservation.purpose && (
                              <div className="text-sm break-words line-clamp-2">
                                📝 {reservation.purpose}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 예약 목록 (텍스트) */}
              <div className="mt-4 space-y-2">
                {groupedByDate[date].map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">
                          {reservation.startTime} - {reservation.endTime}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                          {reservation.userName}
                        </span>
                        {reservation.participants && reservation.participants.length > 0 && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">
                            그룹예약 ({reservation.participants.length}명)
                          </span>
                        )}
                      </div>
                      {reservation.purpose && (
                        <p className="text-sm text-gray-600">
                          목적: {reservation.purpose}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="warning"
                      size="md"
                      onClick={() => {
                        setWaitlistDate(date);
                        setWaitlistStartTime(reservation.startTime);
                        setWaitlistEndTime(reservation.endTime);
                        setShowWaitlistModal(true);
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold"
                    >
                      ⏳ 대기 신청
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 대기 신청 모달 */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-2xl font-black text-gray-800 mb-4">
                대기 신청
              </h3>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">강의실</p>
                  <p className="font-bold">{classroom?.name || '강의실'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">날짜</p>
                  <p className="font-bold">{waitlistDate ? formatDate(waitlistDate) : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">시간</p>
                  <p className="font-bold">{waitlistStartTime} - {waitlistEndTime}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={async () => {
                    try {
                      await waitlistAPI.create({
                        roomId: roomId,
                        date: waitlistDate,
                        startTime: waitlistStartTime,
                        endTime: waitlistEndTime,
                      });
                      alert('대기 신청이 완료되었습니다!');
                      setShowWaitlistModal(false);
                    } catch (err) {
                      alert(err.response?.data?.message || '대기 신청에 실패했습니다.');
                    }
                  }}
                  className="flex-1"
                >
                  신청하기
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowWaitlistModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RoomTimeline;

