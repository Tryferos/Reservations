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

const euros = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
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
        if(keys[i]=="image" || keys[i]=="id") continue;
        const th = document.createElement("th");
        const thText = document.createTextNode(keys[i].replaceAll("_", ' '));
        th.appendChild(thText);
        table.appendChild(th);
    }


    for(let i =0; i< data.length;i++){
        const row = document.createElement("tr");
        for(let j=0;j<keys.length;j++){
            if(keys[j]=="image" || keys[j]=="id") continue;
            const cell = document.createElement("td");
            const cellText = document.createTextNode(
                keys[j]!='price_total' ? keys[j]!='game_length' ?  
                keys[j].includes('available') ? `${`${data[i][keys[j]]}`.length==1 ? `0${data[i][keys[j]]}` : data[i][keys[j]]}:00` 
                : data[i][keys[j]] : 
                `${data[i][keys[j]]} minutes`
                :
                euros.format(data[i][keys[j]])
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


function showStadium(data){
    const el = document.getElementById("selected-stadium");
    el.setAttribute('data-show', 'true')
    const img = document.getElementById("stadium-image");
    img.src = data.image;
    const title = document.getElementById("stadium-title");
    title.innerText = data.name;
    const details = document.getElementById("stadium-details");
    while(details.hasChildNodes()){
        details.removeChild(details.firstChild)
    }
    const p1 = document.createElement("p");
    p1.innerText = data.sport;
    const p2 = document.createElement("p");
    p2.innerText=data.type;
    const p3 = document.createElement("p");
    p3.innerText=euros.format(data.price_total);
    const p4 = document.createElement("p");
    p4.innerText=data.game_length+" Minutes";
    details.append(p1,p2,p3,p4)
}