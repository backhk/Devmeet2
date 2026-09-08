import Link from "next/link";

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    capacity: number;
    techStack?: string[];
    meetingType: string;
    status: string;
    author: {
      nickname: string;
    };
    createdAt: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const isRecruiting = post.status === "RECRUITING";

  return (
    <Link href={`/posts/${post._id}`}>
      <div className="border rounded-lg p-5 hover:shadow-md transition-shadow bg-white flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                isRecruiting ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
              }`}
            >
              {isRecruiting ? "모집 중" : "모집 완료"}
            </span>
            <span className="text-xs text-gray-500">{post.meetingType}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{post.title}</h3>
          
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.techStack?.map((tech, idx) => (
              <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t">
          <span>작성자: {post.author?.nickname || "익명"}</span>
          <span>모집 인원: {post.capacity}명</span>
        </div>
      </div>
    </Link>
  );
}