# Socket IO With HAProxy And Redis

I've made some tests and for me it was proven as a possible solution to high scalable environments under high load.

This repository contains a complete solution with Node.JS and Socket.IO that can be used as reference.

I've included a simple chat that can be accessed through browser to demonstrate the funcionality.

# Architecture
The following diagram shows how the infraestructure was built. Everything can be found inside the file ```docker-compose.yml```.

![alt tag](Socket%20IO.png)

# How Can I Run?
Please follow the next steps to get ir working. First of all, be sure that you have all the recquirements:
* docker-ce;
* docker-compose;
* At least 8Gb of RAM disponible(we are starting many machines);
* The project;

The following commands will start all containers:
```
git clone git@github.com:darlanmoraes/socket.io-haproxy-kong.git
cd socket.io-haproxy-kong
docker-compose -f docker-compose.yml up
```

The following will send a message through the backend that has no open sockets. This should send the message to all open sockets with frontend.

```
# set all hosts that can handle requests for the servers
curl -X POST -v \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d "{
  \"room\": \"roomb\",
  \"message\": \"A simple message: $(date)\"
}" \
'http://www.node-services-1.com/back/message'
```

Now we can create a little shortcut inside our SO to send requests through the correct hosts(or we can pass the headers):
```
# add the following lines to /etc/hosts file
127.0.1.1	www.node-services-1.com
127.0.1.1	www.node-services-2.com
```

After these steps, we can open the browser and access the following addresses to chat:

```
http://node-services-1.com/front/rooma
http://node-services-1.com/front/roomb
```