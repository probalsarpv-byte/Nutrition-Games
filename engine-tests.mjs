import assert from 'node:assert/strict';
import {createGame} from '../core/game-factory.js';
import {beginRoll,finishAction} from '../core/turn-engine.js';
import {legalClassicMoves,applyClassicMove,classicWinner,tokenCell} from '../classic/classic-rules.js';
import {legalSnakeMove,applySnakeMove} from '../snake/snake-rules.js';

const classic=()=>createGame({mode:'classic',playType:'local',count:2,names:['A','B']});
const snake=()=>createGame({mode:'snake',playType:'local',count:2,names:['A','B']});

{const g=classic();assert.equal(g.players.p1.color,'green');assert.equal(g.players.p2.color,'orange');}
{const g=classic();beginRoll(g,5);assert.equal(legalClassicMoves(g,'p1',5).length,0);}
{const g=classic();beginRoll(g,6);const m=legalClassicMoves(g,'p1',6);assert.equal(m.length,4);applyClassicMove(g,'p1',0,6);assert.equal(g.players.p1.tokens[0].state,0);}
{const g=classic();beginRoll(g,6);applyClassicMove(g,'p1',0,6);finishAction(g,{bonusReasons:['SIX']});beginRoll(g,6);applyClassicMove(g,'p1',0,6);finishAction(g,{bonusReasons:['SIX']});const r=beginRoll(g,6);assert.equal(r.tripleCancel,true);assert.equal(g.players.p1.tokens[0].state,-1);assert.equal(g.currentTurn,'p1');}
{const g=classic();g.players.p1.tokens[0].state=56;beginRoll(g,2);assert.equal(legalClassicMoves(g,'p1',2).length,0);}
{const g=classic();g.players.p1.tokens.forEach(t=>t.state=57);assert.equal(classicWinner(g,'p1'),true);}
{const g=classic();g.players.p1.tokens[0].state=0;g.players.p2.tokens[0].state=26;assert.equal(tokenCell(g.players.p1,g.players.p1.tokens[0]).global,0);assert.equal(tokenCell(g.players.p2,g.players.p2.tokens[0]).global,0);}
{const g=snake();assert.equal(legalSnakeMove(g,'p1',2),false);assert.equal(legalSnakeMove(g,'p1',1),true);}
{const g=snake();beginRoll(g,1);applySnakeMove(g,'p1',1);assert.equal(g.players.p1.position,1);assert.equal(g.players.p1.outside,false);}
{const g=snake();beginRoll(g,1);applySnakeMove(g,'p1',1);finishAction(g,{bonusReasons:['ONE']});beginRoll(g,1);applySnakeMove(g,'p1',1);finishAction(g,{bonusReasons:['ONE']});const r=beginRoll(g,1);assert.equal(r.tripleCancel,true);assert.equal(g.players.p1.outside,true);assert.equal(g.players.p1.position,0);}
{const g=snake();g.players.p1.outside=false;g.players.p1.position=3;const o=applySnakeMove(g,'p1',1);assert.equal(g.players.p1.position,14);assert.equal(o.events.some(e=>e.type==='LADDER'),true);}
console.log('ALL ENGINE TESTS PASSED');
