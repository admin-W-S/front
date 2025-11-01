import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Home = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-12 py-20">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-6xl font-bold text-text mb-6">
              강의실 예약 시스템
            </h1>
            <p className="text-2xl text-textSecondary mb-8">
              캠퍼스에서 원하는 강의실을 쉽고 빠르게 예약하세요
            </p>
          </div>
          
          {!isAuthenticated ? (
            <div className="flex justify-center space-x-4">
              <Button variant="primary" size="lg" onClick={() => window.location.href = '/login'}>
                로그인
              </Button>
              <Button variant="yellow" size="lg" onClick={() => window.location.href = '/signup'}>
                회원가입
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button variant="primary" size="lg" onClick={() => window.location.href = '/explorer'} className="rounded-full">
                지금 예약하기
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-12 py-16">
          <h2 className="text-3xl font-bold text-text mb-12 text-center">이용 가이드</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover className="animate-slide-up bg-white/80 backdrop-blur-sm">
              <div className="text-5xl mb-6 text-center">🗺️</div>
              <h3 className="text-2xl font-semibold text-text mb-4 text-center">강의실 탐색</h3>
              <p className="text-base text-textSecondary text-center">
                캠퍼스 지도를 통해 건물과 강의실을 시각적으로 탐색하세요
              </p>
            </Card>
            
            <Card hover className="animate-slide-up bg-white/80 backdrop-blur-sm">
              <div className="text-5xl mb-6 text-center">📋</div>
              <h3 className="text-2xl font-semibold text-text mb-4 text-center">전체 목록</h3>
              <p className="text-base text-textSecondary text-center">
                모든 강의실 목록을 한눈에 확인하고 빠르게 예약하세요
              </p>
            </Card>
            
            {role === 'student' && (
              <Card hover className="animate-slide-up bg-white/80 backdrop-blur-sm">
                <div className="text-5xl mb-6 text-center">📅</div>
                <h3 className="text-2xl font-semibold text-text mb-4 text-center">내 예약</h3>
                <p className="text-base text-textSecondary text-center">
                  내가 예약한 강의실을 확인하고 관리하세요
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

