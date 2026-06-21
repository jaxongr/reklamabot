import{bs as m,j as t,T as j,s as u,b7 as w,l as n,x as k}from"./index-BmuR8mWc.js";const{Title:z,Text:i}=j,C=n.div`
  padding: 24px;
`,$=n(k)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
`,D=n.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 4px;
  min-width: 600px;
`,M=n.th`
  padding: 8px 12px;
  font-weight: 600;
  font-size: 13px;
  color: #555;
  text-align: center;
  white-space: nowrap;
  background: #f5f7fa;
  border-radius: 6px;
`,S=n.th`
  padding: 8px 12px;
  font-weight: 600;
  font-size: 13px;
  color: #333;
  text-align: left;
  white-space: nowrap;
  background: #f5f7fa;
  border-radius: 6px;
  min-width: 160px;
`,v=n.td`
  padding: 8px 6px;
  text-align: center;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: default;
  transition: transform 0.15s;
  background: ${({intensity:a})=>a===0?"#f9f9f9":`hsl(130, 60%, ${Math.round(95-a*45)}%)`};
  color: ${({intensity:a})=>a>.55?"#fff":"#333"};
  &:hover {
    transform: scale(1.08);
    z-index: 1;
    position: relative;
  }
`,A=n.td`
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  font-weight: 500;
`,R=n.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`,T=n.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: ${({intensity:a})=>a===0?"#f9f9f9":`hsl(130, 60%, ${Math.round(95-a*45)}%)`};
  border: 1px solid #e0e0e0;
`,L=["Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba","Yakshanba"],H=()=>{const{data:a,isLoading:l,error:f}=m(),o=a,p=o?.routes??[],s=o?.days??L,c=o?.data??{},x=Object.values(c).flat(),h=x.length>0?Math.max(...x,1):1,y=e=>!e||h===0?0:Math.min(e/h,1);return t.jsx(C,{children:t.jsxs($,{title:t.jsx(z,{level:4,style:{margin:0},children:"Kun-yo'nalish analitikasi"}),children:[t.jsxs(R,{children:[t.jsx(i,{type:"secondary",style:{fontSize:12,marginRight:4},children:"Zichlik:"}),[0,.2,.4,.6,.8,1].map(e=>t.jsx(u,{title:e===0?"Yo'q":`${Math.round(e*100)}%`,children:t.jsx(T,{intensity:e})},e)),t.jsx(i,{type:"secondary",style:{fontSize:12},children:"(past → yuqori)"})]}),f&&t.jsx(i,{type:"danger",style:{display:"block",marginBottom:16},children:"Ma'lumotlarni yuklashda xatolik yuz berdi."}),l?t.jsx("div",{style:{textAlign:"center",padding:"48px 0"},children:t.jsx(w,{size:"large"})}):p.length===0?t.jsx(i,{type:"secondary",style:{display:"block",textAlign:"center",padding:"32px 0"},children:"Ma'lumot topilmadi"}):t.jsxs(D,{children:[t.jsx("thead",{children:t.jsxs("tr",{children:[t.jsx(S,{children:"Yo'nalish"}),s.map((e,d)=>t.jsx(M,{children:e},d))]})}),t.jsx("tbody",{children:p.map((e,d)=>{const b=c[e]??Array(s.length).fill(0);return t.jsxs("tr",{children:[t.jsx(A,{children:e}),b.slice(0,s.length).map((r,g)=>t.jsx(u,{title:`${e} — ${s[g]}: ${r} ta buyurtma`,children:t.jsx(v,{intensity:y(r),children:r>0?r:""})},g))]},d)})})]})]})})};export{H as default};
