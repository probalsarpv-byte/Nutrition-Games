import { LEVELS, QUESTIONS } from "./data.js";

export const DIFFICULTY={
  easy:{timer:0,points:10,penalty:0,ai:.60},
  medium:{timer:25,points:15,penalty:1,ai:.76},
  hard:{timer:15,points:25,penalty:2,ai:.90}
};

export const FOOD_TILES={
  5:{kind:"good",icon:"🥚",bn:"ডিম",en:"Egg",delta:2},
  11:{kind:"bad",icon:"🥤",bn:"সফট ড্রিংক",en:"Soft drink",delta:-2},
  16:{kind:"good",icon:"🥦",bn:"ব্রকলি",en:"Broccoli",delta:3},
  23:{kind:"bad",icon:"🍟",bn:"ফ্রেঞ্চ ফ্রাই",en:"French fries",delta:-3},
  29:{kind:"good",icon:"🍎",bn:"আপেল",en:"Apple",delta:2},
  36:{kind:"bad",icon:"🍩",bn:"ডোনাট",en:"Donut",delta:-2},
  43:{kind:"good",icon:"🐟",bn:"মাছ",en:"Fish",delta:3},
  49:{kind:"bad",icon:"🍬",bn:"ক্যান্ডি",en:"Candy",delta:-3},
  57:{kind:"good",icon:"🥛",bn:"দুধ",en:"Milk",delta:2},
  64:{kind:"bad",icon:"🍔",bn:"বার্গার",en:"Burger",delta:-3},
  71:{kind:"good",icon:"🥗",bn:"সালাদ",en:"Salad",delta:4},
  78:{kind:"bad",icon:"🧁",bn:"কাপকেক",en:"Cupcake",delta:-2},
  84:{kind:"good",icon:"🥜",bn:"বাদাম",en:"Nuts",delta:3},
  91:{kind:"bad",icon:"🍕",bn:"পিজা",en:"Pizza",delta:-3},
  96:{kind:"good",icon:"🍊",bn:"কমলা",en:"Orange",delta:2}
};

export const QUIZ_TILES=[8,19,33,46,60,75,88,98];

export function makePlayer(id,name,slot,avatar,isAI=false){
  return {id,name,slot,avatar,isAI,inYard:true,position:0,score:0,correct:0,wrong:0,streak:0,bestStreak:0,powerups:{hint:1,boost:0,freeze:1}};
}

export function makeGame({mode,level,difficulty,players}){
  const map={};players.forEach(p=>map[p.id]=p);
  return {mode,level,difficulty,status:"playing",phase:"roll",turnIndex:0,currentTurn:players[0].id,playerOrder:players.map(p=>p.id),players:map,dice:null,pendingQuestionId:null,usedQuestions:[],lastEvent:"Roll the dice",winner:null,frozen:{}};
}

export const rollDie=()=>Math.floor(Math.random()*6)+1;

export function canEnterFromYard(dice){return dice===1||dice===6}

export function getQuestion(level,difficulty,used=[]){
  let pool=QUESTIONS.filter(q=>q.level===Number(level)&&q.difficulty===difficulty&&!used.includes(q.id));
  if(!pool.length)pool=QUESTIONS.filter(q=>q.level===Number(level)&&!used.includes(q.id));
  if(!pool.length)pool=QUESTIONS.filter(q=>q.level===Number(level));
  return pool[Math.floor(Math.random()*pool.length)];
}

export function prepareMove(game,uid,dice){
  const p=game.players[uid];
  if(p.inYard){
    if(canEnterFromYard(dice)){
      game.phase="select";
      game.lastEvent=`${p.name}: tap your token to enter the board.`;
      return {selectable:true,enter:true};
    }
    game.lastEvent=`${p.name} needs 1 or 6 to enter.`;
    return {selectable:false,enter:false};
  }
  let target=p.position+dice;
  if(target>100){
    game.lastEvent=`Exact roll needed to reach 100.`;
    return {selectable:false,overshoot:true};
  }
  game.phase="select";
  game.lastEvent=`${p.name}: tap your token to move ${dice}.`;
  return {selectable:true,target};
}

export function moveSelectedToken(game,uid){
  const p=game.players[uid],dice=game.dice;
  if(game.phase!=="select"||!dice)return {ok:false};
  if(p.inYard){
    if(!canEnterFromYard(dice))return {ok:false};
    p.inYard=false;p.position=1;
    game.lastEvent=`${p.name} entered the board!`;
  }else{
    p.position+=dice;
    game.lastEvent=`${p.name} moved ${dice} step${dice===1?"":"s"}.`;
  }
  game.phase="resolve";
  return resolveLanding(game,uid);
}

export function resolveLanding(game,uid){
  const p=game.players[uid];
  if(p.position>=100){p.position=100;game.status="finished";game.winner=uid;return{type:"win"};}
  if(QUIZ_TILES.includes(p.position)){game.phase="quiz";return{type:"quiz"};}
  const food=FOOD_TILES[p.position];
  if(food){
    const from=p.position;
    p.position=Math.max(1,Math.min(100,p.position+food.delta));
    p.score+=food.kind==="good"?10:0;
    game.lastEvent=`${p.name} landed on ${food.en}: ${food.delta>0?"+":""}${food.delta}.`;
    return{type:"food",food,from,to:p.position};
  }
  return{type:"normal"};
}

export function resolveQuiz(game,uid,correct){
  const p=game.players[uid],cfg=DIFFICULTY[game.difficulty];
  if(correct){p.correct++;p.streak++;p.bestStreak=Math.max(p.bestStreak,p.streak);p.score+=cfg.points;game.lastEvent=`Correct! +${cfg.points} points.`;}
  else{p.wrong++;p.streak=0;if(cfg.penalty&&!p.inYard)p.position=Math.max(1,p.position-cfg.penalty);game.lastEvent=`Wrong answer${cfg.penalty?`, -${cfg.penalty} step`:""}.`;}
  game.phase="resolve";
}

export function finishTurn(game){
  if(game.status!=="playing")return;
  game.turnIndex=(game.turnIndex+1)%game.playerOrder.length;
  game.currentTurn=game.playerOrder[game.turnIndex];
  game.dice=null;game.phase="roll";
}

export function useBoost(game,uid){
  const p=game.players[uid];if(!p.powerups.boost||p.inYard||game.phase!=="roll")return false;
  p.powerups.boost--;p.position=Math.min(100,p.position+3);p.score+=5;game.lastEvent=`${p.name} used Healthy Boost (+3)!`;return true;
}
export function useFreeze(game,uid){
  const p=game.players[uid];if(!p.powerups.freeze||game.phase!=="roll")return false;
  const ids=game.playerOrder.filter(x=>x!==uid);const target=ids[0];p.powerups.freeze--;game.frozen[target]=(game.frozen[target]||0)+1;game.lastEvent=`${game.players[target].name} is frozen for one turn.`;return true;
}
