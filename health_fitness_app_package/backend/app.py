from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# 导入模型
from models import User, PhysicalData, Exercise, DietRecommendation, WorkoutRecommendation
# 导入增强版AI推荐系统
from ai_recommendation import AIRecommendationSystem

# 加载环境变量
load_dotenv()

# 创建Flask应用
app = Flask(__name__)
CORS(app)  # 启用CORS

# 配置应用
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-secret-key'
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# 初始化扩展
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# 连接MongoDB
mongo_uri = os.environ.get('MONGO_URI') or 'mongodb+srv://admin:password@cluster0.mongodb.net/health_fitness_app'
client = MongoClient(mongo_uri)
db = client.health_fitness_app

# 用户认证路由
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # 检查必填字段
    if not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'error': '缺少必填字段'}), 400
    
    # 检查用户名和邮箱是否已存在
    if db.users.find_one({'username': data['username']}):
        return jsonify({'error': '用户名已存在'}), 400
    
    if db.users.find_one({'email': data['email']}):
        return jsonify({'error': '邮箱已存在'}), 400
    
    # 哈希密码
    password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # 创建用户
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=password_hash,
        gender=data.get('gender'),
        birth_date=data.get('birth_date'),
        height=data.get('height'),
        weight=data.get('weight'),
        activity_level=data.get('activity_level'),
        goal=data.get('goal')
    )
    
    # 保存用户到数据库
    db.users.insert_one(user.to_dict())
    
    return jsonify({'message': '注册成功'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # 检查必填字段
    if not all(k in data for k in ('email', 'password')):
        return jsonify({'error': '缺少必填字段'}), 400
    
    # 查找用户
    user_data = db.users.find_one({'email': data['email']})
    if not user_data:
        return jsonify({'error': '用户不存在'}), 404
    
    user = User.from_dict(user_data)
    
    # 验证密码
    if not bcrypt.check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': '密码错误'}), 401
    
    # 创建访问令牌
    access_token = create_access_token(identity=str(user._id))
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': str(user._id),
            'username': user.username,
            'email': user.email
        }
    }), 200

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    
    # 查找用户
    user_data = db.users.find_one({'_id': ObjectId(user_id)})
    if not user_data:
        return jsonify({'error': '用户不存在'}), 404
    
    user = User.from_dict(user_data)
    
    # 返回用户信息（不包括密码）
    user_dict = user.to_dict()
    user_dict.pop('password_hash', None)
    user_dict['_id'] = str(user_dict['_id'])
    
    return jsonify(user_dict), 200

