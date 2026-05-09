import { useState, useEffect, useCallback } from "react";

const TEXTS = {
  EN: {
    brand:"Khang Trading", tagline:"AI Trading Intelligence",
    tabs:["Dashboard","AI Macro Desk","Macro View","Calendar"],
    bullish:"● Bullish", bearish:"● Bearish",
    aiAnalysis:"AI Analysis", deepDive:"Deep Dive ↗", quickOverview:"Quick Overview",
    edgeFactor:"Edge Factor", capitalFlow:"Capital Flow",
    riskTone:"Risk Tone", keyDriver:"Key Driver", watch:"Watch", avoid:"Avoid",
    loading:"Analyzing market...", overall:"Overall market sentiment",
    lastUpdate:"Last update", sessionLabel:"NY SESSION · 21:30 VN",
    marketMood:"Market Mood", policy:"Market Policy", outlook:"Global Economic Outlook",
    flow:"Flow", bearing:"Bearing", pulse:"Pulse", news:"News Stories",
    calendarTitle:"Economic Calendar",
    highImp:"High", medImp:"Med", lowImp:"Low", forecast:"Forecast", previous:"Previous",
    resistance:"RESISTANCE", support:"SUPPORT",
    sessionTimes:"Session Times (VN)", nyOpen:"NY Open", silverBullet:"Silver Bullet",
    lonClose:"London Close", nyClose:"NY Close", readMore:"Read more",
  },
  VI: {
    brand:"Khang Trading", tagline:"Phân Tích Giao Dịch Bằng AI",
    tabs:["Tổng Quan","Phân Tích AI","Macro Chi Tiết","Lịch Sự Kiện"],
    bullish:"● Tăng", bearish:"● Giảm",
    aiAnalysis:"Phân Tích AI", deepDive:"Phân Tích Sâu ↗", quickOverview:"Tổng Quan Nhanh",
    edgeFactor:"Chỉ Số Edge", capitalFlow:"Dòng Vốn",
    riskTone:"Khẩu Vị Rủi Ro", keyDriver:"Động Lực Chính", watch:"Theo Dõi", avoid:"Tránh",
    loading:"Đang phân tích...", overall:"Tâm lý thị trường chung",
    lastUpdate:"Cập nhật", sessionLabel:"PHIÊN NY · 21:30 VN",
    marketMood:"Tâm Lý Thị Trường", policy:"Chính Sách", outlook:"Triển Vọng Toàn Cầu",
    flow:"Dòng Lệnh", bearing:"Xu Hướng", pulse:"Nhịp Điệu", news:"Tin Tức",
    calendarTitle:"Lịch Kinh Tế",
    highImp:"Cao", medImp:"TB", lowImp:"Thấp", forecast:"Dự báo", previous:"Trước",
    resistance:"KHÁNG CỰ", support:"HỖ TRỢ",
    sessionTimes:"Giờ Phiên (VN)", nyOpen:"NY Mở Cửa", silverBullet:"Silver Bullet",
    lonClose:"London Đóng", nyClose:"NY Đóng Cửa", readMore:"Xem thêm",
  }
};

const INSTRS = [
  { id:"NQ",     label:"NQ / US100", flag:"🇺🇸", base:29241,  dec:2, conf:85, cat:"Futures Index",
    prompt:"Analyze NQ/US100 Nasdaq futures for today's NY session. Cover Fed policy, tech momentum, key levels, institutional bias. 2-3 sentences with clear directional bias." },
  { id:"XAUUSD", label:"XAU / USD",  flag:"🥇", base:3312,   dec:2, conf:70, cat:"Commodity",
    prompt:"Analyze XAU/USD Gold for today's NY session. Cover safe-haven demand, DXY correlation, geopolitical risk, key support/resistance. 2-3 sentences with clear directional bias." },
  { id:"US30",   label:"US30 / DOW", flag:"🏛️", base:41850,  dec:0, conf:75, cat:"Futures Index",
    prompt:"Analyze US30/Dow Jones futures for today's NY session. Cover macro risk, rate sensitivity, sector rotation. 2-3 sentences with clear directional bias." },
  { id:"VIX",    label:"VIX Index",  flag:"📊", base:18.42,  dec:2, conf:80, cat:"Volatility",
    prompt:"Analyze VIX volatility index. What does this level imply about equity risk sentiment and trading conditions today? 2-3 sentences." },
  { id:"DXY",    label:"DXY Index",  flag:"💵", base:99.82,  dec:3, conf:75, cat:"Dollar Index",
    prompt:"Analyze DXY US Dollar Index. Cover Fed policy trajectory, rate expectations, impact on Gold and NQ. 2-3 sentences." },
  { id:"BTC",    label:"BTC / USD",  flag:"₿",  base:104200, dec:0, conf:60, cat:"Crypto",
    prompt:"Analyze BTC/USD macro context. Cover risk-on/risk-off correlation with equities, institutional flows, key levels. 2-3 sentences." },
];

