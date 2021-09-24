const ffmpeg = require("ffmpeg");
const {v4: uuid} = require("uuid");
const {mkdir, writeFile, readFile} = require("fs/promises");
const fs = require("fs");
const path = require("path");
const WebSocket = require('ws');

module.exports = () => {

  const wsServer = new WebSocket.Server({ port: 9000 });
  wsServer.on('connection', onConnect);

  function onConnect(wsClient) {
      console.log('Новый пользователь');

      wsClient.on('close', () => {
          console.log('Пользователь отключился');
      });

      wsClient.on('message', async (message) => {
          try {
            const pathToVideosFolder = path.join(__dirname, "videos");
            if (!fs.existsSync(pathToVideosFolder)) {
              await mkdir(pathToVideosFolder);
            }
            const pathToFolder = await createFolder();
            const pathToFile = `${pathToFolder}/video.webm`;
            await writeFile(pathToFile, message);

            const savedVideoPath = `${pathToFolder}/converted-video.mp4`;
            new ffmpeg(pathToFile, (err, video) => {
              if (err) {
                return wsClient.send(new Error(err));
              }
              video
              .setVideoFormat("mp4")
              .save(savedVideoPath, async (err, file) => {
                if(err) {
                  return console.log(err);
                }
                console.log("start reading", file);
                const data = await readFile(savedVideoPath);
                console.log("sending back data", data);
                wsClient.send(data);
              });
            });
          } catch (error) {
              console.log('Ошибка', error);
          }
      });
  }
  async function createFolder (folderName=uuid()) {
    const pathToFolder = path.join(__dirname, "videos", folderName);
    await mkdir(pathToFolder);
    return pathToFolder;
  }
  
  console.log('Сервер запущен на 9000 порту');
}