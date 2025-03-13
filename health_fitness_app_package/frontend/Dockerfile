# 使用Node.js作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 设置NODE_ENV为生产环境
ENV NODE_ENV=production

# 显示React版本
RUN echo "React version:" && npm list react

# 尝试构建，如果失败则输出错误
RUN npm run build || (echo "Build failed" && exit 1)

# 验证build目录是否存在
RUN ls -la build || (echo "Build directory not found" && exit 1)

# 安装serve工具来提供静态文件服务
RUN npm install -g serve

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["serve", "-s", "build", "-l", "3000"]

