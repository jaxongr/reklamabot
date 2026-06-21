import{r as s,bt as P,j as e,T as B,h as S,i as C,B as F,aT as L,g as W,aH as N,R as q,C as m,S as u,D as K,aD as O,l as r,x as Q}from"./index-BmuR8mWc.js";import{A as v}from"./index-BPkwW031.js";const{Title:V,Text:c}=B,{Option:Y}=C,A=r.div`
  padding: 24px;
`,$=r(Q)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 760px;
`,U=r.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 24px;
`,p=r.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
  flex: 1;
`,Z=r.div`
  background: linear-gradient(135deg, #f0f7ff 0%, #f5fff5 100%);
  border-radius: 10px;
  padding: 24px;
  margin-top: 8px;
  border: 1px solid #d6e8ff;
`,G=r.div`
  text-align: center;
  color: #888;
  font-size: 13px;
  margin-top: 12px;
`,X=r.div`
  text-align: center;
  color: #aaa;
  font-size: 11px;
  margin-top: 4px;
`,_=["Fura","Kamaz","MAN","Volvo","Scania","DAF","Mercedes","HOWO","Shacman","Isuzu","Gazel","Porter","Labo","Damas","Tentli","Refrijerator","Samosval","Konteyner","Boshqa"],ae=()=>{const[o,b]=s.useState(""),[i,z]=s.useState(""),[h,T]=s.useState(void 0),[l,w]=s.useState(""),[n,D]=s.useState(""),[I,M]=s.useState(void 0),[y,R]=s.useState(!1),{data:k,isLoading:d,error:x}=P({from:l,to:n,vehicleType:I}),a=k,f=()=>{!o.trim()||!i.trim()||(w(o.trim()),D(i.trim()),M(h),R(!0))},g=t=>{t.key==="Enter"&&f()},j=!!l&&!!n,E=y&&j&&!d&&!x&&a&&a.sampleCount>0,H=y&&j&&!d&&!x&&(!a||a.sampleCount===0);return e.jsx(A,{children:e.jsxs($,{title:e.jsx(V,{level:4,style:{margin:0},children:"Narx taxmini"}),children:[e.jsxs(U,{children:[e.jsxs(p,{children:[e.jsx(c,{type:"secondary",style:{fontSize:13},children:"Qayerdan"}),e.jsx(S,{placeholder:"Masalan: Toshkent",value:o,onChange:t=>b(t.target.value),onKeyDown:g,size:"large",allowClear:!0})]}),e.jsxs(p,{children:[e.jsx(c,{type:"secondary",style:{fontSize:13},children:"Qayerga"}),e.jsx(S,{placeholder:"Masalan: Samarqand",value:i,onChange:t=>z(t.target.value),onKeyDown:g,size:"large",allowClear:!0})]}),e.jsxs(p,{children:[e.jsx(c,{type:"secondary",style:{fontSize:13},children:"Mashina turi (ixtiyoriy)"}),e.jsx(C,{placeholder:"Barcha turlar",value:h,onChange:T,size:"large",allowClear:!0,style:{width:"100%"},children:_.map(t=>e.jsx(Y,{value:t,children:t},t))})]}),e.jsx(F,{type:"primary",icon:e.jsx(L,{}),size:"large",loading:d,onClick:f,disabled:!o.trim()||!i.trim(),style:{minWidth:120},children:"Hisoblash"})]}),x&&e.jsx(v,{type:"error",message:"Xatolik",description:"Narx ma'lumotlarini olishda xatolik yuz berdi.",showIcon:!0,style:{marginBottom:16}}),H&&e.jsx(v,{type:"info",message:"Ma'lumot topilmadi",description:`${l} → ${n} yo'nalishi bo'yicha narx ma'lumoti mavjud emas.`,showIcon:!0}),E&&a&&e.jsxs(Z,{children:[e.jsxs(W,{style:{marginBottom:16},children:[e.jsx(N,{style:{fontSize:18,color:"#1677ff"}}),e.jsxs(c,{strong:!0,style:{fontSize:15},children:[a.fromCity||l," → ",a.toCity||n,a.vehicleType?` (${a.vehicleType})`:""]})]}),e.jsxs(q,{gutter:[24,16],children:[e.jsx(m,{xs:24,sm:8,children:e.jsx(u,{title:"O'rtacha narx",value:a.avgPrice,suffix:"so'm",valueStyle:{color:"#1677ff",fontWeight:700},formatter:t=>Number(t).toLocaleString("uz-UZ")})}),e.jsx(m,{xs:24,sm:8,children:e.jsx(u,{title:"Minimal narx",value:a.minPrice,suffix:"so'm",valueStyle:{color:"#52c41a",fontWeight:700},formatter:t=>Number(t).toLocaleString("uz-UZ")})}),e.jsx(m,{xs:24,sm:8,children:e.jsx(u,{title:"Maksimal narx",value:a.maxPrice,suffix:"so'm",valueStyle:{color:"#fa8c16",fontWeight:700},formatter:t=>Number(t).toLocaleString("uz-UZ")})})]}),e.jsx(K,{style:{margin:"16px 0 8px"}}),e.jsxs(G,{children:["Hisob-kitob ",a.sampleCount," ta buyurtma asosida amalga oshirildi"]}),a.lastCalculated&&e.jsxs(X,{children:["Oxirgi yangilanish: ",O(a.lastCalculated).format("DD.MM.YYYY HH:mm")]})]})]})})};export{ae as default};
