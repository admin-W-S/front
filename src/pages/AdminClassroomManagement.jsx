import { useState, useEffect } from 'react';
import { classroomAPI } from '../api/classroom';

const AdminClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    amenities: '',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const classroomData = {
      ...formData,
      capacity: parseInt(formData.capacity),
      amenities: formData.amenities
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item),
    };

    try {
      if (editingClassroom) {
        await classroomAPI.update(editingClassroom.id, classroomData);
        alert('강의실 정보가 수정되었습니다.');
      } else {
        await classroomAPI.create(classroomData);
        alert('강의실이 추가되었습니다.');
      }
      setShowModal(false);
      resetForm();
      fetchClassrooms();
    } catch (err) {
      setError(err.response?.data?.message || '작업에 실패했습니다.');
    }
  };

  const handleEdit = (classroom) => {
    setEditingClassroom(classroom);
    setFormData({
      name: classroom.name,
      location: classroom.location,
      capacity: classroom.capacity,
      amenities: classroom.amenities?.join(', ') || '',
      description: classroom.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await classroomAPI.delete(id);
      alert('강의실이 삭제되었습니다.');
      fetchClassrooms();
    } catch (error) {
      alert('삭제에 실패했습니다.');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      capacity: '',
      amenities: '',
      description: '',
    });
    setEditingClassroom(null);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">강의실 관리</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + 강의실 추가
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingClassroom ? '강의실 수정' : '강의실 추가'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  강의실 이름
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  위치
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수용 인원
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시설 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="예: 프로젝터, 화이트보드, 마이크"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingClassroom ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Classroom List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classrooms.map((classroom) => (
          <div
            key={classroom.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {classroom.name}
              </h3>
              <p className="text-gray-600 mb-2">{classroom.location}</p>
              <p className="text-sm text-gray-500 mb-4">
                수용 인원: {classroom.capacity}명
              </p>
              {classroom.amenities && classroom.amenities.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {classroom.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(classroom)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(classroom.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {classrooms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">등록된 강의실이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default AdminClassroomManagement;

