"use client"

import Image from 'next/image'
import { Play, Clock, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react'

const HistoryVideoCard = ({ title, channel, views, watchedAt, thumbnail, duration, link }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 group">
      <div onClick={() => window.location.href = link} className="block">
        <div className="relative">
          <Image 
            src={thumbnail} 
            alt={title} 
            className="w-full h-48 object-cover" 
            width={320} 
            height={180} 
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {duration}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Play className="text-white" size={48} />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 line-clamp-2 text-white">{title}</h3>
          <p className="text-sm text-gray-400">{channel}</p>
          <p className="text-xs text-gray-500">{views} views</p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <Clock size={14} className="mr-1" />
            <span>Watched {watchedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default function HistoryPage({history}) {
  const [histories, setHistory] = useState(history || null);

  useEffect(() => {
    const history_data = JSON.parse(localStorage.getItem('watchHistory'));

    if (history_data) {
      setHistory(history_data);
      return;
    }

  }, [history]);

  function clearHistory() {
    setHistory(null);
    if (localStorage.getItem('watchHistory') === null) return;
    localStorage.removeItem('watchHistory');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Watch History {"(in the making)"}</h1>
        <Button onClick={clearHistory} variant="destructive" size="sm" className="flex items-center">
          <Trash2 size={16} className="mr-2" />
          Clear All History
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {histories ? histories.map((video) => (
          <HistoryVideoCard key={video.id} {...video} />
        )) : 
        (<div>No history found</div>)
        }
      </div>
    </div>
  );
}