import{r as f,aD as g,b as M,j as e,T as z,aV as F,aF as K,F as G,M as L,bv as y,l as d,t as R,b7 as O,x as P,w as D}from"./index-BmuR8mWc.js";import{P as q}from"./progress-BaKm75E4.js";const{Title:B,Text:E}=z,{RangePicker:J}=K,_=d(P)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`,A=d.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-top: 12px;
`,H=d.div`
  aspect-ratio: 1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  background: ${({$intensity:r})=>r===0?"#f0f0f0":r<=5?"#d9f7be":r<=15?"#95de64":r<=40?"#52c41a":r<=80?"#237804":"#135200"};
  color: ${({$intensity:r})=>r>15?"#fff":"#333"};
  &:hover {
    opacity: 0.8;
    transform: scale(1.1);
  }
  transition: all 0.15s;
`,N=d.div`
  text-align: center;
  font-size: 11px;
  color: #999;
  font-weight: 500;
  padding-bottom: 4px;
`,Q=d.div`
  font-size: 12px;
  color: #666;
  font-weight: 600;
  margin: 8px 0 4px;
`,U=d.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  font-size: 12px;
  color: #666;
`,i=d.div`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: ${({$color:r})=>r};
`,X=()=>{const[r,b]=f.useState([g().subtract(30,"days"),g()]),[p,T]=f.useState(null),[w,m]=f.useState(!1),{data:u,isLoading:C}=M({queryKey:["topGroups",r[0]?.format("YYYY-MM-DD"),r[1]?.format("YYYY-MM-DD")],queryFn:()=>D.get("/analytics/top-groups",{params:{dateFrom:r[0]?.format("YYYY-MM-DD"),dateTo:r[1]?.format("YYYY-MM-DD"),limit:50}}).then(a=>a.data)}),{data:h,isLoading:v}=M({queryKey:["groupCalendar",p?.groupTelegramId,r[0]?.format("YYYY-MM-DD"),r[1]?.format("YYYY-MM-DD")],queryFn:()=>D.get("/analytics/group-calendar",{params:{groupTelegramId:p?.groupTelegramId,dateFrom:r[0]?.format("YYYY-MM-DD"),dateTo:r[1]?.format("YYYY-MM-DD")}}).then(a=>a.data),enabled:!!p?.groupTelegramId}),S=u?.length?Math.max(...u.map(a=>a.count)):1,I=[{title:"#",dataIndex:"rank",width:50,render:a=>e.jsx("span",{style:{fontWeight:600,color:a<=3?"#f5222d":"#666"},children:a})},{title:"Guruh nomi",dataIndex:"groupTitle",ellipsis:!0,render:(a,t)=>e.jsxs("div",{children:[e.jsx(E,{strong:!0,children:a}),e.jsx("div",{style:{fontSize:11,color:"#999",fontFamily:"monospace"},children:t.groupTelegramId})]})},{title:"Orderlar",dataIndex:"count",width:120,sorter:(a,t)=>a.count-t.count,render:a=>e.jsx(R,{color:"blue",children:a.toLocaleString()})},{title:"Ulush",dataIndex:"percentage",width:200,render:(a,t)=>e.jsx("div",{children:e.jsx(q,{percent:Math.round(t.count/S*100),size:"small",format:()=>`${a}%`,strokeColor:a>10?"#52c41a":a>3?"#1890ff":"#d9d9d9"})})},{title:"Kalendar",width:80,render:(a,t)=>e.jsxs("a",{onClick:()=>{T(t),m(!0)},children:[e.jsx(y,{})," Ko'rish"]})}],$=()=>{if(!h||v)return e.jsx(O,{});const a={};for(const o of h)a[o.date]=o.count;const t=r[0],Y=r[1],j=[];let c=t.startOf("day");for(;c.isBefore(Y)||c.isSame(Y,"day");)j.push(c),c=c.add(1,"day");const x={};for(const o of j){const s=o.format("YYYY-MM");x[s]||(x[s]=[]),x[s].push(o)}const k=["Du","Se","Ch","Pa","Ju","Sh","Ya"];return e.jsxs("div",{children:[e.jsxs(U,{children:[e.jsx("span",{children:"Kam"}),e.jsx(i,{$color:"#f0f0f0"}),e.jsx(i,{$color:"#d9f7be"}),e.jsx(i,{$color:"#95de64"}),e.jsx(i,{$color:"#52c41a"}),e.jsx(i,{$color:"#237804"}),e.jsx(i,{$color:"#135200"}),e.jsx("span",{children:"Ko'p"})]}),Object.entries(x).map(([o,s])=>e.jsxs("div",{children:[e.jsx(Q,{children:g(o+"-01").format("MMMM YYYY")}),e.jsxs(A,{children:[k.map(n=>e.jsx(N,{children:n},n)),Array.from({length:s[0].day()===0?6:s[0].day()-1}).map((n,l)=>e.jsx("div",{},`empty-${l}`)),s.map(n=>{const l=a[n.format("YYYY-MM-DD")]||0;return e.jsx(H,{$intensity:l,title:`${n.format("DD.MM")} — ${l} order`,children:l>0?l:""},n.format("YYYY-MM-DD"))})]})]},o))]})};return e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24},children:[e.jsxs(B,{level:2,children:[e.jsx(F,{})," Top Guruhlar"]}),e.jsx(J,{value:r,onChange:a=>{a&&a[0]&&a[1]&&b([a[0],a[1]])},format:"DD/MM/YYYY"})]}),e.jsx(_,{children:e.jsx(G,{columns:I,dataSource:u||[],loading:C,rowKey:"groupTelegramId",pagination:{pageSize:20,showSizeChanger:!0,showTotal:a=>`Jami: ${a}`},size:"middle"})}),e.jsx(L,{open:w,onCancel:()=>m(!1),title:e.jsxs("span",{children:[e.jsx(y,{})," ",p?.groupTitle," — Kunlik orderlar"]}),footer:null,width:600,children:$()})]})};export{X as default};
