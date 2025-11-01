const CampusMap = ({ buildings, selectedBuilding, onBuildingSelect }) => {
  // 실제 강의실 데이터 기반 건물 목록
  const defaultBuildings = [
    { id: '공대1호관', name: '공대1호관', floors: 5, color: '#2563EB' },
    { id: '공3호관', name: '공3호관', floors: 5, color: '#1E40AF' },
    { id: '공대5호관', name: '공대5호관', floors: 5, color: '#1E90FF' },
    { id: '도서관', name: '도서관', floors: 3, color: '#059669' },
    { id: '자연대', name: '자연대', floors: 5, color: '#DC2626' },
    { id: '경상대', name: '경상대', floors: 5, color: '#F59E0B' },
    { id: '인문대', name: '인문대', floors: 5, color: '#9333EA' },
    { id: '사과대', name: '사과대', floors: 5, color: '#EC4899' },
    { id: '교양관', name: '교양관', floors: 3, color: '#14B8A6' },
  ];

  const buildingsList = buildings || defaultBuildings;

  return (
    <div className="bg-white rounded-2xl shadow-glow p-8 animate-fade-in">
      <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-8 text-center">🗺️ 캠퍼스 지도</h3>
      <div className="grid grid-cols-3 gap-4">
        {buildingsList.map((building) => (
          <button
            key={building.id}
            onClick={() => onBuildingSelect(building)}
            className={`relative p-6 rounded-2xl border-3 transition-all duration-300 hover:scale-hover hover:shadow-glow ${
              selectedBuilding?.id === building.id
                ? 'border-primary bg-gradient-to-br from-primary/20 to-accent/20 shadow-glow scale-105'
                : 'border-gray-300 bg-white hover:border-primary'
            }`}
          >
            {/* 건물 아이콘 */}
            <div 
              className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-glow transition-all duration-300 hover:scale-125"
              style={{ backgroundColor: building.color }}
            >
              {building.name.charAt(0)}
            </div>
            
            <h4 className="text-xl font-black text-gray-900 mb-2">{building.name}</h4>
            <p className="text-lg text-gray-700 font-bold">{building.floors}층</p>
            
            {selectedBuilding?.id === building.id && (
              <div className="absolute top-4 right-4 w-4 h-4 bg-primary rounded-full shadow-glow animate-pulse-slow"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CampusMap;

