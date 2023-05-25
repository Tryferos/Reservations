function onCapacityChange(target){
    const value = target.value;
    const capacity = document.getElementById("capacity-sec");
    capacity.value = value;    
}

function onImageSelect(target){
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = function(e){
        const img = document.getElementById("stadium-image");
        img.src = e.target.result;
        img.style.display = "block";
    }
    reader.readAsDataURL(file);
}


