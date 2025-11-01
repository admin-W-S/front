import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Badge from './ui/Badge';

const Layout = ({ children }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // 스크롤 이벤트 핸들러
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setScrolled(window.scrollY > 10);
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation - 인터파크 스타일 */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-shadow ${scrolled ? 'shadow-md' : 'shadow-sm'} bg-white/80 backdrop-blur-md border-b border-gray-200`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">CNU</span>
              </div>
              <span className="hidden md:inline text-2xl font-bold text-text">
                InterRoom
              </span>
            </Link>

            {/* Desktop Menu */}
            {user && (
              <div className="hidden lg:flex items-center space-x-1">
                <Link
                  to="/explorer"
                  className={`px-4 py-2 rounded-xl text-base font-semibold transition-all ${isActive('/explorer') ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100'}`}
                >
                  강의실 탐색
                </Link>
                <Link
                  to="/classrooms"
                  className={`px-4 py-2 rounded-xl text-base font-semibold transition-all ${isActive('/classrooms') ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100'}`}
                >
                  강의실 목록
                </Link>
                {role === 'student' && (
                  <>
                    <Link
                      to="/my-reservations"
                      className={`px-4 py-2 rounded-xl text-base font-semibold transition-all ${isActive('/my-reservations') ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100'}`}
                    >
                      내 예약
                    </Link>
                    <Link
                      to="/notifications"
                      className={`px-4 py-2 rounded-xl text-base font-semibold transition-all ${isActive('/notifications') ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100'}`}
                    >
                      알림
                    </Link>
                  </>
                )}
                {role === 'admin' && (
                  <Link
                    to="/admin/classrooms"
                    className={`px-4 py-2 rounded-xl text-base font-semibold transition-all ${isActive('/admin/classrooms') ? 'bg-primary text-white' : 'text-textSecondary hover:bg-gray-100'}`}
                  >
                    관리자
                  </Link>
                )}
              </div>
            )}

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center space-x-3">
                    <span className="text-base text-text font-semibold">{user.name}</span>
                    <Badge variant={role === 'admin' ? 'warning' : 'info'}>
                      {role === 'admin' ? '관리자' : '학생'}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    로그아웃
                  </Button>
                </>
              ) : (
                <Button variant="primary" size="md" onClick={() => navigate('/login')}>
                  로그인
                </Button>
              )}

              {/* Mobile Menu Button */}
              {user && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden text-textSecondary hover:text-text p-2"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && user && (
            <div className="lg:hidden border-t border-gray-200 py-3 space-y-2">
              <Link
                to="/explorer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-xl text-textSecondary hover:bg-gray-100 font-semibold"
              >
                강의실 탐색
              </Link>
              <Link
                to="/classrooms"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-xl text-textSecondary hover:bg-gray-100 font-semibold"
              >
                강의실 목록
              </Link>
              {role === 'student' && (
                <>
                  <Link
                    to="/my-reservations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-xl text-textSecondary hover:bg-gray-100 font-semibold"
                  >
                    내 예약
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 rounded-xl text-textSecondary hover:bg-gray-100 font-semibold"
                  >
                    알림
                  </Link>
                </>
              )}
              {role === 'admin' && (
                <Link
                  to="/admin/classrooms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-xl text-textSecondary hover:bg-gray-100 font-semibold"
                >
                  관리자
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content - navbar 높이만큼 padding-top */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-text mb-3">CNU InterRoom</h3>
              <p className="text-base text-textSecondary">
                충남대학교 강의실 예약 시스템
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text mb-3">이용 안내</h3>
              <ul className="space-y-1 text-base text-textSecondary">
                <li>• 예약은 최대 3개까지 가능합니다</li>
                <li>• 예약 시간은 1시간 단위입니다</li>
                <li>• 최대 7일 이내 예약만 가능합니다</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text mb-3">문의처</h3>
              <p className="text-base text-textSecondary">
                admin@cnu.ac.kr<br />
                042-821-1234
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-base text-textSecondary">
            © 2024 CNU InterRoom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
