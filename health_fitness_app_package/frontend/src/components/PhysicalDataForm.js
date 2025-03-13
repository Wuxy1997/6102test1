import React, { useState } from 'react';
import { physicalDataAPI } from '../utils/api';

const PhysicalDataForm = () => {
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    bmi: '',
    waist: ''
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
        weight: parseFloat(formData.weight),
      };
      
      // 添加可选字段
      if (formData.bodyFat) submitData.body_fat = parseFloat(formData.bodyFat);
      if (formData.muscleMass) submitData.muscle_mass = parseFloat(formData.muscleMass);
      if (formData.bmi) submitData.bmi = parseFloat(formData.bmi);
      if (formData.waist) submitData.waist = parseFloat(formData.waist);
      
      // 使用API工具类提交数据
      const response = await physicalDataAPI.addPhysicalData(submitData);
      
      if (response.status === 201) {
        setSuccess('身体数据已成功添加');
        // 清空表单
        setFormData({
          weight: '',
          bodyFat: '',
          muscleMass: '',
          bmi: '',
          waist: ''
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
      <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">记录身体数据</h2>
      
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
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              体重 (kg) *
            </label>
            <div className="mt-1">
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                required
                value={formData.weight}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bodyFat" className="block text-sm font-medium text-gray-700">
              体脂率 (%)
            </label>
            <div className="mt-1">
              <input
                id="bodyFat"
                name="bodyFat"
                type="number"
                step="0.1"
                value={formData.bodyFat}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="muscleMass" className="block text-sm font-medium text-gray-700">
              肌肉量 (kg)
            </label>
            <div className="mt-1">
              <input
                id="muscleMass"
                name="muscleMass"
                type="number"
                step="0.1"
                value={formData.muscleMass}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bmi" className="block text-sm font-medium text-gray-700">
              BMI
            </label>
            <div className="mt-1">
              <input
                id="bmi"
                name="bmi"
                type="number"
                step="0.1"
                value={formData.bmi}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="waist" className="block text-sm font-medium text-gray-700">
              腰围 (cm)
            </label>
            <div className="mt-1">
              <input
                id="waist"
                name="waist"
                type="number"
                step="0.1"
                value={formData.waist}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
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

export default PhysicalDataForm;
