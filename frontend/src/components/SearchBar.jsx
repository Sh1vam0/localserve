import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

const categories = [
  { value: '', label: 'All' },
  { value: 'salon', label: 'Salons' },
  { value: 'gym', label: 'Gyms' },
  { value: 'spa', label: 'Spas' },
  { value: 'parlour', label: 'Parlours' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'clinic', label: 'Clinics' },
];

const SearchBar = ({ variant = 'default', initialQuery = '', initialCategory = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    navigate(`/search?${params.toString()}`);
  };

  const isHero = variant === 'hero';

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className={`flex flex-col sm:flex-row gap-3 ${isHero ? 'max-w-2xl mx-auto' : ''}`}>
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for services, salons, gyms..."
              className={`w-full pl-11 pr-4 ${isHero ? 'py-3.5 text-base' : 'py-2.5 text-sm'} bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400`}
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className={`w-full sm:w-40 pl-11 pr-4 ${isHero ? 'py-3.5 text-base' : 'py-2.5 text-sm'} bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400`}
            />
          </div>
          <button
            type="submit"
            className={`${isHero ? 'px-8 py-3.5 text-base' : 'px-6 py-2.5 text-sm'} bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2`}
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </form>

      {/* Category Pills */}
      <div className={`flex flex-wrap gap-2 ${isHero ? 'mt-5 justify-center' : 'mt-3'}`}>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setCategory(cat.value);
              const params = new URLSearchParams();
              if (query) params.set('q', query);
              if (cat.value) params.set('category', cat.value);
              if (city) params.set('city', city);
              navigate(`/search?${params.toString()}`);
            }}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
              category === cat.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
