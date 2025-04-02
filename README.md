# MP3 Folder Merger

A web application for merging MP3 files in folders using FFmpeg.wasm for audio processing.

## Solving SharedArrayBuffer Error

Due to browser security restrictions, FFmpeg.wasm requires specific HTTP headers to use SharedArrayBuffer. We provide a simple Node.js server to add these necessary headers.

## How to Run

1. Ensure Node.js is installed
2. Open Command Prompt or PowerShell and navigate to the project folder
3. Run the following command to start the server:

```
npm start
```

4. In browser visit http://localhost:3000

## Important Notes

- This application requires HTTP server to run, can't be opened from file system
- Server added necessary COOP and COEP headers to support SharedArrayBuffer
- If problem persists, please try using the latest version of Chrome browser


chinese:
# MP3 Folder Merger

这是一个用于合并文件夹中MP3文件的Web应用程序，使用FFmpeg.wasm进行MP3处理。

## 解决SharedArrayBuffer错误

由于浏览器安全限制，FFmpeg.wasm需要特定的HTTP头部才能使用SharedArrayBuffer。我们提供了一个简单的Node.js服务器来添加这些必要的头部。

## 如何运行

1. 确保您已安装Node.js
2. 打开命令提示符或PowerShell，导航到项目文件夹
3. 运行以下命令启动服务器：

```
npm start
```

4. 在浏览器中访问 http://localhost:3000

## 注意事项

- 此应用程序需要通过HTTP服务器运行，不能直接从文件系统打开HTML文件
- 服务器添加了必要的COOP和COEP头部以支持SharedArrayBuffer
- 如果仍然遇到问题，请尝试使用最新版本的Chrome浏览器