## Getting Started

用MySQL資料庫重新打造餐廳forum。

## Getting Started
Step.1 Clone and install node package
```
$ git clone https://github.com/harry811016/todo-list-sequelize.git
$ npm install
```
Step.2 Execute server 
```
$ npm run dev 
```
Step.3 Run seed migration to build fake data
```
$ npx sequelize db:seed:all
```
Step.4 Enter following website on browser
```
http://localhost:3000
```
## Fake data
*第一組帳號有 admin 權限：
email: root@example.com
password: 12345678
*第二組帳號沒有 admin 權限：
email: user1@example.com
password: 12345678
*第三組帳號沒有 admin 權限：
email: user2@example.com
password: 12345678

## Features
* CRUD功能
* 登入註冊功能
* User 切換管理員權限功能

## Environment Setup
* Node.js

## Built With & Tools
* "express": "^4.17.1",
* "mysql2": "^2.1.0",
* "sequelize": "^5.21.13",
* "sequelize-cli": "^5.5.1"


