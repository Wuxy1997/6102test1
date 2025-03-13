# 阿里云部署指南

本文档提供在阿里云上部署运动健康网站的详细步骤，包括环境设置、容器部署和数据库配置。

## 目录

1. [阿里云环境设置](#1-阿里云环境设置)
2. [容器部署步骤](#2-容器部署步骤)
3. [数据库配置步骤](#3-数据库配置步骤)
4. [域名和HTTPS配置](#4-域名和https配置)
5. [监控和维护](#5-监控和维护)

## 1. 阿里云环境设置

### 1.1 创建阿里云账户

1. 访问阿里云官网 (https://www.aliyun.com/)
2. 点击"免费注册"，按照提示创建阿里云账户
3. 完成实名认证

### 1.2 创建ECS实例

1. 登录阿里云控制台
2. 进入"云服务器ECS"产品页面
3. 点击"创建实例"
4. 选择配置：
   - 地域：选择离您用户最近的地域
   - 实例规格：推荐至少2核4GB内存
   - 镜像：Ubuntu 22.04
   - 存储：系统盘至少40GB
   - 网络：默认VPC和交换机
   - 安全组：开放以下端口：
     - 22 (SSH)
     - 80 (HTTP)
     - 443 (HTTPS)
     - 3000 (前端开发服务)
     - 5000 (后端API)
5. 设置登录密码
6. 确认订单并创建实例

### 1.3 安装Docker和Docker Compose

连接到ECS实例后，执行以下命令安装Docker和Docker Compose：

```bash
# 更新包索引
sudo apt-get update

# 安装必要的依赖
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# 设置Docker稳定版仓库
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# 更新包索引
sudo apt-get update

# 安装Docker CE
sudo apt-get install -y docker-ce

# 将当前用户添加到docker组
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

重新登录服务器以应用组权限更改。

## 2. 容器部署步骤

### 2.1 准备应用代码

1. 将应用代码上传到ECS实例：

```bash
# 在本地执行
scp -r /path/to/health_fitness_app username@your-ecs-instance-ip:/home/username/
```

或者使用Git克隆代码库：

```bash
# 在ECS实例上执行
git clone <your-repository-url> health_fitness_app
cd health_fitness_app
```

### 2.2 配置环境变量

1. 创建`.env`文件：

```bash
cd /home/username/health_fitness_app
touch .env
```

2. 编辑`.env`文件，添加以下内容：

```
MONGO_URI=mongodb://admin:password@mongodb:27017/health_fitness_app?authSource=admin
SECRET_KEY=your_production_secret_key
JWT_SECRET_KEY=your_production_jwt_secret_key
```

请确保替换为强密码和安全的密钥。

### 2.3 修改API基础URL

在前端代码中，修改API基础URL以匹配您的生产环境：

1. 编辑`frontend/src/utils/api.js`文件：

```bash
nano /home/username/health_fitness_app/frontend/src/utils/api.js
```

2. 更新API_BASE_URL：

```javascript
// 将
const API_BASE_URL = 'http://localhost:5000/api';
// 修改为
const API_BASE_URL = 'https://your-domain.com/api';  // 如果有域名
// 或
const API_BASE_URL = 'http://your-ecs-instance-ip:5000/api';  // 如果直接使用IP
```

### 2.4 使用Docker Compose部署

1. 启动应用：

```bash
cd /home/username/health_fitness_app
docker-compose up -d
```

2. 验证容器运行状态：

```bash
docker-compose ps
```

3. 查看容器日志：

```bash
# 查看所有容器的日志
docker-compose logs

# 查看特定服务的日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

### 2.5 使用阿里云容器服务（可选）

如果您希望使用阿里云容器服务进行更高级的容器编排和管理：

1. 登录阿里云控制台
2. 进入"容器服务Kubernetes版"
3. 创建Kubernetes集群
4. 使用kubectl部署应用：

```bash
# 安装kubectl
curl -LO "https://dl.k8s.io/release/stable.txt"
curl -LO "https://dl.k8s.io/$(cat stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# 配置kubectl
mkdir -p $HOME/.kube
scp root@<master-public-ip>:/etc/kubernetes/admin.conf $HOME/.kube/config

# 部署应用
kubectl apply -f kubernetes/
```

## 3. 数据库配置步骤

### 3.1 使用Docker Compose的MongoDB

如果您使用Docker Compose中的MongoDB服务，数据将存储在命名卷中。确保备份这些数据：

```bash
# 创建备份目录
mkdir -p /home/username/mongodb_backups

# 备份数据
docker exec health_fitness_mongodb mongodump --out /dump
docker cp health_fitness_mongodb:/dump /home/username/mongodb_backups/dump_$(date +%Y%m%d)
```

### 3.2 使用阿里云MongoDB（推荐用于生产环境）

1. 登录阿里云控制台
2. 进入"云数据库MongoDB"产品页面
3. 点击"创建实例"
4. 选择配置：
   - 地域：与ECS实例相同的地域
   - 数据库版本：4.4或更高
   - 存储引擎：WiredTiger
   - 网络类型：专有网络VPC（与ECS实例相同的VPC）
5. 设置密码
6. 确认订单并创建实例

7. 配置白名单：
   - 在MongoDB实例控制台中，选择"数据安全性" > "白名单设置"
   - 添加ECS实例的内网IP地址

8. 获取连接字符串：
   - 在MongoDB实例控制台中，点击"数据库连接"
   - 复制连接字符串

9. 更新应用配置：
   - 编辑`.env`文件，更新MONGO_URI：
   ```
   MONGO_URI=mongodb://username:password@your-mongodb-instance-connection-string/health_fitness_app
   ```

10. 重启应用：
```bash
docker-compose down
docker-compose up -d
```

### 3.3 数据迁移（从本地到阿里云MongoDB）

如果您已经有本地数据需要迁移到阿里云MongoDB：

```bash
# 导出本地数据
docker exec health_fitness_mongodb mongodump --out /dump

# 复制到主机
docker cp health_fitness_mongodb:/dump /home/username/mongodb_dump

# 导入到阿里云MongoDB
mongorestore --uri "mongodb://username:password@your-mongodb-instance-connection-string/health_fitness_app" /home/username/mongodb_dump
```

## 4. 域名和HTTPS配置

### 4.1 域名配置

1. 在阿里云购买域名（如果没有）
2. 在"云解析DNS"中添加记录：
   - 记录类型：A
   - 主机记录：@ 或 www
   - 记录值：ECS实例的公网IP
   - TTL：10分钟

### 4.2 配置HTTPS

1. 安装Nginx：

```bash
sudo apt-get update
sudo apt-get install -y nginx
```

2. 获取SSL证书：
   - 在阿里云SSL证书服务中购买证书
   - 或使用Let's Encrypt免费证书：

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

3. 配置Nginx反向代理：

```bash
sudo nano /etc/nginx/sites-available/health_fitness_app
```

添加以下内容：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

4. 启用站点并重启Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/health_fitness_app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5. 监控和维护

### 5.1 设置日志监控

1. 配置Docker日志驱动：

编辑`/etc/docker/daemon.json`：

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

重启Docker：

```bash
sudo systemctl restart docker
```

2. 使用阿里云日志服务（可选）：
   - 在阿里云控制台中，进入"日志服务"
   - 创建Project和Logstore
   - 安装Logtail并配置收集Docker日志

### 5.2 设置监控告警

1. 使用阿里云云监控：
   - 在阿里云控制台中，进入"云监控"
   - 添加ECS和MongoDB的监控项
   - 设置告警规则，如CPU使用率、内存使用率、磁盘空间等

### 5.3 定期备份

1. 设置MongoDB定期备份：

创建备份脚本`/home/username/backup_mongodb.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/home/username/mongodb_backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mongodb_backup_$TIMESTAMP"

# 创建备份
docker exec health_fitness_mongodb mongodump --out /dump
docker cp health_fitness_mongodb:/dump $BACKUP_FILE

# 保留最近7天的备份
find $BACKUP_DIR -type d -name "mongodb_backup_*" -mtime +7 -exec rm -rf {} \;
```

添加执行权限：

```bash
chmod +x /home/username/backup_mongodb.sh
```

添加到crontab：

```bash
crontab -e
```

添加以下行（每天凌晨2点执行备份）：

```
0 2 * * * /home/username/backup_mongodb.sh
```

### 5.4 更新应用

1. 拉取最新代码：

```bash
cd /home/username/health_fitness_app
git pull
```

2. 重新构建并启动容器：

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 故障排除

### 容器无法启动

1. 检查日志：

```bash
docker-compose logs
```

2. 检查网络连接：

```bash
docker network ls
docker network inspect health_fitness_app_app_network
```

3. 检查存储卷：

```bash
docker volume ls
docker volume inspect health_fitness_app_mongodb_data
```

### 数据库连接问题

1. 检查MongoDB服务状态：

```bash
docker-compose ps mongodb
```

2. 检查MongoDB日志：

```bash
docker-compose logs mongodb
```

3. 验证连接字符串：

```bash
docker exec -it health_fitness_backend python -c "from pymongo import MongoClient; client = MongoClient('mongodb://admin:password@mongodb:27017/health_fitness_app?authSource=admin'); print(client.server_info())"
```

### 网络问题

1. 检查安全组规则
2. 检查Nginx配置
3. 验证域名解析

如果您遇到任何其他问题，请参考阿里云文档或联系阿里云支持。
