const ClassroomFloor = ({ floor, classrooms, selectedClassroom, onClassroomSelect }) => {
  if (!floor || !classrooms || classrooms.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card p-12 text-center">
        <p className="text-xl text-gray-600 font-medium">강의실 정보가 없습니다</p>
      </div>
    );
  }

  // 층 배치: 레이아웃을 시각적으로 표현
  const getClassroomPosition = (index, total) => {
    // 간단한 그리드 배치 (3열 기준)
    const cols = 3;
    const row = Math.floor(index / cols);
    const col = index % cols;
    return { row, col };
  };

  return (
    <div className="bg-white rounded-2xl shadow-glow p-8 animate-fade-in">
      <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-8 text-center">📚 {floor}층 강의실</h3>
      
      {/* 강의실 그리드 배치 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((room, index) => {
          const isSelected = selectedClassroom?.id === room.id;
          const isReserved = !room.available;
          
          return (
            <button
              key={room.id}
              onClick={() => onClassroomSelect(room)}
              className={`relative p-6 rounded-2xl border-3 transition-all duration-300 hover:scale-hover hover:shadow-glow ${
                isSelected
                  ? 'border-primary bg-gradient-to-br from-primary/20 to-accent/20 shadow-glow scale-105'
                  : isReserved
                  ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                  : 'border-gray-300 hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5'
              }`}
            >
              {/* 강의실 평면도 프리뷰 */}
              <div className="mb-4 relative w-full h-40 bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 rounded-2xl overflow-hidden border-2 border-blue-200">
                {/* 칠판 */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl"></div>
                
                {/* 좌석들 (작은 점으로 표현) */}
                <div className="absolute bottom-3 left-3 right-3 grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-full aspect-square rounded-lg ${
                        isReserved ? 'bg-gray-400' : 'bg-white border-2 border-gray-300'
                      }`}
                    ></div>
                  ))}
                </div>
                
                {/* 출입문 */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl"></div>
              </div>
              
              {/* 강의실 정보 */}
              <h4 className="text-2xl font-black text-gray-900 mb-2">{room.name}</h4>
              <p className="text-lg text-gray-700 font-bold mb-3">{room.location}</p>
              
              {/* 상태 배지 */}
              <div className="flex items-center justify-between">
                <span className="text-lg text-gray-800 font-black">
                  👥 {room.capacity}명
                </span>
                <span
                  className={`px-4 py-2 rounded-full text-base font-black ${
                    isReserved
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  }`}
                >
                  {isReserved ? '예약됨' : '예약 가능'}
                </span>
              </div>
              
              {isSelected && (
                <div className="absolute top-4 right-4 w-4 h-4 bg-primary rounded-full shadow-glow animate-pulse-slow"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ClassroomFloor;

