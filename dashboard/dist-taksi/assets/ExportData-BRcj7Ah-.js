import{r as d,I as w,bu as z,j as t,T as E,i as g,g as T,t as R,aF as I,aD as B,B as C,l as s,v as u,x as $}from"./index-BmuR8mWc.js";import{A}from"./index-BPkwW031.js";import{R as F}from"./DownloadOutlined-DGzK6WUn.js";var H={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0042 42h216v494zM504 618H320c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h184c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM312 490v48c0 4.4 3.6 8 8 8h384c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H320c-4.4 0-8 3.6-8 8z"}}]},name:"file-text",theme:"outlined"};function p(){return p=Object.assign?Object.assign.bind():function(r){for(var o=1;o<arguments.length;o++){var a=arguments[o];for(var l in a)Object.prototype.hasOwnProperty.call(a,l)&&(r[l]=a[l])}return r},p.apply(this,arguments)}const L=(r,o)=>d.createElement(w,p({},r,{ref:o,icon:H})),P=d.forwardRef(L),{RangePicker:q}=I,{Title:N,Text:c}=E,{Option:U}=g,J=s.div`
  padding: 24px;
`,V=s($)`
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 640px;
`,_=s.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`,x=s.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`,W=s.div`
  background: #f5f7fa;
  border-radius: 8px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 3px solid #1677ff;
`,f=[{value:"orders",label:"Buyurtmalar",color:"blue"},{value:"drivers",label:"Haydovchilar",color:"green"},{value:"offers",label:"Takliflar",color:"purple"},{value:"payments",label:"To'lovlar",color:"gold"}],K=()=>{const[r,o]=d.useState("orders"),[a,l]=d.useState([null,null]),{mutateAsync:m,isPending:y,error:v}=z(),j=f.find(e=>e.value===r),b=async()=>{try{const e={entity:r};a[0]&&(e.dateFrom=a[0].startOf("day").toISOString()),a[1]&&(e.dateTo=a[1].endOf("day").toISOString());const i=await m(e);if(!i){u.warning("Eksport qilish uchun ma'lumot topilmadi");return}const S=JSON.stringify(i,null,2),Y=new Blob([S],{type:"application/json;charset=utf-8"}),h=URL.createObjectURL(Y),k=a[0]?a[0].format("YYYYMMDD"):"all",M=a[1]?a[1].format("YYYYMMDD"):"all",D=`${r}_${k}_${M}.json`,n=document.createElement("a");n.href=h,n.download=D,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(h);const O=Array.isArray(i)?i.length:1;u.success(`${O} ta yozuv muvaffaqiyatli yuklandi`)}catch{u.error("Eksport qilishda xatolik yuz berdi")}};return t.jsx(J,{children:t.jsx(V,{title:t.jsx(N,{level:4,style:{margin:0},children:"Ma'lumot eksport"}),children:t.jsxs(_,{children:[t.jsxs(x,{children:[t.jsx(c,{strong:!0,children:"Ma'lumot turi"}),t.jsx(g,{value:r,onChange:e=>o(e),size:"large",style:{width:"100%"},children:f.map(e=>t.jsx(U,{value:e.value,children:t.jsx(T,{children:t.jsx(R,{color:e.color,style:{margin:0},children:e.label})})},e.value))})]}),t.jsxs(x,{children:[t.jsx(c,{strong:!0,children:"Sana oralig'i (ixtiyoriy)"}),t.jsx(q,{value:a,onChange:e=>l(e?[e[0],e[1]]:[null,null]),format:"DD.MM.YYYY",placeholder:["Boshlanish","Tugash"],size:"large",allowClear:!0,style:{width:"100%"},disabledDate:e=>e.isAfter(B())})]}),t.jsxs(W,{children:[t.jsx(P,{style:{fontSize:20,color:"#1677ff"}}),t.jsxs("div",{children:[t.jsx(c,{strong:!0,children:j?.label}),t.jsx("br",{}),t.jsxs(c,{type:"secondary",style:{fontSize:12},children:[a[0]&&a[1]?`${a[0].format("DD.MM.YYYY")} — ${a[1].format("DD.MM.YYYY")} oralig'i`:"Barcha vaqt oralig'i"," ","· JSON formatida yuklanadi"]})]})]}),v&&t.jsx(A,{type:"error",message:"Xatolik",description:"Ma'lumotlarni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.",showIcon:!0}),t.jsx(C,{type:"primary",icon:t.jsx(F,{}),size:"large",loading:y,onClick:b,style:{width:"100%",height:48,fontSize:15,fontWeight:600},children:"JSON yuklab olish"})]})})})};export{K as default};
