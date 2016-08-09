 
//declaram variabilele globale pe care le vom folosi in continuare.
var lat = 0;
var lng = 0;
var map = 0;
var marker = 0;
var status = 0;


//prin functia getLocation obtinem coordonatele geografice ale punctului in care ne aflam
function getLocation() {
    if (navigator.geolocation) {
	   navigator.geolocation.getCurrentPosition(centerMap);
	} else { 
    alert("Geolocation is not supported by this browser.");
    }
}
getLocation();

// functia centerMap 1) initializeaza si centreaza harta pe pozitia noastra actuala; 2) creeaza popup-ul de control. 
function centerMap(position){
	lat = position.coords.latitude;
	lng = position.coords.longitude;

    map = L.map('map', {
        center: [lat, lng],
        zoom: 16            
        });
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    //popup-ul de control (cu butoane).
    L.popup({closeOnClick: false})
    .setLatLng([lat, lng])
    .setContent("<p class='text'>You are <b>HERE</b>!</br></br>What do you want to do?</p><button class='text' onclick='writeStatus()'>Check-in</button><button class='text' onclick='readStatus()';>See friends' check-ins</button>")
    .openOn(map);
}


// un obiect in care vom stoca numele si statusul introduse in input, precum si coordonatele geografice.
var myData = {
    name: '',
    status: '',
	location: ''
};

//functia writeStatus va cere userului numele si statusul, si le va scrie pe server, atunci cand acesta face check-in.

var writeStatus = function() {

    //cheia care va fi folosita cand vom scrie in baza de date.
     do{
        if (localStorage["Nume"] === null || localStorage["Nume"] === "null" || localStorage["Nume"] === "") 
            {
                localStorage["Nume"] = prompt("Please enter your NAME below:");
            }
        else{
                localStorage["Nume"] = prompt("Confirm your name or modify it accordingly:", localStorage["Nume"]);
            }
        }
    while(localStorage["Nume"] === null || localStorage["Nume"] === undefined || localStorage["Nume"] === "");
    myKey=localStorage["Nume"];
  
    do{status = prompt("Please enter your STATUS below:")}
    while(status === null || status === undefined || status === "");
    
    // salvam valorile input-urilor in cadrul obiectului myData
    myData.name = localStorage["Nume"];
    myData.status = status;
    myData.location = [lat, lng];
    
      //popup-ul de control (cu butoane).
    L.popup({closeOnClick: false})
    .setLatLng([myData.location[0], myData.location[1]])
    .setContent("<p class='text'>You have <b>succesfully CHECKED-IN</b> at this location!</br></br></p><button class='text' onclick='readStatus();'>See what your friends are up to!</button>")
    .openOn(map);
    
    
    // convertim obiectul myData intr-un JSON pe care il salvam intr-o variabila
    var stringifiedData = JSON.stringify(myData);
    
    // call-ul de ajax care scrie in baza de date;
     
    ajax('http://alpha.neti.ro:8080/mgl/db?write=true&db=checkin&table=locatioonnss&key=' + myKey + '&data=' + stringifiedData);
   
    
};
// functia care va citi datele de pe server si va crea markerele cu pozitiile check-in-urilor.
var readStatus = function() {
    ajax('http://alpha.neti.ro:8080/mgl/db?read_all=true&db=checkin&table=locatioonnss', 
        function(rezultat) {         
            nodeList = JSON.parse(rezultat);    
            for(i=0; i<nodeList.length; i++){
            node = nodeList[i];
            var newData=JSON.parse(node.data);
                                
        	marker = L.marker([newData.location[0], newData.location[1]]).addTo(map);
            marker.bindPopup("<b>Nume: </b>" + newData.name + "<br><b>Status: </b>" + newData.status);
            };
         });
  //popup-ul de control (cu butoane).
    L.popup({closeOnClick: false})
    .setLatLng([lat, lng])
    .setContent("<p class='text'>Click on any marker to see friend's name and status!</br></br> If you haven't already, keep your friends updated by <button class='text' onclick='writeStatus()'>Checking-in!</button></p>")
    .openOn(map);
};