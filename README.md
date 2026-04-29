# VIET_FUTURE

> Hệ thống xác thực tài liệu số phi tập trung ứng dụng công nghệ Blockchain để đảm bảo tính toàn vẹn, chống giả mạo và minh bạch hóa nguồn gốc dữ liệu mà không cần thông qua trung gian.

psql -U postgres <<EOF
create database "graph-node" with owner=verzik template=template0 encoding='UTF8' locale='C';
create extension pg_trgm;
create extension btree_gist;
create extension postgres_fdw;
grant usage on foreign data wrapper postgres_fdw to verzik;
EOF
