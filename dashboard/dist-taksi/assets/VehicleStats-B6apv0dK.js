import{br as u,j as e,T as y,F as g,l as o,t as h,x as m}from"./index-BmuR8mWc.js";import{P as j}from"./progress-BaKm75E4.js";const{Title:f,Text:r}=y,S=o.div`
  padding: 24px;
`,b=o(m)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`,z=o.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`,l=o.div`
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px 20px;
  min-width: 120px;
  text-align: center;
`,T={Fura:"purple",Kamaz:"red",Gazel:"orange",Porter:"cyan",Labo:"lime",Damas:"gold",Tentli:"geekblue",Refrijerator:"blue",Samosval:"volcano",Konteyner:"magenta",MAN:"processing",Volvo:"success",Scania:"warning"};function k(s){return T[s]??"default"}const C=()=>{const{data:s,isLoading:d,error:c}=u(),n=Array.isArray(s)?s:[],i=n.reduce((t,a)=>t+a.count,0),p=[{title:"Mashina turi",dataIndex:"vehicleType",key:"vehicleType",render:t=>e.jsx(h,{color:k(t),style:{fontSize:13,padding:"2px 12px"},children:t||"Noma'lum"})},{title:"Buyurtmalar",dataIndex:"count",key:"count",sorter:(t,a)=>t.count-a.count,defaultSortOrder:"descend",render:t=>e.jsx(r,{strong:!0,style:{fontSize:15},children:t.toLocaleString()})},{title:"Ulush (%)",dataIndex:"percentage",key:"percentage",render:(t,a)=>{const x=t??(i>0?Math.round(a.count/i*1e3)/10:0);return e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx(j,{percent:x,showInfo:!1,strokeColor:"#52c41a",style:{width:140}}),e.jsxs(r,{style:{minWidth:44,textAlign:"right"},children:[x.toFixed(1),"%"]})]})}}];return e.jsx(S,{children:e.jsxs(b,{title:e.jsx(f,{level:4,style:{margin:0},children:"Mashina turlari"}),children:[!d&&!c&&n.length>0&&e.jsxs(z,{children:[e.jsxs(l,{children:[e.jsx(r,{type:"secondary",style:{fontSize:12},children:"Jami tur"}),e.jsx("br",{}),e.jsx(r,{strong:!0,style:{fontSize:20},children:n.length})]}),e.jsxs(l,{children:[e.jsx(r,{type:"secondary",style:{fontSize:12},children:"Jami buyurtma"}),e.jsx("br",{}),e.jsx(r,{strong:!0,style:{fontSize:20},children:i.toLocaleString()})]}),e.jsxs(l,{children:[e.jsx(r,{type:"secondary",style:{fontSize:12},children:"Eng ko'p"}),e.jsx("br",{}),e.jsx(r,{strong:!0,style:{fontSize:16},children:n[0]?.vehicleType||"—"})]})]}),c&&e.jsx(r,{type:"danger",style:{display:"block",marginBottom:16},children:"Ma'lumotlarni yuklashda xatolik yuz berdi."}),e.jsx(g,{dataSource:n.map((t,a)=>({...t,key:a})),columns:p,loading:d,pagination:{pageSize:20,showSizeChanger:!1},locale:{emptyText:"Ma'lumot topilmadi"},size:"middle"})]})})};export{C as default};
