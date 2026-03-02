#!/bin/bash

# Saturn AI BE 阿里云 ECS 部署脚本
# 使用方法: ./deploy.sh [命令]
#
# 命令:
#   init     - 初始化环境
#   deploy   - 部署应用
#   start    - 启动应用
#   stop     - 停止应用
#   restart  - 重启应用
#   logs     - 查看日志
#   status   - 查看状态
#   clean    - 清理容器和镜像

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数: 打印信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 函数: 检查 Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker 未安装，请先安装 Docker"
    fi
    info "Docker 已安装: $(docker --version)"
}

# 函数: 检查 Docker Compose
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose 未安装，请先安装 Docker Compose"
    fi
    info "Docker Compose 已就绪"
}

# 函数: 初始化环境
init_env() {
    info "初始化部署环境..."

    # 创建数据目录
    mkdir -p data/prisma data/uploads

    # 复制环境变量文件
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            info "已创建 .env 文件，请编辑配置后重新运行部署"
            warn "请先编辑 .env 文件，填入正确的配置"
            exit 0
        else
            error ".env.example 文件不存在"
        fi
    fi

    info "环境初始化完成"
}

# 函数: 部署应用
deploy_app() {
    info "开始部署应用..."

    # 构建镜像
    info "构建 Docker 镜像..."
    docker-compose build

    # 启动容器
    info "启动容器..."
    docker-compose up -d

    info "部署完成！"
    info "应用运行在: http://localhost:$(grep PORT .env | cut -d '=' -f2)"
}

# 函数: 启动应用
start_app() {
    info "启动应用..."
    docker-compose up -d
    info "应用已启动"
}

# 函数: 停止应用
stop_app() {
    info "停止应用..."
    docker-compose down
    info "应用已停止"
}

# 函数: 重启应用
restart_app() {
    info "重启应用..."
    docker-compose restart
    info "应用已重启"
}

# 函数: 查看日志
show_logs() {
    docker-compose logs -f --tail=100
}

# 函数: 查看状态
show_status() {
    docker-compose ps
}

# 函数: 清理
clean_all() {
    warn "这将删除所有容器、镜像和数据卷"
    read -p "确认继续? (y/N): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        docker-compose down -v --rmi all
        info "清理完成"
    else
        info "已取消"
    fi
}

# 主程序
main() {
    check_docker
    check_docker_compose

    case "${1:-deploy}" in
        init)
            init_env
            ;;
        deploy)
            init_env
            deploy_app
            ;;
        start)
            start_app
            ;;
        stop)
            stop_app
            ;;
        restart)
            restart_app
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        clean)
            clean_all
            ;;
        *)
            echo "使用方法: $0 {init|deploy|start|stop|restart|logs|status|clean}"
            exit 1
            ;;
    esac
}

main "$@"
