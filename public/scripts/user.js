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

async function postToServer(path, data){
    return new Promise((res, rej) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(){
            if(this.readyState==4 && this.status==200){
                res(JSON.parse(this.status))
            }
        }
        xhttp.open("POST", `http://${location.hostname+":"+location.port}/${path}`, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(data));
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

async function getReservations(stadium_id){
    return (await fetchFromServer(`reservations/${stadium_id}`));
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

    const list = document.getElementById("stadium-list");
    if(list==null || list==undefined) return false;
    
    const data = await fetchStadiums();

    if(data.length==0) {
        const p = document.getElementById("zero-entries");
        p.innerText = "No stadiums found."
        return;
    }

    const title = document.getElementById("title");
    title.append(" ("+data.length+")")

    const keys = Object.keys(data.at(0));
    data.forEach((stadium, i) => {
        const li = document.createElement("li");
        const img = document.createElement("img");
        img.src = stadium.image;
        const p = document.createElement("p");
        p.innerText = stadium.name;
        li.appendChild(img);
        li.appendChild(p);
        li.setAttribute('data-selected', false);
        li.setAttribute('data-stadium_id', stadium.id);
        applyItemListener(li, stadium, list, hideStadium, showStadium);
        list.appendChild(li);
    })
}

function applyItemListener(row, data, parent, hide, show){
    row.addEventListener('click', ev => {
        const target = ev.currentTarget;
        let clicked = target.dataset.selected;
        if(clicked==="true"){
            target.setAttribute('data-selected', false);
            hide();
        }else{
            if(row.dataset.reserved=="true") return;
            Array.from(parent.children).forEach(row => {
                if(row.dataset.selected=="false")return;
                row.setAttribute('data-selected', false);
            })
            show(data)
            target.setAttribute('data-selected', true);
        }
    })
}

function hideStadium(){
    const el = document.getElementById("selected-stadium");
    el.setAttribute('data-show', 'false')
}


async function showStadium(data){
    const el = document.getElementById("selected-stadium");
    el.setAttribute('data-show', 'true')
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
    
    const title = document.getElementById("stadium-title");
    title.innerText = data.name+", "+data.location;
    const schedule = document.getElementById("schedule");
    while(schedule.hasChildNodes()){
        schedule.removeChild(schedule.firstChild)
    }
    const reservations = await getReservations(data.id);
    const times = ((parseInt(data.available_to) - parseInt(data.available_from))*60)/(parseInt(data.game_length));
    for(let i=0; i<times; i++){
        const li = document.createElement("li");
        const p = document.createElement("p");
        let from = `${data.available_from+((i*data.game_length)/60)}`;
        from = formatTime(from);
        let to = i==times-1 ? data.available_to : data.available_from+(((i+1)*data.game_length)/60);
        to = formatTime(`${to}`);
        p.innerText = `${from} - ${to}`;
        li.appendChild(p);
        li.setAttribute('data-time_slot', i);
        if(reservations.some(item => item.time_slot==i)){
            li.setAttribute('data-reserved', true);
        }else{
            li.setAttribute('data-reserved', false);
        }
        applyItemListener(li, data, schedule, ()=>{}, ()=>{});
        schedule.appendChild(li);
    }
}

function reserveTimeSlot(){
    const stadium = document.querySelector("#stadium-list [data-selected='true']");
    const stadium_id= stadium.dataset.stadium_id;
    const item = document.querySelector("[data-selected='true'][data-reserved='false']")
    if(item==null || item==undefined) return;
    const time_slot = item.dataset.time_slot;
    const data = {stadium_id, time_slot};
    postToServer('reservation', data).then(
        status => {
            if(status==200){
                item.setAttribute('data-reserved', true);
            }
        }
    )
}

function formatTime(arg){
    let time = arg;
    const timeArr = time.split(".");
    if(timeArr[1]==undefined){
        timeArr[0].length==1 ? time = "0"+timeArr[0]+":00" :time = timeArr[0]+":00";
    }else{
        let minutes = (parseInt(timeArr[1])*0.6)*10;
        minutes = minutes.toString().length==1 ? "0"+minutes : minutes;
        timeArr[0].length==1 ? time= "0"+timeArr[0]+":"+minutes :time = timeArr[0]+":"+minutes;
    }
    return time;
}