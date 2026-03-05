import { cn, getInitials } from '@/lib/utils';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };
const imageSizes = { sm: 32, md: 40, lg: 48 };

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary/10 font-medium text-primary',
        sizeClasses[size],
        className,
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
