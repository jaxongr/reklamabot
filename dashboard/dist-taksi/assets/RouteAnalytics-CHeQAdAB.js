import{r as y,bq as u,j as a,g as m,T as f,aF as j,F as k,l as n,t as l,x as S}from"./index-BmuR8mWc.js";import{P as b}from"./progress-BaKm75E4.js";const{RangePicker:C}=j,{Title:T,Text:r}=f,w=n.div`
  padding: 24px;
`,D=n(S)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`,F=n.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`,I=n.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  background: ${({rank:t})=>t===1?"#FFD700":t===2?"#C0C0C0":t===3?"#CD7F32":"#f0f0f0"};
  color: ${({rank:t})=>t<=3?"#333":"#666"};
`,R=n.div`
  display: flex;
  align-items: center;
  gap: 10px;
`,v=()=>{const[t,d]=y.useState([null,null]),s={limit:20};t[0]&&(s.dateFrom=t[0].startOf("day").toISOString()),t[1]&&(s.dateTo=t[1].endOf("day").toISOString());const{data:i,isLoading:c,error:x}=u(s),o=Array.isArray(i)?i:[],p=o.length>0?Math.max(...o.map(e=>e.count)):1,g=[{title:"#",dataIndex:"rank",key:"rank",width:60,render:e=>a.jsx(I,{rank:e,children:e})},{title:"Qayerdan",dataIndex:"from",key:"from",render:e=>a.jsx(l,{color:"blue",style:{fontSize:13,padding:"2px 10px"},children:e})},{title:"Qayerga",dataIndex:"to",key:"to",render:e=>a.jsx(l,{color:"green",style:{fontSize:13,padding:"2px 10px"},children:e})},{title:"Buyurtmalar soni",dataIndex:"count",key:"count",render:e=>a.jsxs(R,{children:[a.jsx(b,{percent:Math.round(e/p*100),showInfo:!1,strokeColor:"#1677ff",style:{width:120}}),a.jsx(r,{strong:!0,style:{minWidth:32},children:e})]})},{title:"O'rtacha masofa (km)",dataIndex:"avgDistance",key:"avgDistance",render:e=>e!=null?a.jsxs(r,{children:[Math.round(e)," km"]}):a.jsx(r,{type:"secondary",children:"—"})}];return a.jsx(w,{children:a.jsxs(D,{title:a.jsx(T,{level:4,style:{margin:0},children:"Top yo'nalishlar"}),children:[a.jsx(F,{children:a.jsxs(m,{children:[a.jsx(r,{type:"secondary",children:"Sana oralig'i:"}),a.jsx(C,{value:t,onChange:e=>d(e?[e[0],e[1]]:[null,null]),format:"DD.MM.YYYY",placeholder:["Boshlanish","Tugash"],allowClear:!0})]})}),x&&a.jsx(r,{type:"danger",style:{display:"block",marginBottom:16},children:"Ma'lumotlarni yuklashda xatolik yuz berdi."}),a.jsx(k,{dataSource:o.map((e,h)=>({...e,key:h})),columns:g,loading:c,pagination:{pageSize:20,showSizeChanger:!1},locale:{emptyText:"Ma'lumot topilmadi"},size:"middle"})]})})};export{v as default};
