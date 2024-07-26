---
title: nginx 反向代理和负载均衡设置
---

好的,我来为您介绍 Nginx 中常用的反向代理和负载均衡的配置。

## 反向代理配置:

- proxy_pass 指令用于指定被代理的服务器地址。
- proxy_set_header 用于设置传递给被代理服务的请求头。
- proxy_redirect 用于设置响应头中 Location 字段的修改。

示例配置:


```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

upstream backend {
    server 192.168.1.100:8080;
    server 192.168.1.101:8080;
}
```


## 负载均衡配置:

- upstream 块用于定义一组后端服务器。
- server 指令用于指定后端服务器的地址和端口。
- load_balance 指令用于设置负载均衡算法。

示例配置:

```nginx
upstream backend {
    least_conn;
    server 192.168.1.100:8080;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
    }
}
```


上述配置中,使用了 least_conn 算法进行负载均衡,即将请求转发到当前连接数最少的服务器。
Nginx 支持多种负载均衡算法,如 round-robin、ip_hash、least_time 等。根据您的需求选择合适的算法。

此外,Nginx 还支持其他高级特性,如 health_check 用于检查后端服务器的健康状态,sticky_session 用于会话保持等。

如果您有任何其他问题,欢迎随时提出。我很乐意为您提供更多帮助。
