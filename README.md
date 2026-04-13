# VIET_FUTURE

> Hệ thống xác thực tài liệu số phi tập trung ứng dụng công nghệ Blockchain để đảm bảo tính toàn vẹn, chống giả mạo và minh bạch hóa nguồn gốc dữ liệu mà không cần thông qua trung gian.

graph init \
 --from-contract 0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f \
 --network https://hardhat.devmindtan.uk \
 --abi ./blockchain/abi/VoucherProtocolModule#VoucherProtocol.json \
 vietfuture-subgraph

psql -U postgres <<EOF
create user verzik with password 'verzik123';
create database "graph-node" with owner=verzik template=template0 encoding='UTF8' locale='C';
create extension pg_trgm;
create extension btree_gist;
create extension postgres_fdw;
grant usage on foreign data wrapper postgres_fdw to verzik;
EOF
