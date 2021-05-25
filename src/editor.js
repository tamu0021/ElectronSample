'use strict';

/* アプリケーションモジュールの読み込み */
const {BrowserWindow, dialog} = require('electron').remote;
const {ipcRenderer} = require('electron');
const fs = require('fs');

let inputArea = null;
let inputTxt = null;
let footerArea = null;

let currentPath = '';
let editor = null;

window.addEventListener('DOMContentLoaded', onload);

function onLoad()
{
    inputArea = document.getElementById('input_area');
    inputTxt = document.getElementById('input_txt');
    footerArea = document.getElementById('footer_fixed');

    editor = ace.edit('input.txt');
    editor.setTheme('ace/theme/dracula');
    editor.focus();
    editor.gotoLine(1);
    editor.renderer.setShowPrintMargin(false);

    setEditorTheme();

    document.addEventListener('dragover', (event) => {
        event.preventDefault();
    });
    document.addEventListener('drop', (event) => {
        event.preventDefault();
    });

    inputArea.addEventListener('dragover', (event) => {
        event.preventDefault();
    });
    inputArea.addEventListener('dragleave', (event) => {
        event.preventDefault();
    });
    inputArea.addEventListener('dragend', (event) => {
        event.preventDefault();
    });
    inputArea.addEventListener('drop', (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        readFile(file.path);
    });

    // IPCでメッセージを受信してファイルの制御を行う
    ipcRenderer.on('main_file_message', (event, arg) => {
        console.log(arg);
        if(arg) {
        switch(arg) {
            case 'open':
                // ファイルを開く
                loadFile();
                break;
            case 'save':
                // ファイルを保存
                saveFile();
                break;
            case 'saveas':
                // 名前を付けてファイルを保存
                saveNewFile();
                break;
            }
        }
    });
};

function loadFile() {
    const win = BrowserWindow.getFocusedWindow();
    dialog.showOpenDialog(win, {
        properties: ['openFile'],
        title: 'ファイルを開く',
        defaultPath: currentPath,
        multiSelections: false,
        filters: [
            {
                name: 'Documents',
                extensions: ['*']
            }
        ]
    }).then(result => {
        /* ファイルを開く */
        if (!result.canceled && result.filePaths && result.filePaths.hasOwnProperty(0)) {
            readFile(result.filePaths[0]);
        }
    }).catch(err => {
        console.log(err)
    });
}

function readFile(path)
{
    currentPath = path;
    fs.readFile(path, (error, text) => {
        if (error != null){
            alert('error : ' + error);
            return;
        }
        footerArea.innerHTML = path;
        editor.setValue(text.toString(), -1);
        setEditorTheme(path);
    });
}

function saveFile() {
    if (currentPath === '') {
        saveNewFile();
        return;
    }

    const win = BrowserWindow.getFocusedWindow();
    dialog.showMessageBox(win, {
        title: 'ファイルの上書き保存を行います。',
        type: 'info',
        buttons: ['OK', 'Cancel'],
        detail: 'ファイルを上書き保存します。よろしいですか？'
    }).then(result => {
        if (result.response === 0) {
            const data = editor.getValue();
            writeFile(currentPath, data);
        }
    }).catch(err => {
        console.log(err)
    });
}


function writeFile(path, data)
{
    fs.writeFile(path, data, (error) => {
        if (error != null){
            alert('error : ' + error);
        }
        else {
            setEditorTheme(path);
        }
    });
}

function saveNewFile() {
    const win = BrowserWindow.getFocusedWindow();
    dialog.showSaveDialog(win, {
        properties: ['saveFile'],
        title: '名前を付けて保存',
        defaultPath: currentPath,
        multiSelections: false,
        filters: [
            {
                name: 'Documents',
                extensions: ['*']
            }
        ]
    }).then(result => {
        if (!result.canceled && result.filePath) {
            const data = editor.getValue();
            currentPath = result.filePath;
            writeFile(currentPath, data);
        }
    }).catch(err => {
        console.log(err)
    });
}


function setEditorTheme(fileName = '')
{
    const type = fileName.split('.');
    const ext = type[type.length - 1].toLowerCase();
    switch (ext){
        case 'txt':
            editor.getSession().setMode('ace/mode/plain_text');
            break;
        case 'py':
            editor.getSession().setMode('ace/mode/python');
            break;
        case 'ruby':
            editor.getSession().setMode('ace/mode/ruby');
            break;
        case 'c':
        case 'cpp':
        case 'h':
        case 'hpp':
            editor.getSession().setMode('ace/mode/c_cpp');
            break;
        case 'html':
            editor.getSession().setMode('ace/mode/html');
            break;
        case 'js':
            editor.getSession().setMode('ace/mode/javascript');
            break;
        case 'md':
            editor.getSession().setMode('ace/mode/markdown');
            break;
        defalut:
            editor.getSession().setMode('ace/mode/plain_text');
            break;
    }
}