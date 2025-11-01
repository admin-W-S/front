import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classroomAPI } from '../api/classroom';

const ClassroomList = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    filterClassrooms();
  }, [searchTerm, capacityFilter, classrooms]);

  const fetchClassrooms = async () => {
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

  const filterClassrooms = () => {
    let filtered = classrooms;

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

    setFilteredClassrooms(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">강의실 목록</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Classroom Grid */}
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
                <div className="flex gap-2">
                  <Link
                    to={`/reserve?classroomId=${classroom.id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    예약하기
                  </Link>
                  <Link
                    to={`/room/${classroom.id}/timeline`}
                    className="flex-1 text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    타임라인
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassroomList;

