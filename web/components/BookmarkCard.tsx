'use client';

import { Bookmark } from '@/types';
import Link from 'next/link';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
}

export default function BookmarkCard({ bookmark, onDelete }: BookmarkCardProps) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      onDelete(bookmark.id);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-blue-600 hover:text-blue-800 break-all"
        >
          {bookmark.title}
        </a>
      </div>

      <p className="text-gray-700 text-sm mb-3 italic">
        "{bookmark.note}"
      </p>

      {bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {bookmark.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{new Date(bookmark.createdAt).toLocaleDateString()}</span>
        <div className="flex gap-2">
          <Link
            href={`/bookmarks/${bookmark.id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
