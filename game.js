const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const hud={coins:document.getElementById("coins"),lives:document.getElementById("lives"),score:document.getElementById("score")};
const message=document.getElementById("message"),startBtn=document.getElementById("startBtn");

let W,H,dpr,started=false,last=0,camX=0,coins=0,score=0,lives=3,won=false;
const keys={left:false,right:false,jump:false};
const worldW=5200, groundY=0;
const platforms=[
 {x:0,y:560,w:900,h:80},{x:1050,y:560,w:850,h:80},{x:1980,y:560,w:850,h:80},
 {x:2920,y:560,w:950,h:80},{x:3970,y:560,w:1230,h:80},
 {x:430,y:450,w:170,h:25},{x:700,y:370,w:180,h:25},
 {x:1170,y:440,w:170,h:25},{x:1450,y:350,w:180,h:25},
 {x:1660,y:450,w:130,h:25},{x:2150,y:430,w:180,h:25},
 {x:2440,y:340,w:170,h:25},{x:2680,y:455,w:120,h:25},
 {x:3150,y:420,w:180,h:25},{x:3420,y:330,w:170,h:25},
 {x:3660,y:440,w:150,h:25},{x:4140,y:430,w:180,h:25},
 {x:4470,y:340,w:170,h:25},{x:4750,y:450,w:170,h:25}
];
const coinSpots=[
 [470,410],[750,330],[1220,400],[1510,300],[1700,410],
 [2200,390],[2490,300],[2720,415],[3200,380],[3470,290],
 [3710,400],[4190,390],[4520,300],[4800,410],[900,500],[1870,500],
 [2800,500],[3860,500],[5150,500]
].map(([x,y])=>({x,y,r:10,taken:false}));
const enemies=[
 {x:760,y:330,w:30,h:30,vx:55,min:700,max:850,alive:true},
 {x:1260,y:410,w:30,h:30,vx:60,min:1170,max:1310,alive:true},
 {x:2200,y:400,w:30,h:30,vx:70,min:2150,max:2300,alive:true},
 {x:3200,y:390,w:30,h:30,vx:65,min:3150,max:3300,alive:true},
 {x:4480,y:310,w:30,h:30,vx:75,min:4470,max:4610,alive:true},
 {x:5000,y:500,w:30,h:30,vx:80,min:3970,max:5150,alive:true}
];
const player={x:100,y:470,w:34,h:48,vx:0,vy:0,speed:250,jump:570,onGround:false,inv:0};

function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener("resize",resize);resize();

function resetPlayer(){player.x=100;player.y=470;player.vx=player.vy=0;camX=0;player.inv=1.5}
function resetGame(){coins=0;score=0;lives=3;won=false;coinSpots.forEach(c=>c.taken=false);enemies.forEach(e=>e.alive=true);resetPlayer();hudUpdate()}
function hudUpdate(){hud.coins.textContent=coins;hud.lives.textContent=lives;hud.score.textContent=score}

function rectHit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}

function hurt(){
 if(player.inv>0)return;
 lives--; hudUpdate();
 if(lives<=0){endGame("GAME OVER","Coba lagi dan capai bendera!");return}
 resetPlayer();
}

function endGame(title,text){
 started=false;message.style.display="flex";message.querySelector("h1").textContent=title;message.querySelector("p").textContent=text;startBtn.textContent="MAIN LAGI";
}

function start(){
 resetGame();started=true;message.style.display="none";last=performance.now();requestAnimationFrame(loop)
}
startBtn.onclick=start;

function bind(btn,key){
 const down=e=>{e.preventDefault();keys[key]=true};
 const up=e=>{e.preventDefault();keys[key]=false};
 btn.addEventListener("pointerdown",down);btn.addEventListener("pointerup",up);btn.addEventListener("pointercancel",up);btn.addEventListener("pointerleave",up);
}
bind(document.getElementById("left"),"left");bind(document.getElementById("right"),"right");bind(document.getElementById("jump"),"jump");
addEventListener("keydown",e=>{if(e.code==="ArrowLeft"||e.code==="KeyA")keys.left=true;if(e.code==="ArrowRight"||e.code==="KeyD")keys.right=true;if(e.code==="Space"||e.code==="ArrowUp"||e.code==="KeyW")keys.jump=true});
addEventListener("keyup",e=>{if(e.code==="ArrowLeft"||e.code==="KeyA")keys.left=false;if(e.code==="ArrowRight"||e.code==="KeyD")keys.right=false;if(e.code==="Space"||e.code==="ArrowUp"||e.code==="KeyW")keys.jump=false});

