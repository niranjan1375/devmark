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
    <div className="border border-gray-800 bg-black p-6 hover:border-lime-400 transition-all group">
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-4 text-xl font-bold text-white hover:text-lime-400 transition-colors line-clamp-2"
      >
        {bookmark.title}
      </a>

      <p className="text-gray-400 text-base mb-6 leading-relaxed">
        {bookmark.note}
      </p>

      {bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {bookmark.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 bg-gray-900 text-lime-400 text-sm font-mono border border-gray-800"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500 font-mono border-t border-gray-900 pt-4">
        <span>{new Date(bookmark.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <div className="flex gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/bookmarks/${bookmark.id}`}
            className="text-gray-400 hover:text-lime-400 transition-colors"
          >
            edit
          </Link>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            delete
          </button>
        </div>
      </div>
    </div>
  );
}
