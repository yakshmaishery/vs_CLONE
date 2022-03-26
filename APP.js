const {app,BrowserWindow, ipcMain, dialog, Menu, nativeTheme} = require("electron")
const path = require("path")
const fs = require("fs")
const process = require("process")

let root;

let names;
let paths;
let exts;
let fsize;

let template = [{label:"Undo",role:"undo",accelerator:"Ctrl + Z"},{label:"Redo",role:"redo"},{ type: 'separator' },{label:"Cut",role:"cut",accelerator:"Ctrl + X"},{label:"Copy",role:"copy",accelerator:"Ctrl + C"},{label:"Paste",role:"paste",accelerator:"Ctrl + P"},{label:"Select All",role:"selectAll",accelerator:"Ctrl + A"}]
let menu = Menu.buildFromTemplate(template)

let window = () => {
    root = new BrowserWindow({
        x:0,
        y:0,
        frame:false,
        webPreferences:{
            webSecurity:true,
            preload:path.join(app.getAppPath(),"Renderer.js"),
            contextIsolation:true
        }
    })
    root.loadFile("Index.html")
    root.on("ready-to-show", () => {root.maximize()})
    // file on argument
    root.on("ready-to-show", () => {
        let ars = process.argv
        if(ars.length>=2){
            if(fs.statSync(ars[1]).isFile()){
                paths = ars[1]
                names = path.basename(paths)
                exts = path.extname(paths).toLowerCase()
                fsize = fs.statSync(paths).size
                root.webContents.send("open_allow",{paths,names,exts,fsize})
            }
        }
    })

    // popup
    root.webContents.on("context-menu",() => {
        menu.popup()
    })
}

app.on("ready",() => {
    window()
    nativeTheme.themeSource = "dark"
})

app.disableHardwareAcceleration()

// min button
ipcMain.on("min", () => {root.isMinimized()?none:root.minimize()})

// max button
ipcMain.on("max", () => {root.isMaximized()?root.unmaximize():root.maximize()})

// close button
ipcMain.on("close", () => {app.quit()})

// Open File
ipcMain.on("openfile", (e,arr) => {
    dialog.showOpenDialog(root,{
        title:"Open File",
        properties:["openFile"]
    }).then(file => {
        if(file.canceled==false){
            paths = file.filePaths[0]
            names = path.basename(paths)
            exts = path.extname(paths).toLowerCase()
            fsize = fs.statSync(paths).size
            e.reply("open_allow",{paths,names,exts,fsize})
        }
    })
})

// save file
ipcMain.on("savefile", (e,arr) => {
    dialog.showSaveDialog(root,{
        title:"Save File",
        filters:[{name:"All Files",extensions:["*"]},
        {name:"Text Document",extensions:["txt"]},
        {name:"HTML Document",extensions:["html"]},
        {name:"Python Document",extensions:["py"]},
        {name:"C Document",extensions:["c"]},
        {name:"C# Document",extensions:["cs"]},
        {name:"JavaScript Document",extensions:["js"]},
        {name:"JSON Document",extensions:["JSON"]}]
    }).then(result => {
        if(result.canceled==false){
            paths = result.filePath
            names = path.basename(paths)
            exts = path.extname(paths)
            fs.writeFileSync(paths,arr.data)
            fsize = fs.statSync(paths).size
            e.reply("save_allow",{paths,names,exts,fsize})
        }
    })
})

// no file
ipcMain.on("nofile",(e,arr) => {dialog.showMessageBox(root,{title:"Error",message:"There is no File!",type:"error"})})

// modify file
ipcMain.on("modify_popup",(e,arr) => {dialog.showMessageBox(root,{title:"Update",message:"The File Has been Modified",type:'info'})})

// fullscreen
ipcMain.on("fullscreenmode",() => {root.isFullScreen()?root.setFullScreen(false):root.setFullScreen(true)})

// Open Folder
ipcMain.on("openfolder", (e,arr) => {
    dialog.showOpenDialog(root,{
        title:"Open Folder",
        properties:["openDirectory"]
    }).then(result => {
        if(result.canceled==false){
            let data = result.filePaths[0]
            e.reply("openFolder_allow",{data})
        }
    })
})

// file details
ipcMain.on("file_show",(e,arr) => {
    names = arr.names
    paths = arr.paths
    exts = arr.exts
    fsize = arr.fsize
})

// file show
ipcMain.on("showfiles", (e,arr) => {
    names = arr.names
    paths = arr.paths
    exts = arr.exts
    fsize = arr.fsize
    e.reply("show_details_now",{names,paths,exts,fsize})
})

ipcMain.on("helpwin", () => {
    dialog.showMessageBoxSync(root,{
        title:"Shortcut Keys",
        message:"New Tab : Ctrl + N\nOpen File : Ctrl + O\nSave File : Ctrl + S\nAdd Folder : Ctrl + Shift + A\nFullScreen Mode : F5\nOpen Settings : Ctrl + Shift + S\nModify File : F1\nFile Details : F2\nClose Tab : Ctrl + F4",
        type:"info",
    })
})