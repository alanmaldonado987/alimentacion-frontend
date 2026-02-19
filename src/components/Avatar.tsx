import { clsx } from 'clsx';

interface AvatarProps {
  name: string;
  avatar?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  bgColor?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

export const Avatar = ({ name, avatar, size = 'md', className, bgColor = 'bg-mint-500' }: AvatarProps) => {
  const getAvatarUrl = () => {
    if (!avatar || avatar.trim() === '') return null;
    
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    
    if (avatar.startsWith('/uploads')) {
      const baseURL = import.meta.env.VITE_API_URL;
      if (baseURL && baseURL.trim() !== '') {
        return `${baseURL}${avatar}`;
      }
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const port = isLocalhost ? ':3001' : '';
      return `${window.location.protocol}//${window.location.hostname}${port}${avatar}`;
    }
    
    return avatar;
  };

  const avatarUrl = getAvatarUrl();
  const initials = name.charAt(0).toUpperCase();

  return (
    <div
      className={clsx(
        'rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden',
        sizeClasses[size],
        !avatarUrl && bgColor,
        className
      )}
    >
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = initials;
              parent.classList.add('bg-mint-500');
            }
          }}
        />
      ) : (
        initials
      )}
    </div>
  );
};

