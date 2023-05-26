function logout(){
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText)
        }   
    }
    xhttp.open('GET', 'http://127.0.0.1:3000/logout');
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

async function fetchFromServer(path){
    return new Promise((res, rej) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if(this.readyState==4 && this.status==200){
                res(JSON.parse(this.responseText))
            }
        }
        xhttp.open("GET", `http://${location.hostname+":"+location.port}/${path}`, true);
        xhttp.send();
    });
}

async function fetchStadiums(){
    return (await fetchFromServer("stadiums"));
}

async function fetchUsername(){
    return (await fetchFromServer("username"));
}

async function fetchUserType(){
    return (await fetchFromServer("user-type"));
}


async function getUsername(){
    const username = document.getElementById("username");
    username.innerText = await fetchUsername();
}

const UserTypes = ["Merchant", "Admin", "User"];

async function getUserType(){

    const type = await fetchUserType();
    if(type==UserTypes[0]){
        applyMerchantPaylod();
    }
}

async function applyMerchantPaylod(){
    const btns = document.getElementById("nav-btns");
    const form = document.createElement("form");
    form.setAttribute('action', '/stadium-creation');
    form.setAttribute('method', 'POST');
    const btn = document.createElement("button");
    btn.setAttribute('type', 'submit');
    btn.setAttribute('class', 'btn');
    form.appendChild(btn);
    btn.innerText = "Create a Stadium";
    btns.insertBefore(form, btns.children[0]);
}

window.addEventListener('load', (ev) => {
    const success = populateData();
    getUsername();
    getUserType();
})

async function populateData(){

    const table = document.getElementById("stadiums-table");
    if(table==null || table==undefined) return false;
    
    const data = await fetchStadiums();

    if(data.length==0) {
        const p = document.getElementById("zero-entries");
        p.innerText = "No stadiums found."
        return;
    }

    const keys = Object.keys(data.at(0));

    for(let i=0;i<keys.length;i++){
        const th = document.createElement("th");
        const thText = document.createTextNode(keys[i].replaceAll("_", ' ').replaceAll("url", ""));
        th.appendChild(thText);
        table.appendChild(th);
    }

    for(let i =0; i< data.length;i++){
        const row = document.createElement("tr");
        for(let j=0;j<keys.length;j++){
            const cell = document.createElement("td");
            const cellText = document.createTextNode(
                data[i][keys[j]]
            );
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        row.setAttribute('data-selected', false)
        applyRowListener(row, data[i])
        table.appendChild(row);
    }
}

function applyRowListener(row, data){
    row.addEventListener('click', ev => {
        const target = ev.currentTarget;
        let clicked = target.dataset.selected;
        if(clicked==="true"){
            target.setAttribute('data-selected', false);
            hideStadium();
        }else{
            Array.from(document.getElementById("stadiums-table").rows).forEach(row => {
                if(row.dataset.selected==false)return;
                row.setAttribute('data-selected', false);
            })
            showStadium(data)
            target.setAttribute('data-selected', true);
        }
    })
}

function hideStadium(){
    const el = document.getElementById("selected-stadium");
    el.setAttribute('data-show', 'false')
}

function dataURLToBlob(dataurl) {
    let arr = dataurl.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

function showStadium(data){
    const el = document.getElementById("selected-stadium");
    el.setAttribute('data-show', 'true')
    const img = document.getElementById("stadium-image");
    img.src = data.image;
    const title = document.getElementById("stadium-title");
    title.innerText = data.name;
    const details = document.getElementById("stadium-details");
    details.childNodes.forEach(item => details.removeChild(item))
    const p1 = document.createElement("p");
    p1.innerText = data.sport;
    const p2 = document.createElement("p");
    p2.innerText=data.type;
    const p3 = document.createElement("p");
    p3.innerText=data.price_total+"EUR";
    details.append(p1,p2,p3)
}