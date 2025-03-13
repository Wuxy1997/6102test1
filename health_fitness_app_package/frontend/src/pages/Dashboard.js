import React, { useState, useEffect } from 'react';
import { authAPI, physicalDataAPI, exerciseAPI, recommendationAPI } from '../utils/api';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [physicalData, setPhysicalData] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 使用API工具类获取数据
        const [profileResponse, physicalDataResponse, exercisesResponse] = await Promise.all([
          authAPI.getProfile(),
          physicalDataAPI.getPhysicalData(),
          exerciseAPI.getExercises()
        ]);
        
        setUserData(profileResponse.data);
        setPhysicalData(physicalDataResponse.data);
        setExercises(exercisesResponse.data);
      } catch (err) {
        setError(err.response?.data?.error || '获取数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // 组件其余部分保持不变
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">仪表盘</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 用户信息卡片 */}
          {userData && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">个人资料</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">您的个人信息和健身目标</p>
                </div>
                <a 
                  href="/profile" 
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  编辑
                </a>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">用户名</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.username}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">电子邮箱</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.email}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">性别</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userData.gender === 'male' && '男'}
                      {userData.gender === 'female' && '女'}
                      {userData.gender === 'other' && '其他'}
                      {!userData.gender && '未设置'}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">身高</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userData.height ? `${userData.height} cm` : '未设置'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">体重</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userData.weight ? `${userData.weight} kg` : '未设置'}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">活动水平</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userData.activity_level === 'low' && '低（久坐不动）'}
                      {userData.activity_level === 'medium' && '中（适度活动）'}
                      {userData.activity_level === 'high' && '高（经常运动）'}
                      {!userData.activity_level && '未设置'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">健身目标</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {userData.goal === 'lose' && '减肥'}
                      {userData.goal === 'maintain' && '保持健康'}
                      {userData.goal === 'gain' && '增肌'}
                      {!userData.goal && '未设置'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
          
          {/* 最新身体数据 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">身体数据</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">您的最新身体指标</p>
              </div>
              <a 
                href="/physical-data" 
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                查看全部
              </a>
            </div>
            <div className="border-t border-gray-200">
              {physicalData.length > 0 ? (
                <div className="px-4 py-5 sm:p-6">
                  <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                      {physicalData.slice(0, 3).map((data) => (
                        <li key={data._id} className="py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                体重: {data.weight} kg
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {new Date(data.recorded_at).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              {data.body_fat && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                体脂: {data.body_fat}%
                              </span>}
                              {data.bmi && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                BMI: {data.bmi}
                              </span>}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <p className="text-sm text-gray-500">暂无身体数据记录</p>
                  <a 
                    href="/physical-data" 
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    添加数据
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* 最新运动记录 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg lg:col-span-2">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">运动记录</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">您的最新运动活动</p>
              </div>
              <a 
                href="/exercises" 
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                查看全部
              </a>
            </div>
            <div className="border-t border-gray-200">
              {exercises.length > 0 ? (
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  运动类型
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  持续时间
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  卡路里
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  日期
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {exercises.slice(0, 5).map((exercise) => (
                                <tr key={exercise._id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{exercise.exercise_type}</div>
                                    {exercise.intensity && (
                                      <div className="text-sm text-gray-500">
                                        强度: {exercise.intensity === 'low' ? '低' : exercise.intensity === 'medium' ? '中' : '高'}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{exercise.duration} 分钟</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{exercise.calories_burned || '-'}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(exercise.recorded_at).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <p className="text-sm text-gray-500">暂无运动记录</p>
                  <a 
                    href="/exercises" 
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    添加记录
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* AI推荐卡片 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg lg:col-span-2">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">AI 个性化推荐</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">根据您的数据生成的个性化健康建议</p>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                    <div className="flex-shrink-0">
                      <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href="/recommendations" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true"></span>
                        <p className="text-sm font-medium text-gray-900">膳食推荐</p>
                        <p className="text-sm text-gray-500">获取个性化的膳食计划和营养建议</p>
                      </a>
                    </div>
                  </div>
                  
                  <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                    <div className="flex-shrink-0">
                      <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href="/recommendations" className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true"></span>
                        <p className="text-sm font-medium text-gray-900">运动计划</p>
                        <p className="text-sm text-gray-500">获取个性化的运动计划和训练建议</p>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
