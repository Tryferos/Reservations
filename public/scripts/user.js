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

async function getReservations(stadium_id, day){
    return (await fetchFromServer(`reservations/${stadium_id}/${day}`));
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
        applyItemListener(li, list, hideStadium, showStadium, stadium);
        list.appendChild(li);
    })
}

function applyItemListener(row, parent, hide, show, ...data){
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
            show(...data)
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

    showDates(data);
    await showAvailableReservations(data, getDayOfTheWeek());
}

async function showAvailableReservations(...data){
    const [stadium, day] = data;
    const schedule = document.getElementById("schedule");
    while(schedule.hasChildNodes()){
        schedule.removeChild(schedule.firstChild)
    }
    const reservations = await getReservations(stadium.id, day);
    const times = ((parseInt(stadium.available_to) - parseInt(stadium.available_from))*60)/(parseInt(stadium.game_length));
    for(let i=0; i<times; i++){
        const li = document.createElement("li");
        const p = document.createElement("p");
        let from = `${stadium.available_from+((i*stadium.game_length)/60)}`;
        from = formatTime(from);
        let to = i==times-1 ? stadium.available_to : stadium.available_from+(((i+1)*stadium.game_length)/60);
        to = formatTime(`${to}`);
        p.innerText = `${from} - ${to}`;
        li.appendChild(p);
        li.setAttribute('data-time_slot', i);
        if(reservations.some(item => item.time_slot==i)){
            li.setAttribute('data-reserved', true);
        }else{
            li.setAttribute('data-reserved', false);
        }
        applyItemListener(li, schedule, ()=>{}, ()=>{}, stadium);
        schedule.appendChild(li);
    }
}

function reserveTimeSlot(){
    const stadium = document.querySelector("#stadium-list [data-selected='true']");
    const stadium_id= stadium.dataset.stadium_id;
    const time_slot_item = document.querySelector("[data-selected='true'][data-reserved='false']")
    const day_item = document.querySelector("[data-selected='true'][data-closed='false']");
    if(time_slot_item ==null || time_slot_item ==undefined) return;
    if(day_item ==null || day_item ==undefined) return;
    const time_slot = time_slot_item.dataset.time_slot;
    const date = new Date();
    const day = (parseInt(day_item.dataset.day)-(date.getDate())+date.getDay())%7;
    const data = {stadium_id, time_slot, day};
    postToServer('reservation', data).then(
        status => {
            if(status==200){
                time_slot_item.setAttribute('data-reserved', true);
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

function showDates(data){
    const dates = document.getElementById("dates");
    while(dates.hasChildNodes()){
        dates.removeChild(dates.firstChild)
    }

    const date = new Date();
    let currentDay = date.getDate();
    let currentMonth = date.getMonth()+1;

    let hasSetAvailableDay = false;

    for(let i=0; i<7; i++){
        const li = document.createElement("li")
        li.setAttribute('data-day', `${currentDay+i}`);
        li.setAttribute('id', 'date-item');
        const weekday = (getDayOfTheWeek()+i)%7;
        const isAvailable = data.available_days.some(item => item==weekday);
        li.setAttribute('data-selected', isAvailable && !hasSetAvailableDay ? 'true' : 'false');
        if(isAvailable) hasSetAvailableDay = true;
        const p =document.createElement("p");
        const newDate = new Date(date.getTime()+(i*24*60*60*1000));
        const day = newDate.getDate();
        const month = newDate.getMonth()+1;
        p.innerText = `${day}/${month}`;
        li.appendChild(p);
        li.setAttribute('data-closed', !isAvailable);
        if(isAvailable){
            applyItemListener(li, dates, ()=>{}, showAvailableReservations, data, weekday);
        }
        dates.appendChild(li);  
    } 
}

function getDayOfTheWeek(){
    const date = new Date();
    const day = date.getDay();
    return day;
}
