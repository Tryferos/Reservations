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

async function fetchReservations(){
    return new Promise((res, rej) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
        if(this.readyState==4 && this.status==200){
            res(JSON.parse(this.responseText))
        }
    }
    console.log(location.hostname+location.port);
        xhttp.open("GET", `http://${location.hostname+":"+location.port}/stadiums`, true);
        xhttp.send();
    })
}

async function fetchUsername(){
    return new Promise((res, rej) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if(this.readyState==4 && this.status==200){
                res(JSON.parse(this.responseText).username)
            }
        }
        xhttp.open("GET", `http://${location.hostname+":"+location.port}/username`, true);
        xhttp.send();
    });
}

async function getUsername(){
    const username = document.getElementById("username");
    username.innerText = await fetchUsername();
}

window.addEventListener('load', (ev) => {
    const success = populateData();
    getUsername();
})

async function populateData(){

    const table = document.getElementById("stadiums-table");
    if(table==null || table==undefined) return false;
    
    const data = await fetchReservations();

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

function showStadium(data){
    const el = document.getElementById("selected-stadium");
    el.setAttribute('data-show', 'true')
    const img = document.getElementById("stadium-image");
    img.src = data.photo_url;
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