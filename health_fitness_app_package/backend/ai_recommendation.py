import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from datetime import datetime, timedelta

class AIRecommendationSystem:
    """
    增强版AI推荐系统，提供更加个性化的膳食和运动计划推荐
    """
    
    def __init__(self, user_data, physical_data=None, exercise_data=None):
        """
        初始化推荐系统
        
        参数:
        - user_data: 用户基本信息
        - physical_data: 用户身体数据历史记录
        - exercise_data: 用户运动记录历史
        """
        self.user_data = user_data
        self.physical_data = physical_data or []
        self.exercise_data = exercise_data or []
        
        # 用户特征向量
        self.user_features = self._extract_user_features()
        
    def _extract_user_features(self):
        """提取用户特征向量，用于个性化推荐"""
        features = {}
        
        # 基本特征
        features['gender'] = self.user_data.get('gender', 'male')
        features['age'] = self._calculate_age(self.user_data.get('birth_date'))
        features['height'] = self.user_data.get('height', 170)
        features['weight'] = self._get_latest_weight()
        features['activity_level'] = self.user_data.get('activity_level', 'medium')
        features['goal'] = self.user_data.get('goal', 'maintain')
        
        # 计算BMI
        features['bmi'] = self._calculate_bmi(features['height'], features['weight'])
        
        # 运动偏好
        features['exercise_preferences'] = self._analyze_exercise_preferences()
        
        # 身体变化趋势
        features['weight_trend'] = self._analyze_weight_trend()
        
        return features
    
    def _calculate_age(self, birth_date):
        """计算用户年龄"""
        if not birth_date:
            return 30  # 默认年龄
        
        try:
            if isinstance(birth_date, str):
                birth_date = datetime.strptime(birth_date, '%Y-%m-%d')
            
            today = datetime.now()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            return age
        except:
            return 30  # 默认年龄
    
    def _get_latest_weight(self):
        """获取最新体重数据"""
        if not self.physical_data:
            return self.user_data.get('weight', 70)
        
        # 按记录时间排序
        sorted_data = sorted(self.physical_data, key=lambda x: x.get('recorded_at', datetime.min), reverse=True)
        return sorted_data[0].get('weight', 70)
    
    def _calculate_bmi(self, height, weight):
        """计算BMI指数"""
        if not height or height <= 0:
            return 22  # 默认BMI
        
        # 转换为米
        height_m = height / 100
        
        # 计算BMI
        bmi = weight / (height_m * height_m)
        return round(bmi, 1)
    
    def _analyze_exercise_preferences(self):
        """分析用户运动偏好"""
        if not self.exercise_data:
            return {
                'cardio': 0.5,
                'strength': 0.3,
                'flexibility': 0.2
            }
        
        # 统计各类运动的频率
        exercise_types = {}
        for exercise in self.exercise_data:
            ex_type = exercise.get('exercise_type', '')
            exercise_types[ex_type] = exercise_types.get(ex_type, 0) + 1
        
        # 将运动类型映射到大类
        cardio_types = ['跑步', '步行', '骑行', '游泳', '有氧']
        strength_types = ['力量训练', '举重', '健身']
        flexibility_types = ['瑜伽', '普拉提', '伸展']
        
        # 计算各大类的偏好度
        cardio_pref = sum(exercise_types.get(t, 0) for t in cardio_types)
        strength_pref = sum(exercise_types.get(t, 0) for t in strength_types)
        flexibility_pref = sum(exercise_types.get(t, 0) for t in flexibility_types)
        
        # 归一化
        total = cardio_pref + strength_pref + flexibility_pref
        if total == 0:
            return {
                'cardio': 0.5,
                'strength': 0.3,
                'flexibility': 0.2
            }
        
        return {
            'cardio': cardio_pref / total,
            'strength': strength_pref / total,
            'flexibility': flexibility_pref / total
        }
    
    def _analyze_weight_trend(self):
        """分析体重变化趋势"""
        if len(self.physical_data) < 2:
            return 'stable'
        
        # 按记录时间排序
        sorted_data = sorted(self.physical_data, key=lambda x: x.get('recorded_at', datetime.min))
        
        # 计算最近一个月的体重变化
        recent_data = [d for d in sorted_data if d.get('recorded_at', datetime.min) >= datetime.now() - timedelta(days=30)]
        
        if len(recent_data) < 2:
            return 'stable'
        
        first_weight = recent_data[0].get('weight', 0)
        last_weight = recent_data[-1].get('weight', 0)
        
        # 计算变化百分比
        change_percent = (last_weight - first_weight) / first_weight * 100
        
        if change_percent < -1:
            return 'losing'
        elif change_percent > 1:
            return 'gaining'
        else:
            return 'stable'
    
    def generate_diet_recommendation(self):
        """生成增强版膳食推荐"""
        # 获取用户特征
        gender = self.user_features['gender']
        age = self.user_features['age']
        weight = self.user_features['weight']
        height = self.user_features['height']
        activity_level = self.user_features['activity_level']
        goal = self.user_features['goal']
        bmi = self.user_features['bmi']
        weight_trend = self.user_features['weight_trend']
        
        # 基础代谢率计算 (BMR)
        if gender == 'male':
            bmr = 10 * weight + 6.25 * height - 5 * age + 5
        else:
            bmr = 10 * weight + 6.25 * height - 5 * age - 161
        
        # 根据活动水平调整
        activity_multipliers = {
            'low': 1.2,
            'medium': 1.55,
            'high': 1.9
        }
        
        tdee = bmr * activity_multipliers.get(activity_level, 1.55)
        
        # 根据目标和体重趋势调整卡路里
        goal_adjustments = {
            'lose': -500,
            'maintain': 0,
            'gain': 500
        }
        
        # 根据BMI和体重趋势进行微调
        bmi_adjustment = 0
        if bmi > 25 and goal == 'lose':
            bmi_adjustment = -100  # 超重且目标是减肥，多减100卡
        elif bmi < 18.5 and goal == 'gain':
            bmi_adjustment = 100  # 偏瘦且目标是增肌，多加100卡
        
        # 根据体重趋势调整
        trend_adjustment = 0
        if weight_trend == 'losing' and goal == 'lose':
            trend_adjustment = 100  # 已经在减重，可以适当放松一点
        elif weight_trend == 'gaining' and goal == 'gain':
            trend_adjustment = -50  # 已经在增重，可以适当控制一点
        
        daily_calories = tdee + goal_adjustments.get(goal, 0) + bmi_adjustment + trend_adjustment
        
        # 宏量营养素分配
        # 根据目标调整蛋白质摄入
        if goal == 'gain':
            protein_per_kg = 2.2  # 增肌需要更多蛋白质
        elif goal == 'lose':
            protein_per_kg = 2.0  # 减脂也需要足够蛋白质保持肌肉
        else:
            protein_per_kg = 1.8  # 维持健康的蛋白质摄入
            
        protein = weight * protein_per_kg  # 每公斤体重的蛋白质克数
        
        # 根据目标调整脂肪和碳水比例
        if goal == 'lose':
            fat_ratio = 0.3  # 减脂时适当增加脂肪比例
            carb_ratio = 0.4  # 减脂时适当减少碳水比例
        elif goal == 'gain':
            fat_ratio = 0.25  # 增肌时适当减少脂肪比例
            carb_ratio = 0.55  # 增肌时适当增加碳水比例
        else:
            fat_ratio = 0.25  # 维持健康的脂肪比例
            carb_ratio = 0.5  # 维持健康的碳水比例
        
        # 计算脂肪和碳水的卡路里
        protein_calories = protein * 4  # 蛋白质每克4卡
        fat_calories = daily_calories * fat_ratio
        carb_calories = daily_calories - protein_calories - fat_calories
        
        # 转换为克数
        fat = fat_calories / 9  # 脂肪每克9卡
        carbs = carb_calories / 4  # 碳水每克4卡
        
        # 创建膳食计划
        meal_plan = self._create_personalized_meal_plan(goal, protein, carbs, fat, weight_trend, bmi)
        
        # 生成推荐结果
        recommendation = {
            'daily_calories': round(daily_calories),
            'protein': round(protein),
            'carbs': round(carbs),
            'fat': round(fat),
            'meal_plan': meal_plan,
            'notes': self._generate_diet_notes(goal, bmi, weight_trend)
        }
        
        return recommendation
    
    def _create_personalized_meal_plan(self, goal, protein, carbs, fat, weight_trend, bmi):
        """创建个性化膳食计划"""
        # 根据目标选择食物类型
        if goal == 'lose':
            breakfast_options = [
                '低脂希腊酸奶配蓝莓和坚果',
                '蛋白质煎蛋配全麦吐司',
                '燕麦粥配香蕉和少量蜂蜜'
            ]
            lunch_options = [
                '烤鸡胸肉沙拉配低脂沙拉酱',
                '金枪鱼蔬菜色拉配橄榄油',
                '豆腐炒蔬菜配少量糙米'
            ]
            dinner_options = [
                '烤三文鱼配蒸蔬菜',
                '瘦牛肉炖菜配少量红薯',
                '烤鸡胸肉配绿叶蔬菜'
            ]
            snack_options = [
                '苹果片配少量杏仁',
                '低脂希腊酸奶',
                '胡萝卜条配鹰嘴豆泥'
            ]
        elif goal == 'gain':
            breakfast_options = [
                '全麦面包配鸡蛋、牛油果和奶酪',
                '高蛋白燕麦粥配香蕉、蛋白粉和坚果黄油',
                '全麦华夫饼配希腊酸奶和浆果'
            ]
            lunch_options = [
                '鸡胸肉三明治配全麦面包和牛油果',
                '三文鱼配糙米和蔬菜',
                '牛肉炒饭配蔬菜和额外蛋白'
            ]
            dinner_options = [
                '牛排配烤红薯和蔬菜',
                '全麦意面配肉酱和奶酪',
                '烤鸡配藜麦和蔬菜'
            ]
            snack_options = [
                '蛋白质奶昔配香蕉和花生酱',
                '希腊酸奶配坚果和蜂蜜',
                '全麦吐司配鸡蛋和牛油果'
            ]
        else:  # maintain
            breakfast_options = [
                '全麦面包配鸡蛋和牛油果',
                '燕麦粥配水果和坚果',
                '希腊酸奶配浆果和格兰诺拉麦片'
            ]
            lunch_options = [
                '鸡肉沙拉配藜麦和蔬菜',
                '三文鱼配糙米和蔬菜',
                '豆腐蔬菜炒饭'
            ]
            dinner_options = [
                '烤鱼配蔬菜和少量土豆',
                '瘦肉炖菜配糙米',
                '鸡肉配蔬菜和藜麦'
            ]
            snack_options = [
                '水果和少量坚果',
                '希腊酸奶配少量蜂蜜',
                '胡萝卜和鹰嘴豆泥'
            ]
        
        # 根据BMI调整
        if bmi > 30:  # 肥胖
            breakfast_desc = "早餐应该富含蛋白质和纤维，控制碳水摄入"
            lunch_desc = "午餐应该以蛋白质和蔬菜为主，限制淀粉类食物"
            dinner_desc = "晚餐应该清淡，避免高碳水食物，增加蔬菜摄入"
            snack_desc = "加餐选择低热量、高蛋白的食物，控制总量"
        elif bmi < 18.5:  # 偏瘦
            breakfast_desc = "早餐应该营养丰富，包含优质蛋白质、健康脂肪和复合碳水"
            lunch_desc = "午餐应该热量充足，均衡包含蛋白质、碳水和健康脂肪"
            dinner_desc = "晚餐应该包含足够的蛋白质和碳水，帮助恢复和增长"
            snack_desc = "加餐选择高热量、高蛋白的食物，增加总摄入量"
        else:  # 正常体重
            breakfast_desc = "早餐应该包含优质蛋白质和复合碳水化合物"
            lunch_desc = "午餐应该均衡包含蛋白质、碳水和蔬菜"
            dinner_desc = "晚餐应该适量，包含蛋白质和蔬菜"
            snack_desc = "健康的加餐选择"
        
        # 创建膳食计划
        meal_plan = {
            'breakfast': {
                'description': breakfast_desc,
                'suggestions': breakfast_options
            },
            'lunch': {
                'description': lunch_desc,
                'suggestions': lunch_options
            },
            'dinner': {
                'description': dinner_desc,
                'suggestions': dinner_options
            },
            'snacks': {
                'description': snack_desc,
                'suggestions': snack_options
            }
        }
        
        return meal_plan
    
    def _generate_diet_notes(self, goal, bmi, weight_trend):
        """生成膳食建议注释"""
        notes = []
        
        # 根据目标添加注释
        if goal == 'lose':
            notes.append("您的目标是减肥，我们建议适当控制热量摄入，增加蛋白质比例以保持肌肉。")
        elif goal == 'gain':
            notes.append("您的目标是增肌，我们建议适当增加热量摄入，保证足够的蛋白质和碳水化合物。")
        else:
            notes.append("您的目标是保持健康，我们建议均衡饮食，保持适量的热量摄入。")
        
        # 根据BMI添加注释
        if bmi > 30:
            notes.append("您的BMI指数偏高，建议控制总热量摄入，增加蛋白质比例，减少精制碳水和添加糖。")
        elif bmi > 25:
            notes.append("您的BMI指数略高，建议适当控制热量摄入，选择全谷物和瘦肉类食物。")
        elif bmi < 18.5:
            notes.append("您的BMI指数偏低，建议增加总热量摄入，保证足够的蛋白质和健康脂肪。")
        else:
            notes.append("您的BMI指数在正常范围，建议保持均衡饮食习惯。")
        
        # 根据体重趋势添加注释
        if weight_trend == 'losing' and goal != 'lose':
            notes.append("您最近有减重趋势，如果这不是您的目标，建议适当增加热量摄入。")
        elif weight_trend == 'gaining' and goal != 'gain':
            notes.append("您最近有增重趋势，如果这不是您的目标，建议适当控制热量摄入。")
        
        # 添加水分摄入建议
        notes.append("请确保每天饮用足够的水，建议至少2升（约8杯）。")
        
        return "；".join(notes)
    
    def generate_workout_recommendation(self):
        """生成增强版运动计划推荐"""
        # 获取用户特征
        gender = self.user_features['gender']
        age = self.user_features['age']
        weight = self.user_features['weight']
        height = self.user_features['height']
        activity_level = self.user_features['activity_level']
        goal = self.user_features['goal']
        bmi = self.user_features['bmi']
        exercise_preferences = self.user_features['exercise_preferences']
        
        # 根据目标确定运动类型和强度
        if goal == 'lose':
            workout_focus = "减脂"
            cardio_ratio = 0.6
            strength_ratio = 0.3
            flexibility_ratio = 0.1
        elif goal == 'gain':
            workout_focus = "增肌"
            cardio_ratio = 0.2
            strength_ratio = 0.7
            flexibility_ratio = 0.1
        else:  # maintain
            workout_focus = "健康维持"
            cardio_ratio = 0.4
            strength_ratio = 0.4
            flexibility_ratio = 0.2
        
        # 结合用户偏好调整比例
        user_cardio = exercise_preferences.get('cardio', 0.5)
        user_strength = exercise_preferences.get('strength', 0.3)
        user_flexibility = exercise_preferences.get('flexibility', 0.2)
        
        # 加权平均
        final_cardio = 0.7 * cardio_ratio + 0.3 * user_cardio
        final_strength = 0.7 * strength_ratio + 0.3 * user_strength
        final_flexibility = 0.7 * flexibility_ratio + 0.3 * user_flexibility
        
        # 归一化
        total = final_cardio + final_strength + final_flexibility
        final_cardio /= total
        final_strength /= total
        final_flexibility /= total
        
        # 根据活动水平确定频率
        if activity_level == 'low':
            frequency = "每周3-4次"
            days_per_week = 3
        elif activity_level == 'high':
            frequency = "每周5-6次"
            days_per_week = 5
        else:  # medium
            frequency = "每周4-5次"
            days_per_week = 4
        
        # 根据年龄调整强度
        if age > 60:
            intensity_modifier = "低到中等强度"
            duration_modifier = 0.8  # 减少20%的时间
        elif age > 40:
            intensity_modifier = "中等强度"
            duration_modifier = 1.0
        else:
            intensity_modifier = "中等到高强度"
            duration_modifier = 1.2  # 增加20%的时间
        
        # 创建每周计划
        weekly_schedule = self._create_weekly_schedule(
            days_per_week, 
            final_cardio, 
            final_strength, 
            final_flexibility,
            intensity_modifier,
            duration_modifier
        )
        
        # 计算目标卡路里消耗
        if goal == 'lose':
            target_calories = weight * 35  # 减脂目标更高
        elif goal == 'gain':
            target_calories = weight * 15  # 增肌目标较低
        else:
            target_calories = weight * 25  # 维持健康
        
        # 根据年龄调整
        if age > 60:
            target_calories *= 0.8
        elif age > 40:
            target_calories *= 0.9
        
        # 创建运动计划
        workout_plan = self._create_personalized_workout_plan(
            goal, 
            final_cardio, 
            final_strength, 
            final_flexibility,
            bmi,
            age
        )
        
        # 生成推荐结果
        recommendation = {
            'workout_plan': workout_plan,
            'weekly_schedule': weekly_schedule,
            'target_calories': round(target_calories),
            'notes': self._generate_workout_notes(goal, bmi, age, activity_level)
        }
        
        return recommendation
    
    def _create_weekly_schedule(self, days_per_week, cardio_ratio, strength_ratio, flexibility_ratio, intensity, duration_modifier):
        """创建每周运动计划"""
        # 确定每周的运动天数
        cardio_days = round(days_per_week * cardio_ratio)
        strength_days = round(days_per_week * strength_ratio)
        flexibility_days = days_per_week - cardio_days - strength_days
        
        # 确保至少有一天休息
        if cardio_days + strength_days + flexibility_days >= 7:
            if flexibility_days > 0:
                flexibility_days -= 1
            elif cardio_days > strength_days:
                cardio_days -= 1
            else:
                strength_days -= 1
        
        # 创建每周计划
        days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        schedule = {}
        
        day_index = 0
        
        # 添加力量训练日
        for _ in range(strength_days):
            if day_index < 7:
                schedule[days[day_index]] = {
                    'type': '力量训练',
                    'duration': f'{round(45 * duration_modifier)}-{round(60 * duration_modifier)}分钟',
                    'description': f'{intensity}力量训练，专注于大肌群'
                }
                day_index += 1
        
        # 添加有氧训练日
        for _ in range(cardio_days):
            if day_index < 7:
                schedule[days[day_index]] = {
                    'type': '有氧运动',
                    'duration': f'{round(30 * duration_modifier)}-{round(45 * duration_modifier)}分钟',
                    'description': f'{intensity}有氧运动，如跑步、骑行或游泳'
                }
                day_index += 1
        
        # 添加灵活性训练日
        for _ in range(flexibility_days):
            if day_index < 7:
                schedule[days[day_index]] = {
                    'type': '灵活性训练',
                    'duration': f'{round(20 * duration_modifier)}-{round(30 * duration_modifier)}分钟',
                    'description': '瑜伽或伸展运动，改善柔韧性和平衡性'
                }
                day_index += 1
        
        # 添加休息日
        while day_index < 7:
            schedule[days[day_index]] = {
                'type': '休息',
                'duration': '0分钟',
                'description': '完全休息或轻度伸展'
            }
            day_index += 1
        
        return schedule
    
    def _create_personalized_workout_plan(self, goal, cardio_ratio, strength_ratio, flexibility_ratio, bmi, age):
        """创建个性化运动计划"""
        # 根据目标选择运动类型
        if goal == 'lose':
            cardio_options = ['跑步', '高强度间歇训练', '骑行', '游泳', '椭圆机']
            strength_options = ['全身力量训练', '高重复次数力量训练', '循环训练']
            flexibility_options = ['瑜伽', '普拉提', '伸展运动']
            focus = "减脂，增加心肺功能，保持肌肉量"
            progression = "每2周增加有氧运动时间或强度"
        elif goal == 'gain':
            cardio_options = ['短时间高强度间歇训练', '爬楼梯', '划船机']
            strength_options = ['重量训练', '低重复次数高强度训练', '复合动作训练']
            flexibility_options = ['动态伸展', '瑜伽', '泡沫轴放松']
            focus = "增肌，提高力量，适量有氧维持心肺功能"
            progression = "每2-3周增加训练重量或组数"
        else:  # maintain
            cardio_options = ['跑步', '骑行', '游泳', '快走', '跳绳']
            strength_options = ['中等强度力量训练', '自重训练', '功能性训练']
            flexibility_options = ['瑜伽', '普拉提', '太极', '伸展运动']
            focus = "保持整体健康，平衡发展心肺功能和肌肉力量"
            progression = "每3-4周变换训练方式，保持多样性"
        
        # 根据BMI调整
        if bmi > 30:  # 肥胖
            cardio_desc = "低冲击有氧运动，减少关节压力"
            strength_desc = "全身力量训练，增加基础代谢率"
            flexibility_desc = "改善活动范围，减少受伤风险"
            if '跑步' in cardio_options:
                cardio_options.remove('跑步')
                cardio_options.append('快走')
        elif bmi < 18.5:  # 偏瘦
            cardio_desc = "适量有氧运动，不过度消耗能量"
            strength_desc = "重点进行力量训练，促进肌肉生长"
            flexibility_desc = "保持关节健康和活动范围"
        else:  # 正常体重
            cardio_desc = "多样化有氧运动，提高心肺功能"
            strength_desc = "平衡的力量训练，增强整体力量"
            flexibility_desc = "改善柔韧性和平衡能力"
        
        # 根据年龄调整
        if age > 60:
            if '高强度间歇训练' in cardio_options:
                cardio_options.remove('高强度间歇训练')
                cardio_options.append('快走')
            if '重量训练' in strength_options:
                strength_options.remove('重量训练')
                strength_options.append('轻量多次数训练')
            progression = "每4周缓慢增加训练量，注意恢复"
        
        # 创建运动计划
        workout_plan = {
            'goal': goal,
            'focus': focus,
            'progression': progression,
            'exercises': [
                {
                    'name': '有氧训练',
                    'options': cardio_options,
                    'duration': f'{round(30 + 15 * cardio_ratio)}-{round(45 + 15 * cardio_ratio)}分钟',
                    'frequency': f'每周{max(2, round(3 * cardio_ratio))}次',
                    'description': cardio_desc
                },
                {
                    'name': '力量训练',
                    'options': strength_options,
                    'duration': f'{round(30 + 15 * strength_ratio)}-{round(45 + 15 * strength_ratio)}分钟',
                    'frequency': f'每周{max(2, round(3 * strength_ratio))}次',
                    'description': strength_desc
                },
                {
                    'name': '灵活性训练',
                    'options': flexibility_options,
                    'duration': f'{round(15 + 15 * flexibility_ratio)}-{round(30 + 15 * flexibility_ratio)}分钟',
                    'frequency': f'每周{max(1, round(3 * flexibility_ratio))}次',
                    'description': flexibility_desc
                }
            ]
        }
        
        return workout_plan
    
    def _generate_workout_notes(self, goal, bmi, age, activity_level):
        """生成运动建议注释"""
        notes = []
        
        # 根据目标添加注释
        if goal == 'lose':
            notes.append("您的目标是减肥，我们建议结合有氧运动和力量训练，创造热量赤字同时保持肌肉量。")
        elif goal == 'gain':
            notes.append("您的目标是增肌，我们建议以力量训练为主，辅以适量有氧运动，确保足够的营养摄入。")
        else:
            notes.append("您的目标是保持健康，我们建议均衡的有氧和力量训练，保持身体各方面的健康。")
        
        # 根据BMI添加注释
        if bmi > 30:
            notes.append("您的BMI指数偏高，建议从低冲击运动开始，如快走、游泳或椭圆机，减少关节压力。")
        elif bmi > 25:
            notes.append("您的BMI指数略高，建议结合有氧运动和力量训练，帮助减少体脂率。")
        elif bmi < 18.5:
            notes.append("您的BMI指数偏低，建议重点进行力量训练，适当控制有氧运动量，确保足够的营养摄入。")
        
        # 根据年龄添加注释
        if age > 60:
            notes.append("考虑到您的年龄，建议从低强度运动开始，逐渐增加强度，特别注意关节保护和充分恢复。")
        elif age > 40:
            notes.append("随着年龄增长，建议增加灵活性训练和核心训练，预防受伤和保持功能性。")
        
        # 根据活动水平添加注释
        if activity_level == 'low':
            notes.append("您当前的活动水平较低，建议从短时间、低强度的运动开始，逐渐增加时间和强度。")
        elif activity_level == 'high':
            notes.append("您当前的活动水平较高，建议注意恢复和变化训练方式，避免过度训练。")
        
        # 添加通用建议
        notes.append("请确保每次运动前进行5-10分钟的热身，运动后进行适当的拉伸。")
        notes.append("保持充分的水分摄入，特别是在运动前、中、后。")
        
        return "；".join(notes)
