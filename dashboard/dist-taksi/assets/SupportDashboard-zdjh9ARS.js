import{r as c,bO as U,bP as X,bQ as Y,bR as K,j as e,T as Z,a8 as f,Q as L,C as W,S as ee,i as b,t as y,F as te,b3 as ae,b7 as se,x as k,g as p,bN as j,aG as m,D as ie,bp as D,h as re,B as I,n as oe,bS as ne,v as u,P as le,l as r,R as ce}from"./index-BmuR8mWc.js";import{R as N}from"./CloseCircleOutlined-moWxEcBY.js";const{Title:de,Text:n}=Z,{TextArea:xe}=re,{Option:z}=b,pe=r.div`
  padding: 24px;
`,ue=r.div`
  margin-bottom: 24px;
`,fe=r(ce)`
  margin-bottom: 24px;
`,ge=r(k)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
`,he=r(k)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`,ye=r.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(100vh - 380px);
`,je=r.div`
  display: flex;
  flex-direction: ${({$isStaff:i})=>i?"row-reverse":"row"};
  gap: 10px;
  align-items: flex-end;
`,me=r.div`
  max-width: 75%;
  padding: 10px 14px;
  border-radius: ${({$isStaff:i})=>i?"16px 16px 4px 16px":"16px 16px 16px 4px"};
  background: ${({$isStaff:i})=>i?"#FC3F1D":"#f5f5f5"};
  color: ${({$isStaff:i})=>i?"#fff":"#333"};
  word-break: break-word;
  font-size: 13px;
`,Se=r.div`
  font-size: 11px;
  color: #bbb;
  margin-top: 3px;
