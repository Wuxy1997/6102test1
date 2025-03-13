import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">健康运动助手</Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-green-200">仪表盘</Link>
                <Link to="/physical-data" className="hover:text-green-200">身体数据</Link>
                <Link to="/exercises" className="hover:text-green-200">运动记录</Link>
                <Link to="/recommendations" className="hover:text-green-200">AI推荐</Link>
                <Link to="/profile" className="hover:text-green-200">个人资料</Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-white text-green-600 px-4 py-2 rounded-md hover:bg-green-100"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-green-200">登录</Link>
                <Link 
                  to="/register" 
                  className="bg-white text-green-600 px-4 py-2 rounded-md hover:bg-green-100"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
