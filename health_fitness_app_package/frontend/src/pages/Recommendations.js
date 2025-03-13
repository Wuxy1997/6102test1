import React, { useState, useEffect } from 'react';
import { recommendationAPI } from '../utils/api';

const RecommendationsPage = () => {
  const [dietRecommendation, setDietRecommendation] = useState(null);
  const [workoutRecommendation, setWorkoutRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('diet');

  const fetchRecommendations = async (type) => {
    try {
      setLoading(true);
      setError('');
      
      // 使用API工具类获取推荐
      let response;
      if (type === 'diet') {
        response = await recommendationAPI.getDietRecommendation();
        setDietRecommendation(response.data);
      } else {
        response = await recommendationAPI.getWorkoutRecommendation();
        setWorkoutRecommendation(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || '获取推荐失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初始加载时获取膳食推荐
    fetchRecommendations('diet');
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'diet' && !dietRecommendation) {
      fetchRecommendations('diet');
    } else if (tab === 'workout' && !workoutRecommendation) {
      fetchRecommendations('workout');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">AI 个性化推荐</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => handleTabChange('diet')}
              className={`${
                activeTab === 'diet'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm w-1/2 text-center`}
            >
              膳食推荐
            </button>
            <button
              onClick={() => handleTabChange('workout')}
              className={`${
                activeTab === 'workout'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm w-1/2 text-center`}
            >
              运动计划
            </button>
          </nav>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div>
          {activeTab === 'diet' && dietRecommendation && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">膳食推荐</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">{dietRecommendation.notes}</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">每日推荐卡路里</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{dietRecommendation.daily_calories} 卡路里</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">蛋白质</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{dietRecommendation.protein} 克</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">碳水化合物</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{dietRecommendation.carbs} 克</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">脂肪</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{dietRecommendation.fat} 克</dd>
                  </div>
                </dl>
              </div>
              
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">膳食计划</h3>
              </div>
              
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">早餐</h4>
                  <p className="text-sm text-gray-500 mb-2">{dietRecommendation.meal_plan.breakfast.description}</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {dietRecommendation.meal_plan.breakfast.suggestions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  
                  <h4 className="text-md font-medium text-gray-900 mt-4 mb-2">午餐</h4>
                  <p className="text-sm text-gray-500 mb-2">{dietRecommendation.meal_plan.lunch.description}</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {dietRecommendation.meal_plan.lunch.suggestions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  
                  <h4 className="text-md font-medium text-gray-900 mt-4 mb-2">晚餐</h4>
                  <p className="text-sm text-gray-500 mb-2">{dietRecommendation.meal_plan.dinner.description}</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {dietRecommendation.meal_plan.dinner.suggestions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  
                  <h4 className="text-md font-medium text-gray-900 mt-4 mb-2">加餐</h4>
                  <p className="text-sm text-gray-500 mb-2">{dietRecommendation.meal_plan.snacks.description}</p>
                  <ul className="list-disc pl-5 text-sm text-gray-700">
                    {dietRecommendation.meal_plan.snacks.suggestions.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'workout' && workoutRecommendation && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">运动计划推荐</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">{workoutRecommendation.notes}</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">目标</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {workoutRecommendation.workout_plan.goal === 'lose' && '减肥'}
                      {workoutRecommendation.workout_plan.goal === 'maintain' && '保持健康'}
                      {workoutRecommendation.workout_plan.goal === 'gain' && '增肌'}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">频率</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{workoutRecommendation.workout_plan.frequency}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">重点</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{workoutRecommendation.workout_plan.focus}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">目标卡路里消耗</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{workoutRecommendation.target_calories} 卡路里</dd>
                  </div>
                </dl>
              </div>
              
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">每周计划</h3>
              </div>
              
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(workoutRecommendation.weekly_schedule).map(([day, schedule]) => (
                      <div key={day} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-md font-medium text-gray-900 mb-2">
                          {day === 'monday' && '星期一'}
                          {day === 'tuesday' && '星期二'}
                          {day === 'wednesday' && '星期三'}
                          {day === 'thursday' && '星期四'}
                          {day === 'friday' && '星期五'}
                          {day === 'saturday' && '星期六'}
                          {day === 'sunday' && '星期日'}
                        </h4>
                        <p className="text-sm font-medium text-green-600 mb-1">{schedule.type}</p>
                        <p className="text-sm text-gray-700 mb-1">时长: {schedule.duration}</p>
                        <p className="text-sm text-gray-500">{schedule.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">推荐运动</h3>
              </div>
              
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  {workoutRecommendation.workout_plan.exercises.map((exercise, index) => (
                    <div key={index} className="mb-6">
                      <h4 className="text-md font-medium text-gray-900 mb-2">{exercise.name}</h4>
                      <p className="text-sm text-gray-700 mb-1">频率: {exercise.frequency}</p>
                      <p className="text-sm text-gray-700 mb-2">时长: {exercise.duration}</p>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500 mb-1">推荐选项:</p>
                        <ul className="list-disc pl-5 text-sm text-gray-700">
                          {exercise.options.map((option, idx) => (
                            <li key={idx}>{option}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'diet' && !dietRecommendation && !loading && (
            <div className="text-center py-12">
              <button
                onClick={() => fetchRecommendations('diet')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                获取膳食推荐
              </button>
            </div>
          )}
          
          {activeTab === 'workout' && !workoutRecommendation && !loading && (
            <div className="text-center py-12">
              <button
                onClick={() => fetchRecommendations('workout')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                获取运动计划
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
