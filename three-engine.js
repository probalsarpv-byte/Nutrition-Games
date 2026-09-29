import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import {FOOD_TILES,QUIZ_TILES,SNAKE_LADDERS} from "./data.js";
import {classicPath,classicTokenCell} from "./game-logic.js";

export class ThreeBoard{
  constructor(canvas){
    this.canvas=canvas;
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    this.renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
    this.renderer.shadowMap.enabled=true;
    this.scene=new THREE.Scene();
    this.camera=new THREE.PerspectiveCamera(42,1,.1,100);
    this.camera.position.set(0,12.5,12.5);this.camera.lookAt(0,0,0);
    this.root=new THREE.Group();this.scene.add(this.root);
    this.tokens=new Map();this.selectable=[];this.dice=null;this.mode="snake";
    const hemi=new THREE.HemisphereLight(0xffffff,0x35544d,1.8);this.scene.add(hemi);
    const dir=new THREE.DirectionalLight(0xffffff,2);dir.position.set(6,10,5);dir.castShadow=true;this.scene.add(dir);
    const floor=new THREE.Mesh(new THREE.CylinderGeometry(8.6,8.6,.5,64),new THREE.MeshStandardMaterial({color:0xd7ece4,roughness:.9}));
    floor.position.y=-.48;floor.receiveShadow=true;this.scene.add(floor);
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();
    this.resize();addEventListener("resize",()=>this.resize());this.animate();
  }
  resize(){const r=this.canvas.getBoundingClientRect();this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix()}
  clear(){
    while(this.root.children.length){const o=this.root.children.pop();o.traverse?.(n=>{n.geometry?.dispose?.();if(n.material){if(Array.isArray(n.material))n.material.forEach(m=>m.dispose?.());else n.material.dispose?.()}})}
    this.tokens.clear();this.dice=null;
  }
  sprite(text,scale=.7){
    const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");
    x.font="150px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText(text,128,135);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true}));
    s.scale.set(scale,scale,scale);return s;
  }
  label(text,scale=.35){
    const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");
    x.fillStyle="rgba(255,255,255,.95)";x.fillRect(0,0,256,256);x.fillStyle="#28453f";x.font="bold 120px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText(text,128,136);
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true}));
    s.scale.set(scale,scale,scale);return s;
  }
  panda(color=0x18b89c){
    const g=new THREE.Group(),white=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5}),black=new THREE.MeshStandardMaterial({color:0x171717,roughness:.65}),accent=new THREE.MeshStandardMaterial({color,roughness:.4});
    const head=new THREE.Mesh(new THREE.SphereGeometry(.4,24,20),white);head.scale.y=.92;head.castShadow=true;g.add(head);
    [-.27,.27].forEach(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.14,16,12),black);e.position.set(x,.26,0);g.add(e)});
    [-.15,.15].forEach(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.08,12,8),black);e.position.set(x,.05,.34);e.scale.y=1.35;g.add(e)});
    const nose=new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),black);nose.position.set(0,-.08,.37);g.add(nose);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.28,.055,10,24),accent);ring.rotation.x=Math.PI/2;ring.position.y=-.26;g.add(ring);
    return g;
  }
  addDice(){
    const mats=[1,2,3,4,5,6].map(n=>{
      const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,128,128);x.fillStyle="#111";x.font="88px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText(["⚀","⚁","⚂","⚃","⚄","⚅"][n-1],64,69);
      return new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.3});
    });
    this.dice=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mats);this.dice.position.set(0,1.15,0);this.dice.castShadow=true;this.root.add(this.dice);
  }
  tilePos(n){
    const row=Math.floor((n-1)/10),ci=(n-1)%10,col=row%2?9-ci:ci;
    return {x:col*1.08-4.86,z:row*1.08-4.86};
  }
  buildSnake(game){
    this.clear();this.mode="snake";
    for(let n=1;n<=100;n++){
      const p=this.tilePos(n);let color=n%2?0xeef8f4:0xdff0ea;
      if(FOOD_TILES[n])color=FOOD_TILES[n].kind==="good"?0xcaf2da:0xf8d4d8;
      if(QUIZ_TILES.includes(n))color=0xd7e7ff;
      const tile=new THREE.Mesh(new THREE.BoxGeometry(1,.20,1),new THREE.MeshStandardMaterial({color,roughness:.5,metalness:.03}));
      tile.position.set(p.x,0,p.z);tile.receiveShadow=true;this.root.add(tile);
      const l=this.label(String(n),.28);l.position.set(p.x,.18,p.z+.34);this.root.add(l);
      if(FOOD_TILES[n]){const f=this.sprite(FOOD_TILES[n].icon,.62);f.position.set(p.x,.42,p.z);this.root.add(f)}
      else if(QUIZ_TILES.includes(n)){const q=this.sprite("❓",.56);q.position.set(p.x,.4,p.z);this.root.add(q)}
    }
    this.addSnakesAndLadders();this.addDice();this.sync(game);
  }
  addSnakesAndLadders(){
    for(const [a,b] of Object.entries(SNAKE_LADDERS.ladders)){
      const p1=this.tilePos(+a),p2=this.tilePos(+b),dx=p2.x-p1.x,dz=p2.z-p1.z,len=Math.hypot(dx,dz),ang=Math.atan2(dz,dx);
      const g=new THREE.Group();
      for(const side of [-.13,.13]){const rail=new THREE.Mesh(new THREE.BoxGeometry(len,.07,.07),new THREE.MeshStandardMaterial({color:0x8d5a2b}));rail.rotation.y=-ang;rail.position.set((p1.x+p2.x)/2,.34,(p1.z+p2.z)/2);rail.position.x+=Math.sin(ang)*side;rail.position.z-=Math.cos(ang)*side;g.add(rail)}
      for(let i=1;i<6;i++){const t=i/6,x=p1.x+dx*t,z=p1.z+dz*t;const step=new THREE.Mesh(new THREE.BoxGeometry(.36,.06,.06),new THREE.MeshStandardMaterial({color:0xc7853d}));step.rotation.y=-ang+Math.PI/2;step.position.set(x,.35,z);g.add(step)}
      this.root.add(g);
    }
    for(const [a,b] of Object.entries(SNAKE_LADDERS.snakes)){
      const p1=this.tilePos(+a),p2=this.tilePos(+b),curve=new THREE.CatmullRomCurve3([
        new THREE.Vector3(p1.x,.42,p1.z),
        new THREE.Vector3((p1.x+p2.x)/2+1,.65,(p1.z+p2.z)/2),
        new THREE.Vector3((p1.x+p2.x)/2-1,.42,(p1.z+p2.z)/2+.6),
        new THREE.Vector3(p2.x,.38,p2.z)
      ]);
      const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,40,.12,8,false),new THREE.MeshStandardMaterial({color:0xe65a6c,roughness:.45}));
      mesh.castShadow=true;this.root.add(mesh);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),new THREE.MeshStandardMaterial({color:0xe65a6c}));head.position.copy(curve.getPoint(0));this.root.add(head);
    }
  }
  buildClassic(game){
    this.clear();this.mode="classic";const tile=.68,off=4.76;
    for(let r=0;r<15;r++)for(let c=0;c<15;c++){
      let color=0xf8fbf9;
      if(r<6&&c<6)color=0xdff6ee;else if(r<6&&c>8)color=0xeee9ff;else if(r>8&&c<6)color=0xfff0de;else if(r>8&&c>8)color=0xe2edff;
      const m=new THREE.Mesh(new THREE.BoxGeometry(tile,.16,tile),new THREE.MeshStandardMaterial({color,roughness:.7}));m.position.set(c*tile-off,0,r*tile-off);m.receiveShadow=true;this.root.add(m)
    }
    classicPath().forEach((p,i)=>{
      const [r,c]=p,x=c*tile-off,z=r*tile-off;let color=i%2?0xeaf5f1:0xffffff;
      if(FOOD_TILES[i+1])color=FOOD_TILES[i+1].kind==="good"?0xcaf2da:0xf8d4d8;if(QUIZ_TILES.includes(i+1))color=0xd7e7ff;
      const m=new THREE.Mesh(new THREE.BoxGeometry(tile*.92,.24,tile*.92),new THREE.MeshStandardMaterial({color,roughness:.45}));m.position.set(x,.11,z);this.root.add(m);
      if(FOOD_TILES[i+1]){const s=this.sprite(FOOD_TILES[i+1].icon,.42);s.position.set(x,.38,z);this.root.add(s)}
      else if(QUIZ_TILES.includes(i+1)){const s=this.sprite("❓",.38);s.position.set(x,.38,z);this.root.add(s)}
    });
    const center=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,.24,4),new THREE.MeshStandardMaterial({color:0xf5b63b}));center.rotation.y=Math.PI/4;center.position.set(0,.12,0);this.root.add(center);
    this.addDice();this.sync(game);
  }
  tokenKey(uid,idx){return `${uid}:${idx}`}
  sync(game){
    if(!game)return;const colors=[0x18b89c,0x7657e8,0xf28b34,0x3d8de8];
    for(const uid of game.order){
      const p=game.players[uid];
      if(game.mode==="snake"){
        const key=this.tokenKey(uid,0);let t=this.tokens.get(key);if(!t){t=this.panda(colors[p.slot-1]);this.tokens.set(key,t);this.root.add(t)}
        let x,z;if(p.snake.inYard){const yards=[[-5.6,-5.4],[5.6,-5.4],[-5.6,5.4],[5.6,5.4]];[x,z]=yards[p.slot-1]}else{const pos=this.tilePos(p.snake.pos);x=pos.x;z=pos.z}t.position.set(x,.72,z);t.userData={uid,idx:0};
      }else{
        p.classic.tokens.forEach((tok,i)=>{
          const key=this.tokenKey(uid,i);let t=this.tokens.get(key);if(!t){t=this.panda(colors[p.slot-1]);t.scale.setScalar(.76);this.tokens.set(key,t);this.root.add(t)}
          let x,z;if(tok.p<0){const sets=[[[-4.1,-4.1],[-3.25,-4.1],[-4.1,-3.25],[-3.25,-3.25]],[[3.25,-4.1],[4.1,-4.1],[3.25,-3.25],[4.1,-3.25]],[[-4.1,3.25],[-3.25,3.25],[-4.1,4.1],[-3.25,4.1]],[[3.25,3.25],[4.1,3.25],[3.25,4.1],[4.1,4.1]]];[x,z]=sets[p.slot-1][i]}else{const [r,c]=classicTokenCell(p,tok);x=c*.68-4.76;z=r*.68-4.76}t.position.set(x,.62,z);t.userData={uid,idx:i};
        })
      }
    }
  }
  highlight(list){
    this.selectable=list||[];
    for(const [key,g] of this.tokens){const [uid,idx]=key.split(":");const active=this.selectable.some(s=>s.uid===uid&&String(s.idx)===idx);const base=this.mode==="classic"?.76:1;g.scale.setScalar(active?base*1.18:base);g.traverse(o=>{if(o.material?.emissive)o.material.emissive.setHex(active?0x334400:0x000000)})}
  }
  async animateTokenTo(game,uid,idx=0){
    const g=this.tokens.get(this.tokenKey(uid,idx));if(!g)return;
    const end=g.position.clone();const start=end.clone();start.y+=.65;g.position.copy(start);
    const st=performance.now(),dur=380;
    return new Promise(res=>{const tick=(now)=>{const t=Math.min(1,(now-st)/dur),e=1-Math.pow(1-t,3);g.position.lerpVectors(start,end,e);g.position.y=end.y+Math.sin(t*Math.PI)*.5;if(t<1)requestAnimationFrame(tick);else{g.position.copy(end);res()}};requestAnimationFrame(tick)})
  }
  async rollDice(v){
    const d=this.dice;if(!d)return;const st=performance.now(),dur=900;
    return new Promise(res=>{const tick=(now)=>{const t=Math.min(1,(now-st)/dur),e=1-Math.pow(1-t,3);d.rotation.x=e*Math.PI*(5+v*.15);d.rotation.y=e*Math.PI*(7+v*.12);d.position.set(Math.sin(t*Math.PI*2)*2,1.15+Math.sin(t*Math.PI)*3.2,Math.cos(t*Math.PI*2)*1.2);if(t<1)requestAnimationFrame(tick);else{d.position.set(0,1.15,0);res()}};requestAnimationFrame(tick)})
  }
  pick(clientX,clientY){
    const r=this.canvas.getBoundingClientRect();this.pointer.x=((clientX-r.left)/r.width)*2-1;this.pointer.y=-((clientY-r.top)/r.height)*2+1;this.raycaster.setFromCamera(this.pointer,this.camera);
    const objs=[];for(const g of this.tokens.values())g.traverse(o=>{if(o.isMesh)objs.push(o)});
    const hits=this.raycaster.intersectObjects(objs,false);if(!hits.length)return null;let o=hits[0].object;while(o.parent&&!o.userData.uid)o=o.parent;return o.userData.uid?o.userData:null;
  }
  animate(){requestAnimationFrame(()=>this.animate());for(const g of this.tokens.values()){g.rotation.y+=.004;g.position.y+=Math.sin(performance.now()/500+g.position.x)*.0006}this.renderer.render(this.scene,this.camera)}
}