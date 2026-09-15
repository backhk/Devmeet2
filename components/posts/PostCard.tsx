import Link from "next/link";

interface PostCardProps {
  id: string;
  title: string;
  category?: string;
  capacity?: number;
  applicantsCount?: number;
  authorName?: string;
  createdAt: string;
  isSecret?: boolean;
}

export default function PostCard({
  id,
  title,
  category = "기타",
  capacity,
  applicantsCount = 0,
  authorName = "익명",
  createdAt,
  isSecret = false,
}: PostCardProps) {
  const displayCapacity = capacity && capacity > 0 ? `${capacity}명` : "(미정)";

  return (
    <Link href={`/posts/${id}`}>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-48 cursor-pointer">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              {category}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
            {isSecret ? "🔒 비밀글입니다." : title}
          </h3>
        </div>

        <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3">
          <span className="text-gray-500 font-medium">작성자: {authorName}</span>
          <span className="text-blue-600 font-bold">
            {applicantsCount} / {displayCapacity} 모집
          </span>
        </div>
      </div>
    </Link>
  );
}