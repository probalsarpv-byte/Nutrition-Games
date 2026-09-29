import {FOOD_TILES,QUIZ_TILES,QUESTIONS} from "./data.js";
export const DIFF={easy:{timer:0,points:10,penalty:0,ai:.60},medium:{timer:25,points:15,penalty:1,ai:.76},hard:{timer:15,points:25,penalty:2,ai:.90}};
export const AVATARS=["green","purple","orange","blue"];

export function player(id,name,slot,avatar,isAI=false){
 return {id,name,slot,avatar,isAI,score:0,correct:0,wrong:0,streak:0,bestStreak:0,powerups:{hint:1,boost:1,freeze:1},
 snake:{inYard:true,pos:0},classic:{tokens:[{p:-1},{p:-1},{p:-1},{p:-1}]}};
}
export function game({mode="snake",playType="solo",level=1,difficulty="medium",players=[]}){
 const map={};players.forEach(p=>map[p.id]=p);
 return {mode,playType,level,difficulty,status:"playing",phase:"roll",turnIndex:0,currentTurn:players[0].id,order:players.map(p=>p.id),players:map,dice:null,pendingQuestionId:null,usedQuestions:[],lastEvent:"Roll the dice",winner:null};
}
export const rollDie=()=>1+Math.floor(Math.random()*6);
export function question(level,diff,used=[]){let p=QUESTIONS.filter(q=>q.level===+level&&q.difficulty===diff&&!used.includes(q.id));if(!p.length)p=QUESTIONS.filter(q=>q.level===+level&&!used.includes(q.id));if(!p.length)p=QUESTIONS.filter(q=>q.level===+level);return p[Math.floor(Math.random()*p.length)]}

export function snakePrepare(g,uid,d){const p=g.players[uid].snake;if(p.inYard){if(d===1||d===6){g.phase="select";return{selectable:[0]}}return{selectable:[]}}if(p.pos+d>100)return{selectable:[]};g.phase="select";return{selectable:[0]}}
export function snakeMove(g,uid){const p=g.players[uid],s=p.snake,d=g.dice;if(g.phase!=="select")return{type:"none"};if(s.inYard){s.inYard=false;s.pos=1}else s.pos+=d;g.phase="resolve";if(s.pos>=100){s.pos=100;g.status="finished";g.winner=uid;return{type:"win"}}if(QUIZ_TILES.includes(s.pos)){g.phase="quiz";return{type:"quiz"}}const f=FOOD_TILES[s.pos];if(f){s.pos=Math.max(1,Math.min(100,s.pos+f.delta));if(f.kind==="good")p.score+=10;return{type:"food",food:f}}return{type:"normal"}}

const PATH=[
[6,13],[6,12],[6,11],[6,10],[6,9],[5,9],[4,9],[3,9],[2,9],[1,9],[0,9],[0,8],[0,7],[1,7],[2,7],[3,7],[4,7],[5,7],
[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,5],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[6,3],[6,2],[6,1],[6,0],
[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4],[14,5],[14,6],[13,6],[12,6],
[11,6],[10,6],[9,6],[9,7],[10,7],[11,7],[12,7],[13,7],[14,7],[14,8],[14,9],[13,9],[12,9],[11,9],[10,9],[9,9],
[9,10],[9,11],[9,12],[9,13],[9,14],[8,14],[7,14],[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]
];
const START=[0,20,40,60]; const SAFE=new Set([0,8,13,20,28,33,40,48,53,60,68,73]);
export function classicPath(){return PATH}
export function classicPrepare(g,uid,d){const p=g.players[uid],start=START[p.slot-1],sel=[];p.classic.tokens.forEach((t,i)=>{if(t.p<0){if(d===1||d===6)sel.push(i)}else if(t.p<56&&t.p+d<=56)sel.push(i)});if(sel.length)g.phase="select";return{selectable:sel}}
export function classicTokenCell(playerObj,token){if(token.p<0)return null;if(token.p<52){const idx=(START[playerObj.slot-1]+token.p)%52;return PATH[idx]}const lane=token.p-52;const lanes=[
[[7,13],[7,12],[7,11],[7,10],[7,9]],
[[1,7],[2,7],[3,7],[4,7],[5,7]],
[[7,1],[7,2],[7,3],[7,4],[7,5]],
[[13,7],[12,7],[11,7],[10,7],[9,7]]
];return lanes[playerObj.slot-1][Math.min(4,lane)]}
export function classicMove(g,uid,tokenIndex){const p=g.players[uid],t=p.classic.tokens[tokenIndex],d=g.dice;if(g.phase!=="select")return{type:"none"};if(t.p<0)t.p=0;else t.p+=d;if(t.p>=56){t.p=56;if(p.classic.tokens.every(x=>x.p>=56)){g.status="finished";g.winner=uid;return{type:"win"}}}
 g.phase="resolve";let event={type:"normal"};
 if(t.p>=0&&t.p<52){const global=(START[p.slot-1]+t.p)%52;const cellNum=global+1;if(QUIZ_TILES.includes(cellNum)){g.phase="quiz";event={type:"quiz"}}else if(FOOD_TILES[cellNum]){const f=FOOD_TILES[cellNum],delta=f.delta;t.p=Math.max(0,Math.min(55,t.p+delta));if(f.kind==="good")p.score+=10;event={type:"food",food:f}}if(!SAFE.has(global))capture(g,uid,tokenIndex,global)}
 return event}
function capture(g,uid,ti,global){for(const oid of g.order){if(oid===uid)continue;const op=g.players[oid];op.classic.tokens.forEach(t=>{if(t.p>=0&&t.p<52){const og=(START[op.slot-1]+t.p)%52;if(og===global)t.p=-1}})}}
export function resolveQuiz(g,uid,ok){const p=g.players[uid],c=DIFF[g.difficulty];if(ok){p.correct++;p.streak++;p.bestStreak=Math.max(p.bestStreak,p.streak);p.score+=c.points}else{p.wrong++;p.streak=0}g.phase="resolve"}
export function endTurn(g){if(g.status!=="playing")return;g.turnIndex=(g.turnIndex+1)%g.order.length;g.currentTurn=g.order[g.turnIndex];g.dice=null;g.phase="roll"}
