import React, { useState } from 'react';
import { exerciseAPI } from '../utils/api';

const ExerciseForm = () => {
  const [formData, setFormData] = useState({
    exerciseType: '',
    duration: '',
    caloriesBurned: '',
    distance: '',
    steps: '',
    heartRate: '',
    intensity: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // 准备提交数据
      const submitData = {
        exercise_type: formData.exerciseType,
        duration: parseInt(formData.duration),
      };
      
      // 添加可选字段
      if (formData.caloriesBurned) submitData.calories_burned = parseInt(formData.caloriesBurned);
      if (formData.distance) submitData.distance = parseFloat(formData.distance);
      if (formData.steps) submitData.steps = parseInt(formData.steps);
      if (formData.heartRate) submitData.heart_rate = parseInt(formData.heartRate);
      if (formData.intensity) submitData.intensity = formData.intensity;
      if (formData.notes) submitData.notes = formData.notes;
      
      // 使用API工具类提交数据
      const response = await exerciseAPI.addExercise(submitData);
      
      if (response.status === 201) {
        setSuccess('运动记录已成功添加');
        // 清空表单
        setFormData({
          exerciseType: '',
          duration: '',
          caloriesBurned: '',
          distance: '',
          steps: '',
          heartRate: '',
          intensity: '',
          notes: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || '提交数据失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">记录运动活动</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700">
              运动类型 *
            </label>
            <div className="mt-1">
              <select
                id="exerciseType"
                name="exerciseType"
                required
                value={formData.exerciseType}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">选择运动类型</option>
                <option value="跑步">跑步</option>
                <option value="步行">步行</option>
                <option value="骑行">骑行</option>
                <option value="游泳">游泳</option>
                <option value="力量训练">力量训练</option>
                <option value="瑜伽">瑜伽</option>
                <option value="篮球">篮球</option>
                <option value="足球">足球</option>
                <option value="羽毛球">羽毛球</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              持续时间 (分钟) *
            </label>
            <div className="mt-1">
              <input
                id="duration"
                name="duration"
                type="number"
                required
                value={formData.duration}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="caloriesBurned" className="block text-sm font-medium text-gray-700">
              消耗卡路里
            </label>
            <div className="mt-1">
              <input
                id="caloriesBurned"
                name="caloriesBurned"
                type="number"
                value={formData.caloriesBurned}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
              距离 (米)
            </label>
            <div className="mt-1">
              <input
                id="distance"
                name="distance"
                type="number"
                step="0.01"
                value={formData.distance}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="steps" className="block text-sm font-medium text-gray-700">
              步数
            </label>
            <div className="mt-1">
              <input
                id="steps"
                name="steps"
                type="number"
                value={formData.steps}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700">
              平均心率 (次/分钟)
            </label>
            <div className="mt-1">
              <input
                id="heartRate"
                name="heartRate"
                type="number"
                value={formData.heartRate}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="intensity" className="block text-sm font-medium text-gray-700">
              强度
            </label>
            <div className="mt-1">
              <select
                id="intensity"
                name="intensity"
                value={formData.intensity}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">选择强度</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              备注
            </label>
            <div className="mt-1">
              <textarea
                id="notes"
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {loading ? '提交中...' : '提交数据'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExerciseForm;
