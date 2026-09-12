import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
const app=express(); app.use(cors()); app.use(express.json());
const port=5000;
let parks=[
{id:1,name:'Central Square Parking',lat:13.0827,lng:80.2707,total:40,available:12,traffic:'Low',price:40,evTotal:6,evAvailable:3,walking:180},
{id:2,name:'Station Hub Parking',lat:13.0838,lng:80.2755,total:60,available:8,traffic:'Medium',price:35,evTotal:4,evAvailable:1,walking:260},
{id:3,name:'City Mall Parking',lat:13.0799,lng:80.2682,total:80,available:3,traffic:'High',price:60,evTotal:4,evAvailable:0,walking:120},
{id:4,name:'Riverside Parking',lat:13.0875,lng:80.277,total:30,available:18,traffic:'Low',price:25,evTotal:3,evAvailable:2,walking:420}];
let bookings=[];
const score=p=>Math.round((p.available/p.total*35)+(p.traffic==='Low'?30:p.traffic==='Medium'?18:6)+(p.evAvailable>0?15:0)+(p.walking<250?10:5)+(p.price<40?10:4));
app.get('/api/health',(req,res)=>res.json({ok:true,service:'ParkAI Demo Backend'}));
app.get('/api/parking',(req,res)=>res.json(parks.map(p=>({...p,score:score(p),status:p.available===0?'Full':p.available<5?'Limited':'Available'}))));
app.get('/api/recommend',(req,res)=>{let ranked=[...parks].sort((a,b)=>score(b)-score(a)); let best=ranked[0]; res.json({destination:req.query.destination||'Destination',recommendation:{...best,score:score(best),reason:`Best overall balance of ${best.traffic.toLowerCase()} traffic, ${best.available} available slots, ${best.walking}m walking distance and EV availability.`}})});
app.get('/api/bookings',(req,res)=>res.json(bookings));
app.post('/api/bookings',(req,res)=>{const p=parks.find(x=>x.id===Number(req.body.parkingId)); if(!p||p.available<1)return res.status(409).json({error:'Parking unavailable'}); p.available--; const b={id:crypto.randomUUID(),parkingId:p.id,parkingName:p.name,slot:`A-${String((p.total-p.available)).padStart(2,'0')}`,arrival:req.body.arrival||'Today 5:30 PM',price:p.price,status:'CONFIRMED',createdAt:new Date().toISOString()}; bookings.push(b); res.status(201).json(b)});
app.patch('/api/parking/:id',(req,res)=>{const p=parks.find(x=>x.id===Number(req.params.id)); if(!p)return res.sendStatus(404); Object.assign(p,req.body); res.json(p)});
app.listen(port,()=>console.log(`ParkAI backend running on http://localhost:${port}`));