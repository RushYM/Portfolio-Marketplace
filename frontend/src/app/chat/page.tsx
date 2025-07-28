'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageCircle, 
  Search, 
  User, 
  Package, 
  Clock, 
  Loader2,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { ChatService, ChatRoom } from '@/services/chatService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function ChatListPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());

  // 채팅방 목록 로드
  useEffect(() => {
    const loadChatRooms = async () => {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }

      try {
        setLoading(true);
        
        // Socket.IO 연결
        const token = localStorage.getItem('accessToken');
        if (token) {
          ChatService.connect(token);
          
          // 채팅방 업데이트 이벤트 리스너
          ChatService.on('chatRoomUpdated', () => {
            loadChatRoomsData();
          });

          ChatService.on('newMessage', (data) => {
            // 실시간 메시지 업데이트
            loadChatRoomsData();
          });
        }

        await loadChatRoomsData();
      } catch (error) {
        console.error('채팅방 목록 로드 실패:', error);
        toast.error('채팅방 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadChatRooms();

    // 컴포넌트 언마운트 시 Socket 연결 해제
    return () => {
      ChatService.disconnect();
    };
  }, [isAuthenticated, router]);

  // 채팅방 데이터 로드
  const loadChatRoomsData = async () => {
    try {
      const rooms = await ChatService.getChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      console.error('채팅방 데이터 로드 실패:', error);
    }
  };

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // 채팅방 삭제
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('채팅방을 삭제하시겠습니까?')) return;

    try {
      await ChatService.deleteChatRoom(roomId);
      setChatRooms(prev => prev.filter(room => room.id !== roomId));
      toast.success('채팅방이 삭제되었습니다.');
    } catch (error) {
      console.error('채팅방 삭제 실패:', error);
      toast.error('채팅방 삭제에 실패했습니다.');
    }
  };

  // 검색 필터링
  const filteredChatRooms = chatRooms.filter(room => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      room.otherUser.username.toLowerCase().includes(query) ||
      room.product.title.toLowerCase().includes(query) ||
      room.lastMessage?.content.toLowerCase().includes(query)
    );
  });

  // 채팅방 클릭
  const handleRoomClick = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-4">채팅을 사용하려면 로그인해주세요.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom max-w-4xl py-8">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <MessageCircle className="w-7 h-7 text-orange-500" />
                <span>채팅</span>
              </h1>
              <p className="text-gray-600 mt-1">
                {chatRooms.length > 0 ? `총 ${chatRooms.length}개의 채팅방` : '아직 채팅방이 없습니다'}
              </p>
            </div>

            {/* 검색바 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="사용자, 상품명으로 검색"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
              />
            </div>
          </div>
        </div>

        {/* 채팅방 목록 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600">채팅방을 불러오는 중...</span>
          </div>
        ) : filteredChatRooms.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {searchQuery ? '검색 결과가 없습니다' : '채팅방이 없습니다'}
            </h3>
            <p className="text-gray-600 mb-8">
              {searchQuery 
                ? '다른 검색어로 시도해보세요.' 
                : '상품 페이지에서 판매자와 채팅을 시작해보세요!'
              }
            </p>
            {!searchQuery && (
              <Link
                href="/products"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                상품 둘러보기
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {filteredChatRooms.map((room) => (
              <div
                key={room.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleRoomClick(room.id)}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* 상대방 프로필 */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {room.otherUser.profileImage ? (
                        <img
                          src={room.otherUser.profileImage}
                          alt={room.otherUser.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-600" />
                      )}
                    </div>

                    {/* 채팅 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {room.otherUser.username}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Package className="w-3 h-3" />
                            <span className="truncate">{room.product.title}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {room.lastMessage && (
                            <span className="text-xs text-gray-500 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(room.lastMessage.createdAt)}</span>
                            </span>
                          )}
                          
                          {room.unreadCount > 0 && (
                            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                              {room.unreadCount > 99 ? '99+' : room.unreadCount}
                            </span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRoom(room.id);
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="채팅방 삭제"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* 마지막 메시지 */}
                      {room.lastMessage ? (
                        <p className="text-gray-600 text-sm truncate">
                          {room.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-gray-400 text-sm italic">
                          아직 메시지가 없습니다
                        </p>
                      )}

                      {/* 상품 정보 */}
                      <div className="flex items-center space-x-3 mt-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={room.product.images[room.product.mainImageIndex] || room.product.images[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'}
                          alt={room.product.title}
                          className="w-10 h-10 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {room.product.title}
                          </p>
                          <p className="text-sm text-orange-600 font-semibold">
                            {room.product.price.toLocaleString()}원
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {room.product.status === 'AVAILABLE' ? '판매중' :
                           room.product.status === 'RESERVED' ? '예약중' : '판매완료'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 