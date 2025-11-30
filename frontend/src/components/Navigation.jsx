import { NavLink } from 'react-router-dom';
import { FiUploadCloud, FiClock } from 'react-icons/fi';
import { GiGolfFlag } from 'react-icons/gi';

const Navigation = () => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 text-golf-green-700 hover:text-golf-green-800 transition-colors"
          >
            <GiGolfFlag className="w-8 h-8" />
            <span className="text-xl font-bold">Golf Swing Analyzer</span>
          </NavLink>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-golf-green-100 text-golf-green-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <FiUploadCloud className="w-5 h-5" />
              <span className="hidden sm:inline">Analyze</span>
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-golf-green-100 text-golf-green-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <FiClock className="w-5 h-5" />
              <span className="hidden sm:inline">History</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
