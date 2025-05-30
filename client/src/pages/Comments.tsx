// client/src/pages/Comments.tsx
import React, { useEffect, useState } from 'react';
import CommentItemComponent, { CommentItem } from '../components/CommentItem';
import Spinner from '../components/Spinner';

const Comments: React.FC = () => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(5);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [newContent, setNewContent] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL || '/api/';

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}comments?page=${page}&limit=${limit}`);
      // console.log("Comment apiUrl: " + `${apiUrl}comments?page=${page}&limit=${limit}`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.data);
        setTotalCount(data.totalCount);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newContent || !newPassword) {
      alert('Please enter both comment content and password.');
      return;
    }
    try {
      const res = await fetch(`${apiUrl}comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentHeaderId: null, content: newContent, userPassword: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewContent('');
        setNewPassword('');
        setPage(1);
        fetchComments();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page]);

  return (
    // min-h-screen 제거 → div 높이는 콘텐츠에 맞춰 자동 조정됩니다.
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">

      <main className="container mx-auto px-6 pt-4 pb-8">
        <p className="text-gray-400 mb-6">
          * Your username is generated based on a hash of your IP address.
        </p>

        {/* 입력 폼 */}
        <div className="bg-gray-800 p-4 rounded-2xl shadow-lg mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <textarea
            className="col-span-1 lg:col-span-2 w-full bg-gray-700 p-3 rounded-md text-gray-100 focus:outline-none"
            rows={3}
            placeholder="Enter your comment"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
          />
          <div className="flex flex-col space-y-2">
            <input
              type="password"
              className="w-full bg-gray-700 p-3 rounded-md text-gray-100 focus:outline-none"
              placeholder="Password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <button
              onClick={handleCreateComment}
              className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-md"
            >
              Submit Comment
            </button>
          </div>
        </div>

        {/* 규칙 토글 */}
        <div className="mb-6">
          <button
            onClick={() => setShowRules(prev => !prev)}
            className="text-indigo-400 hover:text-indigo-300"
          >
            {showRules ? 'Hide Commenting Rules' : 'Show Commenting Rules'}
          </button>
          {showRules && (
            <ul className="mt-2 list-disc list-inside text-gray-400 space-y-2">
              <li>When a comment is created or edited, the author's identity is generated by hashing the user's current IP address.</li>
              <li>Edited comments maintain a viewable history.</li>
              <li>Deleted comments are marked as (deleted) and their history is no longer accessible, though the hashed IP remains visible.</li>
              <li>These rules apply equally to replies.</li>
            </ul>
          )}
        </div>

        {/* 댓글 리스트 */}
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <CommentItemComponent
                key={comment.id}
                comment={comment}
                apiUrl={apiUrl}
                onReload={fetchComments}
              />
            ))}
          </div>
        )}

        {/* 페이징 */}
        <div className="mt-6 flex items-center justify-center space-x-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
            className="px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-400">
            {page} / {Math.ceil(totalCount / limit)} pages
          </span>
          <button
            disabled={page * limit >= totalCount}
            onClick={() => setPage(prev => prev + 1)}
            className="px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <p className="mt-4 mb-6 text-center text-gray-500">Powered by OCI Autonomous Database</p>
      </main>
    </div>
  );
};

export default Comments;
