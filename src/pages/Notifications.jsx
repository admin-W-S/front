import { useState, useEffect } from 'react';
import { notificationsAPI } from '../api/notifications';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getMyNotifications();
      setNotifications(response.data);
      setError('');
    } catch (error) {
      setError('알림 목록을 불러오는데 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      // 로컬 상태 업데이트
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      alert('알림 읽음 처리에 실패했습니다.');
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4 animate-fade-in">
          알림
        </h1>
        {unreadCount > 0 && (
          <p className="text-2xl text-gray-800 font-bold">
            읽지 않은 알림 {unreadCount}개
          </p>
        )}
      </div>

      {error && (
        <Card className="bg-gradient-to-r from-red-100 to-red-200 border-red-500 mb-8">
          <p className="text-xl text-red-800 font-bold">{error}</p>
        </Card>
      )}

      {notifications.length === 0 ? (
        <Card className="p-16 text-center animate-slide-up">
          <div className="text-8xl mb-6">🔔</div>
          <p className="text-3xl text-gray-700 font-black mb-4">알림이 없습니다</p>
          <p className="text-xl text-gray-600 font-bold">
            예약 시작 30분 전에 알림이 생성됩니다.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <Card 
              key={notification.id} 
              className={`animate-slide-up ${
                !notification.read 
                  ? 'border-l-4 border-yellow-500 bg-yellow-50' 
                  : 'bg-gray-50'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {!notification.read && (
                      <span className="px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold">
                        새 알림
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(notification.timestamp)}
                    </span>
                  </div>
                  <p className={`text-xl ${!notification.read ? 'font-bold' : 'font-semibold'} text-gray-800`}>
                    {notification.message}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="ml-4"
                  >
                    읽음
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

