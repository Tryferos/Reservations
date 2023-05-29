
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

async function fetchReservations(){
    const data = await fetchFromServer("get-reservations");
    if(data.length==0) return;
    data.forEach(async(reservation) => {
        const stadium = await fetchFromServer(`get-stadium/${reservation.stadium_id}`);
        addReservation(stadium, reservation);
    })
}

async function addReservation(stadium, reservation){
    const list = document.getElementById("reservations-list");
    const li = document.createElement("li");  
    li.setAttribute('class', 'reservation-item');
    const d = new Date().getTime();
    const currentDate= d + 24*60*60*1000 + 59*60*1000 + 59*1000;
    if(reservation.date_day>currentDate){
        li.setAttribute('data-past', 'false')
        if((reservation.date_day-currentDate)<(24*60*60*1000)){
            li.setAttribute('data-soon', 'true')
        }else{
            li.setAttribute('data-soon', 'false')
        }
    }else{
        li.setAttribute('data-past', 'true')
    }
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    img.setAttribute('src', stadium.image);
    img.setAttribute('alt', stadium.name);
    const figcaption = document.createElement("figcaption");
    figcaption.innerHTML = `<h3>${stadium.name}, <span>${stadium.location}</span></h3>`;
    fig.appendChild(img);
    fig.appendChild(figcaption);
    li.appendChild(fig);
    const div = document.createElement("div");
    div.setAttribute('class', 'reservation-info');
    const p = document.createElement("p");
    const date = getReservationDate(stadium, reservation);
    p.innerHTML = `<span>Reservation date:</span> <time>${formatDate(date, stadium.game_length)}</time>`;
    const p2 = document.createElement("p");
    p2.innerText = `${stadium.sport} - ${stadium.type} - ${formatPrice(stadium.price_total)}€`;
    div.appendChild(p2);
    div.appendChild(p);
    li.appendChild(div);
    list.appendChild(li);
}

function formatPrice(price){
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
    }).format(price);
}

function getReservationDate(stadium, reservation){
    let date = new Date(reservation.date_day).getTime();
    date -= 23*60*60*1000;
    date -= 59*60*1000;
    date -= 59*1000;
    date += stadium.available_from*60*60*1000;
    date += (stadium.game_length*reservation.time_slot)*60*1000;
    return date
    
}

function formatDate(date, game_length){
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth()+1;
    const day = d.getDate();
    const hours = `${d.getHours()}`.length==1 ? `0${d.getHours()}` : `${d.getHours()}`;
    const minutes = `${d.getMinutes()}`.length==1 ? `0${d.getMinutes()}` : `${d.getMinutes()}`;
    const endDate = new Date(date+(game_length*60*1000));
    const ehours = `${endDate.getHours()}`.length==1 ? `0${endDate.getHours()}` : `${endDate.getHours()}`;
    const eminutes = `${endDate.getMinutes()}`.length==1 ? `0${endDate.getMinutes()}` : `${endDate.getMinutes()}`;
    return `${day}/${month}/${year}, ${hours}:${minutes}-${ehours}:${eminutes}`;
}


window.addEventListener('load', async (ev) => {
    await fetchReservations();
});