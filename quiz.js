export const QUESTIONS=[
{id:'q1',cat:'Food',q:'Which food is a good source of protein?',opts:['Egg','Sugar','Oil','Salt'],a:0,ex:'Egg provides high-quality protein.'},
{id:'q2',cat:'Fiber',q:'Which is a good source of dietary fiber?',opts:['Vegetables','Sugar','Ghee','Salt'],a:0,ex:'Vegetables are an important fiber source.'},
{id:'q3',cat:'Iron',q:'Vitamin C can help improve absorption of which nutrient?',opts:['Non-heme iron','Sodium','Cholesterol','Water'],a:0,ex:'Vitamin C can improve non-heme iron absorption.'},
{id:'q4',cat:'Metabolism',q:'Insulin helps regulate:',opts:['Blood glucose','Bone length','Skin color','Hearing'],a:0,ex:'Insulin is central to blood-glucose regulation.'}
];
export function getQuestion(game){let pool=QUESTIONS.filter(q=>!game.usedQuestions.includes(q.id));if(!pool.length){game.usedQuestions=[];pool=[...QUESTIONS];}const q=pool[Math.floor(Math.random()*pool.length)];game.usedQuestions.push(q.id);return q;}
