# 使用轻量级 Nginx 镜像
FROM nginx:alpine

# 移除默认的 nginx 配置和默认页面
RUN rm -rf /usr/share/nginx/html/* \
    && rm -f /etc/nginx/conf.d/default.conf

# 拷贝自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 拷贝网站静态文件
COPY index.html /usr/share/nginx/html/index.html
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY img /usr/share/nginx/html/img

# 容器内监听 80 端口（宿主机端口映射在 docker-compose.yml / docker run 中指定为 1888）
EXPOSE 80

# 简单健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
