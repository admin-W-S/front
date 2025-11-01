import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CampusMap from '../components/campus/CampusMap';
import BuildingView from '../components/campus/BuildingView';
import ClassroomFloor from '../components/campus/ClassroomFloor';
import SeatGrid from '../components/campus/SeatGrid';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { classroomAPI } from '../api/classroom';

const ClassroomExplorer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState([]);

  useEffect(() => {
    fetchAllClassrooms();
  }, []);

  useEffect(() => {
    if (selectedFloor && classrooms.length > 0) {
      filterClassroomsByFloor();
    }
  }, [selectedFloor, classrooms]);

  const fetchAllClassrooms = async () => {
    try {
      setLoading(true);
      const response = await classroomAPI.getAll();
      setClassrooms(response.data);
    } catch (error) {
      console.error('강의실 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClassroomsByFloor = () => {
    // 강의실 위치에서 층 정보 추출 (예: "본관 3층" -> 3층)
    const filtered = classrooms.filter(room => {
      const location = room.location || '';
      return location.includes(`${selectedFloor}층`) || location.includes(`${selectedFloor}F`);
    });
    setFilteredClassrooms(filtered);
  };

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    setSelectedFloor(null);
    setSelectedClassroom(null);
    setSelectedSeats([]);
  };

  const handleFloorSelect = (floor) => {
    setSelectedFloor(floor);
    setSelectedClassroom(null);
    setSelectedSeats([]);
  };

  const handleClassroomSelect = (classroom) => {
    if (!classroom.available) return; // 예약된 강의실은 선택 불가
    setSelectedClassroom(classroom);
    setSelectedSeats([]);
  };

  const handleSeatClick = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 5) { // 최대 5개 좌석 선택
        alert('좌석은 최대 5개까지 선택할 수 있습니다.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleReserve = () => {
    if (!selectedClassroom || selectedSeats.length === 0) {
      alert('강의실과 좌석을 선택해주세요.');
      return;
    }
    navigate(`/reserve?classroomId=${selectedClassroom.id}&seats=${selectedSeats.join(',')}`);
  };

  const getBuildingFromClassroom = (classroom) => {
    // 강의실 위치에서 건물 정보 추출
    const location = classroom.location || '';
    if (location.includes('본관')) return 'main';
    if (location.includes('도서관')) return 'library';
    if (location.includes('과학관')) return 'science';
    if (location.includes('예술관')) return 'art';
    return 'main';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
      {/* 헤더 */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4 animate-fade-in">
          강의실 탐색
        </h1>
        <p className="text-2xl text-gray-800 font-bold">
          캠퍼스 지도를 통해 강의실을 직접 탐색하고 예약하세요
        </p>
      </div>

      {/* 메인 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 왼쪽: 캠퍼스 지도 */}
        <div className="lg:col-span-1">
          <CampusMap
            buildings={null}
            selectedBuilding={selectedBuilding}
            onBuildingSelect={handleBuildingSelect}
          />
        </div>

        {/* 중앙: 건물/층 선택 */}
        <div className="lg:col-span-1">
          <BuildingView
            building={selectedBuilding}
            selectedFloor={selectedFloor}
            onFloorSelect={handleFloorSelect}
          />
        </div>

        {/* 오른쪽: 층 강의실 목록 */}
        <div className="lg:col-span-1">
          <ClassroomFloor
            floor={selectedFloor}
            classrooms={filteredClassrooms}
            selectedClassroom={selectedClassroom}
            onClassroomSelect={handleClassroomSelect}
          />
        </div>
      </div>

      {/* 선택된 강의실 좌석 상세 */}
      {selectedClassroom && (
        <div className="mb-6">
          <SeatGrid
            classroom={selectedClassroom}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
            maxSeats={5}
          />
        </div>
      )}

      {/* 예약 요약 */}
      <div className="bg-gradient-to-br from-primary via-purple-600 to-accent rounded-2xl shadow-glow p-8 text-white animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-4xl font-black mb-4">🎫 예약 요약</h3>
            {selectedClassroom ? (
              <div className="space-y-2">
                <p className="text-2xl font-black">강의실: {selectedClassroom.name}</p>
                <p className="text-xl font-bold">위치: {selectedClassroom.location}</p>
                {selectedSeats.length > 0 && (
                  <p className="text-xl font-bold">선택 좌석: {selectedSeats.join(', ')}번</p>
                )}
              </div>
            ) : (
              <p className="text-2xl font-bold">강의실을 선택해주세요</p>
            )}
          </div>
          <div>
            <Button
              variant="secondary"
              size="xl"
              onClick={handleReserve}
              disabled={!selectedClassroom || selectedSeats.length === 0}
              className="shadow-glow"
            >
              예약하기
            </Button>
          </div>
        </div>
      </div>

      {/* 빠른 접근 버튼 */}
      <div className="mt-8 flex justify-center space-x-6">
        <Button variant="outline" size="lg" onClick={() => navigate('/classrooms')}>
          📋 목록 보기
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/my-reservations')}>
          📅 내 예약
        </Button>
      </div>
    </div>
  );
};

export default ClassroomExplorer;

