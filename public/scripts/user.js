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
            res(JSON.parse(this.responseText).Stadiums)
        }
    }
        xhttp.open("GET", "http://127.0.0.1:8080/data/reservations.json", true);
        xhttp.send();
    })
}

window.addEventListener('load', (ev) => {
    const success = populateData();
})

async function populateData(){

    const table = document.getElementById("stadiums-table");
    if(table==null || table==undefined) return false;
    
    const data = await fetchReservations();

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
                keys[j]=="reservable_at" ? 
                data[i][keys[j]]["from"]+"-"+data[i][keys[j]]["to"]: 
                data[i][keys[j]]
            );
            cell.appendChild(cellText);
            row.appendChild(cell);
        }
        row.setAttribute('data-selected', false)
        applyRowListener(row)
        table.appendChild(row);
    }
}

function applyRowListener(row){
    row.addEventListener('click', ev => {
        const target = ev.currentTarget;
        let clicked = target.dataset.selected;
        if(clicked==="true"){
            target.setAttribute('data-selected', false);
        }else{
            Array.from(document.getElementById("stadiums-table").rows).forEach(row => {
                if(row.dataset.selected==false)return;
                row.setAttribute('data-selected', false);
            })
            target.setAttribute('data-selected', true);
        }
    })
}