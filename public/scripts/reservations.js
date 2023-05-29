
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
    p.innerHTML = `<span>Reservation date:</span> <date>${reservation.date}</date>`;
    const p2 = document.createElement("p");
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
    });
    p2.innerText = `${stadium.sport} - ${stadium.type} - ${formatter.format(stadium.price_total)}€`;
    div.appendChild(p2);
    div.appendChild(p);
    li.appendChild(div);
    list.appendChild(li);
}

function formatDate(date){
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth()+1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


window.addEventListener('load', async (ev) => {
    await fetchReservations();
});