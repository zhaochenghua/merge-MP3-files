## 功能说明：
一个前端网页，实现mp3音频合并。网页上有一个框，拖入本地文件夹后实现每个子文件夹中的MP3文件都列出，可以通过拖动排序，点击合并按钮，mp3按照拖动后的顺序合并成一个mp3并以该子文件夹命名。
![image](https://github.com/user-attachments/assets/f62e6a38-d888-48e9-8f97-90cd9d94654b)

chinese:
## MP3文件按子文件夹合并

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

5. 您也可以在以下网址预览应用程序：

```
https://mp3.nbzch.cn:8001/
```

## 预览视频

您可以在此处观看应用程序的27秒预览视频：

[预览视频](https://mp3.nbzch.cn:8001/preview.mp4)

## 注意事项

- 此应用程序需要通过HTTP服务器运行，不能直接从文件系统打开HTML文件
- 服务器添加了必要的COOP和COEP头部以支持SharedArrayBuffer
- 如果仍然遇到问题，请尝试使用最新版本的Chrome浏览器

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

5. Alternatively, you can preview the application at the following URL:

```
https://mp3.nbzch.cn:8001/
```

## Preview Video

You can watch a 27-second preview video of the application here:

[Preview Video](https://mp3.nbzch.cn:8001/preview.mp4)

## Important Notes

- This application requires HTTP server to run, can't be opened from file system
- Server added necessary COOP and COEP headers to support SharedArrayBuffer
- If problem persists, please try using the latest version of Chrome browser

Cursor Prompt:
"Create a frontend web page that allows users to merge MP3 files from subfolders with the following features:

Implement a drag-and-drop zone that accepts local folders

Recursively process all subfolders and display their MP3 files in separate sections

For each subfolder:

Show the folder name as a header

Create a sortable list of its MP3 files (using SortableJS)

Allow drag-and-drop reordering of MP3 files within the same folder

Add a 'Merge' button for each subfolder that:

Combines MP3s in the current order

Generates a single MP3 named after the parent folder

Triggers automatic download

Use modern web technologies:

HTML5 File API for folder handling

Web Audio API or FFmpeg.wasm for MP3 merging

Optional: Vue.js/React for state management

Include visual feedback for:

File validation (MP3 only)

Merge progress

Error handling

Add CSS styling for:

Folder dropzone highlighting

Clear visual separation between subfolders

Drag-and-drop sorting indicators"

Key implementation notes to include:

Use webkitdirectory attribute for folder selection

Handle directory traversal using FileSystemDirectoryEntry

Implement chunked file reading for large MP3 files

Consider using IndexedDB for temporary storage of large files

Add worker thread for non-UI blocking merge operations

Include metadata preservation logic for merged files

Browser compatibility notice:

Mention required polyfills for Safari/Firefox

Note Chrome's native filesystem API advantages
