const { ipcRenderer, dialog } = require("electron")
const fs = require("fs")
const path = require("path")
const os = require("os")
const process = require("process")
const cmds = require("child_process")

window.addEventListener("DOMContentLoaded", () => {
    // file details
    let file_details=[]
    let paths;
    let names;
    let exts;
    let fsize;
    let UTF=true;
    let WRAp = false;

    // main buttons
    document.getElementById("minbtn").addEventListener("click", () => {ipcRenderer.send("min")})
    document.getElementById("maxbtn").addEventListener("click", () => {ipcRenderer.send("max")})
    document.getElementById("closebtn").addEventListener("click", () => {ipcRenderer.send("close")})

    // Number of Tabs
    let TAB_NUMBER = 1;

    // current Tab
    let current_tab = 1;

    // font size
    let font_size = 1.4

    // line height
    let line_Height = 1

    // Word wrap
    let word_height = 0

    // font style
    let font_style = "Arial"

    // Tab Click Event
    let TabClickEvent = (n) => {
        current_tab = n
        let t = document.getElementsByClassName("tabbtn")
        for (let index = 0; index < t.length; index++) {
            document.getElementsByClassName("txtcontainer")[index].style.display='none'
            document.getElementsByClassName("tabdiv")[index].style.backgroundColor="#2d2d2d"
            document.getElementsByClassName("tabdiv")[index].setAttribute("style","border-right: 0px solid black;border-left: 0px solid black")
            // document.getElementById(`tab${current_tab}`).style.color="white"
        }
        document.getElementById(`txtcontainer${current_tab}`).style.display="block"
        document.getElementById(`tabdiv${current_tab}`)
        document.getElementById(`tabdiv${current_tab}`).setAttribute("style","border-top: 1px solid yellow;border-right: 1px solid black;border-left: 1px solid black;background-color:#1e1e1e")
        document.getElementById(`tab${current_tab}`).style.color="white"
        // data
        let result = file_details.find( ({ no }) => no === current_tab );
        if(result){
            paths = result.paths
            names = result.names
            exts = result.exts
            fsize = result.fsize
            ipcRenderer.send("file_show",{names,paths,exts,fsize})
        }
        else{
            paths = undefined
            names = undefined
            exts = undefined
            fsize = undefined
        }
        // status bar
        if(document.getElementById(`txt${current_tab}`).tagName=="TEXTAREA"){
            document.getElementById(`txt${current_tab}`).focus()
            document.getElementById(`txt${current_tab}`).style.lineHeight = line_Height + 'em'
            document.getElementById(`txt${current_tab}`).style.letterSpacing = word_height + 'px'
            if(WRAp == true){
                document.getElementById(`txt${current_tab}`).style.whiteSpace = "normal";
            }
            else if(WRAp == false){
                document.getElementById(`txt${current_tab}`).style.whiteSpace = "nowrap";
            }
            let str = document.getElementById(`txt${current_tab}`).value
            let words = str.trim().split(/\s+/)
            let loc = str.substr(0, txt.selectionStart).split("\n").length
            document.getElementById("status").innerHTML=`Words:${words.length}\t\t\tLetters:${str.length}\t\t\tCursor:${loc}`
        }
        else{
            document.getElementById("status").innerHTML=""
        }
    }

    // close Tab
    let Close_TAB_EVENT = (n) => {
        document.getElementById(`tabdiv${n}`).remove()
        document.getElementById(`txtcontainer${n}`).remove()
        let nt = document.getElementsByClassName("tabbtn")
        if(nt.length<1){}
        else if(nt.length>=1){
            nt[0].click()
        }
    }

    // initial Tab
    let Button_frame = document.createElement("div")
    let tab_text = document.createElement("button")
    let close_tab = document.createElement("button")

    // for tab button
    tab_text.setAttribute("id",`tab${1}`)
    tab_text.setAttribute("class",`tabbtn`)
    tab_text.setAttribute("style","height:100%;font-size:medium;margin:0px;background-color:transparent;border:0px;color:rgb(150,150,150);cursor: pointer;")
    tab_text.innerHTML = `Untitled-1`
    tab_text.addEventListener("click",()=>{TabClickEvent(1)})
    
    close_tab.innerHTML = "❌"
    close_tab.setAttribute("id",`closeTAB${1}`)
    close_tab.setAttribute("style","height:100%;font-size:medium;margin:0px;padding:0px;background-color:transparent;border:0px;cursor: pointer;")

    Button_frame.appendChild(tab_text)
    Button_frame.appendChild(close_tab)
    Button_frame.setAttribute("id",`tabdiv${1}`)
    Button_frame.setAttribute("class",`tabdiv`)
    Button_frame.setAttribute("style","background-color:rgb(45,45,45);width:fit-content")
    document.getElementById("TabFrame").appendChild(Button_frame)

    // for Tab Content
    let txt_content = document.createElement("div")
    let txt = document.createElement("textarea")

    txt.setAttribute("id",`txt${1}`)
    txt.setAttribute("spellcheck",false)
    txt.setAttribute("placeholder","Welcome 😀")
    txt.setAttribute("style",`height:100%;width:100%;font-size:${font_size}em;line-height:1em;color:white;background-color:rgb(30,30,30);outline:none;font-family:${font_style};border:0px;white-space:nowrap;resize:none;cursor:auto`)
    txt.addEventListener("keydown",(e) => {
        if ( e.key === 'Tab' && !e.shiftKey ) {
            document.execCommand('insertText', false, "\t");
            e.preventDefault();
        }
    })
    txt.addEventListener("input",() => {
        let str = document.getElementById(`txt${1}`).value
        let words = str.trim().split(/\s+/)
        let loc = str.substr(0, txt.selectionStart).split("\n").length
        document.getElementById("status").innerHTML=`Words:${words.length}\t\t\tLetters:${str.length}\t\t\tCursor:${loc}`
    })

    txt_content.setAttribute("id",`txtcontainer${1}`)
    txt_content.setAttribute("class",`txtcontainer`)
    txt_content.appendChild(txt)
    document.getElementById("contentbody").appendChild(txt_content)

    close_tab.addEventListener("click", () => {
        Close_TAB_EVENT(1)
    })
    TabClickEvent(1)
    txt.focus()

    // New Tab
    document.getElementById("newbtn").addEventListener("click", () => {
        TAB_NUMBER = TAB_NUMBER + 1
        let no = TAB_NUMBER
        let Button_frame = document.createElement("div")
        let tab_text = document.createElement("button")
        let close_tab = document.createElement("button")

        // for tab button
        tab_text.setAttribute("id",`tab${no}`)
        tab_text.setAttribute("class",`tabbtn`)
        tab_text.setAttribute("style","height:100%;font-size:medium;margin:0px;background-color:transparent;border:0px;color:rgb(150,150,150);cursor: pointer;")
        tab_text.innerHTML = `Untitled-${no}`
        tab_text.addEventListener("click",()=>{TabClickEvent(no)})
        
        close_tab.innerHTML = "❌"
        close_tab.setAttribute("id",`closeTAB${no}`)
        close_tab.setAttribute("style","height:100%;font-size:medium;margin:0px;padding:0px;background-color:transparent;border:0px;cursor: pointer;")

        Button_frame.appendChild(tab_text)
        Button_frame.appendChild(close_tab)
        Button_frame.setAttribute("id",`tabdiv${no}`)
        Button_frame.setAttribute("class",`tabdiv`)
        Button_frame.setAttribute("style","background-color:rgb(45,45,45);width:fit-content")
        document.getElementById("TabFrame").appendChild(Button_frame)

        // for Tab Content
        let txt_content = document.createElement("div")
        let txt = document.createElement("textarea")

        txt.setAttribute("id",`txt${no}`)
        txt.setAttribute("placeholder",`Note - ${no}`)
        txt.setAttribute("spellcheck",false)
        txt.setAttribute("style",`height:100%;width:100%;font-size:${font_size}em;line-height:1em;color:white;background-color:rgb(30,30,30);outline:none;font-family:${font_style};border:0px;white-space:nowrap;resize:none;cursor:auto`)
        txt.addEventListener("keydown",(e) => {
            if ( e.key === 'Tab' && !e.shiftKey ) {
                document.execCommand('insertText', false, "\t");
                e.preventDefault();
            }
        })
        txt.addEventListener("input",() => {
            let str = document.getElementById(`txt${no}`).value
            let words = str.trim().split(/\s+/)
            let loc = str.substr(0, txt.selectionStart).split("\n").length
            document.getElementById("status").innerHTML=`Words:${words.length}\t\t\tLetters:${str.length}\t\t\tCursor:${loc}`
        })

        txt_content.setAttribute("id",`txtcontainer${no}`)
        txt_content.setAttribute("class",`txtcontainer`)
        txt_content.appendChild(txt)
        document.getElementById("contentbody").appendChild(txt_content)

        close_tab.addEventListener("click", () => {
            Close_TAB_EVENT(no)
        })
        TabClickEvent(no)
    })

    // Open File
    document.getElementById("openbtn").addEventListener("click", () => {ipcRenderer.send("openfile")})

    ipcRenderer.on("open_allow", (e,arr) => {
        paths = arr.paths
        names = arr.names
        exts = arr.exts
        fsize = arr.fsize
        if((exts==".png" || exts==".jpg" || exts==".jpeg" || exts==".bmp" || exts==".ico" || exts==".gif") && UTF==true){
            TAB_NUMBER = TAB_NUMBER + 1
            let no = TAB_NUMBER
            let Button_frame = document.createElement("div")
            let tab_text = document.createElement("button")
            let close_tab = document.createElement("button")
            file_details.push({no,names,paths,exts,fsize})

            // for tab button
            tab_text.setAttribute("id",`tab${no}`)
            tab_text.setAttribute("class",`tabbtn`)
            tab_text.setAttribute("style","height:100%;font-size:medium;margin:0px;background-color:transparent;border:0px;color:rgb(150,150,150);cursor: pointer;")
            tab_text.innerHTML = `${names}`
            tab_text.addEventListener("click",()=>{TabClickEvent(no)})
            
            close_tab.innerHTML = "❌"
            close_tab.setAttribute("id",`closeTAB${no}`)
            close_tab.setAttribute("style","height:100%;font-size:medium;margin:0px;padding:0px;background-color:transparent;border:0px;cursor: pointer;")

            Button_frame.appendChild(tab_text)
            Button_frame.appendChild(close_tab)
            Button_frame.setAttribute("id",`tabdiv${no}`)
            Button_frame.setAttribute("class",`tabdiv`)
            Button_frame.setAttribute("style","background-color:rgb(45,45,45);width:fit-content")
            document.getElementById("TabFrame").appendChild(Button_frame)

            // for Tab Content
            let txt_content = document.createElement("div")
            let txt = document.createElement("embed")
            let centertag = document.createElement("center")

            txt.setAttribute("id",`txt${no}`)
            txt.height=""
            txt.width=""
            txt.setAttribute("style",`background-color:rgb(30,30,30);outline:none;border:0px;resize:both`)

            centertag.appendChild(txt)
            
            let div_height = document.getElementById("contentbody").clientHeight
            let div_width = document.getElementById("contentbody").clientWidth
            txt.setAttribute("src",paths)
            
            txt_content.setAttribute("id",`txtcontainer${no}`)
            txt_content.setAttribute("class",`txtcontainer`)
            centertag.setAttribute("style",`overflow:auto;height:${div_height}px;width:${div_width};resize:both`)
            txt_content.setAttribute("style","overflow:hidden;resize:none")
            txt_content.appendChild(centertag)
            document.getElementById("contentbody").appendChild(txt_content)
            document.getElementById("contentbody").setAttribute("style","overflow:hidden;resize:none")

            close_tab.addEventListener("click", () => {
                Close_TAB_EVENT(no)
            })
            TabClickEvent(no)
        }

        // MP4
        else if((exts==".mp4") && UTF==true){
            TAB_NUMBER = TAB_NUMBER + 1
            let no = TAB_NUMBER
            file_details.push({no,names,paths,exts,fsize})
            let Button_frame = document.createElement("div")
            let tab_text = document.createElement("button")
            let close_tab = document.createElement("button")

            // for tab button
            tab_text.setAttribute("id",`tab${no}`)
            tab_text.setAttribute("class",`tabbtn`)
            tab_text.setAttribute("style","height:100%;font-size:medium;margin:0px;background-color:transparent;border:0px;color:rgb(150,150,150);cursor: pointer;")
            tab_text.innerHTML = `${names}`
            tab_text.addEventListener("click",()=>{TabClickEvent(no)})
            
            close_tab.innerHTML = "❌"
            close_tab.setAttribute("id",`closeTAB${no}`)
            close_tab.setAttribute("style","height:100%;font-size:medium;margin:0px;padding:0px;background-color:transparent;border:0px;cursor: pointer;")

            Button_frame.appendChild(tab_text)
            Button_frame.appendChild(close_tab)
            Button_frame.setAttribute("id",`tabdiv${no}`)
            Button_frame.setAttribute("class",`tabdiv`)
            Button_frame.setAttribute("style","background-color:rgb(45,45,45);width:fit-content")
            document.getElementById("TabFrame").appendChild(Button_frame)

            // for Tab Content
            let txt_content = document.createElement("div")
            let txt = document.createElement("embed")

            txt.setAttribute("id",`txt${no}`)
            txt.setAttribute("style",`height:100%;width:100%;background-color:rgb(30,30,30);outline:none;border:0px;resize:none`)
            txt.setAttribute("src",paths)

            txt_content.setAttribute("id",`txtcontainer${no}`)
            txt_content.setAttribute("class",`txtcontainer`)
            txt_content.appendChild(txt)
            document.getElementById("contentbody").appendChild(txt_content)

            close_tab.addEventListener("click", () => {
                Close_TAB_EVENT(no)
            })
            TabClickEvent(no)
        }

        // PDF
        else if((exts==".pdf") && UTF==true){
            TAB_NUMBER = TAB_NUMBER + 1
            let no = TAB_NUMBER
            file_details.push({no,names,paths,exts,fsize})
            let Button_frame = document.createElement("div")
            let tab_text = document.createElement("button")
            let close_tab = document.createElement("button")

            // for tab button
            tab_text.setAttribute("id",`tab${no}`)
            tab_text.setAttribute("class",`tabbtn`)
            tab_text.setAttribute("style","height:100%;font-size:medium;margin:0px;background-color:transparent;border:0px;color:rgb(150,150,150);cursor: pointer;")
            tab_text.innerHTML = `${names}`
            tab_text.addEventListener("click",()=>{TabClickEvent(no)})
            
            close_tab.innerHTML = "❌"
            close_tab.setAttribute("id",`closeTAB${no}`)
            close_tab.setAttribute("style","height:100%;font-size:medium;margin:0px;padding:0px;background-color:transparent;border:0px;cursor: pointer;")

            Button_frame.appendChild(tab_text)
            Button_frame.appendChild(close_tab)
            Button_frame.setAttribute("id",`tabdiv${no}`)
            Button_frame.setAttribute("class",`tabdiv`)
            Button_frame.setAttribute("style","background-color:rgb(45,45,45);width:fit-content")
            document.getElementById("TabFrame").appendChild(Button_frame)

            // for Tab Content
            let txt_content = document.createElement("div")
            let txt = document.createElement("embed")

            txt.setAttribute("id",`txt${no}`)
            txt.setAttribute("style",`height:100%;width:100%;background-color:rgb(30,30,30);outline:none;border:0px;resize:none`)
            txt.setAttribute("src",`${paths}#toolbar=1&scrollbar=0&view=FitH&statusbar=0`)

            txt_content.setAttribute("id",`txtcontainer${no}`)
            txt_content.setAttribute("class",`txtcontainer`)
            txt_content.appendChild(txt)
            document.getElementById("contentbody").appendChild(txt_content)

            close_tab.addEventListener("click", () => {
                Close_TAB_EVENT(no)
            })
            TabClickEvent(no)
        }
        else{
            TAB_NUMBER = TAB_NUMBER + 1
            let no = TAB_NUMBER
            file_details.push({no,names,paths,exts,fsize})
            let Button_frame = document.createElement("div")
            let tab_text = document.createElement("button")
            let close_tab = document.createElement("button")

            // for tab button
            tab_text.setAttribute("id",`tab${no}`)
            tab_text.setAttribute("class",`tabbtn`)
            tab_text.setAttribute("style","height:100%;font-size:medium;margin:0px;background-color:transparent;border:0px;color:rgb(150,150,150);cursor: pointer;")
            tab_text.innerHTML = `${names}`
            tab_text.addEventListener("click",()=>{TabClickEvent(no)})
            
            close_tab.innerHTML = "❌"
            close_tab.setAttribute("id",`closeTAB${no}`)
            close_tab.setAttribute("style","height:100%;font-size:medium;margin:0px;padding:0px;background-color:transparent;border:0px;cursor: pointer;")

            Button_frame.appendChild(tab_text)
            Button_frame.appendChild(close_tab)
            Button_frame.setAttribute("id",`tabdiv${no}`)
            Button_frame.setAttribute("class",`tabdiv`)
            Button_frame.setAttribute("style","background-color:rgb(45,45,45);width:fit-content")
            document.getElementById("TabFrame").appendChild(Button_frame)

            // for Tab Content
            let txt_content = document.createElement("div")
            let txt = document.createElement("textarea")

            txt.setAttribute("id",`txt${no}`)
            txt.setAttribute("spellcheck",false)
            txt.setAttribute("style",`height:100%;width:100%;font-size:${font_size}em;line-height:1.2em;color:white;background-color:rgb(30,30,30);outline:none;font-family:${font_style};border:0px;white-space:nowrap;resize:none;cursor:auto`)
            txt.addEventListener("keydown",(e) => {
                if ( e.key === 'Tab' && !e.shiftKey ) {
                    document.execCommand('insertText', false, "\t");
                    e.preventDefault();
                }
            })
            txt.addEventListener("input",() => {
                let str = document.getElementById(`txt${no}`).value
                let words = str.trim().split(/\s+/)
                let loc = str.substr(0, txt.selectionStart).split("\n").length
                document.getElementById("status").innerHTML=`Words:${words.length}\t\t\tLetters:${str.length}\t\t\tCursor:${loc}`
            })
            txt.innerHTML = fs.readFileSync(paths,"utf-8")

            txt_content.setAttribute("id",`txtcontainer${no}`)
            txt_content.setAttribute("class",`txtcontainer`)
            txt_content.appendChild(txt)
            document.getElementById("contentbody").appendChild(txt_content)

            close_tab.addEventListener("click", () => {
                Close_TAB_EVENT(no)
            })
            TabClickEvent(no)
        }
    })

    // save file
    document.getElementById("savebtn").addEventListener("click", () => {
        if(document.getElementById(`txt${current_tab}`).tagName == 'TEXTAREA'){
            ipcRenderer.send("savefile",{data:document.getElementById(`txt${current_tab}`).value})
        }
        else{ipcRenderer.send("nofile")}
    })

    ipcRenderer.on("save_allow", (e,arr) => {
        paths = arr.paths
        names = arr.names
        exts = arr.exts
        fsize = arr.fsize
        let no = current_tab
        file_details.push({no,names,paths,exts,fsize})
        document.getElementById(`tab${no}`).innerHTML = names
    })

    // modify file
    document.getElementById("modifybtn").addEventListener("click",() => {
        if(document.getElementById(`txt${current_tab}`).tagName=="TEXTAREA" && paths){
            let data = document.getElementById(`txt${current_tab}`).value
            fs.writeFileSync(paths,data)
            fsize = fs.statSync(paths).size
            ipcRenderer.send("modify_popup")
        }
        else{ipcRenderer.send("nofile")}
    })

    // full screen
    document.getElementById("fullscrrenbtn").addEventListener("click",() => {ipcRenderer.send("fullscreenmode")})

    // explorer open folder
    document.getElementById("explorerbtn").addEventListener("click", () => {ipcRenderer.send("openfolder")})

    // open file from folder
    let open_folder_file = (n) => {
        paths = n
        names = path.basename(paths)
        exts = path.extname(paths).toLowerCase()
        fsize = fs.statSync(paths).size
        if((exts==".png" || exts==".jpg" || exts==".jpeg" || exts==".bmp" || exts==".ico" || exts==".gif") && UTF==true){
            TAB_NUMBER = TAB_NUMBER + 1
            let no = TAB_NUMBER
            let Button_frame = document.createElement("div")
            let tab_text = document.createElement("button")
            let close_tab = document.createElement("button")
            file_details.push({no,names,paths,exts,fsize})

            // for tab button
            tab_text.setAttribute("id",`tab${no}`)
            tab_text.setAttribute("class",`tabbtn`)
            tab_text.setAttribute("style","height:100%;font-size:medium;margin:0px;background-color:transparent;border:0px;color:rgb(150,150,150);cursor: pointer;")
            tab_text.innerHTML = `${names}`
            tab_text.addEventListener("click",()=>{TabClickEvent(no)})
            
            close_tab.innerHTML = "❌"
            close_tab.setAttribute("id",`closeTAB${no}`)
            close_tab.setAttribute("style","height:100%;font-size:medium;margin:0px;padding:0px;background-color:transparent;border:0px;cursor: pointer;")

            Button_frame.appendChild(tab_text)
            Button_frame.appendChild(close_tab)
            Button_frame.setAttribute("id",`tabdiv${no}`)
            Button_frame.setAttribute("class",`tabdiv`)
            Button_frame.setAttribute("style","background-color:rgb(45,45,45);width:fit-content")
            document.getElementById("TabFrame").appendChild(Button_frame)

            // for Tab Content
            let txt_content = document.createElement("div")
            let txt = document.createElement("embed")
            let centertag = document.createElement("center")

            txt.setAttribute("id",`txt${no}`)
            txt.setAttribute("style",`background-color:rgb(30,30,30);outline:none;border:0px;resize:both`)

            txt.setAttribute("src",paths)
            centertag.appendChild(txt)

            let div_height = document.getElementById("contentbody").clientHeight
            let div_width = document.getElementById("contentbody").clientWidth

            txt_content.setAttribute("id",`txtcontainer${no}`)
            txt_content.setAttribute("class",`txtcontainer`)
            centertag.setAttribute("style",`overflow:auto;height:fit-content;width:fit-content;resize:both`)
            txt_content.setAttribute("style","overflow:hidden;resize:none")
            txt_content.appendChild(centertag)
            document.getElementById("contentbody").appendChild(txt_content)
            document.getElementById("contentbody").setAttribute("style","overflow:hidden;resize:none")

            close_tab.addEventListener("click", () => {
                Close_TAB_EVENT(no)
            })
            TabClickEvent(no)
        }

        // MP4
        else if((exts==".mp4") && UTF==true){
            TAB_NUMBER = TAB_NUMBER + 1
            let no = TAB_NUMBER
            file_details.push({no,names,paths,exts,fsize})
            let Button_frame = document.createElement("div")
            let tab_text = document.createElement("button")
            let close_tab = document.createElement("button")

            // for tab button
            tab_text.setAttribute("id",`tab${no}`)
            tab_text.setAttribute("class",`tabbtn`)
            tab_text.setAttribute("style","height:100%;font-size:medium;margin:0px;background-color:transparent;border:0px;color:rgb(150,150,150);cursor: pointer;")
            tab_text.innerHTML = `${names}`
            tab_text.addEventListener("click",()=>{TabClickEvent(no)})
            
            close_tab.innerHTML = "❌"
            close_tab.setAttribute("id",`closeTAB${no}`)
            close_tab.setAttribute("style","height:100%;font-size:medium;margin:0px;padding:0px;background-color:transparent;border:0px;cursor: pointer;")

            Button_frame.appendChild(tab_text)
            Button_frame.appendChild(close_tab)
            Button_frame.setAttribute("id",`tabdiv${no}`)
            Button_frame.setAttribute("class",`tabdiv`)
            Button_frame.setAttribute("style","background-color:rgb(45,45,45);width:fit-content")
            document.getElementById("TabFrame").appendChild(Button_frame)

            // for Tab Content
            let txt_content = document.createElement("div")
            let txt = document.createElement("embed")

            txt.setAttribute("id",`txt${no}`)
            txt.setAttribute("style",`height:100%;width:100%;background-color:rgb(30,30,30);outline:none;border:0px;resize:none`)
            txt.setAttribute("src",paths)

            txt_content.setAttribute("id",`txtcontainer${no}`)
            txt_content.setAttribute("class",`txtcontainer`)
            txt_content.appendChild(txt)
            document.getElementById("contentbody").appendChild(txt_content)

            close_tab.addEventListener("click", () => {
                Close_TAB_EVENT(no)
            })
            TabClickEvent(no)
        }

        // PDF
        else if((exts==".pdf") && UTF==true){
            TAB_NUMBER = TAB_NUMBER + 1
            let no = TAB_NUMBER
            file_details.push({no,names,paths,exts,fsize})
            let Button_frame = document.createElement("div")
            let tab_text = document.createElement("button")
            let close_tab = document.createElement("button")

            // for tab button
            tab_text.setAttribute("id",`tab${no}`)
            tab_text.setAttribute("class",`tabbtn`)
            tab_text.setAttribute("style","height:100%;font-size:medium;margin:0px;background-color:transparent;border:0px;color:rgb(150,150,150);cursor: pointer;")
            tab_text.innerHTML = `${names}`
            tab_text.addEventListener("click",()=>{TabClickEvent(no)})
            
            close_tab.innerHTML = "❌"
            close_tab.setAttribute("id",`closeTAB${no}`)
            close_tab.setAttribute("style","height:100%;font-size:medium;margin:0px;padding:0px;background-color:transparent;border:0px;cursor: pointer;")

            Button_frame.appendChild(tab_text)
            Button_frame.appendChild(close_tab)
            Button_frame.setAttribute("id",`tabdiv${no}`)
            Button_frame.setAttribute("class",`tabdiv`)
            Button_frame.setAttribute("style","background-color:rgb(45,45,45);width:fit-content")
            document.getElementById("TabFrame").appendChild(Button_frame)

            // for Tab Content
            let txt_content = document.createElement("div")
            let txt = document.createElement("embed")

            txt.setAttribute("id",`txt${no}`)
            txt.setAttribute("style",`height:100%;width:100%;background-color:rgb(30,30,30);outline:none;border:0px;resize:none`)
            txt.setAttribute("src",`${paths}#toolbar=1&scrollbar=0&view=FitH&statusbar=0&highlight=rt`)

            txt_content.setAttribute("id",`txtcontainer${no}`)
            txt_content.setAttribute("class",`txtcontainer`)
            txt_content.appendChild(txt)
            document.getElementById("contentbody").appendChild(txt_content)

            close_tab.addEventListener("click", () => {
                Close_TAB_EVENT(no)
            })
            TabClickEvent(no)
        }
        else{
            TAB_NUMBER = TAB_NUMBER + 1
            let no = TAB_NUMBER
            file_details.push({no,names,paths,exts,fsize})
            let Button_frame = document.createElement("div")
            let tab_text = document.createElement("button")
            let close_tab = document.createElement("button")

            // for tab button
            tab_text.setAttribute("id",`tab${no}`)
            tab_text.setAttribute("class",`tabbtn`)
            tab_text.setAttribute("style","height:100%;font-size:medium;margin:0px;background-color:transparent;border:0px;color:rgb(150,150,150);cursor: pointer;")
            tab_text.innerHTML = `${names}`
            tab_text.addEventListener("click",()=>{TabClickEvent(no)})
            
            close_tab.innerHTML = "❌"
            close_tab.setAttribute("id",`closeTAB${no}`)
            close_tab.setAttribute("style","height:100%;font-size:medium;margin:0px;padding:0px;background-color:transparent;border:0px;cursor: pointer;")

            Button_frame.appendChild(tab_text)
            Button_frame.appendChild(close_tab)
            Button_frame.setAttribute("id",`tabdiv${no}`)
            Button_frame.setAttribute("class",`tabdiv`)
            Button_frame.setAttribute("style","background-color:rgb(45,45,45);width:fit-content")
            document.getElementById("TabFrame").appendChild(Button_frame)

            // for Tab Content
            let txt_content = document.createElement("div")
            let txt = document.createElement("textarea")

            txt.setAttribute("id",`txt${no}`)
            txt.setAttribute("spellcheck",false)
            txt.setAttribute("style",`height:100%;width:100%;font-size:${font_size}em;line-height:1.2em;color:white;background-color:rgb(30,30,30);outline:none;font-family:${font_style};border:0px;white-space:nowrap;resize:none;cursor:auto`)
            txt.addEventListener("keydown",(e) => {
                if ( e.key === 'Tab' && !e.shiftKey ) {
                    document.execCommand('insertText', false, "\t");
                    e.preventDefault();
                }
            })
            txt.addEventListener("input",() => {
                let str = document.getElementById(`txt${no}`).value
                let words = str.trim().split(/\s+/)
                let loc = str.substr(0, txt.selectionStart).split("\n").length
                document.getElementById("status").innerHTML=`Words:${words.length}\t\t\tLetters:${str.length}\t\t\tCursor:${loc}`
            })
            txt.innerHTML = fs.readFileSync(paths,"utf-8")

            txt_content.setAttribute("id",`txtcontainer${no}`)
            txt_content.setAttribute("class",`txtcontainer`)
            txt_content.appendChild(txt)
            document.getElementById("contentbody").appendChild(txt_content)

            close_tab.addEventListener("click", () => {
                Close_TAB_EVENT(no)
            })
            TabClickEvent(no)
        }
    }

    // add folder in workshop
    ipcRenderer.on("openFolder_allow", (e,arr) => {
        let selecttag = document.createElement("select")
        selecttag.setAttribute("style",'background-color:rgb(37,37,38);color:white;font-size:medium;width:100%;outline:none;border: 0px;cursor:pointer')
        // folder name
        let optiontaghead = document.createElement("option")
        optiontaghead.innerHTML = `${path.basename(arr.data)}`
        optiontaghead.setAttribute("value",arr.data)
        selecttag.appendChild(optiontaghead)
        process.chdir(arr.data)
        fs.readdirSync(arr.data).forEach(element=>{
            let f = path.resolve(element)
            if(fs.statSync(f).isFile()){
                let option_tag = document.createElement("option")
                option_tag.innerHTML = f
                option_tag.setAttribute("value",f)
                selecttag.appendChild(option_tag)
            }
        })
        selecttag.addEventListener("change",() => {
            let indexer = selecttag.options[selecttag.selectedIndex].index
            if(indexer!=0){
                let f = selecttag.options[selecttag.selectedIndex].value
                open_folder_file(f)
                selecttag.selectedIndex=0
            }
        })
        document.getElementById("explorer_frame").appendChild(selecttag)
    })

    // ➕ button
    document.getElementById("plusbtn").addEventListener("click", () => {
        if(document.getElementById(`txt${current_tab}`).tagName == "TEXTAREA"){
            let ts = parseFloat(document.getElementById(`txt${current_tab}`).style.fontSize)
            document.getElementById(`txt${current_tab}`).style.fontSize=ts+0.2+'em'
        }
        if(document.getElementById(`txt${current_tab}`).tagName == "EMBED"){
            let h = document.getElementById(`txt${current_tab}`).clientHeight
            let w = document.getElementById(`txt${current_tab}`).clientWidth
            document.getElementById(`txt${current_tab}`).setAttribute("style",`height:${h*1.2};width:${w*1.2}`)
        }
    })

    // ➖ button
    document.getElementById("minusbtn").addEventListener("click", () => {
        if(document.getElementById(`txt${current_tab}`).tagName == "TEXTAREA"){
            let ts = parseFloat(document.getElementById(`txt${current_tab}`).style.fontSize)
            document.getElementById(`txt${current_tab}`).style.fontSize=ts-0.2+'em'
        }
        if(document.getElementById(`txt${current_tab}`).tagName == "EMBED"){
            let h = document.getElementById(`txt${current_tab}`).clientHeight
            let w = document.getElementById(`txt${current_tab}`).clientWidth
            document.getElementById(`txt${current_tab}`).setAttribute("style",`height:${h/1.2};width:${w/1.2}`)
        }
    })

    // hide explorer
    document.getElementById("explorerhead").addEventListener("click", () => {
        document.getElementById("explorerdiv").style.display='none'
        document.getElementById("showExplorer").style.display='block'
    })

    // show explorer
    document.getElementById("showExplorer").addEventListener("click", () => {
        document.getElementById("explorerdiv").style.display='block'
        document.getElementById("showExplorer").style.display='none'
    })

    // hide bars
    document.getElementById("hidebarbtn").addEventListener("click", () => {
        document.getElementById("container").setAttribute("style","grid-template-columns:auto")
        document.getElementById("bodycontainer").setAttribute("style","grid-row:2/span 2;grid-column:1/span 2")
        document.getElementById("showbarbtn").style.display="block"
        document.getElementById("status").style.display = "none"
    })
    
    // show bars
    document.getElementById("showbarbtn").addEventListener("click", () => {
        document.getElementById("container").setAttribute("style","grid-template-columns:3em auto")
        document.getElementById("bodycontainer").setAttribute("style","grid-row:2;grid-column:2")
        document.getElementById("showbarbtn").style.display="none"
        document.getElementById("status").style.display = "block"
    })

    // show setting window
    document.getElementById("settingsbtn").addEventListener("click", () => {
        document.getElementById("settingsbtn").disabled = true
        document.getElementById("settingsbtn").style.color="black"
        document.getElementById("tooltip_div").style.display="none"
        // initial Tab
        let Button_frame = document.createElement("div")
        let tab_text = document.createElement("button")
        let close_tab = document.createElement("button")
        TAB_NUMBER = TAB_NUMBER + 1
        let no = TAB_NUMBER
        
        // for tab button
        tab_text.setAttribute("id",`tab${no}`)
        tab_text.setAttribute("class",`tabbtn`)
        tab_text.setAttribute("style","height:100%;font-size:medium;margin:0px;background-color:transparent;border:0px;color:rgb(150,150,150);cursor: pointer;")
        tab_text.innerHTML = `Setting`
        tab_text.addEventListener("click",()=>{TabClickEvent(no)})
        
        close_tab.innerHTML = "❌"
        close_tab.setAttribute("id",`closeTAB${no}`)
        close_tab.setAttribute("style","height:100%;font-size:medium;margin:0px;padding:0px;background-color:transparent;border:0px;cursor: pointer;")
        
        Button_frame.appendChild(tab_text)
        Button_frame.appendChild(close_tab)
        Button_frame.setAttribute("id",`tabdiv${no}`)
        Button_frame.setAttribute("class",`tabdiv`)
        Button_frame.setAttribute("style","background-color:rgb(45,45,45);width:fit-content")
        document.getElementById("TabFrame").appendChild(Button_frame)
        
        // for Tab Content
        let txt_content = document.createElement("div")
        txt_content.setAttribute("id",`txtcontainer${no}`)
        txt_content.setAttribute("class",`txtcontainer`)
        
        // ----------------------Setting----------------------
        let l1 = document.createElement("h3")
        l1.innerHTML = "Font Style -"
        l1.setAttribute("style",`color:white;font-size:1.3em;font-family:consolas;margin:10px`)
        l1.setAttribute("id",`txt${no}`)
        txt_content.appendChild(l1)

        let selecttag = document.createElement("select")
        selecttag.setAttribute("style",`font-size:1.3em;font-family:arial;width:80%;padding:0px;margin:2px;outline:none;border:1px solid black`)

        let font_data_list = ['System','Terminal','Fixedsys','Modern','Roman','Script','Courier','MS Serif','MS Sans Serif','Small Fonts',
        'Bell Gothic Std Black','Bell Gothic Std Light','Eccentric Std','Stencil Std','Tekton Pro','Tekton Pro Cond','Tekton Pro Ext','Trajan Pro',
        'Rosewood Std Regular','Prestige Elite Std','Poplar Std','Orator Std','OCR A Std','Nueva Std Cond','Minion Pro SmBd','Minion Pro Med',
        'Minion Pro Cond','Mesquite Std','Lithos Pro Regular','Kozuka Mincho Pro R','@Kozuka Mincho Pro R','Kozuka Mincho Pro M','@Kozuka Mincho Pro M',
        'Kozuka Mincho Pro L','@Kozuka Mincho Pro L','Kozuka Mincho Pro H','@Kozuka Mincho Pro H','Kozuka Mincho Pro EL','@Kozuka Mincho Pro EL',
        'Kozuka Mincho Pro B','@Kozuka Mincho Pro B','Kozuka Gothic Pro R','@Kozuka Gothic Pro R','Kozuka Gothic Pro M','@Kozuka Gothic Pro M',
        'Kozuka Gothic Pro L','@Kozuka Gothic Pro L','Kozuka Gothic Pro H','@Kozuka Gothic Pro H','Kozuka Gothic Pro EL','@Kozuka Gothic Pro EL',
        'Kozuka Gothic Pro B','@Kozuka Gothic Pro B','Hobo Std','Giddyup Std','Cooper Std Black','Charlemagne Std','Chaparral Pro','Brush Script Std',
        'Blackoak Std','Birch Std','Adobe Garamond Pro','Adobe Garamond Pro Bold','Adobe Kaiti Std R','@Adobe Kaiti Std R','Adobe Heiti Std R',
        '@Adobe Heiti Std R','Adobe Fangsong Std R','@Adobe Fangsong Std R','Adobe Caslon Pro','Adobe Caslon Pro Bold','Adobe Arabic','Adobe Devanagari',
        'Adobe Hebrew','Adobe Ming Std L','@Adobe Ming Std L','Adobe Myungjo Std M','@Adobe Myungjo Std M','Adobe Song Std L','@Adobe Song Std L',
        'Kozuka Gothic Pr6N B','@Kozuka Gothic Pr6N B','Kozuka Gothic Pr6N EL','@Kozuka Gothic Pr6N EL','Kozuka Gothic Pr6N H','@Kozuka Gothic Pr6N H',
        'Kozuka Gothic Pr6N L','@Kozuka Gothic Pr6N L','Kozuka Gothic Pr6N M','@Kozuka Gothic Pr6N M','Kozuka Gothic Pr6N R','@Kozuka Gothic Pr6N R',
        'Kozuka Mincho Pr6N B','@Kozuka Mincho Pr6N B','Kozuka Mincho Pr6N EL','@Kozuka Mincho Pr6N EL','Kozuka Mincho Pr6N H','@Kozuka Mincho Pr6N H',
        'Kozuka Mincho Pr6N L','@Kozuka Mincho Pr6N L','Kozuka Mincho Pr6N M','@Kozuka Mincho Pr6N M','Kozuka Mincho Pr6N R','@Kozuka Mincho Pr6N R','Letter Gothic Std',
        'Minion Pro','Myriad Hebrew','Myriad Pro','Myriad Pro Cond','Myriad Pro Light','Rosewood Std Fill','Marlett','Arial','Arabic Transparent',
        'Arial Baltic','Arial CE','Arial CYR','Arial Greek','Arial TUR','Batang','@Batang','BatangChe','@BatangChe','Gungsuh','@Gungsuh',
        'GungsuhChe','@GungsuhChe','Courier New','Courier New Baltic','Courier New CE','Courier New CYR','Courier New Greek','Courier New TUR','DaunPenh',
        'DokChampa','Estrangelo Edessa','Euphemia','Gautami','Vani','Gulim','@Gulim','GulimChe','@GulimChe','Dotum','@Dotum','DotumChe','@DotumChe',
        'Impact','Iskoola Pota','Kalinga','Kartika','Khmer UI','Lao UI','Latha','Lucida Console','Malgun Gothic','@Malgun Gothic','Mangal','Meiryo',
        '@Meiryo','Meiryo UI','@Meiryo UI','Microsoft Himalaya','Microsoft JhengHei','@Microsoft JhengHei','Microsoft YaHei','@Microsoft YaHei',
        'MingLiU','@MingLiU','PMingLiU','@PMingLiU','MingLiU_HKSCS','@MingLiU_HKSCS','MingLiU-ExtB','@MingLiU-ExtB','PMingLiU-ExtB','@PMingLiU-ExtB',
        'MingLiU_HKSCS-ExtB','@MingLiU_HKSCS-ExtB','Mongolian Baiti','MS Gothic','@MS Gothic','MS PGothic','@MS PGothic','MS UI Gothic','@MS UI Gothic',
        'MS Mincho','@MS Mincho','MS PMincho','@MS PMincho','MV Boli','Microsoft New Tai Lue','Nyala','Microsoft PhagsPa','Plantagenet Cherokee','Raavi',
        'Segoe Script','Segoe UI','Segoe UI Semibold','Segoe UI Light','Segoe UI Symbol','Shruti','SimSun','@SimSun','NSimSun','@NSimSun',
        'SimSun-ExtB','@SimSun-ExtB','Sylfaen','Microsoft Tai Le','Times New Roman','Times New Roman Baltic','Times New Roman CE','Times New Roman CYR','Times New Roman Greek',
        'Times New Roman TUR','Tunga','Vrinda','Shonar Bangla','Microsoft Yi Baiti','Tahoma','Microsoft Sans Serif','Angsana New','Aparajita','Cordia New',
        'Ebrima','Gisha','Kokila','Leelawadee','Microsoft Uighur','MoolBoran','Symbol','Utsaah','Vijaya','Wingdings','Andalus','Arabic Typesetting','Simplified Arabic',
        'Simplified Arabic Fixed','Sakkal Majalla','Traditional Arabic','Aharoni','David','FrankRuehl','Levenim MT','Miriam','Miriam Fixed',
        'Narkisim','Rod','FangSong','@FangSong','SimHei','@SimHei','KaiTi','@KaiTi','AngsanaUPC','Browallia New','BrowalliaUPC','CordiaUPC','DilleniaUPC','EucrosiaUPC',
        'FreesiaUPC','IrisUPC','JasmineUPC','KodchiangUPC','LilyUPC','DFKai-SB','@DFKai-SB','Lucida Sans Unicode','Arial Black','Calibri','Cambria',
        'Cambria Math','Candara','Comic Sans MS','Consolas','Constantia','Corbel','Franklin Gothic Medium','Gabriola','Georgia','Palatino Linotype',
        'Segoe Print','Trebuchet MS','Verdana','Webdings','Haettenschweiler','MS Outlook','Book Antiqua','Century Gothic','Bookshelf Symbol 7',
        'MS Reference Sans Serif','MS Reference Specialty','Bradley Hand ITC','Freestyle Script','French Script MT','Juice ITC','Kristen ITC',
        'Lucida Handwriting','Mistral','Papyrus','Pristina','Tempus Sans ITC','Garamond','Monotype Corsiva','Agency FB','Arial Rounded MT Bold','Blackadder ITC',
        'Bodoni MT','Bodoni MT Black','Bodoni MT Condensed','Bookman Old Style','Calisto MT','Castellar','Century Schoolbook','Copperplate Gothic Bold','Copperplate Gothic Light',
        'Curlz MT','Edwardian Script ITC','Elephant','Engravers MT','Eras Bold ITC','Eras Demi ITC','Eras Light ITC','Eras Medium ITC','Felix Titling',
        'Forte','Franklin Gothic Book','Franklin Gothic Demi','Franklin Gothic Demi Cond','Franklin Gothic Heavy','Franklin Gothic Medium Cond','Gigi',
        'Gill Sans MT','Gill Sans MT Condensed','Gill Sans Ultra Bold','Gill Sans Ultra Bold Condensed','Gill Sans MT Ext Condensed Bold','Gloucester MT Extra Condensed',
        'Goudy Old Style','Goudy Stout','Imprint MT Shadow','Lucida Sans','Lucida Sans Typewriter','Maiandra GD','OCR A Extended','Palace Script MT',
        'Perpetua','Perpetua Titling MT','Rage Italic','Rockwell','Rockwell Condensed','Rockwell Extra Bold','Script MT Bold','Tw Cen MT','Tw Cen MT Condensed',
        'Tw Cen MT Condensed Extra Bold','Algerian','Baskerville Old Face','Bauhaus 93','Bell MT','Berlin Sans FB','Berlin Sans FB Demi','Bernard MT Condensed',
        'Bodoni MT Poster Compressed','Britannic Bold','Broadway','Brush Script MT','Californian FB','Centaur','Chiller','Colonna MT','Cooper Black',
        'Footlight MT Light','Harlow Solid Italic','Harrington','High Tower Text','Jokerman','Kunstler Script','Lucida Bright','Lucida Calligraphy','Lucida Fax',
        'Magneto','Matura MT Script Capitals','Modern No. 20','Niagara Engraved','Niagara Solid','Old English Text MT','Onyx','Parchment','Playbill',
        'Poor Richard','Ravie','Informal Roman','Showcard Gothic','Snap ITC','Stencil','Viner Hand ITC','Vivaldi','Vladimir Script','Wide Latin','Century',
        'Wingdings 2','Wingdings 3','Arial Unicode MS','@Arial Unicode MS','Arial Narrow','Rupee Foradian','Rupee','DevLys 010','Calibri Light',
        'Monoton','Ubuntu Medium','Ubuntu','Ubuntu Light','Yatra One','HelvLight','Lato','Great Vibes']
        font_data_list.forEach(element => {
            let opt = document.createElement("option")
            opt.innerHTML = element
            opt.setAttribute("value",element)
            selecttag.appendChild(opt)
        });
        selecttag.value=font_style
        txt_content.appendChild(selecttag)
        selecttag.addEventListener("change",() => {
            font_style = selecttag.options[selecttag.selectedIndex].value
            let tx = document.getElementsByTagName("textarea").length
            for (let index = 0; index < tx; index++) {
                document.getElementsByTagName("textarea")[index].style.fontFamily=font_style
            }
        })
        // utf
        let utf8label = document.createElement("h3")
        utf8label.innerHTML = "Character Encoding (UTF-8) -"
        utf8label.setAttribute("style",`color:white;font-size:1.3em;font-family:consolas;margin:10px`)
        txt_content.appendChild(utf8label)
        
        let utf_check = document.createElement("input")
        utf_check.type="checkbox"
        utf_check.style.width=2+'em'
        utf_check.style.height=2+'em'
        utf_check.setAttribute("id","utf_change")
        utf_check.addEventListener("click", () => {
            if(utf_check.checked == true){
                UTF = true
            }
            else{
                UTF = false
            }
        })
        utf_check.checked = UTF
        txt_content.appendChild(utf_check)
        // Line Height
        let line_height_label = document.createElement("h3")
        line_height_label.innerHTML = "Line Height -"
        line_height_label.setAttribute("style",`color:white;font-size:1.3em;font-family:consolas;margin:10px`)
        txt_content.appendChild(line_height_label)

        let line_height_input = document.createElement("input")
        line_height_input.type="number"
        line_height_input.setAttribute("min",1)
        line_height_input.setAttribute("step",0.2)
        line_height_input.setAttribute("max",10)
        line_height_input.setAttribute("value",line_Height)
        line_height_input.setAttribute("style",`font-size:1.3em;font-family:arial;padding:0px;margin:2px;outline:none;border:1px solid black;cursor:pointer`)
        line_height_input.addEventListener("change", () => {line_Height = line_height_input.value})
        txt_content.appendChild(line_height_input)

        // Word Height
        let word_height_label = document.createElement("h3")
        word_height_label.innerHTML = "Letter Height -"
        word_height_label.setAttribute("style",`color:white;font-size:1.3em;font-family:consolas;margin:10px`)
        txt_content.appendChild(word_height_label)

        let word_height_input = document.createElement("input")
        word_height_input.type="number"
        word_height_input.setAttribute("min",0)
        word_height_input.setAttribute("step",0.2)
        word_height_input.setAttribute("max",3)
        word_height_input.setAttribute("value",line_Height)
        word_height_input.setAttribute("style",`font-size:1.3em;font-family:arial;padding:0px;margin:2px;outline:none;border:1px solid black;cursor:pointer`)
        word_height_input.addEventListener("change", () => {word_height = word_height_input.value})
        txt_content.appendChild(word_height_input)

        
        // Word Wrap
        let word_Wrap_label = document.createElement("h3")
        word_Wrap_label.innerHTML = "Word Wrap -"
        word_Wrap_label.setAttribute("style",`color:white;font-size:1.3em;font-family:consolas;margin:10px`)
        txt_content.appendChild(word_Wrap_label)

        
        let WRAP_check = document.createElement("input")
        WRAP_check.type="checkbox"
        WRAP_check.style.width=2+'em'
        WRAP_check.style.height=2+'em'
        WRAP_check.setAttribute("id","wrap_change")
        WRAP_check.addEventListener("click", () => {
            if(WRAP_check.checked == true){
                WRAp = true
            }
            else{
                WRAp = false
            }
        })
        WRAP_check.checked = WRAp
        txt_content.appendChild(WRAP_check)
        
        document.getElementById("contentbody").appendChild(txt_content)
        
        close_tab.addEventListener("click", () => {
            Close_TAB_EVENT(no)
            document.getElementById("settingsbtn").disabled = false
            document.getElementById("settingsbtn").style.color="white"
        })
        TabClickEvent(no)
    })

    // show file details
    document.getElementById("file_detail_show").addEventListener("click", () => {ipcRenderer.send("showfiles",{names,paths,exts,fsize})})

    ipcRenderer.on("show_details_now", (e,arr) => {
        document.getElementById("showname").innerHTML = arr.names
        document.getElementById("showpath").innerHTML = arr.paths
        document.getElementById("showext").innerHTML = arr.exts
        document.getElementById("showsize").innerHTML = arr.fsize + ' bytes'
        document.getElementById("showdetails").setAttribute("style","position: absolute;top: 2em;background-color: rgba(49, 49, 49, 0.7);height: 100%;width: 100%;align-items: center;transition: 0.7s;transform: rotateY(0deg)")
    })

    document.getElementById("closedetails").addEventListener("click", () => {document.getElementById("showdetails").setAttribute("style","position: absolute;top: 2em;background-color: rgba(49, 49, 49, 0.7);height: 100%;width: 100%;align-items: center;transition: 0.7s;transform: rotateY(90deg);")})

    // tooltips
    let tooltip_tags = ["newbtn","openbtn","savebtn","modifybtn","explorerbtn","plusbtn","minusbtn","showExplorer","settingsbtn","file_detail_show","fullscrrenbtn","explorerhead","reset_explorer","findbtn","hidebarbtn","terminalbtn","helpbtn"]
    tooltip_tags.forEach(element => {
        document.getElementById(element).addEventListener("mouseover", (e) => {
            if(element==tooltip_tags[0]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "New File (Ctrl + N)"
            }
            else if(element==tooltip_tags[1]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Open File (Ctrl + O)"
            }
            else if(element==tooltip_tags[2]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Save File (Ctrl + S)"
            }
            else if(element==tooltip_tags[3]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Modify File (F1)"
            }
            else if(element==tooltip_tags[4]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Add Folder in Workshop (Ctrl + Shift + A)"
            }
            else if(element==tooltip_tags[5]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Increase Font / Image Size (Ctrl + '+')"
            }
            else if(element==tooltip_tags[6]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Decrease Font / Image Size (Ctrl + '-')"
            }
            else if(element==tooltip_tags[7]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Show Explorer"
            }
            else if(element==tooltip_tags[8]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Settings (Ctrl + Shift + S)"
            }
            else if(element==tooltip_tags[9]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "File Details (F2)"
            }
            else if(element==tooltip_tags[10]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Full Screen Mode (F5)"
            }
            else if(element==tooltip_tags[11]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Hide Explorer"
            }
            else if(element==tooltip_tags[12]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Reset WorkShop"
            }
            else if(element==tooltip_tags[13]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Replace"
            }
            else if(element==tooltip_tags[14]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Hide SideBar"
            }
            else if(element==tooltip_tags[15]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Terminal"
            }
            else if(element==tooltip_tags[16]){
                let locs = document.getElementById(element).getBoundingClientRect()
                document.getElementById("tooltip_div").setAttribute("style",`top:${locs.top};left:${locs.right}`)
                document.getElementById("tooltip_div").style.display="block"
                document.getElementById("tooltip_div").innerHTML = "Help"
            }
        })
        document.getElementById(element).addEventListener("mouseleave",()=>{document.getElementById("tooltip_div").style.display="none"})
    });

    // reset all folder
    document.getElementById("reset_explorer").addEventListener("click", () => {
        let x = document.getElementById("explorer_frame")
        while(x.lastElementChild){
            x.removeChild(x.lastElementChild)
        }
    })

    // terminal
    document.getElementById("terminalbtn").addEventListener("click", () => {
        if(paths){
            cmds.exec(`start cmd.exe /K cd ${path.dirname(paths)}`)
        }
        else{
            cmds.exec(`start cmd.exe /K cd/`)
        }
    })
    
    let initialfinds = 0
    // replace window open
    document.getElementById("findbtn").addEventListener("click", () => {
        document.getElementById("find_Replace").style.transition = 1+'s'
        document.getElementById("find_Replace").style.display="block"
    })

    // replace window close
    document.getElementById("close_find_btn").addEventListener("click", () => {
        document.getElementById("find_Replace").style.transition = 1+'s'
        document.getElementById("find_Replace").style.display="none"
        initialfinds = 0
        document.getElementById("Findvalue").value=""
        document.getElementById("Replacevalue").value = ""
        document.getElementById("FVALUE").value = ""
    })

    // Replace button dunction
    document.getElementById("replacebtn").addEventListener("click", () => {
        let x = document.getElementById(`txt${current_tab}`)
        if(x.tagName=="TEXTAREA"){
            let temp = document.getElementById(`txt${current_tab}`).value
            let from = new RegExp(document.getElementById("Findvalue").value,"i")
            let to = document.getElementById("Replacevalue").value
            document.getElementById(`txt${current_tab}`).value = temp.replace(from,to)
        }
    })

    // Replace All button dunction
    document.getElementById("replaceAllbtn").addEventListener("click", () => {
        let x = document.getElementById(`txt${current_tab}`)
        if(x.tagName=="TEXTAREA"){
            let temp = document.getElementById(`txt${current_tab}`).value
            let from = new RegExp(document.getElementById("Findvalue").value,"ig")
            let to = document.getElementById("Replacevalue").value
            document.getElementById(`txt${current_tab}`).value = temp.replaceAll(from,to)
        }
    })

    // find button
    document.getElementById("fb").addEventListener("click", () => {
        let src = document.getElementById("FVALUE").value.toLowerCase()
        let data = document.getElementById(`txt${current_tab}`).value.toLowerCase()
        let ind = `${data}`.indexOf(src,initialfinds)
        initialfinds = ind+1
        document.getElementById(`txt${current_tab}`).focus()
        document.getElementById(`txt${current_tab}`).setSelectionRange(ind,ind+src.length,"forward")

        const fullText = document.getElementById(`txt${current_tab}`).value;
        document.getElementById(`txt${current_tab}`).value = fullText.substring(0, ind);
        document.getElementById(`txt${current_tab}`).scrollTop = document.getElementById(`txt${current_tab}`).scrollHeight;
        document.getElementById(`txt${current_tab}`).value = fullText;

        document.getElementById(`txt${current_tab}`).setSelectionRange(ind,ind+src.length,"forward")
    })

    // help 
    document.getElementById("helpbtn").addEventListener("click", () => {ipcRenderer.send("helpwin")})

    // shortcut keys
    window.addEventListener("keydown",(e) => {

        // new file
        if(e.ctrlKey && e.key=='n'){
            TAB_NUMBER = TAB_NUMBER + 1
            let no = TAB_NUMBER
            let Button_frame = document.createElement("div")
            let tab_text = document.createElement("button")
            let close_tab = document.createElement("button")

            // for tab button
            tab_text.setAttribute("id",`tab${no}`)
            tab_text.setAttribute("class",`tabbtn`)
            tab_text.setAttribute("style","height:100%;font-size:medium;margin:0px;background-color:transparent;border:0px;color:rgb(150,150,150);cursor: pointer;")
            tab_text.innerHTML = `Untitled-${no}`
            tab_text.addEventListener("click",()=>{TabClickEvent(no)})
            
            close_tab.innerHTML = "❌"
            close_tab.setAttribute("id",`closeTAB${no}`)
            close_tab.setAttribute("style","height:100%;font-size:medium;margin:0px;padding:0px;background-color:transparent;border:0px;cursor: pointer;")

            Button_frame.appendChild(tab_text)
            Button_frame.appendChild(close_tab)
            Button_frame.setAttribute("id",`tabdiv${no}`)
            Button_frame.setAttribute("class",`tabdiv`)
            Button_frame.setAttribute("style","background-color:rgb(45,45,45);width:fit-content")
            document.getElementById("TabFrame").appendChild(Button_frame)

            // for Tab Content
            let txt_content = document.createElement("div")
            let txt = document.createElement("textarea")

            txt.setAttribute("id",`txt${no}`)
            txt.setAttribute("spellcheck",false)
            txt.setAttribute("style",`height:100%;width:100%;font-size:${font_size}em;line-height:1em;color:white;background-color:rgb(30,30,30);outline:none;font-family:${font_style};border:0px;white-space:nowrap;resize:none;cursor:auto`)
            txt.addEventListener("keydown",(e) => {
                if ( e.key === 'Tab' && !e.shiftKey ) {
                    document.execCommand('insertText', false, "\t");
                    e.preventDefault();
                }
            })
            txt.addEventListener("input",() => {
                let str = document.getElementById(`txt${no}`).value
                let words = str.trim().split(/\s+/)
                let loc = str.substr(0, txt.selectionStart).split("\n").length
                document.getElementById("status").innerHTML=`Words:${words.length}\t\t\tLetters:${str.length}\t\t\tCursor:${loc}`
            })

            txt_content.setAttribute("id",`txtcontainer${no}`)
            txt_content.setAttribute("class",`txtcontainer`)
            txt_content.appendChild(txt)
            document.getElementById("contentbody").appendChild(txt_content)

            close_tab.addEventListener("click", () => {
                Close_TAB_EVENT(no)
            })
            TabClickEvent(no)
        }

        // open file
        if(e.ctrlKey && e.key=="o"){
            ipcRenderer.send("openfile")
        }

        // save file
        if(e.ctrlKey && e.key=="s"){
            ipcRenderer.send("savefile",{data:document.getElementById(`txt${current_tab}`).value})
        }

        // increase font size
        if(e.ctrlKey && e.key=="+"){
            if(document.getElementById(`txt${current_tab}`).tagName == "TEXTAREA"){
                let ts = parseFloat(document.getElementById(`txt${current_tab}`).style.fontSize)
                document.getElementById(`txt${current_tab}`).style.fontSize=ts+0.2+'em'
            }
            if(document.getElementById(`txt${current_tab}`).tagName == "EMBED"){
                let h = document.getElementById(`txt${current_tab}`).clientHeight
                let w = document.getElementById(`txt${current_tab}`).clientWidth
                document.getElementById(`txt${current_tab}`).setAttribute("style",`height:${h*1.2};width:${w*1.2}`)
            }
        }

        // Decrease font size
        if(e.ctrlKey && e.key=="-"){
            if(document.getElementById(`txt${current_tab}`).tagName == "TEXTAREA"){
                let ts = parseFloat(document.getElementById(`txt${current_tab}`).style.fontSize)
                document.getElementById(`txt${current_tab}`).style.fontSize=ts-0.2+'em'
            }
            if(document.getElementById(`txt${current_tab}`).tagName == "EMBED"){
                let h = document.getElementById(`txt${current_tab}`).clientHeight
                let w = document.getElementById(`txt${current_tab}`).clientWidth
                document.getElementById(`txt${current_tab}`).setAttribute("style",`height:${h/1.2};width:${w/1.2}`)
            }
        }

        // Add folder in explorer
        if(e.ctrlKey && e.shiftKey && e.key=="A"){
            ipcRenderer.send("openfolder")
        }

        // file details
        if(e.key=="F2"){ipcRenderer.send("showfiles",{names,paths,exts,fsize})}

        // full screen
        if(e.key=="F5"){ipcRenderer.send("fullscreenmode")}

        // settings
        if(e.ctrlKey && e.shiftKey && e.key=="S"){document.getElementById("settingsbtn").click()}

        // modify
        if(e.key=="F1"){document.getElementById("modifybtn").click()}

        // close Tab
        if(e.shiftKey && e.key == "F4"){
            if(typeof(document.getElementById(`closeTAB${current_tab}`)))
            {document.getElementById(`closeTAB${current_tab}`).click()}
        }
    })
})