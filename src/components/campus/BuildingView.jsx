const BuildingView = ({ building, selectedFloor, onFloorSelect }) => {
  if (!building) {
    return (
      <div className="bg-white rounded-xl shadow-card p-12 text-center">
        <p className="text-xl text-gray-600 font-medium">건물을 선택해주세요</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-glow p-8 animate-fade-in">
      <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-8 text-center">🏢 {building.name}</h3>
      
      {/* 층 버튼 그리드 */}
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: building.floors }, (_, i) => {
          const floorNum = i + 1;
          const isSelected = selectedFloor === floorNum;
          
          return (
            <button
              key={floorNum}
              onClick={() => onFloorSelect(floorNum)}
              className={`p-5 rounded-2xl border-3 font-black text-xl transition-all duration-300 hover:scale-125 hover:shadow-glow ${
                isSelected
                  ? 'bg-gradient-to-br from-primary to-accent text-white border-primary shadow-glow scale-110'
                  : 'border-gray-300 text-gray-800 hover:border-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-accent/10'
              }`}
            >
              {floorNum}F
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BuildingView;

