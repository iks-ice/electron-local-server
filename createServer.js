module.exports = () => {
  const ffmpeg = require("ffmpeg");
  const {v4: uuid} = require("uuid");
  const fs = require("fs/promises");
  const path = require("path");
  const WebSocket = require('ws');
  const wsServer = new WebSocket.Server({ port: 9000 });

  wsServer.on('connection', onConnect);

  function onConnect(wsClient) {
      console.log('Новый пользователь');

      wsClient.on('close', () => {
          console.log('Пользователь отключился');
      });

      wsClient.on('message', async (message) => {
          try {
            const pathToFolder = await createFolder();
            const pathtoFile = `${pathToFolder}/video.webm`;
            await fs.writeFile(pathtoFile, message)
            // const video = await new ffmpeg(pathtoFile);
            // video
            //   .setVideoFormat(".mp4")
            //   .save(`${pathToFolder}/formattedVideo.avi`, (err, file) => {
            //     if(err) {
            //       return console.log(err);
            //     }
            //     console.log("file: ", file);
            //   })

            
          } catch (error) {
              console.log('Ошибка', error);
          }
      });
  }
  async function createFolder (folderName=uuid()) {
    const pathToFolder = path.join(__dirname, "videos", folderName);
    await fs.mkdir(pathToFolder);
    return pathToFolder;
  }
  console.log('Сервер запущен на 9000 порту');
}