import allTickets from './tickets.js'

function mainLoop(){
    if(!gameState.pause){
        if(inMainLoop === true){
            console.error('mainLoop called while processing loop. There may be slowdowns');
        }
        inMainLoop = true;
        console.log('doing loop');
        redrawStats();
        generateTickets();
        inMainLoop = false;
    }
}

function redrawStats(){
    player.anxiety += gameState.anxietyPerTick;

    document.getElementById('player_happiness').innerText = Math.floor(player.happiness);
    document.getElementById('player_anxiety').innerText = Math.floor(player.anxiety);
}

function generateTickets(){
    if(Math.random() > 0.9) {
        lastTicket++;
        const avTicket = Math.floor(Math.random() * availableTickets.length);
        const realTicketId = availableTickets[avTicket];
        const realTicket = allTickets[realTicketId];
        const ticket = {
            'id': realTicket.id,
            'clicks': realTicket.clicks
        };
        nowTickets[lastTicket] = ticket;
        gameState.anxietyPerTick += realTicket.anxietyPerTick;
        drawLastTicket(lastTicket);
        if(realTicket.unique) availableTickets.splice(realTicketId);
    }
}

function drawLastTicket(ticketNumber){
    const newTicket = document.createElement('div');
    const ticket = nowTickets[ticketNumber];
    const realTicket = allTickets[nowTickets[ticketNumber].id];
    newTicket.innerHTML = `
    <div class="list-group">
    <a href="#" class="list-group-item list-group-item-action flex-column align-items-start" style="padding: 0.25rem 0.75rem;">
      <div class="d-flex w-100 justify-content-between">
        <h5 class="mb-1">${realTicket.title}</h5>
      </div>
      <p class="mb-1" id="${ticketNumber + 'clicks'}">CLICKS LEFT ${ticket.clicks}</p>
      <p class="mb-1" >anx+ ${realTicket.anxietyPerTick} anx- ${realTicket.anxietyRelief} hap+ ${realTicket.happinessRelief}</p>
    </a>
    </div>
  `;
    newTicket.id = ticketNumber;
    newTicket.addEventListener('click',function(){
        if(!gameState.pause) {
            nowTickets[this.id].clicks--;
            this.childNodes[1].childNodes[1].childNodes[3].innerText = `CLICKS LEFT ${ticket.clicks}`;
            if(nowTickets[this.id].clicks === 0){
                const realTicket = allTickets[nowTickets[ticketNumber].id];
    
                // player or gamestate changes
                gameState.anxietyPerTick -= realTicket.anxietyPerTick;
                player.anxiety -= realTicket.anxietyRelief;
                player.happiness += realTicket.happinessRelief;
    
                // Available tickets changes
                if(realTicket.unlocks) {
                    for(let i=0; i<realTicket.unlocks.length; i++) {
                        availableTickets.push(realTicket.unlocks[i]);
                    }
                }
       
                // UI changes
                const parentId = this.parentElement.id.substring(3); // from pos##
                this.parentElement.removeChild(this);
                openPos.push(parseInt(parentId));
        
            }
        }
    });

    // losing condition: full tickets
    if(openPos.length == 0){
        gameState.loss = true;
        document.getElementById('lost-alert-tickets').style = 'display: block;';
        gameState.pause = true;
    }
    const arrPos = Math.floor(Math.random() * openPos.length);
    const pos = openPos[arrPos];
    document.getElementById('pos'+pos).appendChild(newTicket);
    openPos.splice(arrPos,1);
}

let openPos = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
const availableTickets = [1,2,3,5];

let lastTicket = 0;
const nowTickets = {};
var inMainLoop = false;
const gameState = {
    anxietyPerTick : 0,
    pause: false
};

var player = {
    anxiety : 0,
    happiness : 200
};

document.getElementById('pause_button').addEventListener('click',function(){
    gameState.pause = !gameState.pause;
    if(gameState.pause) {
        document.getElementById('pause-alert').style = 'display: block;'
    }else {
        document.getElementById('pause-alert').style = 'display: none;'
    }
})


// Here we set the game loop
// if this game loop is janky, we should change it for something like what is explained here http://nokarma.org/2011/02/02/javascript-game-development-the-game-loop/index.html
var interval = setInterval(mainLoop, 1000/5); 
