import {FOOD_TILES,SNAKE_LADDERS,QUIZ_TILES,QUESTIONS} from "./data.js";

export const DIFF={
  easy:{timer:0,points:10,penalty:0,ai:.62},
  medium:{timer:25,points:15,penalty:1,ai:.77},
  hard:{timer:15,points:25,penalty:2,ai:.9}
};
export const AVATARS=["green","purple","orange","blue"];

export function makePlayer(id,name,slot,avatar,isAI=false){
  return {
    id,name,slot,avatar,isAI,score:0,correct:0,wrong:0,streak:0,bestStreak:0,
    powerups:{hint:1,boost:1,freeze:1},
    snake:{inYard:true,pos:0},
    classic:{tokens:[{p:-1},{p:-1},{p:-1},{p:-1}]}
  };
}

export function makeGame({mode,playType,level,difficulty,players}){
  const map={};players.forEach(p=>map[p.id]=p);
  return {mode,playType,level,difficulty,status:"playing",phase:"roll",turnIndex:0,currentTurn:players[0].id,order:players.map(p=>p.id),players:map,dice:null,pendingQuestionId:null,usedQuestions:[],lastEvent:"Roll the dice",winner:null,extraTurn:false,freeze:{}};
}
export const rollDie=()=>1+Math.floor(Math.random()*6);

export function getQuestion(level,difficulty,used=[]){
  let p=QUESTIONS.filter(q=>q.level===+level&&q.difficulty===difficulty&&!used.includes(q.id));
  if(!p.length)p=QUESTIONS.filter(q=>q.level===+level&&!used.includes(q.id));
  if(!p.length)p=QUESTIONS.filter(q=>q.level===+level);
  return p[Math.floor(Math.random()*p.length)];
}

export function snakePrepare(g,uid,dice){
  const s=g.players[uid].snake;
  if(s.inYard){
    if(dice===1||dice===6){g.phase="select";g.lastEvent="Tap your glowing Panda to enter.";return [0]}
    g.lastEvent="You need 1 or 6 to enter the board.";return []
  }
  if(s.pos+dice>100){g.lastEvent="Exact roll needed to reach 100.";return []}
  g.phase="select";g.lastEvent=`Tap your Panda to move ${dice}.`;return [0]
}

export function snakeMove(g,uid){
  const p=g.players[uid],s=p.snake,d=g.dice;
  if(g.phase!=="select")return {type:"none"};
  if(s.inYard){s.inYard=false;s.pos=1}else s.pos+=d;
  g.phase="resolve";
  if(s.pos>=100){s.pos=100;g.status="finished";g.winner=uid;return {type:"win"}}
  if(SNAKE_LADDERS.ladders[s.pos]){
    const from=s.pos,to=SNAKE_LADDERS.ladders[s.pos];s.pos=to;g.lastEvent=`Ladder! ${from} → ${to}`;return {type:"ladder",from,to};
  }
  if(SNAKE_LADDERS.snakes[s.pos]){
    const from=s.pos,to=SNAKE_LADDERS.snakes[s.pos];s.pos=to;g.lastEvent=`Snake! ${from} → ${to}`;return {type:"snake",from,to};
  }
  if(QUIZ_TILES.includes(s.pos)){g.phase="quiz";return {type:"quiz"}}
  const food=FOOD_TILES[s.pos];
  if(food){
    const from=s.pos;s.pos=Math.max(1,Math.min(100,s.pos+food.delta));
    if(food.kind==="good")p.score+=10;
    g.lastEvent=`${food.en}: ${food.delta>0?"+":""}${food.delta}`;
    return {type:"food",food,from,to:s.pos}
  }
  return {type:"normal"};
}