const CAP_FLOW=[{l:"VIX",v:+1.82},{l:"DXY",v:-0.18},{l:"US10Y",v:+0.12},{l:"US30",v:-0.31},{l:"US100",v:-0.24},{l:"XAUUSD",v:+0.74},{l:"COPPER",v:-0.43},{l:"USOIL",v:+0.95}];

const BG="#080f0b",CARD="#0c1510",BORDER="#182b1e",GREEN="#1db87a",RED="#e63946",AMBER="#f59e0b",TEXT="#c8ddd0",DIM="#4a6e58",WHITE="#f0f7f2",CARDH="#112018";

function parseJSON(txt){
  if(!txt)return null;
  let s=txt.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
  try{return JSON.parse(s);}catch{}
  const a=s.indexOf("{"),b=s.lastIndexOf("}");
  if(a>=0&&b>a){try{return JSON.parse(s.slice(a,b+1));}catch{}}
  const c=s.indexOf("["),d=s.lastIndexOf("]");
  if(c>=0&&d>c){try{return JSON.parse(s.slice(c,d+1));}catch{}}
  return null;
}

async function ai(prompt,sys="You are a professional trading analyst. Be concise and direct."){
  try{
    const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,system:sys})});
    const d=await r.json();
    return d.text||"";
  }catch{return "";}
}

function usePrices(){
  const[prices,setPrices]=useState(()=>{
    const out={};
    INSTRS.forEach((i,n)=>{const seed=(((Date.now()%1000)*(n+7)*13)%100)/100;const init=(seed-0.5)*0.8;out[i.id]={price:i.base*(1+init/100),change:init};});
    return out;
  });
  useEffect(()=>{
    const t=setInterval(()=>{
      setPrices(prev=>{
        const next={...prev};
        INSTRS.forEach(i=>{const drift=(Math.random()-0.5)*0.00035;const np=next[i.id].price*(1+drift);next[i.id]={price:np,change:((np-i.base)/i.base)*100};});
        return next;
      });
    },3500);
    return()=>clearInterval(t);
  },[]);
  return prices;
}