`,be=r.div`
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`,d={OPEN:{color:"blue",label:"Ochiq",icon:e.jsx(f,{})},IN_PROGRESS:{color:"orange",label:"Jarayonda",icon:e.jsx(f,{})},RESOLVED:{color:"green",label:"Hal qilingan",icon:e.jsx(L,{})},CLOSED:{color:"default",label:"Yopilgan",icon:e.jsx(N,{})}},A=["OPEN","IN_PROGRESS","RESOLVED","CLOSED"];function S(i){return new Date(i).toLocaleString("uz-UZ",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}function we(){const[i,P]=c.useState(void 0),[v,w]=c.useState(1),[l,R]=c.useState(""),[$,T]=c.useState(!1),[g,x]=c.useState(""),{data:h,isLoading:M}=U({status:i,page:v,limit:20}),{data:a,isLoading:F}=X(l),E=Y(),O=K(),B=h?.data??[],_=h?.pagination?.total??0,J=h?.stats??{},C=t=>{R(t),T(!0),x("")},q=()=>{T(!1),R(""),x("")},V=async()=>{const t=g.trim();if(!(!t||!l))try{await E.mutateAsync({ticketId:l,message:t}),u.success("Javob yuborildi"),x("")}catch{u.error("Javob yuborishda xato")}},G=async t=>{if(l)try{await O.mutateAsync({ticketId:l,status:t}),u.success("Status yangilandi")}catch{u.error("Statusni yangilashda xato")}},H=[{title:"Mavzu",dataIndex:"subject",key:"subject",ellipsis:!0,render:t=>e.jsx("strong",{children:t})},{title:"Foydalanuvchi",key:"user",width:180,render:(t,s)=>{const o=s.user;return o?e.jsxs(p,{children:[e.jsx(j,{size:"small",icon:e.jsx(m,{})}),e.jsx("span",{children:o.firstName||o.username||o.telegramId||"—"})]}):e.jsx(n,{type:"secondary",children:"—"})}},{title:"Status",dataIndex:"status",key:"status",width:140,render:t=>{const s=d[t];return e.jsx(y,{color:s?.color,icon:s?.icon,children:s?.label??t})}},{title:"Xabarlar",key:"messages",width:100,render:(t,s)=>e.jsx(le,{count:s._count?.messages??0,showZero:!0,style:{backgroundColor:"#8c8c8c"}})},{title:"Sana",dataIndex:"createdAt",key:"createdAt",width:150,render:t=>S(t)},{title:"Amal",key:"action",width:100,render:(t,s)=>e.jsx(I,{type:"link",onClick:()=>C(s.id),style:{padding:0},children:"Ko'rish"})}];return e.jsxs(pe,{children:[e.jsx(ue,{children:e.jsx(de,{level:3,style:{margin:0},children:"Qo'llab-quvvatlash"})}),e.jsx(fe,{gutter:[16,16],children:[{key:"OPEN",label:"Ochiq",icon:e.jsx(f,{style:{color:"#1677ff",fontSize:24}}),color:"#e6f4ff"},{key:"IN_PROGRESS",label:"Jarayonda",icon:e.jsx(f,{style:{color:"#fa8c16",fontSize:24}}),color:"#fff7e6"},{key:"RESOLVED",label:"Hal qilingan",icon:e.jsx(L,{style:{color:"#52c41a",fontSize:24}}),color:"#f6ffed"},{key:"CLOSED",label:"Yopilgan",icon:e.jsx(N,{style:{color:"#8c8c8c",fontSize:24}}),color:"#fafafa"}].map(({key:t,label:s,icon:o,color:Q})=>e.jsx(W,{xs:24,sm:12,md:6,children:e.jsxs(ge,{style:{background:Q},children:[o,e.jsx(ee,{title:s,value:J[t]??0,style:{marginTop:8}})]})},t))}),e.jsxs(he,{children:[e.jsx("div",{style:{marginBottom:16,display:"flex",gap:12},children:e.jsx(b,{placeholder:"Status bo'yicha filtr",allowClear:!0,style:{width:200},onChange:t=>{P(t),w(1)},children:A.map(t=>e.jsx(z,{value:t,children:e.jsx(y,{color:d[t].color,children:d[t].label})},t))})}),e.jsx(te,{columns:H,dataSource:B,rowKey:"id",loading:M,pagination:{current:v,pageSize:20,total:_,onChange:t=>w(t),showTotal:t=>`Jami: ${t} ta`},onRow:t=>({onClick:()=>C(t.id),style:{cursor:"pointer"}}),locale:{emptyText:"Murojatlar topilmadi"}})]}),e.jsx(ae,{title:a?e.jsxs(p,{children:[e.jsx(ne,{}),e.jsx("span",{children:a.subject})]}):"Murojaat",open:$,onClose:q,width:520,extra:a&&e.jsx(b,{value:a.status,style:{width:160},onChange:G,loading:O.isPending,children:A.map(t=>e.jsx(z,{value:t,children:e.jsx(y,{color:d[t].color,children:d[t].label})},t))}),children:F?e.jsx("div",{style:{textAlign:"center",padding:48},children:e.jsx(se,{size:"large"})}):a?e.jsxs(e.Fragment,{children:[e.jsx(k,{size:"small",style:{marginBottom:16,background:"#fafafa"},children:e.jsxs(p,{direction:"vertical",size:4,children:[e.jsx(n,{type:"secondary",style:{fontSize:12},children:"Foydalanuvchi"}),e.jsxs(p,{children:[e.jsx(j,{size:"small",icon:e.jsx(m,{})}),e.jsx(n,{children:a.user?.firstName||a.user?.username||a.user?.telegramId||"Noma'lum"})]}),e.jsxs(n,{type:"secondary",style:{fontSize:12},children:["Yaratilgan: ",S(a.createdAt)]})]})}),e.jsx(ie,{style:{margin:"8px 0"},children:"Xabarlar"}),e.jsx(ye,{children:!a.messages||a.messages.length===0?e.jsx(D,{description:"Xabarlar yo'q"}):a.messages.map(t=>{const s=t.sender?.firstName||"Noma'lum";return e.jsxs(je,{$isStaff:t.isStaff,children:[!t.isStaff&&e.jsx(j,{size:"small",icon:e.jsx(m,{}),style:{flexShrink:0}}),e.jsxs("div",{children:[!t.isStaff&&e.jsx(n,{type:"secondary",style:{fontSize:11,display:"block",marginBottom:2},children:s}),e.jsx(me,{$isStaff:t.isStaff,children:t.message}),e.jsx(Se,{style:{textAlign:t.isStaff?"right":"left"},children:S(t.createdAt)})]})]},t.id)})}),a.status!=="CLOSED"&&a.status!=="RESOLVED"&&e.jsxs(be,{children:[e.jsx(xe,{value:g,onChange:t=>x(t.target.value),placeholder:"Javob yozing...",rows:3}),e.jsx(I,{type:"primary",icon:e.jsx(oe,{}),loading:E.isPending,onClick:V,disabled:!g.trim(),style:{alignSelf:"flex-end"},children:"Javob berish"})]}),(a.status==="CLOSED"||a.status==="RESOLVED")&&e.jsx(n,{type:"secondary",style:{display:"block",textAlign:"center",marginTop:12},children:"Bu murojaat yopilgan"})]}):e.jsx(D,{description:"Ma'lumot topilmadi"})})]})}export{we as default};
