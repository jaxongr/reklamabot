import{r as c,bJ as A,bK as z,bL as E,j as e,T,g as $,bM as y,b7 as b,bp as f,P as L,t as j,bN as v,aG as w,h as M,B as N,n as H,v as B,l as n}from"./index-BmuR8mWc.js";const{Text:R,Title:F}=T,{TextArea:U}=M,_=n.div`
  padding: 24px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
`,V=n.div`
  margin-bottom: 16px;
`,X=n.div`
  display: flex;
  flex: 1;
  gap: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-height: 0;
`,G=n.div`
  width: 30%;
  min-width: 240px;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`,K=n.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
  font-size: 14px;
  color: #333;
`,O=n.div`
  flex: 1;
  overflow-y: auto;
`,W=n.div`
  padding: 12px 16px;
  cursor: pointer;
  border-left: 3px solid ${({$active:t})=>t?"#FC3F1D":"transparent"};
  background: ${({$active:t})=>t?"#fff5f3":"transparent"};
  transition: background 0.15s;

  &:hover {
    background: ${({$active:t})=>t?"#fff5f3":"#fafafa"};
  }
`,q=n.div`
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`,J=n.div`
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`,Y=n.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  min-width: 0;
`,Z=n.div`
  padding: 14px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
`,Q=n.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`,ee=n.div`
  display: flex;
  flex-direction: ${({$isStaff:t})=>t?"row-reverse":"row"};
  gap: 10px;
  align-items: flex-end;
`,te=n.div`
  max-width: 68%;
  padding: 10px 14px;
  border-radius: ${({$isStaff:t})=>t?"16px 16px 4px 16px":"16px 16px 16px 4px"};
  background: ${({$isStaff:t})=>t?"#FC3F1D":"#fff"};
  color: ${({$isStaff:t})=>t?"#fff":"#333"};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  word-break: break-word;
`,se=n.div`
  font-size: 11px;
  color: #bbb;
  margin-top: 4px;
`,ne=n.div`
  padding: 14px 20px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 10px;
  align-items: flex-end;
`,ie=n.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f8fa;
`,p={DISPATCHER_SUPPORT:{color:"orange",label:"Dispetcher"},DRIVER_SUPPORT:{color:"green",label:"Haydovchi"},DISPATCHER_GROUP:{color:"blue",label:"Guruh"},DRIVER_GROUP:{color:"purple",label:"Haydovchi guruhi"}};function S(t){if(t.name)return t.name;const i=t.participants?.[0]?.user;return i?(i.firstName||i.username||"Noma'lum foydalanuvchi").slice(0,15):`Xona #${t.id.slice(-6)}`}function ae(t){const i=t.messages;if(!i||i.length===0)return"Xabarlar yo'q";const o=i[i.length-1];return o.message.length>40?o.message.slice(0,40)+"…":o.message}function oe(t){return new Date(t).toLocaleString("uz-UZ",{hour:"2-digit",minute:"2-digit",day:"2-digit",month:"2-digit"})}function le(){const[t,i]=c.useState(""),[o,h]=c.useState(""),g=c.useRef(null),{data:C,isLoading:I}=A({limit:50}),{data:k,isLoading:D}=z(t,{limit:100}),u=E(),l=C?.data??[],x=k?.data??[],r=l.find(s=>s.id===t);c.useEffect(()=>{g.current?.scrollIntoView({behavior:"smooth"})},[x]);const m=async()=>{const s=o.trim();if(!(!s||!t))try{await u.mutateAsync({roomId:t,message:s}),h("")}catch{B.error("Xabar yuborishda xato")}},P=s=>{s.key==="Enter"&&!s.shiftKey&&(s.preventDefault(),m())};return e.jsxs(_,{children:[e.jsx(V,{children:e.jsx(F,{level:3,style:{margin:0},children:"Chat paneli"})}),e.jsxs(X,{children:[e.jsxs(G,{children:[e.jsx(K,{children:e.jsxs($,{children:[e.jsx(y,{}),"Suhbatlar (",l.length,")"]})}),e.jsx(O,{children:I?e.jsx("div",{style:{padding:24,textAlign:"center"},children:e.jsx(b,{})}):l.length===0?e.jsx("div",{style:{padding:24},children:e.jsx(f,{description:"Suhbatlar topilmadi",imageStyle:{height:40}})}):l.map(s=>{const a=p[s.type],d=s._count?.messages??0;return e.jsxs(W,{$active:s.id===t,onClick:()=>i(s.id),children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsx(q,{children:S(s)}),d>0&&e.jsx(L,{count:d,overflowCount:99,style:{fontSize:10}})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsx(J,{children:ae(s)}),e.jsx(j,{color:a?.color,style:{fontSize:10,lineHeight:"16px",marginLeft:4},children:a?.label??s.type})]})]},s.id)})})]}),r?e.jsxs(Y,{children:[e.jsxs(Z,{children:[e.jsx(v,{icon:e.jsx(w,{}),style:{background:"#FC3F1D"}}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsx("div",{style:{fontWeight:600},children:S(r)}),e.jsx(j,{color:p[r.type]?.color,style:{fontSize:11},children:p[r.type]?.label??r.type})]})]}),e.jsxs(Q,{children:[D?e.jsx("div",{style:{textAlign:"center",padding:32},children:e.jsx(b,{})}):x.length===0?e.jsx(f,{description:"Xabarlar yo'q"}):x.map(s=>{const a=s.sender?.role==="ADMIN"||s.sender?.role==="SUPER_ADMIN",d=(s.sender?.firstName||s.sender?.username||"Noma'lum").slice(0,15);return e.jsxs(ee,{$isStaff:a,children:[!a&&e.jsx(v,{size:"small",icon:e.jsx(w,{}),style:{flexShrink:0}}),e.jsxs("div",{children:[!a&&e.jsx(R,{type:"secondary",style:{fontSize:12,marginBottom:2,display:"block"},children:d}),e.jsx(te,{$isStaff:a,children:s.message}),e.jsx(se,{style:{textAlign:a?"right":"left"},children:oe(s.createdAt)})]})]},s.id)}),e.jsx("div",{ref:g})]}),e.jsxs(ne,{children:[e.jsx(U,{value:o,onChange:s=>h(s.target.value),onKeyDown:P,placeholder:"Xabar yozing... (Enter — yuborish)",autoSize:{minRows:1,maxRows:4},style:{flex:1,borderRadius:8}}),e.jsx(N,{type:"primary",icon:e.jsx(H,{}),onClick:m,loading:u.isPending,disabled:!o.trim(),style:{borderRadius:8,height:40},children:"Yuborish"})]})]}):e.jsx(ie,{children:e.jsx(f,{image:e.jsx(y,{style:{fontSize:64,color:"#ddd"}}),description:e.jsx(R,{type:"secondary",children:"Suhbat tanlang"})})})]})]})}export{le as default};
