import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchBarRef = useRef(null);
  const inputRef = useRef(null);

  // Mock recommendations - replace with actual API call
  const mockRecommendations = ['video tutorial', 'music video', 'tech review', 'cooking recipe'];

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
    setIsActive(true);
    setSelectedIndex(-1);
    
    // Filter recommendations based on input
    if (e.target.value) {
      setRecommendations(
        mockRecommendations.filter(rec =>
          rec.toLowerCase().includes(e.target.value.toLowerCase())
        )
      );
    } else {
      setRecommendations([]);
    }
  };

  const executeSearch = () => {
    if (!searchTerm.trim()) return;
    setTimeout(() => {
      setRecommendations([]);
      setIsActive(false);
      inputRef.current?.blur();
      return window.location.href = `/search?query=${searchTerm}`
    }, 500)
    
  };

  const handleRecommendationClick = (recommendation) => {
    setSearchTerm(recommendation);
    setRecommendations([]);
    setIsActive(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
    executeSearch();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && recommendations.length > 0) {
        e.preventDefault();
        handleRecommendationClick(recommendations[selectedIndex]);
      } else if (searchTerm) {
        e.preventDefault();
        executeSearch();
      }
      return;
    }

    if (!recommendations.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prevIndex => 
          prevIndex < recommendations.length - 1 ? prevIndex + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prevIndex => 
          prevIndex > 0 ? prevIndex - 1 : recommendations.length - 1
        );
        break;

      case 'Escape':
        setIsActive(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsActive(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle focus events
  const handleFocus = () => {
    setIsActive(true);
    setSelectedIndex(-1);
    if (searchTerm) {
      setRecommendations(
        mockRecommendations.filter(rec => 
          rec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  };

  const handleMouseEnter = (index) => {
    setSelectedIndex(index);
  };

  return (
    <div className="relative w-full max-w-lg" ref={searchBarRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="w-full pl-4 pr-12 py-2 rounded-full bg-gray-700 text-white border-gray-600 focus:border-gray-500"
        />
        <Button 
          onClick={executeSearch}
          disabled={!searchTerm.trim()}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-600"
          variant="ghost"
        >
          <Search className="w-5 h-5 text-gray-400" />
        </Button>
      </div>
      
      {isActive && recommendations.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-700 mt-1 rounded-md shadow-lg border border-gray-600">
          {recommendations.map((rec, index) => (
            <li 
              key={index} 
              className={`px-4 py-2 cursor-pointer text-white flex items-center transition-colors
                ${selectedIndex === index ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
              onClick={() => handleRecommendationClick(rec)}
              onMouseEnter={() => handleMouseEnter(index)}
            >
              <Search className="w-4 h-4 mr-2 text-gray-400" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;