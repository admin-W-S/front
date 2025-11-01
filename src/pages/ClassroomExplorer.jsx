import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CampusMap from '../components/campus/CampusMap';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { classroomAPI } from '../api/classroom';

const ClassroomExplorer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');

  useEffect(() => {
    fetchAllClassrooms();
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      filterClassroomsByBuilding();
    } else {
      filterClassrooms();
    }
  }, [selectedBuilding, classrooms, searchTerm, capacityFilter]);

  const fetchAllClassrooms = async () => {
    try {
      setLoading(true);
      const response = await classroomAPI.getAll();
      setClassrooms(response.data);
      setFilteredClassrooms(response.data);
    } catch (error) {
      console.error('강의실 목록을 불러오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClassroomsByBuilding = () => {
    // 선택된 건물의 강의실만 필터링
    let filtered = classrooms.filter(room => {
      if (selectedBuilding && room.location) {
        return room.location === selectedBuilding.name || room.location === selectedBuilding.id;
      }
      return false;
    });
    
    // 추가 필터링 (검색어, 수용인원)
    filtered = applyFilters(filtered);
    setFilteredClassrooms(filtered);
  };

  const filterClassrooms = () => {
    const filtered = applyFilters(classrooms);
    setFilteredClassrooms(filtered);
  };

  const applyFilters = (classroomsList) => {
    let filtered = classroomsList;

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(classroom =>
        classroom.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by capacity
    if (capacityFilter) {
      const capacity = parseInt(capacityFilter);
      filtered = filtered.filter(classroom => classroom.capacity >= capacity);
    }

    return filtered;
  };

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    setSelectedClassroom(null);
  };

  const handleClassroomSelect = (classroom) => {
    if (!classroom.available) return;
    setSelectedClassroom(classroom);
    navigate(`/reserve?classroomId=${classroom.id}`);
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
        {/* 왼쪽: 캠퍼스 지도 (2열 차지) */}
        <div className="lg:col-span-2">
          <CampusMap
            buildings={null}
            selectedBuilding={selectedBuilding}
            onBuildingSelect={handleBuildingSelect}
          />
        </div>

        {/* 오른쪽: 필터 및 검색 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-glow p-6">
            <h3 className="text-2xl font-bold mb-4">필터</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검색
                </label>
                <input
                  type="text"
                  placeholder="강의실 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소 수용 인원
                </label>
                <input
                  type="number"
                  placeholder="최소 수용 인원"
                  value={capacityFilter}
                  onChange={(e) => setCapacityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 강의실 목록 (ClassroomList 스타일) */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">
          {selectedBuilding 
            ? `${selectedBuilding.name} 강의실`
            : '전체 강의실'}
        </h2>
        {filteredClassrooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClassrooms.map((classroom) => (
              <div key={classroom.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {classroom.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{classroom.location}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">
                      수용 인원: {classroom.capacity}명
                    </span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      classroom.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {classroom.available ? '사용 가능' : '사용 중'}
                    </span>
                  </div>
                  {classroom.equipments && classroom.equipments.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">시설:</p>
                      <div className="flex flex-wrap gap-2">
                        {classroom.equipments.map((equipment, idx) => {
                          const equipmentNames = {
                            projector: '프로젝터',
                            whiteboard: '화이트보드'
                          };
                          return (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {equipmentNames[equipment] || equipment}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <Link
                    to={`/reserve?classroomId=${classroom.id}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    예약하기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
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

