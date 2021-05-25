'use strict';

/* �A�v���P�[�V�������W���[���̓ǂݍ��� */
const { app, BrowserWindow, Menu, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow()
{
    /* ���j���[���쐬 */
    const menu = Menu.buildFromTemplate(createMenuTemplate());
    Menu.setApplicationMenu(menu);

    /* ���C���E�B���h�E�̍쐬 */
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true
        }
    });

    /* ���C���E�B���h�E��HTML��\�� */
    mainWindow.loadURL(url.format({
    pathname: path.join(app.getAppPath(), 'index.html'),
    protocol: 'file:',
    slashes: true
    }));

    // �J���c�[����L����
    // mainWindow.webContents.openDevTools();

    /* ���C���E�B���h�E������ꂽ���̏��� */
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    /* Chrome�f�x���b�p�[�c�[���N���p�̃V���[�g�J�b�g�L�[��o�^ */
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

/* �����������������Ƃ��̏��� */
app.on('ready', createWindow);

/* �S�ẴE�B���h�E�������Ƃ��̏��� */
app.on('window-all-closed', () => {
    if (mainWindow !== 'darwin'){
        app.quit();
    }
});

/* �A�v���P�[�V�����E�B���h�E���A�N�e�B�u�ɂȂ������̏��� */
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

/* ���j���[�e���v���[�g�̍쐬 */
function createMenuTemplate()
{
    /* ���j���[�̃e���v���[�g */
    let templete = [{
        label: '�t�@�C��',
        submenu: [{
            label: '�J��',
            accelerator: 'CmdOrCtrl+o',
            click: function(item, focusedWindow)
            {
                if (focusedWindow){
                    /* �����_���[�v���Z�X��IPC�Ń��b�Z�[�W�𑗐M���ăt�@�C�����J�� */
                    focusedWindow.webContents.send('main_file_message', 'open');
                }
            }
        }, {
            label: '�ۑ�',
            accelerator: 'CmdOrCtrl+S',
            click: function(item, focusedWindow) {
                if (focusedWindow) {
                    // �����_���[�v���Z�X��IPC�Ń��b�Z�[�W�𑗐M���ăt�@�C����ۑ�
                    focusedWindow.webContents.send('main_file_message', 'save');
                }
            }
        }, {
            label: '���O��t���ĕۑ�',
            accelerator: 'Shift+CmdOrCtrl+S',
            click: function(item, focusedWindow) {
                if (focusedWindow) {
                    // �����_���[�v���Z�X��IPC�Ń��b�Z�[�W�𑗐M���ăt�@�C���𖼑O��t���ĕۑ�
                    focusedWindow.webContents.send('main_file_message', 'saveas');
                }
            }
        }]
    }, {
        label: '�ҏW',
        submenu: [{
            label: '��蒼��',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
        }, {
            type: 'separator'
        }, {
            label: '�؂���',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
        }, {
            label: '�R�s�[',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
        }, {
            label: '�\��t��',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
        }]
    }, {
        label: '�\��',
        submenu: [{
            label: '�S��ʕ\���ؑ�',
            accelerator: (function() {
                if (process.platform === 'darwin') {
                    return 'Ctrl+Command+F'
                } else {
                    return 'F11'
                }
            }),
            click: function(item, focusedWindow) {
                if (focusedWindow) {
                    // �S��ʕ\���̐؂�ւ�
                    focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                }
            }
        }, {
            label: '�g��',
            accelerator: 'CmdOrCtrl+Shift+=',
            role: 'zoomin'
        }, {
            label: '�k��',
            accelerator: 'CmdOrCtrl+-',
            role: 'zoomout'
        }, {
            label: '�Y�[���̃��Z�b�g',
            accelerator: 'CmdOrCtrl+0',
            role: 'resetzoom'
        }]
    }]
    return template;
}