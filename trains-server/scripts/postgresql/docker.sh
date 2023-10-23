docker run --name p1 -p 5432:5432 -e POSTGRES_PASSWORD=Admin1! -e POSTGRES_HOST_AUTH_METHOD=password -d postgres
# user is postgres / Admin1!
docker ps
docker stop p1
docker ps -a
docker start p1