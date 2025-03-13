# 运动健康网站安装指南

本文档提供运动健康网站的详细安装步骤，包括本地开发环境和生产环境的设置。

## 目录

1. [系统要求](#1-系统要求)
2. [本地开发环境安装](#2-本地开发环境安装)
3. [生产环境安装](#3-生产环境安装)
4. [常见问题解答](#4-常见问题解答)

## 1. 系统要求

### 1.1 硬件要求

- **开发环境**：
  - CPU: 双核处理器或更高
  - 内存: 至少4GB RAM
  - 磁盘空间: 至少10GB可用空间

- **生产环境**：
  - CPU: 四核处理器或更高
  - 内存: 至少8GB RAM
  - 磁盘空间: 至少20GB可用空间

### 1.2 软件要求

- **操作系统**：
  - Linux (推荐Ubuntu 20.04或更高版本)
  - macOS 10.15或更高版本
  - Windows 10或更高版本

- **必要软件**：
  - Docker 20.10或更高版本
  - Docker Compose 2.0或更高版本
  - Git 2.25或更高版本

- **可选软件**（仅开发环境）：
  - Node.js 16或更高版本
  - Python 3.8或更高版本
  - MongoDB 4.4或更高版本

## 2. 本地开发环境安装

### 2.1 安装必要软件

#### Linux (Ubuntu)

```bash
# 更新包索引
sudo apt-get update

# 安装Git
sudo apt-get install -y git

# 安装Docker
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将当前用户添加到docker组
sudo usermod -aG docker $USER
```

重新登录以应用组权限更改。

#### macOS

1. 安装Homebrew（如果尚未安装）：
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. 安装Git和Docker：
```bash
brew install git
brew install --cask docker
```

3. 启动Docker Desktop应用。

#### Windows

1. 安装Git：
   - 下载并安装：https://git-scm.com/download/win

2. 安装Docker Desktop：
   - 下载并安装：https://www.docker.com/products/docker-desktop
   - 确保启用WSL 2后端

### 2.2 获取代码

```bash
# 克隆代码库
git clone https://github.com/yourusername/health_fitness_app.git
cd health_fitness_app
```

### 2.3 配置环境变量

创建`.env`文件：

```bash
cp .env.example .env
```

编辑`.env`文件，设置以下变量：

```
MONGO_URI=mongodb://admin:password@mongodb:27017/health_fitness_app?authSource=admin
SECRET_KEY=your_development_secret_key
JWT_SECRET_KEY=your_development_jwt_secret_key
```

### 2.4 使用Docker Compose启动应用

```bash
# 构建并启动容器
docker-compose up -d

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs
```

### 2.5 手动开发环境设置（可选）

如果您希望在不使用Docker的情况下设置开发环境：

#### 后端设置

```bash
# 创建Python虚拟环境
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# 或
venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动后端服务
flask run --host=0.0.0.0
```

#### 前端设置

```bash
# 安装依赖
cd frontend
npm install

# 启动开发服务器
npm start
```

#### MongoDB设置

1. 安装MongoDB：
   - 参考官方文档：https://docs.mongodb.com/manual/installation/

2. 创建数据库和用户：
```bash
mongo
> use health_fitness_app
> db.createUser({
    user: "admin",
    pwd: "password",
    roles: [{ role: "readWrite", db: "health_fitness_app" }]
  })
```

### 2.6 访问应用

- 前端: http://localhost:3000
- 后端API: http://localhost:5000

## 3. 生产环境安装

### 3.1 服务器准备

1. 设置服务器（推荐使用阿里云ECS）：
   - 参考[阿里云部署指南](aliyun_deployment_guide.md)中的"阿里云环境设置"部分

2. 安装必要软件：
   - Docker和Docker Compose（参考上述指南）

### 3.2 部署应用

1. 获取代码：
```bash
git clone https://github.com/yourusername/health_fitness_app.git
cd health_fitness_app
```

2. 配置环境变量：
```bash
cp .env.example .env
```

编辑`.env`文件，设置生产环境变量：
```
MONGO_URI=mongodb://admin:secure_password@mongodb:27017/health_fitness_app?authSource=admin
SECRET_KEY=your_secure_production_secret_key
JWT_SECRET_KEY=your_secure_production_jwt_secret_key
```

3. 修改前端API地址：

编辑`frontend/src/utils/api.js`：
```javascript
const API_BASE_URL = 'https://your-domain.com/api';  // 替换为您的域名
```

4. 构建并启动容器：
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3.3 配置Web服务器

1. 安装Nginx：
```bash
sudo apt-get update
sudo apt-get install -y nginx
```

2. 配置Nginx：
```bash
sudo nano /etc/nginx/sites-available/health_fitness_app
```

添加以下内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. 启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/health_fitness_app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. 配置HTTPS（推荐）：
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3.4 设置自动更新

创建更新脚本`update.sh`：

```bash
#!/bin/bash
cd /path/to/health_fitness_app
git pull
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

添加执行权限：
```bash
chmod +x update.sh
```

## 4. 常见问题解答

### 4.1 Docker相关问题

**问题**: 容器无法启动
**解决方案**: 
- 检查Docker服务是否运行：`sudo systemctl status docker`
- 检查日志：`docker-compose logs`
- 确保端口未被占用：`sudo netstat -tulpn | grep -E '5000|3000|27017'`

**问题**: 无法连接到MongoDB
**解决方案**:
- 检查MongoDB容器是否运行：`docker-compose ps mongodb`
- 检查MongoDB日志：`docker-compose logs mongodb`
- 验证连接字符串是否正确

### 4.2 应用相关问题

**问题**: 前端无法连接到后端API
**解决方案**:
- 确保API_BASE_URL配置正确
- 检查CORS设置
- 验证后端服务是否正常运行

**问题**: 用户无法注册或登录
**解决方案**:
- 检查MongoDB连接
- 验证JWT密钥配置
- 检查后端日志中的错误信息

### 4.3 性能优化

**问题**: 应用响应缓慢
**解决方案**:
- 增加服务器资源（CPU/内存）
- 优化MongoDB查询
- 考虑添加缓存层（如Redis）
- 使用负载均衡（适用于高流量）

### 4.4 安全问题

**问题**: 如何增强应用安全性
**解决方案**:
- 定期更新所有依赖
- 使用强密码和安全的密钥
- 启用HTTPS
- 实施速率限制
- 定期备份数据

如果您遇到其他问题，请查看项目的GitHub Issues或联系开发团队。
