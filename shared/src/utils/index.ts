// Date utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  
  return d.toLocaleDateString('ko-KR');
};

// Price utilities
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8 && /^(?=.*[a-zA-Z])(?=.*\d)/.test(password);
};

// Image utilities
export const getImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http')) return imagePath;
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${imagePath}`;
};

// Category utilities
export const getCategoryDisplayName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    electronics: '전자기기',
    fashion: '패션/의류',
    home: '가구/생활',
    books: '도서',
    sports: '스포츠',
    beauty: '뷰티',
    toys: '완구/취미',
    other: '기타'
  };
  return categoryNames[category] || category;
};

export const getConditionDisplayName = (condition: string): string => {
  const conditionNames: Record<string, string> = {
    new: '새상품',
    like_new: '거의 새상품',
    good: '상태 좋음',
    fair: '사용감 있음',
    poor: '상태 나쁨'
  };
  return conditionNames[condition] || condition;
}; 