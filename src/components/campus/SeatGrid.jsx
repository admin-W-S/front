const SeatGrid = ({ classroom, selectedSeats = [], onSeatClick, maxSeats = null }) => {
  if (!classroom) {
    return (
      <div className="bg-white rounded-xl shadow-card p-12 text-center">
        <p className="text-xl text-gray-600 font-medium">강의실을 선택해주세요</p>
      </div>
    );
  }

  // 좌석 그리드 생성 (기본: 5열)
  const rows = Math.ceil(classroom.capacity / 5);
  const seats = Array.from({ length: classroom.capacity }, (_, i) => i + 1);

  const getSeatStatus = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) return 'selected';
    // 예약된 좌석 체크 (실제 구현 시 API 데이터 활용)
    return 'available';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-2xl shadow-glow p-8 animate-fade-in">
      <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-8 text-center">
        {classroom.name} 좌석 배치
      </h3>
      
      {/* 칠판 */}
      <div className="relative mb-8">
        <div className="mx-auto w-4/5 h-12 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-glow"></div>
        <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 text-lg text-gray-700 font-black">
          칠판
        </span>
      </div>
      
      {/* 좌석 그리드 */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {seats.map((seatNumber) => {
          const status = getSeatStatus(seatNumber);
          const isDisabled = maxSeats && selectedSeats.length >= maxSeats && status !== 'selected';
          
          return (
            <button
              key={seatNumber}
              onClick={() => !isDisabled && onSeatClick && onSeatClick(seatNumber)}
              disabled={isDisabled}
              className={`aspect-square rounded-2xl border-3 font-black text-lg transition-all duration-300 hover:scale-125 ${
                status === 'selected'
                  ? 'bg-gradient-to-br from-pink-500 to-red-500 text-white border-pink-600 shadow-glow'
                  : isDisabled
                  ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'bg-white text-gray-800 border-gray-400 hover:border-primary hover:shadow-glow hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10'
              }`}
            >
              {seatNumber}
            </button>
          );
        })}
      </div>
      
      {/* 출입문 */}
      <div className="flex justify-center mb-3">
        <div className="w-24 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl border-3 border-amber-600 shadow-md"></div>
      </div>
      <div className="text-center text-lg text-gray-700 font-black mb-6">🚪 출입문</div>
      
      {/* 좌석 정보 */}
      <div className="mt-8 pt-6 border-t-2 border-gray-300">
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-xl bg-white border-3 border-gray-400"></div>
            <span className="text-lg text-gray-800 font-bold">예약 가능</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 shadow-glow"></div>
            <span className="text-lg text-gray-800 font-bold">선택됨</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-xl bg-gray-200 border-3 border-gray-300"></div>
            <span className="text-lg text-gray-800 font-bold">불가</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;

