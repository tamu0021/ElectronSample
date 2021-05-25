'use strict';

/* アプリケーションモジュールの読み込み */
const { app, BrowserWindow, Menu, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow()
{
    /* メニューを作成 */
    const menu = Menu.buildFromTemplate(createMenuTemplate());
    Menu.setApplicationMenu(menu);

    /* メインウィンドウの作成 */
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true
        }
    });

    /* メインウィンドウにHTMLを表示 */
    mainWindow.loadURL(url.format({
    pathname: path.join(app.getAppPath(), 'index.html'),
    protocol: 'file:',
    slashes: true
    }));

    // 開発ツールを有効化
    // mainWindow.webContents.openDevTools();

    /* メインウィンドウが閉じられた時の処理 */
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    /* Chromeデベロッパーツール起動用のショートカットキーを登録 */
    if (process.env.NODE_ENV === 'development'){
        app.on('browser-window-focus', (event, focusedWindow) => {
            globalShortcut.register(
                process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shitf+I',
                () => focusedWindow.webContents.toggleDevTools()
            );
        });
        app.on('browser-window-blur', (event, focusedWindow) => {
            globalShortcut.register(
                process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I'
            );
        });
    }
}

/* 初期化が完了したときの処理 */
app.on('ready', createWindow);

/* 全てのウィンドウが閉じたときの処理 */
app.on('window-all-closed', () => {
    if (mainWindow !== 'darwin'){
        app.quit();
    }
});

/* アプリケーションウィンドウがアクティブになった時の処理 */
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

/* メニューテンプレートの作成 */
function createMenuTemplate()
{
    /* メニューのテンプレート */
    let templete = [{
        label: 'ファイル',
        submenu: [{
            label: '開く',
            accelerator: 'CmdOrCtrl+o',
            click: function(item, focusedWindow)
            {
                if (focusedWindow){
                    /* レンダラープロセスへIPCでメッセージを送信してファイルを開く */
                    focusedWindow.webContents.send('main_file_message', 'open');
                }
            }
        }, {
            label: '保存',
            accelerator: 'CmdOrCtrl+S',
            click: function(item, focusedWindow) {
                if (focusedWindow) {
                    // レンダラープロセスへIPCでメッセージを送信してファイルを保存
                    focusedWindow.webContents.send('main_file_message', 'save');
                }
            }
        }, {
            label: '名前を付けて保存',
            accelerator: 'Shift+CmdOrCtrl+S',
            click: function(item, focusedWindow) {
                if (focusedWindow) {
                    // レンダラープロセスへIPCでメッセージを送信してファイルを名前を付けて保存
                    focusedWindow.webContents.send('main_file_message', 'saveas');
                }
            }
        }]
    }, {
        label: '編集',
        submenu: [{
            label: 'やり直し',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
        }, {
            type: 'separator'
        }, {
            label: '切り取り',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
        }, {
            label: 'コピー',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
        }, {
            label: '貼り付け',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
        }]
    }, {
        label: '表示',
        submenu: [{
            label: '全画面表示切替',
            accelerator: (function() {
                if (process.platform === 'darwin') {
                    return 'Ctrl+Command+F'
                } else {
                    return 'F11'
                }
            }),
            click: function(item, focusedWindow) {
                if (focusedWindow) {
                    // 全画面表示の切り替え
                    focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                }
            }
        }, {
            label: '拡大',
            accelerator: 'CmdOrCtrl+Shift+=',
            role: 'zoomin'
        }, {
            label: '縮小',
            accelerator: 'CmdOrCtrl+-',
            role: 'zoomout'
        }, {
            label: 'ズームのリセット',
            accelerator: 'CmdOrCtrl+0',
            role: 'resetzoom'
        }]
    }]
    return template;
}