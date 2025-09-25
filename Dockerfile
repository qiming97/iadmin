# 构建阶段
FROM node:18-alpine as build

WORKDIR /app

# 复制 package.json 和 yarn.lock
COPY package*.json ./
COPY yarn.lock ./

# 安装依赖 - 不使用 frozen-lockfile 以防止同步问题
RUN yarn install

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 安装 serve 来提供静态文件服务
RUN npm install -g serve

# 从构建阶段复制构建产物
COPY --from=build /app/dist ./dist

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["serve", "-s", "dist", "-l", "3000"]
