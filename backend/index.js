const express = require("express");
// const sqlite = require("sqlite");
// const { Sequelize, Op, DataTypes } = require("sequelize");
// const sqlite3 = require("sqlite3");
const path = require("path");

const dotenv = require("dotenv"),
  { Client } = require("pg");

const moment = require("moment");
const ws = require("ws");

const webSocketServer = new ws.Server({ port: 8082 }),
  webSockets = [];

function getTime() {
  return moment().format(`HH:mm:ss`);
}

webSocketServer.on("connection", (webSocket) => {
  console.log("Client connected");

  webSockets.push(webSocket);

  webSocket.send(getTime());

  webSocket.on("message", (message) => {
    console.log("Message from client: " + message);
    webSockets.push(webSocket);
  });

  webSocket.on("close", () => {
    console.log("Client disconnected");

    webSockets.splice(webSockets.indexOf(webSocket), 1);
  });
});

setInterval(() => {
  webSockets.forEach((webSocket) => {
    try {
      webSocket.send(getTime());
    } catch (err) {
      console.log(err + " . removing socket from array!");
      webSockets.splice(webSockets.indexOf(webSocket), 1);
    }
  });
}, 10 * 1000);

dotenv.config();

const client = new Client({
  database: process.env.PGDATABASE,
  host: process.env.PGHOST,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
});

client.connect();

const app = express();

app.use(express.json());

// //1 ladda databas
// let sequelize = new Sequelize({
//   dialect: "sqlite",
//   storage: "backend/fullstackdb.sqlite",
// });

// sequelize.query("PRAGMA foreign_keys = ON");

// //1.2 skapa modellerna för x och y - rad 17 tom 60
// const Profile = sequelize.define(
//   "Profile",
//   {
//     id: {
//       autoIncrement: true,
//       primaryKey: true,
//       type: DataTypes.INTEGER,
//     },
//     nickname: {
//       allowNull: false,
//       unique: true,
//       type: DataTypes.STRING,
//     },
//     name: {
//       allowNull: false,
//       type: DataTypes.STRING,
//     },
//     lastname: {
//       allowNull: false,
//       type: DataTypes.STRING,
//     },
//     age: {
//       allowNull: true,
//       type: DataTypes.INTEGER,
//     },
//   },
//   {
//     timestamps: false,
//   }
// );

// const Post = sequelize.define(
//   "Post",
//   {
//     id: {
//       autoIncrement: true,
//       primaryKey: true,
//       type: DataTypes.INTEGER,
//     },
//     post: {
//       allowNull: false,
//       type: DataTypes.STRING,
//     },
//   },
//   {
//     timestamps: false,
//   }
// );

// Profile.hasMany(Post, { foreignKey: "profile" });

// //1.1 koppla upp till db - rad 63
// sequelize.sync();

app.use((request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

//2 skapa routes (get och kanske post)
app.get("/posts/:id", async (request, response) => {
  try {
    console.log(request.params.id);

    const posts = (
      await client.query("SELECT * FROM posts WHERE profile=$1", [
        request.params.id,
      ])
    ).rows;

    // const id = request.params.id;
    // console.log(id);
    // let posts = await Post.findAll({
    //   where: {
    //     profile: id,
    //   },
    // });

    console.log(posts);

    response.send(posts);
  } catch (err) {
    console.log(err);
  }
});

app.get("/:nickname", async (request, response) => {
  try {
    const profile = (
      await client.query("SELECT * FROM profiles WHERE nickname=$1", [
        request.params.nickname,
      ])
    ).rows;

    // const nickname = request.params.nickname;
    // console.log(nickname);
    // let profile = await Profile.findAll({
    //   where: {
    //     nickname: nickname,
    //   },
    // });

    console.log(profile);

    response.send(profile);
  } catch (err) {
    console.log(err);
  }
});

app.post("/post", async (request, response) => {
  console.log(request.body.profile + " " + request.body.post + "");
  const { rows } = await client.query(
    "INSERT INTO posts (post, profile) VALUES ($1, $2)",
    [request.body.post, request.body.profile + ""]
  );
  response.send(rows);
  if (webSockets !== null) {
    webSockets[0].send("new posts available");
  }
});

app.use(express.static(path.join(path.resolve(), "public")));

// app.use(express.static(__dirname + "/public"));

const port = process.env.PORT || 8081;

app.listen({ port: port }, (e) => console.log("Lyssnar på port " + port));
