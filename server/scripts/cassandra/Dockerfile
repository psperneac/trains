FROM cassandra:latest
ADD setup.cql setup.cql
EXPOSE 7000 7001 7199 9042 9160
RUN ["/bin/bash"]
RUN sed -i "s/authenticator: AllowAllAuthenticator/authenticator: PasswordAuthenticator/g" /etc/cassandra/cassandra.yaml
ENTRYPOINT ["docker-entrypoint.sh"]
