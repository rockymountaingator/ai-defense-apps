FROM node:20-alpine AS build
WORKDIR /build
# No build step needed for static HTML

FROM nginx:alpine
COPY --from=build /build /usr/share/nginx/html
COPY . /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
