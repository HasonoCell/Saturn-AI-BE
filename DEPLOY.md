# 阿里云 ECS Docker 部署指南

## 前置要求

- 阿里云 ECS 服务器（推荐配置：2核4G及以上）
- 服务器操作系统：CentOS 7/8、Ubuntu 18.04/20.04/22.04 或其他 Linux 发行版
- 服务器已开放 3000 端口（或自定义端口）

## 一、服务器安装 Docker

### Ubuntu/Debian

```bash
# 更新包索引
sudo apt-get update

# 安装必要依赖
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG 密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置 Docker 仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker --version
```

### CentOS/RHEL

```bash
# 安装必要依赖
sudo yum install -y yum-utils

# 添加 Docker 仓库
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
sudo docker --version
```

### 配置 Docker 用户组（可选，避免每次 sudo）

```bash
# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录或执行以下命令使组权限生效
newgrp docker
```

## 二、部署项目

### 方式一：使用部署脚本（推荐）

```bash
# 1. 克隆项目到服务器
git clone <your-repo-url> /opt/saturn-ai-be
cd /opt/saturn-ai-be

# 2. 给脚本添加执行权限
chmod +x deploy.sh

# 3. 初始化环境（会自动创建 .env 文件）
./deploy.sh init

# 4. 编辑 .env 文件，填入正确的配置
vim .env
```

编辑 `.env` 文件：
```env
PORT=3000
OPENAI_API_KEY=your_real_openai_api_key
NODE_ENV=production
```

```bash
# 5. 部署应用
./deploy.sh deploy

# 6. 查看运行状态
./deploy.sh status

# 7. 查看日志
./deploy.sh logs
```

### 方式二：手动部署

```bash
# 1. 克隆项目
git clone <your-repo-url> /opt/saturn-ai-be
cd /opt/saturn-ai-be

# 2. 创建环境变量文件
cp .env.example .env

# 3. 编辑 .env 文件
vim .env

# 4. 创建数据目录
mkdir -p data/prisma data/uploads

# 5. 构建并启动
docker-compose up -d --build

# 6. 查看状态
docker-compose ps

# 7. 查看日志
docker-compose logs -f
```

## 三、部署脚本命令

```bash
./deploy.sh init      # 初始化环境
./deploy.sh deploy    # 部署应用
./deploy.sh start     # 启动应用
./deploy.sh stop      # 停止应用
./deploy.sh restart   # 重启应用
./deploy.sh logs      # 查看日志
./deploy.sh status    # 查看状态
./deploy.sh clean     # 清理容器和镜像
```

## 四、配置阿里云安全组

1. 登录阿里云控制台
2. 进入 ECS 实例管理
3. 点击"安全组" -> "配置规则"
4. 添加入方向规则：
   - 端口范围：3000/3000（或自定义端口）
   - 授权对象：0.0.0.0/0

## 五、配置反向代理（可选）

### 使用 Nginx

```bash
# 安装 Nginx
sudo apt-get install -y nginx  # Ubuntu/Debian
# 或
sudo yum install -y nginx      # CentOS/RHEL

# 创建配置文件
sudo vim /etc/nginx/sites-available/saturn-ai
```

Nginx 配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或服务器 IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/saturn-ai /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 配置 HTTPS（使用 Let's Encrypt）

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 六、日常维护

### 查看应用日志

```bash
# 实时查看日志
docker-compose logs -f

# 查看最近 100 行日志
docker-compose logs --tail=100

# 查看特定时间的日志
docker-compose logs --since="2024-01-01T00:00:00"
```

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并部署
./deploy.sh deploy
# 或
docker-compose up -d --build
```

### 数据备份

```bash
# 备份数据库
cp data/prisma/dev.db data/prisma/dev.db.backup.$(date +%Y%m%d)

# 备份上传文件
tar -czf data/uploads.backup.$(date +%Y%m%d).tar.gz data/uploads/
```

### 清理 Docker 资源

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 一键清理
docker system prune -a
```

## 七、故障排查

### 容器无法启动

```bash
# 查看容器日志
docker-compose logs app

# 检查端口占用
sudo netstat -tulpn | grep 3000

# 检查磁盘空间
df -h
```

### 应用无响应

```bash
# 检查容器状态
docker-compose ps

# 重启容器
docker-compose restart

# 查看资源占用
docker stats
```

### 端口访问问题

```bash
# 检查防火墙
sudo ufw status      # Ubuntu
sudo firewall-cmd --list-all  # CentOS

# 开放端口
sudo ufw allow 3000  # Ubuntu
sudo firewall-cmd --add-port=3000/tcp --permanent && sudo firewall-cmd --reload  # CentOS
```

## 八、生产环境建议

1. **定期备份数据**：设置定时任务自动备份
2. **监控服务状态**：使用云监控或 Prometheus + Grafana
3. **日志管理**：使用 ELK 或 Loki 收集日志
4. **安全加固**：
   - 使用非 root 用户运行容器
   - 限制容器资源
   - 定期更新系统和 Docker
5. **高可用**：使用阿里云 SLB + 多台 ECS 实例
