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