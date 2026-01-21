import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return <div className={clsx('skeleton', className)} />;
};

export const CardSkeleton = () => {
  return (
    <div className="card">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
};

export const StatCardSkeleton = () => {
  return (
    <div className="card flex items-center gap-4">
      <Skeleton className="w-14 h-14 rounded-2xl" />
      <div>
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-6 w-12" />
      </div>
    </div>
  );
};

export const TableRowSkeleton = () => {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-6 w-16 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-8 w-20 rounded-lg" />
      </td>
    </tr>
  );
};

