from datetime import datetime
from bson import ObjectId

class User:
    """用户模型，用于存储用户信息和身份验证"""
    def __init__(self, username, email, password_hash, gender=None, birth_date=None, 
                 height=None, weight=None, activity_level=None, goal=None, 
                 created_at=None, _id=None):
        self._id = _id if _id else ObjectId()
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.gender = gender
        self.birth_date = birth_date
        self.height = height  # 身高（厘米）
        self.weight = weight  # 体重（千克）
        self.activity_level = activity_level  # 活动水平：低、中、高
        self.goal = goal  # 目标：减肥、增肌、保持健康等
        self.created_at = created_at if created_at else datetime.now()
    
    def to_dict(self):
        return {
            "_id": self._id,
            "username": self.username,
            "email": self.email,
            "password_hash": self.password_hash,
            "gender": self.gender,
            "birth_date": self.birth_date,
            "height": self.height,
            "weight": self.weight,
            "activity_level": self.activity_level,
            "goal": self.goal,
            "created_at": self.created_at
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            _id=data.get("_id"),
            username=data.get("username"),
            email=data.get("email"),
            password_hash=data.get("password_hash"),
            gender=data.get("gender"),
            birth_date=data.get("birth_date"),
            height=data.get("height"),
            weight=data.get("weight"),
            activity_level=data.get("activity_level"),
            goal=data.get("goal"),
            created_at=data.get("created_at")
        )


class PhysicalData:
    """身体数据模型，用于记录用户的身体指标变化"""
    def __init__(self, user_id, weight, body_fat=None, muscle_mass=None, 
                 bmi=None, waist=None, recorded_at=None, _id=None):
        self._id = _id if _id else ObjectId()
        self.user_id = user_id
        self.weight = weight  # 体重（千克）
        self.body_fat = body_fat  # 体脂率（百分比）
        self.muscle_mass = muscle_mass  # 肌肉量（千克）
        self.bmi = bmi  # 身体质量指数
        self.waist = waist  # 腰围（厘米）
        self.recorded_at = recorded_at if recorded_at else datetime.now()
    
    def to_dict(self):
        return {
            "_id": self._id,
            "user_id": self.user_id,
            "weight": self.weight,
            "body_fat": self.body_fat,
            "muscle_mass": self.muscle_mass,
            "bmi": self.bmi,
            "waist": self.waist,
            "recorded_at": self.recorded_at
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            _id=data.get("_id"),
            user_id=data.get("user_id"),
            weight=data.get("weight"),
            body_fat=data.get("body_fat"),
            muscle_mass=data.get("muscle_mass"),
            bmi=data.get("bmi"),
            waist=data.get("waist"),
            recorded_at=data.get("recorded_at")
        )


class Exercise:
    """运动记录模型，用于记录用户的运动活动"""
    def __init__(self, user_id, exercise_type, duration, calories_burned=None, 
                 distance=None, steps=None, heart_rate=None, intensity=None, 
                 notes=None, recorded_at=None, _id=None):
        self._id = _id if _id else ObjectId()
        self.user_id = user_id
        self.exercise_type = exercise_type  # 运动类型：跑步、游泳、骑行等
        self.duration = duration  # 持续时间（分钟）
        self.calories_burned = calories_burned  # 消耗卡路里
        self.distance = distance  # 距离（米）
        self.steps = steps  # 步数
        self.heart_rate = heart_rate  # 平均心率
        self.intensity = intensity  # 强度：低、中、高
        self.notes = notes  # 备注
        self.recorded_at = recorded_at if recorded_at else datetime.now()
    
    def to_dict(self):
        return {
            "_id": self._id,
            "user_id": self.user_id,
            "exercise_type": self.exercise_type,
            "duration": self.duration,
            "calories_burned": self.calories_burned,
            "distance": self.distance,
            "steps": self.steps,
            "heart_rate": self.heart_rate,
            "intensity": self.intensity,
            "notes": self.notes,
            "recorded_at": self.recorded_at
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            _id=data.get("_id"),
            user_id=data.get("user_id"),
            exercise_type=data.get("exercise_type"),
            duration=data.get("duration"),
            calories_burned=data.get("calories_burned"),
            distance=data.get("distance"),
            steps=data.get("steps"),
            heart_rate=data.get("heart_rate"),
            intensity=data.get("intensity"),
            notes=data.get("notes"),
            recorded_at=data.get("recorded_at")
        )


class DietRecommendation:
    """膳食推荐模型，用于存储AI生成的膳食建议"""
    def __init__(self, user_id, daily_calories, protein, carbs, fat, 
                 meal_plan, notes=None, created_at=None, _id=None):
        self._id = _id if _id else ObjectId()
        self.user_id = user_id
        self.daily_calories = daily_calories  # 每日推荐卡路里
        self.protein = protein  # 蛋白质（克）
        self.carbs = carbs  # 碳水化合物（克）
        self.fat = fat  # 脂肪（克）
        self.meal_plan = meal_plan  # 膳食计划（早餐、午餐、晚餐、加餐）
        self.notes = notes  # 备注
        self.created_at = created_at if created_at else datetime.now()
    
    def to_dict(self):
        return {
            "_id": self._id,
            "user_id": self.user_id,
            "daily_calories": self.daily_calories,
            "protein": self.protein,
            "carbs": self.carbs,
            "fat": self.fat,
            "meal_plan": self.meal_plan,
            "notes": self.notes,
            "created_at": self.created_at
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            _id=data.get("_id"),
            user_id=data.get("user_id"),
            daily_calories=data.get("daily_calories"),
            protein=data.get("protein"),
            carbs=data.get("carbs"),
            fat=data.get("fat"),
            meal_plan=data.get("meal_plan"),
            notes=data.get("notes"),
            created_at=data.get("created_at")
        )


class WorkoutRecommendation:
    """运动计划推荐模型，用于存储AI生成的运动建议"""
    def __init__(self, user_id, workout_plan, weekly_schedule, 
                 target_calories, notes=None, created_at=None, _id=None):
        self._id = _id if _id else ObjectId()
        self.user_id = user_id
        self.workout_plan = workout_plan  # 运动计划详情
        self.weekly_schedule = weekly_schedule  # 每周安排
        self.target_calories = target_calories  # 目标消耗卡路里
        self.notes = notes  # 备注
        self.created_at = created_at if created_at else datetime.now()
    
    def to_dict(self):
        return {
            "_id": self._id,
            "user_id": self.user_id,
            "workout_plan": self.workout_plan,
            "weekly_schedule": self.weekly_schedule,
            "target_calories": self.target_calories,
            "notes": self.notes,
            "created_at": self.created_at
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(
            _id=data.get("_id"),
            user_id=data.get("user_id"),
            workout_plan=data.get("workout_plan"),
            weekly_schedule=data.get("weekly_schedule"),
            target_calories=data.get("target_calories"),
            notes=data.get("notes"),
            created_at=data.get("created_at")
        )
