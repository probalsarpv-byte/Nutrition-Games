import {LEVELS,QUESTIONS} from "./data.js";
import {DIFF,AVATARS,makePlayer,makeGame,rollDie,getQuestion,snakePrepare,snakeMove,classicPrepare,classicMove,resolveQuiz,endTurn} from "./game-logic.js";

let FB=null;
let ThreeBoardClass=null;

async function loadThree(){
  if(ThreeBoardClass) return ThreeBoardClass;
  const mod=await import("./three-engine.js");
  ThreeBoardClass=mod.ThreeBoard;
  return ThreeBoardClass;
}

async function loadFirebase(){
  if(FB) return FB;
  FB=await import("./firebase.js");
  return FB;
}

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const S={lang:"bn",theme:"light",sound:true,gameMode:"snake",playType:null,count:4,level:1,difficulty:"medium",game:null,user:null,roomCode:null,room:null,unsub:null,renderer:null,selectable:[],busy:false,q:null,qAnswered:false,timer:null};

const TXT={
  bn:{homeTitle:"Play. Learn. Win.",homeSub:"Snake Nutrition আর Classic Nutrition Ludo — একই অ্যাপে।",roll:"Roll the dice",tap:"Glowing Panda token-এ tap করুন",wait:"অপেক্ষা করুন",correct:"সঠিক!",wrong:"ভুল"},
  en:{homeTitle:"Play. Learn. Win.",homeSub:"Snake Nutrition and Classic Nutrition Ludo in one app.",roll:"Roll the dice",tap:"Tap a glowing Panda token",wait:"Please wait",correct:"Correct!",wrong:"Wrong"}
};
const t=k=>TXT[S.lang][k]||k;
function go(id){$$(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active")}
function toast(m){const e=$("#toast");e.textContent=m;e.classList.remove("hidden");setTimeout(()=>e.classList.add("hidden"),1700)}
function clean(v,f){v=(v||"").trim().replace(/[<>]/g,"").slice(0,18);return v||f}
function levelName(n){return S.lang==="bn"?LEVELS[n].bn:LEVELS[n].en}
function tone(type){if(!S.sound)return;try{window.__ac||=new(window.AudioContext||window.webkitAudioContext)();const c=window.__ac,o=c.createOscillator(),g=c.createGain(),n=c.currentTime,f={dice:190,move:360,good:680,bad:120,correct:520,wrong:110,win:840}[type]||300;o.connect(g);g.connect(c.destination);o.frequency.setValueAtTime(f,n);g.gain.setValueAtTime(.06,n);g.gain.exponentialRampToValueAtTime(.001,n+.28);o.start(n);o.stop(n+.3)}catch{}}

function applyLang(){$("#langBtn").textContent=S.lang==="bn"?"EN":"বাংলা";$("#homeTitle").textContent=t("homeTitle");$("#homeSub").textContent=t("homeSub");renderLevels();if(S.game)renderGame()}
function applyTheme(){document.documentElement.dataset.theme=S.theme;$("#themeBtn").textContent=S.theme==="light"?"🌙":"☀️"}

function renderLevels(){const b=$("#levelPicker");b.innerHTML="";Object.keys(LEVELS).forEach(n=>{const x=document.createElement("button");x.className="level-btn"+(+n===S.level?" active":"");x.innerHTML=`<b>Level ${n}</b><small>${levelName(n)}</small>`;x.onclick=()=>{S.level=+n;renderLevels()};b.appendChild(x)})}
function renderEditor(){const b=$("#playerEditor");b.innerHTML="";const c=S.playType==="solo"?1:S.count;for(let i=0;i<c;i++){const d=document.createElement("div");d.className="player-card-edit";d.innerHTML=`<b>Player ${i+1}</b><input id="pname${i}" value="Player ${i+1}" maxlength="18"><div class="avatar-row">${AVATARS.map((a,j)=>`<button data-p="${i}" data-a="${a}" class="${j===i%4?"active":""}">🐼</button>`).join("")}</div>`;b.appendChild(d)}$$(".avatar-row button").forEach(x=>x.onclick=()=>{$$(`.avatar-row button[data-p="${x.dataset.p}"]`).forEach(y=>y.classList.remove("active"));x.classList.add("active")})}
async function choosePlay(type){
  S.playType=type;
  if(type==="online"){
    go("#screen-online");
    $("#firebaseStatus").textContent="Connecting…";
    try{
      const fb=await loadFirebase();
      if(!fb.auth.currentUser) await fb.signInAnonymously(fb.auth);
      $("#firebaseStatus").textContent="Firebase connected ✓";
    }catch(err){
      console.error("Firebase load failed",err);
      $("#firebaseStatus").textContent="Firebase unavailable";
      $("#onlineError").textContent="Online mode could not load. Solo and local modes still work.";
    }
    return;
  }
  $("#playerCountWrap").style.display=type==="solo"?"none":"block";
  if(type==="solo")S.count=2;
  $("#setupModeText").textContent=S.gameMode==="snake"?"Snake Nutrition":"Classic Nutrition Ludo";
  renderEditor();
  go("#screen-setup");
}

function startLocal(){const ps=[];if(S.playType==="solo"){const av=$(".avatar-row button.active")?.dataset.a||"green";ps.push(makePlayer("p1",clean($("#pname0").value,"Player 1"),1,av));ps.push(makePlayer("p2","NutriBot",2,"blue",true))}else{for(let i=0;i<S.count;i++){const av=$(`.avatar-row button[data-p="${i}"].active`)?.dataset.a||AVATARS[i%4];ps.push(makePlayer(`p${i+1}`,clean($(`#pname${i}`).value,`Player ${i+1}`),i+1,av))}}S.game=makeGame({mode:S.gameMode,playType:S.playType,level:S.level,difficulty:S.difficulty,players:ps});enterGame().catch(err=>console.error(err))}
async function enterGame(){
  go("#screen-game");
  $("#instructionTitle").textContent="Loading 3D board…";
  $("#rollBtn").disabled=true;
  try{
    const ThreeBoard=await loadThree();
    S.renderer ||= new ThreeBoard($("#gameCanvas"));
    S.game.mode==="snake"?S.renderer.buildSnake(S.game):S.renderer.buildClassic(S.game);
    renderGame();
  }catch(err){
    console.error("Three.js load failed",err);
    $("#instructionTitle").textContent="3D engine could not load";
    $("#instructionSub").textContent="Check internet/CDN access and reload. Menus remain usable.";
    toast("3D engine load failed");
  }
}

function canAct(){if(!S.game||S.game.status!=="playing")return false;if(S.playType==="online")return S.game.currentTurn===S.user?.uid;if(S.playType==="solo")return S.game.currentTurn==="p1";return true}
function currentPlayer(){return S.game?.players[S.game.currentTurn]}
function renderPlayers(){const b=$("#playersBar");b.innerHTML="";S.game.order.forEach(id=>{const p=S.game.players[id],state=S.game.mode==="snake"?(p.snake.inYard?"HOME":`${p.snake.pos}/100`):`${p.classic.tokens.filter(x=>x.p>=56).length}/4 HOME`;b.innerHTML+=`<div class="player-chip ${id===S.game.currentTurn?"active":""}"><span class="p">🐼</span><div><b>${p.name}</b><small>${state} • ${p.score} pts</small></div></div>`})}
function renderPower(){const b=$("#powerups");b.innerHTML="";const uid=S.playType==="online"?S.user?.uid:S.game.currentTurn,p=S.game.players[uid];if(!p)return;[["hint","💡 Hint"],["boost","⚡ Boost"],["freeze","❄️ Freeze"]].forEach(([k,l])=>{const x=document.createElement("button");x.className="power-pill";x.textContent=`${l} ${p.powerups[k]||0}`;if(k==="hint"){x.disabled=!(S.game.phase==="quiz"&&canAct()&&p.powerups.hint);x.onclick=useHint}else{x.disabled=true}b.appendChild(x)})}
function renderGame(){if(!S.game)return;const p=currentPlayer();$("#gameModeLabel").textContent=S.game.mode==="snake"?"SNAKE NUTRITION":"CLASSIC NUTRITION LUDO";$("#gameLevelLabel").textContent=levelName(S.game.level);$("#turnName").textContent=p.name;$("#lastRoll").textContent=S.game.dice??"—";$("#instructionTitle").textContent=S.game.phase==="select"?t("tap"):(canAct()?t("roll"):t("wait"));$("#instructionSub").textContent=S.game.lastEvent||"";$("#rollBtn").disabled=!canAct()||S.game.phase!=="roll"||S.busy;$("#selectHint").classList.toggle("hidden",S.game.phase!=="select");renderPlayers();renderPower();S.renderer?.sync(S.game);S.renderer?.highlight(S.selectable);if(S.game.status==="finished")showResult()}

function showRoll(v,who){$("#rollWho").textContent=`${who} ROLLED`;$("#rollValue").textContent=v;$("#rollPopup").classList.remove("hidden");setTimeout(()=>$("#rollPopup").classList.add("hidden"),1500)}
async function rollLocal(){if(!canAct()||S.game.phase!=="roll")return;S.busy=true;const d=rollDie();S.game.dice=d;await S.renderer.rollDice(d);showRoll(d,currentPlayer().name);tone("dice");const list=S.game.mode==="snake"?snakePrepare(S.game,S.game.currentTurn,d):classicPrepare(S.game,S.game.currentTurn,d);S.selectable=list.map(idx=>({uid:S.game.currentTurn,idx}));S.busy=false;renderGame();if(!S.selectable.length)setTimeout(endLocalTurn,700)}
async function canvasTap(ev){if(!S.game||S.game.phase!=="select")return;const hit=S.renderer.pick(ev.clientX,ev.clientY);if(!hit)return;if(!S.selectable.some(x=>x.uid===hit.uid&&x.idx===hit.idx))return;if(S.playType==="online"){await onlineToken(hit.idx);return}S.busy=true;
const fromPos=S.renderer.getTokenPosition(hit.uid,hit.idx);
const out=S.game.mode==="snake"?snakeMove(S.game,hit.uid):classicMove(S.game,hit.uid,hit.idx);
S.selectable=[];
S.renderer.sync(S.game);
await S.renderer.animateTokenFrom(hit.uid,hit.idx,fromPos);
tone("move");await handleOutcome(out);S.busy=false;if(out.type==="quiz"){const q=getQuestion(S.game.level,S.game.difficulty,S.game.usedQuestions);S.game.pendingQuestionId=q.id;S.game.usedQuestions.push(q.id);openQuiz(q)}else if(S.game.status==="finished")renderGame();else endLocalTurn()}
async function handleOutcome(out){if(!out||out.type==="normal")return;if(out.type==="food"){const f=out.food;$("#eventEmoji").textContent=f.icon;$("#eventTitle").textContent=S.lang==="bn"?f.bn:f.en;$("#eventDesc").textContent=`${f.delta>0?"+":""}${f.delta}`;$("#eventPopup").classList.remove("hidden");tone(f.kind==="good"?"good":"bad");await new Promise(r=>setTimeout(r,900));$("#eventPopup").classList.add("hidden");S.renderer.sync(S.game)}else if(out.type==="snake"||out.type==="ladder"){$("#eventEmoji").textContent=out.type==="snake"?"🐍":"🪜";$("#eventTitle").textContent=out.type==="snake"?"Snake Slide!":"Ladder Boost!";$("#eventDesc").textContent=`${out.from} → ${out.to}`;$("#eventPopup").classList.remove("hidden");await new Promise(r=>setTimeout(r,900));$("#eventPopup").classList.add("hidden");S.renderer.sync(S.game)}else if(out.type==="capture"){toast(`⚔️ Captured ${out.count} token`) }}
function endLocalTurn(){endTurn(S.game);S.selectable=[];renderGame();if(S.playType==="solo"&&S.game.currentTurn==="p2")setTimeout(aiTurn,700)}

async function aiTurn(){if(!S.game||S.game.currentTurn!=="p2"||S.game.status!=="playing")return;S.busy=true;const d=rollDie();S.game.dice=d;await S.renderer.rollDice(d);showRoll(d,"COMPUTER");const list=S.game.mode==="snake"?snakePrepare(S.game,"p2",d):classicPrepare(S.game,"p2",d);if(!list.length){S.busy=false;return setTimeout(endLocalTurn,500)}await new Promise(r=>setTimeout(r,350));const idx=list[Math.floor(Math.random()*list.length)];const fromPos=S.renderer.getTokenPosition("p2",idx);
const out=S.game.mode==="snake"?snakeMove(S.game,"p2"):classicMove(S.game,"p2",idx);
S.renderer.sync(S.game);
await S.renderer.animateTokenFrom("p2",idx,fromPos);
await handleOutcome(out);if(out.type==="quiz"){const q=getQuestion(S.game.level,S.game.difficulty,S.game.usedQuestions);const ok=Math.random()<DIFF[S.game.difficulty].ai;resolveQuiz(S.game,"p2",ok)}S.busy=false;if(S.game.status==="finished")renderGame();else endLocalTurn()}

function openQuiz(q){S.q=q;S.qAnswered=false;$("#quizModal").classList.remove("hidden");$("#quizContinueBtn").classList.add("hidden");$("#quizFeedback").textContent="";$("#quizCategory").textContent=q.category;const L=q[S.lang];$("#quizQuestion").textContent=L.q;const b=$("#quizOptions");b.innerHTML="";L.options.forEach((o,i)=>{const x=document.createElement("button");x.className="quiz-option";x.textContent=o;x.onclick=()=>answerQuiz(i);b.appendChild(x)});clearInterval(S.timer);let sec=DIFF[S.game.difficulty].timer;$("#quizTimer").textContent=sec||"∞";if(sec)S.timer=setInterval(()=>{sec--;$("#quizTimer").textContent=sec;if(sec<=0){clearInterval(S.timer);answerQuiz(-1)}},1000)}
function answerQuiz(i){if(S.qAnswered)return;S.qAnswered=true;clearInterval(S.timer);const ok=i===S.q.answer,L=S.q[S.lang];$$(".quiz-option").forEach((b,j)=>{b.disabled=true;if(j===S.q.answer)b.classList.add("correct");else if(j===i)b.classList.add("wrong")});$("#quizFeedback").textContent=`${ok?"✅ "+t("correct"):"❌ "+t("wrong")} ${L.explanation}`;$("#quizContinueBtn").dataset.ok=ok?"1":"0";$("#quizContinueBtn").classList.remove("hidden");tone(ok?"correct":"wrong")}
function useHint(){const uid=S.playType==="online"?S.user.uid:S.game.currentTurn,p=S.game.players[uid];if(!p?.powerups.hint||!S.q)return;[0,1,2,3].filter(i=>i!==S.q.answer).slice(0,2).forEach(i=>{const b=$$(".quiz-option")[i];if(b){b.disabled=true;b.style.opacity=".3"}});p.powerups.hint--;renderPower()}
function continueQuiz(){const ok=$("#quizContinueBtn").dataset.ok==="1";$("#quizModal").classList.add("hidden");if(S.playType==="online"){onlineQuiz(ok);return}resolveQuiz(S.game,S.game.currentTurn,ok);endLocalTurn()}

function showResult(){go("#screen-result");const w=S.game.players[S.game.winner];$("#winnerTitle").textContent=`${w.name} Wins!`;const b=$("#resultStats");b.innerHTML="";S.game.order.forEach(id=>{const p=S.game.players[id],tot=p.correct+p.wrong,acc=tot?Math.round(p.correct/tot*100):0;b.innerHTML+=`<div class="stat-card"><b>${p.name}</b><div>Score ${p.score}</div><div>Accuracy ${acc}%</div><div>Best streak ${p.bestStreak}</div></div>`});$("#resultBadges").innerHTML=`<span>🏁 Race Complete</span>${w.bestStreak>=5?"<span>🔥 Streak Master</span>":""}`;saveProgress("games",1);confetti();tone("win")}
function confetti(){const c=$("#confettiCanvas"),x=c.getContext("2d");c.width=innerWidth;c.height=innerHeight;const p=[...Array(70)].map(()=>({x:innerWidth/2,y:innerHeight*.18,vx:(Math.random()-.5)*8,vy:-Math.random()*7-2,g:.2,a:1,r:3+Math.random()*4}));let f=0;(function d(){x.clearRect(0,0,c.width,c.height);p.forEach(z=>{z.vy+=z.g;z.x+=z.vx;z.y+=z.vy;z.a-=.01;x.globalAlpha=Math.max(0,z.a);x.fillStyle=["#18b89c","#f5b63b","#7657e8","#ea5565","#3d8de8"][Math.floor(Math.random()*5)];x.fillRect(z.x,z.y,z.r,z.r*1.5)});x.globalAlpha=1;if(f++<100)requestAnimationFrame(d)})()}
function progress(){try{return JSON.parse(localStorage.getItem("nutriLudoProgress")||"{}")}catch{return{}}}function saveProgress(k,a=1){const p=progress();p[k]=(p[k]||0)+a;localStorage.setItem("nutriLudoProgress",JSON.stringify(p))}
function showAchievements(){const p=progress();$("#achievementList").innerHTML=`<div class="achievement-item ${p.games?"":"locked"}"><b>🎮 First Journey</b><div>Complete one game</div></div><div class="achievement-item ${p.online?"":"locked"}"><b>🌐 Online Explorer</b><div>Play online</div></div>`}
function showHow(){$("#howContent").innerHTML=[S.lang==="bn"?"Snake mode: ১ বা ৬ উঠলে Panda board-এ ঢুকবে।":"Snake mode: roll 1 or 6 to enter.",S.lang==="bn"?"Classic mode: প্রতি player-এর ৪টি Panda token।":"Classic mode: four Panda tokens per player.",S.lang==="bn"?"Dice roll-এর পর glowing token-এ tap করুন।":"After rolling, tap a glowing token.",S.lang==="bn"?"🥦 ভালো খাবার সামনে, 🍔 junk food পিছনে।":"Healthy food moves forward; junk food moves back.",S.lang==="bn"?"🐍 snake নিচে নামায়, 🪜 ladder উপরে তোলে।":"Snakes move down; ladders move up."].map((x,i)=>`<div class="how-step"><b>${i+1}.</b> ${x}</div>`).join("")}

/* Firebase online — lazily loaded so Firebase failure cannot break the whole app */
async function ensureAuth(){
  const fb=await loadFirebase();
  if(fb.auth.currentUser){S.user=fb.auth.currentUser;return S.user}
  await fb.signInAnonymously(fb.auth);
  S.user=fb.auth.currentUser;
  return S.user;
}
const randomCode=()=>String(Math.floor(100000+Math.random()*900000));

async function createRoom(){
  try{
    const fb=await loadFirebase(),u=await ensureAuth(),nm=clean($("#onlineName").value,"Host");
    let code;
    for(let i=0;i<8;i++){code=randomCode();if(!(await fb.get(fb.ref(fb.db,`rooms/${code}`))).exists())break}
    await fb.set(fb.ref(fb.db,`rooms/${code}`),{hostUid:u.uid,status:"waiting",capacity:S.count,settings:{mode:S.gameMode,level:S.level,difficulty:S.difficulty},players:{[u.uid]:{name:nm,slot:1,avatar:"green",ready:false,connected:true}}});
    enterLobby(code);presence(code);
  }catch(e){console.error(e);$("#onlineError").textContent="Could not create room."}
}
async function joinRoom(){
  try{
    const fb=await loadFirebase(),u=await ensureAuth(),code=$("#roomCodeInput").value.trim(),nm=clean($("#onlineName").value,"Player");
    if(!/^\d{6}$/.test(code))return $("#onlineError").textContent="Enter a 6-digit room code.";
    const snap=await fb.get(fb.ref(fb.db,`rooms/${code}`));
    if(!snap.exists())return $("#onlineError").textContent="Room not found.";
    const r=snap.val(),ps=r.players||{};
    if(r.status!=="waiting")return $("#onlineError").textContent="Game already started.";
    if(!ps[u.uid]&&Object.keys(ps).length>=r.capacity)return $("#onlineError").textContent="Room full.";
    const used=new Set(Object.values(ps).map(p=>p.slot)),slot=ps[u.uid]?.slot||[1,2,3,4].find(x=>!used.has(x));
    await fb.set(fb.ref(fb.db,`rooms/${code}/players/${u.uid}`),{name:nm,slot,avatar:AVATARS[(slot-1)%4],ready:false,connected:true});
    enterLobby(code);presence(code);saveProgress("online",1);
  }catch(e){console.error(e);$("#onlineError").textContent="Could not join room."}
}
async function presence(code){
  const fb=await loadFirebase();
  const p=fb.ref(fb.db,`rooms/${code}/players/${S.user.uid}/connected`);
  await fb.set(p,true);fb.onDisconnect(p).set(false);
}
async function enterLobby(code){
  const fb=await loadFirebase();
  S.roomCode=code;$("#roomCodeDisplay").textContent=code;go("#screen-lobby");
  if(S.unsub)S.unsub();
  S.unsub=fb.onValue(fb.ref(fb.db,`rooms/${code}`),snap=>{
    if(!snap.exists()){toast("Room closed");return go("#screen-home")}
    S.room=snap.val();renderLobby();
    if(S.room.status==="playing"&&S.room.game){
      S.playType="online";S.game=S.room.game;
      enterGame().catch(console.error);
      if(S.game.phase==="quiz"&&S.game.currentTurn===S.user?.uid&&$("#quizModal").classList.contains("hidden")){
        const q=QUESTIONS.find(x=>x.id===S.game.pendingQuestionId);if(q)openQuiz(q)
      }
    }else if(S.room.status==="finished"&&S.room.game){S.game=S.room.game;showResult()}
  });
}
function renderLobby(){
  const r=S.room,es=Object.entries(r.players||{}).sort((a,b)=>a[1].slot-b[1].slot),b=$("#lobbyPlayers");b.innerHTML="";
  for(let s=1;s<=r.capacity;s++){const f=es.find(([,p])=>p.slot===s);b.innerHTML+=f?`<div class="lobby-player"><div class="avatar">🐼</div><b>${f[1].name}</b><small>${f[1].ready?"✅ READY":"⏳ WAIT"}</small></div>`:`<div class="lobby-player"><div class="avatar">➕</div><b>Open ${s}</b><small>WAITING</small></div>`}
  const host=r.hostUid===S.user?.uid,me=r.players?.[S.user?.uid];
  $("#readyBtn").textContent=me?.ready?"READY ✓":"I'M READY";
  $("#startOnlineBtn").style.display=host?"block":"none";
  $("#startOnlineBtn").disabled=es.length<2||!es.every(([,p])=>p.ready);
  $("#lobbyMode").disabled=!host;$("#lobbyLevel").disabled=!host;$("#lobbyDifficulty").disabled=!host;
  $("#lobbyMode").value=r.settings?.mode||"snake";$("#lobbyLevel").innerHTML="";
  Object.keys(LEVELS).forEach(n=>{const o=document.createElement("option");o.value=n;o.textContent=`${n} — ${levelName(n)}`;$("#lobbyLevel").appendChild(o)});
  $("#lobbyLevel").value=r.settings?.level||1;$("#lobbyDifficulty").value=r.settings?.difficulty||"medium";
}
async function toggleReady(){const fb=await loadFirebase(),p=S.room?.players?.[S.user.uid];if(p)await fb.update(fb.ref(fb.db,`rooms/${S.roomCode}/players/${S.user.uid}`),{ready:!p.ready})}
async function startOnline(){
  const fb=await loadFirebase(),r=S.room;if(!r||r.hostUid!==S.user.uid)return;
  const es=Object.entries(r.players||{}).sort((a,b)=>a[1].slot-b[1].slot);if(es.length<2||!es.every(([,p])=>p.ready))return;
  const ps=es.map(([id,p])=>makePlayer(id,p.name,p.slot,p.avatar));const g=makeGame({mode:$("#lobbyMode").value,playType:"online",level:+$("#lobbyLevel").value,difficulty:$("#lobbyDifficulty").value,players:ps});
  await fb.update(fb.ref(fb.db,`rooms/${S.roomCode}`),{status:"playing",game:g,settings:{mode:g.mode,level:g.level,difficulty:g.difficulty}});
}
async function onlineRoll(){
  const fb=await loadFirebase();if(!canAct()||S.game.phase!=="roll")return;
  const d=rollDie();await S.renderer.rollDice(d);showRoll(d,currentPlayer().name);
  await fb.runTransaction(fb.ref(fb.db,`rooms/${S.roomCode}/game`),g=>{if(!g||g.currentTurn!==S.user.uid||g.phase!=="roll")return;g.dice=d;const list=g.mode==="snake"?snakePrepare(g,S.user.uid,d):classicPrepare(g,S.user.uid,d);if(!list.length)endTurn(g);return g});
}
async function onlineToken(idx){
  const fb=await loadFirebase(),q=getQuestion(S.game.level,S.game.difficulty,S.game.usedQuestions||[]);
  await fb.runTransaction(fb.ref(fb.db,`rooms/${S.roomCode}/game`),g=>{if(!g||g.currentTurn!==S.user.uid||g.phase!=="select")return;const out=g.mode==="snake"?snakeMove(g,S.user.uid):classicMove(g,S.user.uid,idx);if(out.type==="quiz"){g.pendingQuestionId=q.id;g.usedQuestions=(g.usedQuestions||[]).concat(q.id)}else if(g.status!=="finished")endTurn(g);return g});
  await syncFinish();
}
async function onlineQuiz(ok){
  const fb=await loadFirebase();
  await fb.runTransaction(fb.ref(fb.db,`rooms/${S.roomCode}/game`),g=>{if(!g||g.currentTurn!==S.user.uid||g.phase!=="quiz")return;resolveQuiz(g,S.user.uid,ok);if(g.status!=="finished")endTurn(g);return g});
  await syncFinish();
}
async function syncFinish(){const fb=await loadFirebase(),s=await fb.get(fb.ref(fb.db,`rooms/${S.roomCode}/game`));if(s.exists()&&s.val().status==="finished")await fb.update(fb.ref(fb.db,`rooms/${S.roomCode}`),{status:"finished"})}
async function leaveRoom(){const fb=await loadFirebase();if(S.unsub){S.unsub();S.unsub=null}if(S.roomCode&&S.user)await fb.remove(fb.ref(fb.db,`rooms/${S.roomCode}/players/${S.user.uid}`)).catch(()=>{});S.roomCode=null;S.room=null;go("#screen-home")}

/* Events */
$$("[data-game]").forEach(b=>b.onclick=()=>{$$("[data-game]").forEach(x=>x.classList.remove("active"));b.classList.add("active");S.gameMode=b.dataset.game});
$$("[data-play]").forEach(b=>b.onclick=()=>choosePlay(b.dataset.play));$$("[data-home]").forEach(b=>b.onclick=()=>go("#screen-home"));
$("#themeBtn").onclick=()=>{S.theme=S.theme==="light"?"dark":"light";applyTheme()};$("#langBtn").onclick=()=>{S.lang=S.lang==="bn"?"en":"bn";applyLang()};$("#soundBtn").onclick=()=>{S.sound=!S.sound;$("#soundBtn").textContent=S.sound?"🔊":"🔇"};
$$("[data-count]").forEach(b=>b.onclick=()=>{$$("[data-count]").forEach(x=>x.classList.remove("active"));b.classList.add("active");S.count=+b.dataset.count;renderEditor()});
$$("[data-online-count]").forEach(b=>b.onclick=()=>{$$("[data-online-count]").forEach(x=>x.classList.remove("active"));b.classList.add("active");S.count=+b.dataset.onlineCount});
$$("[data-diff]").forEach(b=>b.onclick=()=>{$$("[data-diff]").forEach(x=>x.classList.remove("active"));b.classList.add("active");S.difficulty=b.dataset.diff});
$("#startLocalBtn").onclick=startLocal;$("#rollBtn").onclick=()=>S.playType==="online"?onlineRoll():rollLocal();$("#gameCanvas").addEventListener("pointerup",canvasTap);$("#quizContinueBtn").onclick=continueQuiz;
$("#createRoomBtn").onclick=createRoom;$("#joinRoomBtn").onclick=joinRoom;$("#readyBtn").onclick=toggleReady;$("#startOnlineBtn").onclick=startOnline;$("#leaveRoomBtn").onclick=leaveRoom;
$("#homeBtn").onclick=()=>go("#screen-home");$("#playAgainBtn").onclick=()=>go("#screen-home");
$("#achievementsBtn").onclick=()=>{showAchievements();$("#achModal").classList.remove("hidden")};$("#howBtn").onclick=()=>{showHow();$("#howModal").classList.remove("hidden")};$("#challengeBtn").onclick=()=>{S.gameMode="snake";S.playType="solo";S.level=((new Date().getDate()-1)%5)+1;S.difficulty="hard";renderEditor();$("#setupModeText").textContent="Daily Challenge";go("#screen-setup")};
$$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).classList.add("hidden"));
$("#lobbyMode").onchange=async()=>{if(S.room?.hostUid===S.user?.uid){const fb=await loadFirebase();await fb.update(fb.ref(fb.db,`rooms/${S.roomCode}/settings`),{mode:$("#lobbyMode").value})}};
$("#lobbyLevel").onchange=async()=>{if(S.room?.hostUid===S.user?.uid){const fb=await loadFirebase();await fb.update(fb.ref(fb.db,`rooms/${S.roomCode}/settings`),{level:+$("#lobbyLevel").value})}};
$("#lobbyDifficulty").onchange=async()=>{if(S.room?.hostUid===S.user?.uid){const fb=await loadFirebase();await fb.update(fb.ref(fb.db,`rooms/${S.roomCode}/settings`),{difficulty:$("#lobbyDifficulty").value})}};

renderLevels();renderEditor();applyLang();applyTheme();