function ConfBar({value}){
  const col=value>=75?GREEN:value>=60?AMBER:RED;
  return(<div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:DIM,letterSpacing:"0.1em",textTransform:"uppercase"}}>Confidence</span><span style={{fontSize:11,color:TEXT,fontFamily:"monospace"}}>{value}%</span></div><div style={{height:3,background:BORDER,borderRadius:2}}><div style={{height:"100%",width:`${value}%`,background:col,borderRadius:2,transition:"width 1s"}}/></div></div>);
}
function BiasTag({up,t}){return(<span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:3,letterSpacing:"0.08em",background:up?"rgba(29,184,122,0.12)":"rgba(230,57,70,0.12)",color:up?GREEN:RED,border:`1px solid ${up?"rgba(29,184,122,0.3)":"rgba(230,57,70,0.3)"}`}}>{up?t.bullish:t.bearish}</span>);}
function Dots(){return(<div style={{display:"flex",gap:4,alignItems:"center",padding:"6px 0"}}>{[0,1,2].map(i=>(<div key={i} style={{width:5,height:5,borderRadius:"50%",background:GREEN,opacity:.5,animation:"ktP 1.2s ease-in-out infinite",animationDelay:`${i*.2}s`}}/>))}</div>);}
function EdgeFactor({score,label}){const col=score>=65?GREEN:score>=40?AMBER:RED;return(<div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:64,height:64,borderRadius:"50%",border:`2px solid ${col}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`${col}12`,flexShrink:0}}><span style={{fontSize:22,fontWeight:900,color:col,lineHeight:1}}>{score}</span></div><div><div style={{fontSize:9,color:DIM,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>Edge Factor</div><div style={{fontSize:12,color:col,fontWeight:700}}>{label}</div></div></div>);}

function CapFlow({t}){
  const max=Math.max(...CAP_FLOW.map(d=>Math.abs(d.v)));
  return(<div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18}}><div style={{fontSize:12,fontWeight:600,color:WHITE,marginBottom:14}}>{t.capitalFlow}</div>{CAP_FLOW.map(item=>{const pos=item.v>=0,pct=Math.abs(item.v)/max;return(<div key={item.l} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}><span style={{width:50,fontSize:11,color:DIM}}>{item.l}</span><div style={{flex:1,height:4,background:BORDER,borderRadius:2,position:"relative"}}><div style={{position:"absolute",top:"-3px",left:"50%",width:1,height:10,background:BORDER}}/><div style={{position:"absolute",top:0,height:"100%",width:`${pct*50}%`,background:pos?GREEN:RED,borderRadius:2,left:pos?"50%":`${50-pct*50}%`}}/></div><span style={{width:42,fontSize:11,textAlign:"right",color:pos?GREEN:RED,fontFamily:"monospace"}}>{pos?"+":""}{item.v.toFixed(2)}</span></div>);})}</div>);
}

function DashboardTab({t,lang,prices}){
  const[brief,setBrief]=useState(null);
  const[loading,setLoading]=useState(true);
  const timeStr=new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"});
  useEffect(()=>{
    setLoading(true);setBrief(null);
    const isVI=lang==="VI";
    const prompt=isVI
      ?`Tóm tắt phiên NY hôm nay cho trader NQ và Vàng. CHỈ trả về JSON hợp lệ, không có text khác:\n{"risk_tone":"cụm từ ngắn","key_driver":"động lực chính","watch":"sự kiện cần theo dõi","avoid":"hành vi cần tránh","overall_bias":"Tăng Nhẹ","confidence_index":72,"briefing":"2 câu tổng quan"}`
      :`Session brief for today's NY session for NQ and Gold traders. Return ONLY valid JSON, nothing else:\n{"risk_tone":"short phrase","key_driver":"main driver","watch":"specific event or level","avoid":"specific behavior","overall_bias":"Moderately Bullish","confidence_index":72,"briefing":"2-sentence narrative"}`;
    ai(prompt,"Return ONLY valid JSON. No markdown. No text before or after. Just the JSON.").then(txt=>{
      setBrief(parseJSON(txt));
      setLoading(false);
    });
  },[lang]);

  return(<div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}><div>
    <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:26,marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:GREEN,boxShadow:`0 0 8px ${GREEN}`}}/>
          <span style={{fontSize:10,color:GREEN,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase"}}>AI · SESSION BRIEF</span>
        </div>
        <span style={{fontSize:10,color:DIM,fontFamily:"monospace"}}>{t.sessionLabel} · {timeStr}</span>
      </div>
      {loading?(<div style={{padding:"16px 0"}}><Dots/><p style={{color:DIM,fontSize:12,marginTop:8}}>{t.loading}</p></div>):brief?(
        <>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,padding:"10px 14px",background:"rgba(29,184,122,0.06)",border:`1px solid ${BORDER}`,borderRadius:8}}>
            <span style={{fontSize:11,color:DIM}}>{t.overall}:</span>
            <span style={{fontSize:12,fontWeight:600,color:GREEN,background:"rgba(29,184,122,0.12)",padding:"2px 12px",borderRadius:20,border:"1px solid rgba(29,184,122,0.25)"}}>{brief.overall_bias}</span>
            <span style={{marginLeft:"auto",fontSize:11,color:DIM}}>Confidence: <span style={{color:TEXT}}>{brief.confidence_index}%</span></span>
          </div>
          <p style={{fontSize:13,color:TEXT,lineHeight:1.75,marginBottom:20}}>{brief.briefing}</p>
          {[{k:"risk_tone",label:t.riskTone,col:"#60a5fa",icon:"◉"},{k:"key_driver",label:t.keyDriver,col:GREEN,icon:"▲"},{k:"watch",label:t.watch,col:AMBER,icon:"◈"},{k:"avoid",label:t.avoid,col:RED,icon:"⚠"}].map(row=>(
            <div key={row.k} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:`1px solid ${BORDER}`}}>
              <div style={{display:"flex",alignItems:"center",gap:6,minWidth:120,flexShrink:0}}>
                <span style={{color:row.col,fontSize:11}}>{row.icon}</span>
                <span style={{fontSize:9,color:row.col,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>{row.label}</span>
              </div>
              <span style={{fontSize:12,color:TEXT,lineHeight:1.6}}>{brief[row.k]}</span>
            </div>
          ))}
        </>
      ):<p style={{color:DIM,fontSize:13}}>{lang==="VI"?"Đang tải...":"Loading..."}</p>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      {INSTRS.slice(0,4).map(ins=>{
        const pr=prices[ins.id];if(!pr)return null;
        return(<div key={ins.id} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18,transition:"border-color 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(29,184,122,0.3)"} onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,fontWeight:700,color:WHITE}}>{ins.label}</span><BiasTag up={pr.change>=0} t={t}/></div>
          <div style={{fontSize:20,fontWeight:800,color:WHITE,fontFamily:"monospace",marginBottom:3}}>{pr.price.toFixed(ins.dec).replace(/\B(?=(\d{3})+(?!\d))/g,",")}</div>
          <div style={{fontSize:12,color:pr.change>=0?GREEN:RED,fontFamily:"monospace",marginBottom:12}}>{pr.change>=0?"+":""}{pr.change.toFixed(2)}%</div>
          <ConfBar value={ins.conf}/>
        </div>);
      })}
    </div>
  </div>
  <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <CapFlow t={t}/>
    <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18}}>
      <div style={{fontSize:12,fontWeight:600,color:WHITE,marginBottom:14}}>{t.sessionTimes}</div>
      {[{label:t.nyOpen,time:"21:30",active:false},{label:t.silverBullet,time:"21:00–22:00",active:true},{label:t.lonClose,time:"19:00",active:false},{label:t.nyClose,time:"04:00 +1",active:false}].map(s=>(
        <div key={s.label} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${BORDER}`}}>
          <span style={{fontSize:12,color:s.active?GREEN:DIM}}>{s.label}</span>
          <span style={{fontSize:12,fontFamily:"monospace",color:s.active?GREEN:TEXT,fontWeight:s.active?700:400}}>{s.time}</span>
        </div>
      ))}
    </div>
  </div></div>);
}

function MacroDeskTab({t,lang,prices}){
  const[analyses,setAnalyses]=useState({});
  const[loading,setLoading]=useState({NQ:true,XAUUSD:true,US30:true,VIX:true,DXY:true,BTC:true});
  const[expanded,setExpanded]=useState({});
  const[update]=useState(new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"}));
  useEffect(()=>{
    const init={};INSTRS.forEach(i=>{init[i.id]=true;});setLoading(init);
    INSTRS.forEach((ins,idx)=>{
      setTimeout(()=>{
        const p=lang==="VI"?`${ins.prompt} Phân tích 2-3 câu bằng tiếng Việt.`:ins.prompt;
        ai(p).then(txt=>{setAnalyses(prev=>({...prev,[ins.id]:txt}));setLoading(prev=>({...prev,[ins.id]:false}));});
      },idx*400);
    });
  },[lang]);
  const upCount=INSTRS.filter(i=>prices[i.id]?.change>=0).length;
  const sentiment=upCount>=4?(lang==="VI"?"Tăng Nhẹ":"Moderately Bullish"):upCount<=2?(lang==="VI"?"Giảm Nhẹ":"Moderately Bearish"):(lang==="VI"?"Hỗn Hợp":"Mixed");
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
      <div><h2 style={{fontSize:20,fontWeight:700,color:WHITE,margin:0}}>{lang==="VI"?"Phân Tích Xu Hướng AI":"AI Market Bias Dashboard"}</h2><p style={{fontSize:12,color:DIM,marginTop:5}}>{lang==="VI"?"Phân tích tổ chức kết hợp AI":"Deep institutional analysis meets AI clarity"}</p></div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontSize:11,color:DIM}}>{t.overall}:</span>
        <span style={{fontSize:11,fontWeight:600,padding:"3px 12px",borderRadius:20,color:upCount>=4?GREEN:RED,background:upCount>=4?"rgba(29,184,122,0.1)":"rgba(230,57,70,0.1)",border:`1px solid ${upCount>=4?"rgba(29,184,122,0.25)":"rgba(230,57,70,0.25)"}`}}>{sentiment}</span>
        <span style={{fontSize:11,color:DIM}}>{t.lastUpdate}: <span style={{color:TEXT}}>{update}</span></span>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
      {INSTRS.map(ins=>{
        const pr=prices[ins.id];if(!pr)return null;
        const txt=analyses[ins.id]||"";const short=txt.length>150?txt.slice(0,147)+"...":txt;const isExp=expanded[ins.id];
        return(<div key={ins.id} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:20,transition:"border-color 0.2s,transform 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(29,184,122,0.35)";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.transform="none";}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div><div style={{fontSize:14,fontWeight:700,color:WHITE}}>{ins.label}</div><div style={{fontSize:20,fontWeight:800,color:WHITE,fontFamily:"monospace",marginTop:2}}>{pr.price.toFixed(ins.dec).replace(/\B(?=(\d{3})+(?!\d))/g,",")}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:12,fontFamily:"monospace",color:pr.change>=0?GREEN:RED,marginBottom:5}}>{pr.change>=0?"+":""}{pr.change.toFixed(2)}%</div><BiasTag up={pr.change>=0} t={t}/></div>
          </div>
          <ConfBar value={ins.conf}/>
          <div style={{fontSize:10,color:DIM,marginTop:5,marginBottom:12}}>↻ {t.lastUpdate}: {1+Math.floor(Math.random()*8)}m ago</div>
          <div style={{borderTop:`1px solid ${BORDER}`,paddingTop:12}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8}}><div style={{width:5,height:5,borderRadius:"50%",background:GREEN}}/><span style={{fontSize:9,color:GREEN,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>{t.aiAnalysis}</span></div>
            {loading[ins.id]?<Dots/>:(
              <><p style={{fontSize:12,color:"#8fb39e",lineHeight:1.7,margin:0}}>{isExp?txt:short}{txt.length>150&&!isExp&&(<span style={{color:GREEN,cursor:"pointer",marginLeft:4}} onClick={()=>setExpanded(p=>({...p,[ins.id]:true}))}>{t.readMore}</span>)}</p>
              <div style={{display:"flex",gap:8,marginTop:14}}>
                <button style={{flex:1,padding:"7px 0",fontSize:11,border:`1px solid ${BORDER}`,borderRadius:6,background:"transparent",color:DIM,cursor:"pointer",fontFamily:"inherit"}}>{t.quickOverview}</button>
                <button style={{flex:1,padding:"7px 0",fontSize:11,border:`1px solid ${GREEN}`,borderRadius:6,background:"rgba(29,184,122,0.1)",color:GREEN,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>{t.deepDive}</button>
              </div></>
            )}
          </div>
        </div>);
      })}
    </div>
  </div>);
}

function MacroViewTab({t,lang,prices}){
  const[sel,setSel]=useState("NQ");const[data,setData]=useState(null);const[loading,setLoading]=useState(false);
  const ins=INSTRS.find(i=>i.id===sel);const pr=prices[sel];
  useEffect(()=>{
    setLoading(true);setData(null);
    const isVI=lang==="VI";
    const prompt=isVI
      ?`Phân tích macro cho ${ins.label}. CHỈ trả về JSON:\n{"ai_overview":"2-3 câu","edge_score":55,"edge_label":"Cơ Hội Tốt","market_mood":"RỦI RO CAO","mood_desc":"2 câu","policy":"THẮT CHẶT","policy_desc":"2 câu","outlook":"2 câu","flow":"LÀNH MẠNH","bearing":"XU HƯỚNG","pulse":"GIAO DỊCH ĐƯỢC","news":["tin1","tin2","tin3"],"support":"mức","resistance":"mức","bias":"MUA"}`
      :`Macro analysis for ${ins.label}. Return ONLY valid JSON:\n{"ai_overview":"2-3 sentences","edge_score":55,"edge_label":"High Confidence","market_mood":"RISK-ON","mood_desc":"2 sentences","policy":"HAWKISH","policy_desc":"2 sentences","outlook":"2 sentences","flow":"HEALTHY","bearing":"TRENDING","pulse":"TRADEABLE","news":["h1","h2","h3"],"support":"level","resistance":"level","bias":"LONG"}`;
    ai(prompt,"Return ONLY valid JSON. No markdown. No text before or after.").then(txt=>{setData(parseJSON(txt));setLoading(false);});
  },[sel,lang]);
  const moodUp=data?.market_mood?.includes("ON")||data?.market_mood?.includes("CAO");
  const moodDn=data?.market_mood?.includes("OFF")||data?.market_mood?.includes("THỦ");
  const moodCol=moodUp?GREEN:moodDn?RED:AMBER;
  const biasUp=data?.bias==="LONG"||data?.bias==="MUA";
  const biasDn=data?.bias==="SHORT"||data?.bias==="BÁN";
  return(<div>
    <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
      {INSTRS.map(i=>(<button key={i.id} onClick={()=>setSel(i.id)} style={{padding:"8px 18px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",border:sel===i.id?`1px solid ${GREEN}`:`1px solid ${BORDER}`,background:sel===i.id?"rgba(29,184,122,0.15)":"transparent",color:sel===i.id?GREEN:DIM,transition:"all 0.15s"}}>{i.flag} {i.label}</button>))}
    </div>
    {pr&&(<>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:22}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}><span style={{fontSize:32}}>{ins.flag}</span><div><div style={{fontSize:18,fontWeight:800,color:WHITE}}>{ins.label}</div><div style={{fontSize:10,color:DIM,textTransform:"uppercase",letterSpacing:"0.1em"}}>{ins.cat}</div></div></div>
          <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:14}}><span style={{fontSize:28,fontWeight:800,color:WHITE,fontFamily:"monospace"}}>{pr.price.toFixed(ins.dec).replace(/\B(?=(\d{3})+(?!\d))/g,",")}</span><span style={{fontSize:14,color:pr.change>=0?GREEN:RED,fontFamily:"monospace"}}>{pr.change>=0?"+":""}{pr.change.toFixed(2)}%</span></div>
          <ConfBar value={ins.conf}/>
          {data&&!loading&&(<div style={{display:"flex",gap:10,marginTop:14}}>
            <div style={{padding:"8px 14px",borderRadius:7,background:`${GREEN}12`,border:`1px solid ${GREEN}35`}}><div style={{fontSize:9,color:GREEN,letterSpacing:"0.1em",marginBottom:2}}>{t.support}</div><div style={{fontSize:13,color:GREEN,fontFamily:"monospace",fontWeight:600}}>{data.support}</div></div>
            <div style={{padding:"8px 14px",borderRadius:7,background:`${RED}12`,border:`1px solid ${RED}35`}}><div style={{fontSize:9,color:RED,letterSpacing:"0.1em",marginBottom:2}}>{t.resistance}</div><div style={{fontSize:13,color:RED,fontFamily:"monospace",fontWeight:600}}>{data.resistance}</div></div>
          </div>)}
        </div>
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:22}}>
          {loading?(<><EdgeFactor score="—" label="Loading..."/><Dots/></>):data?(<>
            <EdgeFactor score={data.edge_score} label={data.edge_label}/>
            <p style={{fontSize:12,color:"#8fb39e",lineHeight:1.75,marginTop:16}}>{data.ai_overview}</p>
            {data.bias&&(<div style={{marginTop:14,display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:6,background:biasUp?"rgba(29,184,122,0.1)":biasDn?"rgba(230,57,70,0.1)":"rgba(245,158,11,0.1)",border:`1px solid ${biasUp?GREEN:biasDn?RED:AMBER}40`}}><span style={{fontSize:10,color:DIM}}>Bias:</span><span style={{fontSize:13,fontWeight:700,color:biasUp?GREEN:biasDn?RED:AMBER}}>{data.bias}</span></div>)}
          </>):null}
        </div>
      </div>
      {data&&!loading&&(<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18}}><div style={{fontSize:10,color:DIM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>{t.marketMood}</div><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{width:44,height:44,borderRadius:"50%",border:`2px solid ${moodCol}`,display:"flex",alignItems:"center",justifyContent:"center",background:`${moodCol}12`}}><span style={{fontSize:16}}>{moodUp?"📈":moodDn?"📉":"◼"}</span></div><span style={{fontSize:13,fontWeight:700,color:moodCol}}>{data.market_mood}</span></div><p style={{fontSize:11,color:"#6a8e78",lineHeight:1.65,margin:0}}>{data.mood_desc}</p></div>
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18}}><div style={{fontSize:10,color:DIM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>{t.policy}</div><span style={{fontSize:12,fontWeight:700,letterSpacing:"0.08em",padding:"4px 12px",display:"inline-block",marginBottom:12,borderRadius:5,background:`${AMBER}18`,color:AMBER,border:`1px solid ${AMBER}40`}}>{data.policy}</span><p style={{fontSize:11,color:"#6a8e78",lineHeight:1.65,margin:0}}>{data.policy_desc}</p></div>
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18}}><div style={{fontSize:10,color:DIM,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>{t.outlook}</div><p style={{fontSize:11,color:"#6a8e78",lineHeight:1.65,margin:0}}>{data.outlook}</p></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18}}>
            {[{label:t.flow,val:data.flow,col:data.flow?.includes("HEAL")||data.flow?.includes("MẠNH")?GREEN:AMBER},{label:t.bearing,val:data.bearing,col:data.bearing?.includes("TREND")||data.bearing?.includes("XU")?GREEN:AMBER},{label:t.pulse,val:data.pulse,col:data.pulse?.includes("WILD")||data.pulse?.includes("BIẾN")?RED:data.pulse?.includes("QUIET")||data.pulse?.includes("YÊN")?DIM:GREEN}].map(row=>(<div key={row.label} style={{marginBottom:18}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:10,color:DIM,letterSpacing:"0.1em",textTransform:"uppercase"}}>{row.label}</span><span style={{fontSize:11,fontWeight:700,color:row.col}}>{row.val}</span></div><div style={{height:5,background:BORDER,borderRadius:3,position:"relative"}}><div style={{position:"absolute",top:0,height:"100%",width:"30%",background:row.col,borderRadius:3,left:"35%"}}/></div></div>))}
          </div>
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:18}}>
            <div style={{fontSize:12,fontWeight:600,color:WHITE,marginBottom:14}}>{t.news}</div>
            {(data.news||[]).map((h,i)=>(<div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:i<data.news.length-1?`1px solid ${BORDER}`:"none"}}><div style={{width:3,minHeight:16,borderRadius:2,background:GREEN,flexShrink:0,marginTop:3}}/><span style={{fontSize:12,color:"#8fb39e",lineHeight:1.55}}>{h}</span></div>))}
          </div>
        </div>
      </>)}
    </>)}
  </div>);
}

function CalendarTab({t,lang}){
  const[events,setEvents]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{
    setLoading(true);setEvents([]);
    const isVI=lang==="VI";
    const prompt=isVI
      ?`Lịch kinh tế hôm nay 9/5/2026 cho trader NQ và Vàng. CHỈ trả về JSON array hợp lệ, 9 sự kiện:\n[{"time":"HH:MM +7","currency":"USD","name":"tên","impact":"CAO","forecast":"gtri","previous":"gtri","analysis":"1 câu","confidence":72}]`
      :`Economic calendar May 9 2026 for NQ and Gold traders. Return ONLY valid JSON array, 9 events:\n[{"time":"HH:MM GMT+7","currency":"USD","name":"event","impact":"HIGH","forecast":"val","previous":"val","analysis":"1 sentence","confidence":72}]`;
    ai(prompt,"Return ONLY a valid JSON array. No markdown. No text before or after. Just the array starting with [").then(txt=>{
      const parsed=parseJSON(txt);setEvents(Array.isArray(parsed)?parsed:[]);setLoading(false);
    });
  },[lang]);
  const ic=imp=>imp==="HIGH"||imp==="CAO"?RED:imp==="MEDIUM"||imp==="TRUNG BÌNH"?AMBER:DIM;
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
      <div><h2 style={{fontSize:20,fontWeight:700,color:WHITE,margin:0}}>{t.calendarTitle}</h2><p style={{fontSize:12,color:DIM,marginTop:5}}>{lang==="VI"?"Sự kiện thị trường với phân tích AI · GMT+7":"Market-moving events with AI impact analysis · GMT+7"}</p></div>
      <div style={{display:"flex",gap:8}}>{[[t.highImp,RED],[t.medImp,AMBER],[t.lowImp,DIM]].map(([lb,col])=>(<span key={lb} style={{fontSize:10,padding:"4px 10px",borderRadius:4,border:`1px solid ${col}40`,color:col,background:`${col}10`}}>● {lb}</span>))}</div>
    </div>
    {loading?(<div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:40,textAlign:"center"}}><Dots/><p style={{color:DIM,fontSize:13,marginTop:10}}>{t.loading}</p></div>):(
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {events.map((ev,i)=>{const col=ic(ev.impact);return(<div key={i} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:"16px 20px",borderLeft:`3px solid ${col}`,display:"grid",gridTemplateColumns:"90px 60px 1fr 90px 90px 220px",gap:14,alignItems:"center",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background=CARDH;e.currentTarget.style.borderColor=col;}} onMouseLeave={e=>{e.currentTarget.style.background=CARD;e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.borderLeftColor=col;}}>
          <span style={{fontSize:12,fontFamily:"monospace",color:TEXT}}>{ev.time}</span>
          <span style={{fontSize:11,fontWeight:700,color:DIM}}>{ev.currency}</span>
          <span style={{fontSize:13,color:WHITE,fontWeight:500}}>{ev.name}</span>
          <div><div style={{fontSize:9,color:DIM,marginBottom:3}}>{t.forecast}</div><span style={{fontSize:12,color:TEXT,fontFamily:"monospace"}}>{ev.forecast}</span></div>
          <div><div style={{fontSize:9,color:DIM,marginBottom:3}}>{t.previous}</div><span style={{fontSize:12,color:TEXT,fontFamily:"monospace"}}>{ev.previous}</span></div>
          <div><div style={{display:"flex",gap:4,alignItems:"center",marginBottom:4}}><div style={{width:4,height:4,borderRadius:"50%",background:GREEN}}/><span style={{fontSize:9,color:GREEN,fontWeight:700}}>AI</span><span style={{fontSize:9,color:DIM}}>· {ev.confidence}%</span></div><span style={{fontSize:11,color:"#6a8e78",lineHeight:1.55}}>{ev.analysis}</span></div>
        </div>);})}
      </div>
    )}
  </div>);
}

export default function App(){
  const[tab,setTab]=useState(0);const[lang,setLang]=useState("EN");
  const t=TEXTS[lang];const prices=usePrices();const[tick,setTick]=useState("");
  useEffect(()=>{const u=()=>setTick(new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));u();const i=setInterval(u,1000);return()=>clearInterval(i);},[]);
  const TABS=[DashboardTab,MacroDeskTab,MacroViewTab,CalendarTab];const Active=TABS[tab];
  return(<div style={{minHeight:"100vh",background:BG,color:TEXT,fontFamily:"'Inter','Helvetica Neue',sans-serif"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');@keyframes ktP{0%,100%{opacity:.15}50%{opacity:1}}*{box-sizing:border-box;margin:0;padding:0}button{font-family:inherit}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:${BG}}::-webkit-scrollbar-thumb{background:${BORDER};border-radius:2px}::selection{background:rgba(29,184,122,.25)}`}</style>
    <header style={{borderBottom:`1px solid ${BORDER}`,background:`${BG}f5`,backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",height:56}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${GREEN},#0a7a45)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:15,color:"#fff"}}>K</div>
          <div><div style={{fontSize:15,fontWeight:800,color:WHITE}}>{t.brand}</div><div style={{fontSize:9,color:DIM,letterSpacing:"0.1em",textTransform:"uppercase"}}>{t.tagline}</div></div>
        </div>
        <nav style={{display:"flex",gap:2}}>
          {t.tabs.map((name,i)=>(<button key={i} onClick={()=>setTab(i)} style={{padding:"7px 18px",borderRadius:7,fontSize:12,fontWeight:500,cursor:"pointer",border:"none",background:tab===i?"rgba(29,184,122,0.12)":"transparent",color:tab===i?GREEN:DIM,borderBottom:tab===i?`2px solid ${GREEN}`:"2px solid transparent",transition:"all 0.15s"}}>{name}</button>))}
        </nav>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:11,color:DIM,fontFamily:"monospace"}}>{tick}</span>
          <div style={{display:"flex",background:CARD,border:`1px solid ${BORDER}`,borderRadius:7,overflow:"hidden"}}>
            {["EN","VI"].map(l=>(<button key={l} onClick={()=>setLang(l)} style={{padding:"5px 14px",fontSize:11,fontWeight:700,cursor:"pointer",border:"none",background:lang===l?GREEN:"transparent",color:lang===l?"#071209":DIM,transition:"all 0.15s"}}>{l}</button>))}
          </div>
        </div>
      </div>
      <div style={{borderTop:`1px solid ${BORDER}`,padding:"6px 28px",display:"flex",gap:28,overflowX:"auto",alignItems:"center"}}>
        {INSTRS.map(ins=>{const pr=prices[ins.id];if(!pr)return null;return(<div key={ins.id} style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}><span style={{fontSize:10,color:DIM,fontWeight:600,letterSpacing:"0.06em"}}>{ins.id}</span><span style={{fontSize:12,fontFamily:"monospace",color:WHITE}}>{pr.price.toFixed(ins.dec).replace(/\B(?=(\d{3})+(?!\d))/g,",")}</span><span style={{fontSize:10,fontFamily:"monospace",color:pr.change>=0?GREEN:RED}}>{pr.change>=0?"+":""}{pr.change.toFixed(2)}%</span></div>);})}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5,flexShrink:0}}><div style={{width:6,height:6,borderRadius:"50%",background:GREEN,animation:"ktP 2s ease-in-out infinite"}}/><span style={{fontSize:10,color:GREEN,fontWeight:600,letterSpacing:"0.1em"}}>SIM</span></div>
      </div>
    </header>
    <main style={{maxWidth:1320,margin:"0 auto",padding:"28px"}}><Active t={t} lang={lang} prices={prices}/></main>
  </div>);
}
