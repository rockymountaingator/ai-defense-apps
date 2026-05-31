FROM nginx:alpine
COPY business/ /usr/share/nginx/html/
COPY business/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