@app.route('/api/auth/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # 查找用户
    user_data = db.users.find_one({'_id': ObjectId(user_id)})
    if not user_data:
        return jsonify({'error': '用户不存在'}), 404
    
    # 更新用户信息
    update_data = {}
    for field in ['username', 'gender', 'birth_date', 'height', 'weight', 'activity_level', 'goal']:
        if field in data:
            update_data[field] = data[field]
    
    if update_data:
        db.users.update_one({'_id': ObjectId(user_id)}, {'$set': update_data})
    
    return jsonify({'message': '个人资料已更新'}), 200

# 身体数据路由
@app.route('/api/physical-data', methods=['POST'])
@jwt_required()
def add_physical_data():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # 检查必填字段
    if 'weight' not in data:
        return jsonify({'error': '缺少必填字段'}), 400
    
    # 创建身体数据记录
    physical_data = PhysicalData(
        user_id=ObjectId(user_id),
        weight=data['weight'],
        body_fat=data.get('body_fat'),
        muscle_mass=data.get('muscle_mass'),
        bmi=data.get('bmi'),
        waist=data.get('waist')
    )
    
    # 保存到数据库
    db.physical_data.insert_one(physical_data.to_dict())
    
    return jsonify({'message': '身体数据已添加'}), 201

@app.route('/api/physical-data', methods=['GET'])
@jwt_required()
def get_physical_data():
    user_id = get_jwt_identity()
    
    # 查询用户的身体数据记录
    cursor = db.physical_data.find({'user_id': ObjectId(user_id)}).sort('recorded_at', -1)
    
    # 转换为列表
    records = []
    for record in cursor:
        record['_id'] = str(record['_id'])
        record['user_id'] = str(record['user_id'])
        records.append(record)
    
    return jsonify(records), 200

# 运动记录路由
@app.route('/api/exercises', methods=['POST'])
@jwt_required()
def add_exercise():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # 检查必填字段
    if not all(k in data for k in ('exercise_type', 'duration')):
        return jsonify({'error': '缺少必填字段'}), 400
    
    # 创建运动记录
    exercise = Exercise(
        user_id=ObjectId(user_id),
        exercise_type=data['exercise_type'],
        duration=data['duration'],
        calories_burned=data.get('calories_burned'),
        distance=data.get('distance'),
        steps=data.get('steps'),
        heart_rate=data.get('heart_rate'),
        intensity=data.get('intensity'),
        notes=data.get('notes')
    )
    
    # 保存到数据库
    db.exercises.insert_one(exercise.to_dict())
    
    return jsonify({'message': '运动记录已添加'}), 201

@app.route('/api/exercises', methods=['GET'])
@jwt_required()
def get_exercises():
    user_id = get_jwt_identity()
    
    # 查询用户的运动记录
    cursor = db.exercises.find({'user_id': ObjectId(user_id)}).sort('recorded_at', -1)
    
    # 转换为列表
    records = []
    for record in cursor:
        record['_id'] = str(record['_id'])
        record['user_id'] = str(record['user_id'])
        records.append(record)
    
    return jsonify(records), 200

# AI推荐路由 - 使用增强版推荐系统
@app.route('/api/recommendations/diet', methods=['POST'])
@jwt_required()
def get_diet_recommendation():
    user_id = get_jwt_identity()
    
    # 获取用户信息
    user_data = db.users.find_one({'_id': ObjectId(user_id)})
    if not user_data:
        return jsonify({'error': '用户不存在'}), 404
    
    # 获取用户的身体数据历史
    physical_data_cursor = db.physical_data.find(
        {'user_id': ObjectId(user_id)}
    ).sort('recorded_at', -1)
    physical_data = list(physical_data_cursor)
    
    # 获取用户的运动记录历史
    exercise_data_cursor = db.exercises.find(
        {'user_id': ObjectId(user_id)}
    ).sort('recorded_at', -1)
    exercise_data = list(exercise_data_cursor)
    
    # 创建增强版AI推荐系统实例
    ai_system = AIRecommendationSystem(user_data, physical_data, exercise_data)
    
    # 生成膳食推荐
    recommendation_data = ai_system.generate_diet_recommendation()
    
    # 创建膳食推荐
    recommendation = DietRecommendation(
        user_id=ObjectId(user_id),
        daily_calories=recommendation_data['daily_calories'],
        protein=recommendation_data['protein'],
        carbs=recommendation_data['carbs'],
        fat=recommendation_data['fat'],
        meal_plan=recommendation_data['meal_plan'],
        notes=recommendation_data['notes']
    )
    
    # 保存到数据库
    db.diet_recommendations.insert_one(recommendation.to_dict())
    
    # 返回推荐结果
    result = recommendation.to_dict()
    result['_id'] = str(result['_id'])
    result['user_id'] = str(result['user_id'])
    
    return jsonify(result), 200

@app.route('/api/recommendations/workout', methods=['POST'])
@jwt_required()
def get_workout_recommendation():
    user_id = get_jwt_identity()
    
    # 获取用户信息
    user_data = db.users.find_one({'_id': ObjectId(user_id)})
    if not user_data:
        return jsonify({'error': '用户不存在'}), 404
    
    # 获取用户的身体数据历史
    physical_data_cursor = db.physical_data.find(
        {'user_id': ObjectId(user_id)}
    ).sort('recorded_at', -1)
    physical_data = list(physical_data_cursor)
    
    # 获取用户的运动记录历史
    exercise_data_cursor = db.exercises.find(
        {'user_id': ObjectId(user_id)}
    ).sort('recorded_at', -1)
    exercise_data = list(exercise_data_cursor)
    
    # 创建增强版AI推荐系统实例
    ai_system = AIRecommendationSystem(user_data, physical_data, exercise_data)
    
    # 生成运动计划推荐
    recommendation_data = ai_system.generate_workout_recommendation()
    
    # 创建运动推荐
    recommendation = WorkoutRecommendation(
        user_id=ObjectId(user_id),
        workout_plan=recommendation_data['workout_plan'],
        weekly_schedule=recommendation_data['weekly_schedule'],
        target_calories=recommendation_data['target_calories'],
        notes=recommendation_data['notes']
    )
    
    # 保存到数据库
    db.workout_recommendations.insert_one(recommendation.to_dict())
    
    # 返回推荐结果
    result = recommendation.to_dict()
    result['_id'] = str(result['_id'])
    result['user_id'] = str(result['user_id'])
    
    return jsonify(result), 200

@app.route('/api/recommendations/diet', methods=['GET'])
@jwt_required()
def get_diet_recommendations():
    user_id = get_jwt_identity()
    
    # 查询用户的膳食推荐
    cursor = db.diet_recommendations.find({'user_id': ObjectId(user_id)}).sort('created_at', -1)
    
    # 转换为列表
    recommendations = []
    for rec in cursor:
        rec['_id'] = str(rec['_id'])
        rec['user_id'] = str(rec['user_id'])
        recommendations.append(rec)
    
    return jsonify(recommendations), 200

@app.route('/api/recommendations/workout', methods=['GET'])
@jwt_required()
def get_workout_recommendations():
    user_id = get_jwt_identity()
    
    # 查询用户的运动推荐
    cursor = db.workout_recommendations.find({'user_id': ObjectId(user_id)}).sort('created_at', -1)
    
    # 转换为列表
    recommendations = []
    for rec in cursor:
        rec['_id'] = str(rec['_id'])
        rec['user_id'] = str(rec['user_id'])
        recommendations.append(rec)
    
    return jsonify(recommendations), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
