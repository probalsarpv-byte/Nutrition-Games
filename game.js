import {LEVELS} from "./levels.js";import {QUESTIONS} from "./questions.js";
export const CFG={easy:{timer:0,points:10,penalty:0,ai:.56},medium:{timer:25,points:15,penalty:1,ai:.74},hard:{timer:15,points:25,penalty:2,ai:.88}};
export function newPlayer(id,name,avatar,slot,isAI=false){return{id,name,avatar,slot,isAI,position:0,score:0,xp:0,streak:0,bestStreak:0,correct:0,wrong:0,powerups:{shield:1,hint:1,boost:0,freeze:0}}}
export function newGame({mode,level,difficulty,players}){const map={};players.forEach(p=>map[p.id]=p);return{mode,level,difficulty,status:"playing",phase:"roll",turnIndex:0,currentTurn:players[0].id,playerOrder:players.map(p=>p.id),players:map,dice:null,pendingQuestionId:null,winner:null,lastEvent:"Game started!",usedQuestions:[]}}
export const roll=()=>Math.floor(Math.random()*6)+1;
export function nextTurn(g){if(g.status!=="playing")return;const p=g.players[g.currentTurn];if(p.position>=100){g.status="finished";g.winner=p.id;return}g.turnIndex=(g.turnIndex+1)%g.playerOrder.length;g.currentTurn=g.playerOrder[g.turnIndex];g.dice=null;g.phase="roll"}
export function question(level,diff,used=[]){let p=QUESTIONS.filter(q=>q.level===+level&&q.difficulty===diff&&!used.includes(q.id));if(!p.length)p=QUESTIONS.filter(q=>q.level===+level&&!used.includes(q.id));if(!p.length)p=QUESTIONS.filter(q=>q.level===+level);return p[Math.floor(Math.random()*p.length)]}
export function tileEvent(level,pos){const L=LEVELS[level];if(L.ladders[pos])return{t:"ladder",to:L.ladders[pos]};if(L.snakes[pos])return{t:"snake",to:L.snakes[pos]};if(L.quiz.includes(pos))return{t:"quiz"};if(L.bonus.includes(pos))return{t:"bonus"};if(L.trap.includes(pos))return{t:"trap"};if(L.duel.includes(pos))return{t:"duel"};return{t:"normal"}}
export function move(g,uid,d){const p=g.players[uid];let n=p.position+d;if(n>100)n=p.position;p.position=n;const ev=tileEvent(g.level,n);
 if(ev.t==="ladder"){p.position=ev.to;g.lastEvent=`${p.name} climbed to ${ev.to}! 🪜`;return ev}
 if(ev.t==="snake"){if(p.powerups.shield>0){p.powerups.shield--;g.lastEvent=`${p.name}'s shield blocked a snake! 🛡️`;return{t:"shield"}}p.position=ev.to;g.lastEvent=`${p.name} slid to ${ev.to}! 🐍`;return ev}
 if(ev.t==="bonus"){p.powerups.boost++;p.score+=10;g.lastEvent=`${p.name} found a Nutrition Boost! ⚡`;return ev}
 if(ev.t==="trap"){p.position=Math.max(0,p.position-3);g.lastEvent=`Sugar Trap! ${p.name} moved back 3. 🍭`;return ev}
 if(ev.t==="duel"){p.score+=5;g.lastEvent=`Duel tile! ${p.name} gets a challenge bonus. ⚔️`;g.phase="quiz";return{t:"quiz"}}
 if(ev.t==="quiz"){g.phase="quiz";return ev}
 g.lastEvent=`${p.name} moved to ${p.position}.`;return ev}
export function quizResult(g,uid,ok){const p=g.players[uid],c=CFG[g.difficulty];if(ok){p.correct++;p.streak++;p.bestStreak=Math.max(p.bestStreak,p.streak);const b=Math.min(3,Math.floor(p.streak/3));p.score+=c.points+b*5;p.xp+=c.points;if(b)p.position=Math.min(100,p.position+b);g.lastEvent=`Correct! ${p.name} +${c.points+b*5} points${b?` & +${b} move`:""}.`}else{p.wrong++;p.streak=0;if(c.penalty)p.position=Math.max(0,p.position-c.penalty);g.lastEvent=`Wrong! ${p.name}${c.penalty?` -${c.penalty} move`:" stays"}.`}g.phase="roll";g.pendingQuestionId=null}
export function useBoost(g,uid){const p=g.players[uid];if(!p.powerups.boost)return false;p.powerups.boost--;p.position=Math.min(100,p.position+3);p.score+=5;g.lastEvent=`${p.name} used Boost +3!`;return true}