let jumpLock=false;
function update(dt){
 player.inv=Math.max(0,player.inv-dt);
 const dir=(keys.right?1:0)-(keys.left?1:0);
 player.vx=dir*player.speed;
 if(keys.jump&&!jumpLock&&player.onGround){player.vy=-player.jump;player.onGround=false;jumpLock=true}
 if(!keys.jump)jumpLock=false;
 player.vy+=1450*dt;
 const oldY=player.y;
 player.x+=player.vx*dt;
 player.x=Math.max(0,Math.min(worldW-player.w,player.x));
 player.y+=player.vy*dt;
 player.onGround=false;

 for(const p of platforms){
   if(player.x+player.w>p.x&&player.x<p.x+p.w){
     if(oldY+player.h<=p.y&&player.y+player.h>=p.y&&player.vy>=0){player.y=p.y-player.h;player.vy=0;player.onGround=true}
     else if(oldY>=p.y+p.h&&player.y<=p.y+p.h&&player.vy<0){player.y=p.y+p.h;player.vy=0}
   }
 }
 if(player.y>H+200){hurt();return}

 for(const c of coinSpots){
   if(!c.taken&&Math.hypot(player.x+player.w/2-c.x,player.y+player.h/2-c.y)<30){c.taken=true;coins++;score+=100;hudUpdate()}
 }
 for(const e of enemies){
   if(!e.alive)continue;
   e.x+=e.vx*dt;
   if(e.x<e.min||e.x>e.max)e.vx*=-1;
   if(rectHit(player,e)){
     if(player.vy>100&&player.y+player.h-e.y<22){e.alive=false;player.vy=-350;score+=250;hudUpdate()}
     else hurt()
   }
 }
 if(player.x>5100){won=true;endGame("LEVEL COMPLETE!","Keren! Semua checkpoint terlewati. Skor: "+score);return}
 camX+=(player.x-W*.35-camX)*Math.min(1,dt*6);camX=Math.max(0,Math.min(worldW-W,camX))
}

function draw(){
 ctx.clearRect(0,0,W,H);
 const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#69c8ff");sky.addColorStop(1,"#dff7ff");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 drawBackground();
 ctx.save();ctx.translate(-camX,0);
 for(const p of platforms)drawPlatform(p);
 for(const c of coinSpots)if(!c.taken)drawCoin(c);
 for(const e of enemies)if(e.alive)drawEnemy(e);
 drawFlag(5120,440);
 drawPlayer();
 ctx.restore();
}

function drawBackground(){
 ctx.fillStyle="#a6df9b";
 for(let x=-((camX*.18)%500)-500;x<W+500;x+=500){ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(x+170,H-180);ctx.lineTo(x+340,H);ctx.fill()}
 ctx.fillStyle="#7acb78";
 for(let x=-((camX*.35)%360)-360;x<W+360;x+=360){ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(x+120,H-130);ctx.lineTo(x+240,H);ctx.fill()}
 ctx.fillStyle="#fff";ctx.globalAlpha=.7;
 for(let x=100-((camX*.1)%500);x<W;x+=500){ctx.beginPath();ctx.arc(x,100,24,0,7);ctx.arc(x+28,105,30,0,7);ctx.arc(x+58,100,22,0,7);ctx.fill()}
 ctx.globalAlpha=1;
}

function drawPlatform(p){
 ctx.fillStyle="#8b5a35";ctx.fillRect(p.x,p.y,p.w,p.h);
 ctx.fillStyle="#4caf50";ctx.fillRect(p.x,p.y,p.w,10);
 ctx.fillStyle="#6f4529";for(let x=p.x+8;x<p.x+p.w;x+=35)ctx.fillRect(x,p.y+20,20,5);
}
function drawCoin(c){
 const bob=Math.sin(performance.now()/180+c.x)*4;
 ctx.fillStyle="#ffd43b";ctx.beginPath();ctx.arc(c.x,c.y+bob,c.r,0,7);ctx.fill();
 ctx.strokeStyle="#d99d00";ctx.lineWidth=3;ctx.stroke();
}
function drawEnemy(e){
 ctx.fillStyle="#8f3b55";ctx.beginPath();ctx.roundRect(e.x,e.y,e.w,e.h,8);ctx.fill();
 ctx.fillStyle="#fff";ctx.fillRect(e.x+6,e.y+7,6,7);ctx.fillRect(e.x+18,e.y+7,6,7);
 ctx.fillStyle="#222";ctx.fillRect(e.x+8,e.y+9,3,4);ctx.fillRect(e.x+20,e.y+9,3,4);
 ctx.fillStyle="#522033";ctx.fillRect(e.x+5,e.y+25,20,4);
}
function drawFlag(x,y){
 ctx.fillStyle="#6b4526";ctx.fillRect(x,y,7,120);
 ctx.fillStyle="#ff5b5b";ctx.beginPath();ctx.moveTo(x+7,y);ctx.lineTo(x+70,y+20);ctx.lineTo(x+7,y+40);ctx.fill();
}
function drawPlayer(){
 if(player.inv>0&&Math.floor(player.inv*12)%2===0)return;
 const x=player.x,y=player.y;
 ctx.fillStyle="#26364d";ctx.fillRect(x+5,y+25,24,20);
 ctx.fillStyle="#ffd0a6";ctx.fillRect(x+7,y+4,21,23);
 ctx.fillStyle="#3c73e8";ctx.fillRect(x+4,y,28,9);
 ctx.fillStyle="#222";ctx.fillRect(x+11,y+12,3,4);ctx.fillRect(x+22,y+12,3,4);
 ctx.fillStyle="#f0a46b";ctx.fillRect(x+8,y+27,18,5);
 ctx.fillStyle="#20283a";ctx.fillRect(x+3,y+42,11,6);ctx.fillRect(x+20,y+42,11,6);
}

function loop(t){if(!started)return;const dt=Math.min((t-last)/1000,.033);last=t;update(dt);draw();if(started)requestAnimationFrame(loop)}
draw();