/* Classic Ludo */
const PATH=[
[6,13],[6,12],[6,11],[6,10],[6,9],[5,9],[4,9],[3,9],[2,9],[1,9],[0,9],[0,8],[0,7],[1,7],[2,7],[3,7],[4,7],[5,7],
[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,5],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[6,3],[6,2],[6,1],[6,0],
[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4],[14,5],[14,6],[13,6],[12,6],
[11,6],[10,6],[9,6],[9,7],[10,7],[11,7],[12,7],[13,7],[14,7],[14,8],[14,9],[13,9],[12,9],[11,9],[10,9],[9,9],
[9,10],[9,11],[9,12],[9,13],[9,14],[8,14],[7,14],[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]
];
const START=[0,20,40,60];
const SAFE=new Set([0,8,13,20,28,33,40,48,53,60,68,73]);
const HOME_LANES=[
 [[7,13],[7,12],[7,11],[7,10],[7,9]],
 [[1,7],[2,7],[3,7],[4,7],[5,7]],
 [[7,1],[7,2],[7,3],[7,4],[7,5]],
 [[13,7],[12,7],[11,7],[10,7],[9,7]]
];
export function classicPath(){return PATH}
export function classicTokenCell(p,t){
  if(t.p<0)return null;
  if(t.p<52)return PATH[(START[p.slot-1]+t.p)%52];
  if(t.p>=56)return [7,7];
  return HOME_LANES[p.slot-1][Math.min(4,t.p-52)];
}
export function classicPrepare(g,uid,dice){
  const p=g.players[uid],sel=[];
  p.classic.tokens.forEach((t,i)=>{
    if(t.p<0){if(dice===1||dice===6)sel.push(i)}
    else if(t.p<56&&t.p+dice<=56)sel.push(i)
  });
  if(sel.length){g.phase="select";g.lastEvent="Tap a glowing Panda token."}
  else g.lastEvent="No token can move.";
  return sel;
}
export function classicMove(g,uid,tokenIndex){
  const p=g.players[uid],t=p.classic.tokens[tokenIndex],d=g.dice;
  if(g.phase!=="select")return {type:"none"};
  if(t.p<0)t.p=0;else t.p+=d;
  if(t.p>=56){t.p=56;if(p.classic.tokens.every(x=>x.p>=56)){g.status="finished";g.winner=uid;return {type:"win"}}}
  g.phase="resolve";
  if(t.p>=0&&t.p<52){
    const global=(START[p.slot-1]+t.p)%52, cellNo=global+1;
    if(QUIZ_TILES.includes(cellNo)){g.phase="quiz";return {type:"quiz"}}
    if(FOOD_TILES[cellNo]){
      const f=FOOD_TILES[cellNo];
      t.p=Math.max(0,Math.min(55,t.p+f.delta));
      if(f.kind==="good")p.score+=10;
      return {type:"food",food:f}
    }
    if(!SAFE.has(global)){
      const captured=captureAt(g,uid,global);
      if(captured)return {type:"capture",count:captured}
    }
  }
  return {type:"normal"};
}
function captureAt(g,uid,global){
  let n=0;
  for(const oid of g.order){
    if(oid===uid)continue;
    const op=g.players[oid];
    op.classic.tokens.forEach(t=>{
      if(t.p>=0&&t.p<52){
        const og=(START[op.slot-1]+t.p)%52;
        if(og===global){t.p=-1;n++}
      }
    })
  }
  return n;
}
export function resolveQuiz(g,uid,ok){
  const p=g.players[uid],cfg=DIFF[g.difficulty];
  if(ok){p.correct++;p.streak++;p.bestStreak=Math.max(p.bestStreak,p.streak);p.score+=cfg.points;g.lastEvent=`Correct! +${cfg.points} points.`}
  else{p.wrong++;p.streak=0;g.lastEvent="Wrong answer."}
  g.phase="resolve";
}
export function endTurn(g){
  if(g.status!=="playing")return;
  if(g.extraTurn){g.extraTurn=false;g.dice=null;g.phase="roll";return}
  g.turnIndex=(g.turnIndex+1)%g.order.length;
  g.currentTurn=g.order[g.turnIndex];
  g.dice=null;g.phase="roll";
}
