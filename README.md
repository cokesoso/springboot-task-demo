# 任务管理系统 Demo

基于 **Spring Boot 4** + **MongoDB** + **JWT** 的轻量级任务管理应用，自带 Web 前端，支持邮箱注册登录与任务的增删改查。

## 功能特性

- 邮箱注册 / 登录，密码 BCrypt 加密存储
- JWT 无状态鉴权，登录后自动携带 Token 访问接口
- 任务管理：创建、编辑、删除、标记完成 / 未完成
- 按状态筛选任务（全部 / 未完成 / 已完成）
- 暗色主题单页界面，开箱即用

## 技术栈

| 类别 | 技术 |
|------|------|
| 后端 | Spring Boot 4.0.5、Spring Security、Spring Data MongoDB |
| 认证 | JJWT 0.12.6 |
| 数据库 | MongoDB 7 |
| 前端 | 原生 HTML / CSS / JavaScript |
| 构建 | Maven、Java 21 |

## 项目结构

```
demo/
├── src/main/java/com/demo/demo/
│   ├── controller/     # REST 接口（认证、任务）
│   ├── service/        # 业务逻辑
│   ├── security/       # JWT 生成与过滤器
│   ├── entity/         # MongoDB 文档实体
│   ├── dto/            # 请求 / 响应对象
│   └── config/         # 安全配置
├── src/main/resources/
│   ├── static/         # 前端页面
│   └── application.yml
├── docker-compose.yml          # 本地开发：仅 MongoDB
├── docker-compose.prod.yml     # 生产：MongoDB + 应用 + Nginx
├── deploy/                     # 部署脚本
└── start.bat                   # Windows 一键启动
```

## 环境要求

- **JDK 21**
- **Maven 3.9+**（项目已包含 `mvnw`，可不单独安装）
- **MongoDB**：本地开发可用 Docker 启动（见下文）
- **Docker Desktop**（推荐，用于运行 MongoDB 与生产部署）

## 快速开始（本地开发）

### 方式一：一键启动（Windows）

1. 打开 **Docker Desktop**
2. 双击项目根目录下的 `start.bat`
3. 浏览器访问 http://localhost:8080

脚本会自动启动 MongoDB 容器并运行 Spring Boot 应用。

### 方式二：命令行

```bash
# 1. 启动 MongoDB
docker compose up -d

# 2. 启动应用（Windows）
mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

启动成功后访问：**http://localhost:8080**

## 配置说明

默认配置见 `src/main/resources/application.yml`：

| 配置项 | 环境变量 | 默认值 | 说明 |
|--------|----------|--------|------|
| MongoDB 连接 | `MONGODB_URI` | `mongodb://localhost:27017/demo` | 数据库地址 |
| 服务端口 | `SERVER_PORT` | `8080` | HTTP 端口 |
| JWT 密钥 | `JWT_SECRET` | 内置开发密钥 | **生产环境必须修改** |
| Token 有效期 | `JWT_EXPIRATION_MS` | `86400000`（24 小时） | 毫秒 |

生产环境使用 `prod` 配置：

```bash
export SPRING_PROFILES_ACTIVE=prod
export MONGODB_URI=mongodb://your-host:27017/demo
export JWT_SECRET=你的随机长密钥
```

## API 接口

### 认证（无需 Token）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册，请求体：`{ "email", "password" }` |
| POST | `/api/auth/login` | 登录，返回 `{ "token", "email" }` |

### 任务（需 Header：`Authorization: Bearer <token>`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/tasks` | 获取当前用户任务列表 |
| POST | `/api/tasks` | 创建任务 |
| PUT | `/api/tasks/{id}` | 更新任务（含完成状态） |
| DELETE | `/api/tasks/{id}` | 删除任务 |

错误响应格式：`{ "message": "错误说明" }`

## 生产部署（Docker）

```bash
# 1. 复制并编辑环境变量
cp .env.example .env
# 编辑 .env，设置 JWT_SECRET（可用 openssl rand -base64 48 生成）

# 2. 启动全栈（MongoDB + 应用 + Nginx）
docker compose -f docker-compose.prod.yml up -d --build
```

默认通过 **80** 端口访问（可在 `.env` 中修改 `HTTP_PORT`）。

**Linux 服务器** 可使用 `deploy/deploy.sh`；**Windows** 可使用 `deploy/deploy.ps1`。

## 运行测试

```bash
mvnw.cmd test          # Windows
./mvnw test            # Linux / macOS
```

测试使用独立数据库 `demo-test`（需本地 MongoDB 在 `localhost:27017` 运行）。

## 常见问题

**Q：点击注册 / 登录没反应？**  
A：通常是 MongoDB 未启动。请先执行 `docker compose up -d`，确认 Docker Desktop 已运行。

**Q：端口 8080 被占用？**  
A：设置环境变量 `SERVER_PORT=8081` 后重启应用，或结束占用 8080 的进程。

**Q：生产环境要注意什么？**  
A：务必设置足够长的随机 `JWT_SECRET`，不要使用默认密钥。

## 许可证

本项目仅供学习与交流使用。
