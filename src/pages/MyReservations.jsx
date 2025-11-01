import { useState, useEffect } from 'react';
import { reservationAPI } from '../api/reservation';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationAPI.getMyReservations();
      setReservations(response.data);
    } catch (error) {
      setError('예약 내역을 불러오는데 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('정말 취소하시겠습니까?')) {
      return;
    }

    try {
      await reservationAPI.delete(id);
      setShowSuccessMessage(true);
      fetchReservations();
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      alert('예약 취소에 실패했습니다.');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
      {/* 성공 메시지 */}
      {showSuccessMessage && (
        <div className="fixed top-24 right-8 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl shadow-glow animate-bounce-in">
          <p className="text-2xl font-black">🎉 예약이 취소되었습니다!</p>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4 animate-fade-in">
          내 예약 내역
        </h1>
        <p className="text-2xl text-gray-800 font-bold">예약한 강의실을 확인하고 관리하세요</p>
      </div>

      {error && (
        <Card className="bg-gradient-to-r from-red-100 to-red-200 border-red-500 mb-8">
          <p className="text-xl text-red-800 font-bold">{error}</p>
        </Card>
      )}

      {reservations.length === 0 ? (
        <Card className="p-16 text-center animate-slide-up">
          <div className="text-8xl mb-6">📭</div>
          <p className="text-3xl text-gray-700 font-black mb-4">예약 내역이 없습니다</p>
          <p className="text-xl text-gray-600 font-bold">강의실을 탐색하고 예약해보세요!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {reservations.map((reservation, index) => (
            <Card 
              key={reservation.id} 
              className="hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4">
                    {reservation.classroom?.name || '강의실명 없음'}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xl text-gray-800 font-black">
                      📍 위치: {reservation.classroom?.location}
                    </p>
                    <p className="text-xl text-gray-800 font-black">
                      📅 날짜: {formatDate(reservation.date)}
                    </p>
                    <p className="text-xl text-gray-800 font-black">
                      ⏰ 시간: {reservation.startTime} - {reservation.endTime}
                    </p>
                    <p className="text-xl text-gray-800 font-black">
                      📝 목적: {reservation.purpose}
                    </p>
                  </div>
                  <span
                    className={`inline-block mt-4 px-5 py-2 rounded-full text-lg font-black ${
                      reservation.status === 'confirmed'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : reservation.status === 'pending'
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                        : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                    }`}
                  >
                    {reservation.status === 'confirmed'
                      ? '✓ 확정'
                      : reservation.status === 'pending'
                      ? '⏳ 대기'
                      : '✕ 취소'}
                  </span>
                </div>
                {reservation.status === 'confirmed' && (
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => handleCancel(reservation.id)}
                    className="ml-8"
                  >
                    취소하기
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReservations;

