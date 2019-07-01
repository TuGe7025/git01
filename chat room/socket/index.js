const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);


//在线用户socket
var onlineUsers = {};//{用户1234:socket,xx:oo}

//当前在线人数
var onlineCount = 0;

//当前在线用户名
var onlineUserName = [];//['user123','uer456'];


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})
//监听收到前端的事件
io.on('connection', (socket) => {

    var disconnect=()=>{
        if (onlineUsers[socket.name]) {
          delete onlineUsers[socket.name]; //删除用户
          onlineUserName.splice(onlineUserName.indexOf(socket.name), 1);//删除用户名
          onlineCount--;//更新在线用户
  
          io.emit('logout', { username: socket.name, msg: '下线了' });
          io.emit('update', { onlineUserName, onlineCount });
          
        }
      }

    // console.log(app)
    //监听前端提交事件发送过来的用户名
    socket.on('login', data => {
        //将用户名存到socket自定义属性name里
        socket.name = data.username;

        //检查在线列表，如果不在里面就加入
        if (!onlineUsers.hasOwnProperty(data.username)) {
            // console.log(socket);
            onlineUsers[data.username] = socket;
            onlineUserName.push(data.username);//添加用户名
            //在线人数+1
            onlineCount++;
        }
        //向所有客户端广播用户加入
      io.emit('login', { username: data.username, msg: '---加入聊天室' });
      //广播在线列表更新
      io.emit('update', { onlineUserName, onlineCount });
    })

    socket.on('logout', disconnect);
    socket.on('disconnect', disconnect);

    //监听前端表单提交发送过来的消息数据
    socket.on('message', (msg) => {
        //将socket自定义属性name里的用户名再赋值给msg自定义属性name
        msg.name = socket.name;

        io.emit('message',msg.name +':'+ msg.val);//将数据广播给所有用户
    })
})
http.listen(3001,() => console.log('端口号为：3001'));