import { useState, useRef, useEffect } from "react";

const T = {
  primary:"#197A56", positive:"#29BA74", negative:"#D64454", neutral:"#7C7C7C",
  warning:"#F59E0B", info:"#1976D2", black:"#000000", gray900:"#4C4D4D",
  gray400:"#B1B1B7", gray100:"#F3F3F3", white:"#FFFFFF", border:"#E0E0E0",
};

const Badge=({label,color})=>(<span style={{background:color+"18",color,border:`1px solid ${color}40`,borderRadius:3,padding:"2px 8px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>);
const PriorityColor=p=>p==="Critical"?T.negative:p==="High"?T.warning:p==="Medium"?T.info:T.neutral;
const statusColor=s=>s==="Complete"?T.positive:s==="In Progress"?T.info:s==="Action Required"?T.negative:T.warning;
const Metric=({label,value,target,unit="",good,bad})=>{
  const color=good?T.positive:bad?T.negative:T.warning;
  return(<div style={{display:"flex",flexDirection:"column",gap:2}}><div style={{fontSize:10,color:T.gray900,fontWeight:600,whiteSpace:"nowrap"}}>{label}</div><div style={{fontSize:16,fontWeight:800,color,lineHeight:1}}>{value}{unit}</div>{target!=null&&<div style={{fontSize:10,color:T.gray400}}>Target: {target}{unit}</div>}</div>);
};

// ── MAINTENANCE DATA ──────────────────────────────────────────────────────────

const maintAssets = [
  {id:"A-001",name:"Line 3 Heat Sealer",line:"Line 3",criticality:"Critical",safetyImpact:"High",qualityImpact:"High",productionImpact:"High",failureCost:42000,replacementCost:800,currentStrategy:"Reactive",agentRec:"Increase PM Frequency",recReason:"Vibration index 8.4 exceeds threshold. Failure causes full line stoppage and quality escapes. Criticality warrants monthly PM minimum.",healthScore:34,vibration:8.4,tempVariance:6.1,lastPM:"Jan 15, 2026",nextPM:"Overdue",failureRisk:"Critical",trend:"Degrading"},
  {id:"A-002",name:"Line 1 Label Applicator",line:"Line 1",criticality:"High",safetyImpact:"Low",qualityImpact:"High",productionImpact:"Medium",failureCost:8500,replacementCost:1200,currentStrategy:"Scheduled PM",agentRec:"Maintain Current",recReason:"Current 8-week PM cycle aligns with degradation rate. Quality impact is high but failure is recoverable within 30 min. No change needed.",healthScore:72,vibration:3.1,tempVariance:1.2,lastPM:"Feb 10, 2026",nextPM:"Apr 7, 2026",failureRisk:"Medium",trend:"Stable"},
  {id:"A-003",name:"Line 2 Conveyor Belt",line:"Line 2",criticality:"Medium",safetyImpact:"Low",qualityImpact:"Low",productionImpact:"Medium",failureCost:3200,replacementCost:420,currentStrategy:"Scheduled PM",agentRec:"Reduce Frequency",recReason:"Current 4-week cycle is excessive given low criticality and $420 replacement cost. Failure causes <15 min downtime. Extend to 10 weeks to reduce technician load.",healthScore:81,vibration:2.2,tempVariance:0.8,lastPM:"Feb 20, 2026",nextPM:"Mar 20, 2026",failureRisk:"Low",trend:"Stable"},
  {id:"A-004",name:"Line 3 Packaging Filler",line:"Line 3",criticality:"High",safetyImpact:"Low",qualityImpact:"High",productionImpact:"High",failureCost:14000,replacementCost:2100,currentStrategy:"Scheduled PM",agentRec:"Increase PM Frequency",recReason:"High production and quality impact. Recent scrap rate increase on Line 3 partially attributed to filler calibration drift. Reduce interval from 8 weeks to 5 weeks.",healthScore:58,vibration:4.7,tempVariance:2.9,lastPM:"Jan 28, 2026",nextPM:"Mar 25, 2026",failureRisk:"High",trend:"Degrading"},
  {id:"A-005",name:"Line 1 Mixing Motor",line:"Line 1",criticality:"Low",safetyImpact:"Low",qualityImpact:"Low",productionImpact:"Low",failureCost:600,replacementCost:180,currentStrategy:"Scheduled PM",agentRec:"Run to Failure",recReason:"Low criticality across all dimensions. Replacement cost is $180 and failure causes <5 min downtime. PM cost exceeds expected failure cost. Safe to run to failure.",healthScore:91,vibration:1.4,tempVariance:0.4,lastPM:"Feb 1, 2026",nextPM:"Mar 1, 2026",failureRisk:"Low",trend:"Stable"},
  {id:"A-006",name:"Line 2 Heat Tunnel",line:"Line 2",criticality:"High",safetyImpact:"Medium",qualityImpact:"High",productionImpact:"High",failureCost:18000,replacementCost:3400,currentStrategy:"Reactive",agentRec:"Initiate PM Program",recReason:"No current PM program despite high criticality. Safety impact (burn risk) and quality impact (seal integrity) make reactive strategy unacceptable. Initiate 6-week PM cycle immediately.",healthScore:67,vibration:3.8,tempVariance:3.2,lastPM:"Never",nextPM:"Not scheduled",failureRisk:"High",trend:"Unknown"},
  {id:"A-007",name:"Line 3 Crimping Unit",line:"Line 3",criticality:"Medium",safetyImpact:"Low",qualityImpact:"Medium",productionImpact:"Medium",failureCost:4800,replacementCost:650,currentStrategy:"Scheduled PM",agentRec:"Maintain Current",recReason:"Current 6-week cycle appropriate for medium criticality asset. Health score 74 indicates no immediate risk. Continue monitoring.",healthScore:74,vibration:2.9,tempVariance:1.6,lastPM:"Feb 5, 2026",nextPM:"Mar 19, 2026",failureRisk:"Medium",trend:"Stable"},
  {id:"A-008",name:"Line 1 Sealing Bar",line:"Line 1",criticality:"Low",safetyImpact:"Low",qualityImpact:"Medium",productionImpact:"Low",failureCost:1100,replacementCost:95,currentStrategy:"Scheduled PM",agentRec:"Run to Failure",recReason:"Replacement cost is $95. Even with medium quality impact, the failure is quickly detectable and recoverable. PM cost over 12 months exceeds expected failure cost by 3x.",healthScore:88,vibration:1.8,tempVariance:0.6,lastPM:"Feb 15, 2026",nextPM:"Mar 15, 2026",failureRisk:"Low",trend:"Stable"},
];

const maintWorkOrders = [
  {id:"WO-4421",asset:"Line 3 Heat Sealer",line:"Line 3",type:"Corrective",priority:"Critical",status:"In Progress",assignedTo:"Carlos Rivera",estimatedHrs:4,actualHrs:1.5,dueDate:"Feb 28, 2026",description:"Sealer inspection — vibration and temp variance above threshold. Full component check required.",agentSuggestion:null},
  {id:"WO-4422",asset:"Line 2 Heat Tunnel",line:"Line 2",type:"Preventive",priority:"High",status:"Open",assignedTo:null,estimatedHrs:2,actualHrs:0,dueDate:"Mar 3, 2026",description:"Initiate first PM cycle — inspect heating elements, check safety interlocks, calibrate temp controls.",agentSuggestion:"Assign to Marcus Webb — heat tunnel certified, available this afternoon after WO-4425 completes."},
  {id:"WO-4423",asset:"Line 3 Packaging Filler",line:"Line 3",type:"Preventive",priority:"High",status:"Open",assignedTo:null,estimatedHrs:3,actualHrs:0,dueDate:"Mar 4, 2026",description:"Filler calibration and seal check — scrap rate increase linked to calibration drift.",agentSuggestion:"Assign to Priya Singh — filler-certified, currently underutilised (2.5hrs available today)."},
  {id:"WO-4424",asset:"Line 1 Label Applicator",line:"Line 1",type:"Corrective",priority:"Medium",status:"Open",assignedTo:"Priya Singh",estimatedHrs:1.5,actualHrs:0,dueDate:"Mar 2, 2026",description:"Label misalignment root cause investigation — check applicator head alignment and sensor calibration.",agentSuggestion:null},
  {id:"WO-4425",asset:"Line 2 Conveyor Belt",line:"Line 2",type:"Preventive",priority:"Low",status:"In Progress",assignedTo:"Marcus Webb",estimatedHrs:1,actualHrs:0.5,dueDate:"Mar 6, 2026",description:"Routine belt inspection — tension check, wear assessment.",agentSuggestion:null},
  {id:"WO-4426",asset:"Line 1 Mixing Motor",line:"Line 1",type:"Preventive",priority:"Low",status:"Open",assignedTo:null,estimatedHrs:0.5,actualHrs:0,dueDate:"Mar 10, 2026",description:"Routine lubrication and visual inspection.",agentSuggestion:"Consider cancelling — Maintenance Strategy Agent recommends run-to-failure for this asset. Saves 0.5 technician hours."},
];

const maintTechnicians = [
  {name:"Carlos Rivera",role:"Senior Technician",certifications:["Heat Sealer","Filler","Conveyor","Electrical"],currentWOs:["WO-4421"],scheduledHrs:8,allocatedHrs:4,availableHrs:4,utilization:50,status:"On Job"},
  {name:"Marcus Webb",role:"Technician",certifications:["Heat Tunnel","Conveyor","Packaging"],currentWOs:["WO-4425"],scheduledHrs:8,allocatedHrs:3,availableHrs:5,utilization:38,status:"On Job"},
  {name:"Priya Singh",role:"Technician",certifications:["Filler","Label Applicator","Mixing"],currentWOs:["WO-4424"],scheduledHrs:8,allocatedHrs:1.5,availableHrs:6.5,utilization:19,status:"Available"},
  {name:"James Okafor",role:"Junior Technician",certifications:["Conveyor","General"],currentWOs:[],scheduledHrs:8,allocatedHrs:0,availableHrs:8,utilization:0,status:"Unassigned"},
];

// ── SPARE PARTS DATA ──────────────────────────────────────────────────────────
const spareParts = [
  {id:"P-001",name:"Sealer Heating Element",partNo:"SE-441",line:"Line 3",asset:"Heat Sealer",stock:0,minStock:2,status:"Stock-Out",blockedWOs:["WO-4421"],unitCost:340,supplier:"Supplier B",leadTimeDays:3,emergencyLeadTimeDays:1,emergencyUnitCost:420,agentRec:"Emergency PO raised — next-day AM delivery confirmed",poRaised:true},
  {id:"P-002",name:"Heat Tunnel Igniter",partNo:"HT-209",line:"Line 2",asset:"Heat Tunnel",stock:1,minStock:3,status:"Low Stock",blockedWOs:[],unitCost:185,supplier:"Supplier A",leadTimeDays:5,emergencyLeadTimeDays:2,emergencyUnitCost:240,agentRec:"Order 3 units standard delivery — 5-day lead time, no emergency needed",poRaised:false},
  {id:"P-003",name:"Filler Calibration Weight Set",partNo:"FC-112",line:"Line 3",asset:"Packaging Filler",stock:0,minStock:1,status:"Stock-Out",blockedWOs:["WO-4423"],unitCost:95,supplier:"Supplier C",leadTimeDays:2,emergencyLeadTimeDays:1,emergencyUnitCost:130,agentRec:"Emergency PO recommended — WO-4423 blocked without this part",poRaised:false},
  {id:"P-004",name:"Label Applicator Head",partNo:"LA-334",line:"Line 1",asset:"Label Applicator",stock:2,minStock:2,status:"At Min",blockedWOs:[],unitCost:220,supplier:"Supplier A",leadTimeDays:4,emergencyLeadTimeDays:null,emergencyUnitCost:null,agentRec:"Reorder triggered — stock at minimum. 4-day standard lead time.",poRaised:false},
  {id:"P-005",name:"Conveyor Belt Tensioner",partNo:"CB-087",line:"Line 2",asset:"Conveyor Belt",stock:4,minStock:2,status:"OK",blockedWOs:[],unitCost:65,supplier:"Supplier B",leadTimeDays:3,emergencyLeadTimeDays:null,emergencyUnitCost:null,agentRec:null,poRaised:false},
  {id:"P-006",name:"Sealer Temperature Probe",partNo:"SE-442",line:"Line 3",asset:"Heat Sealer",stock:0,minStock:2,status:"Stock-Out",blockedWOs:["WO-4421"],unitCost:280,supplier:"Supplier B",leadTimeDays:3,emergencyLeadTimeDays:1,emergencyUnitCost:360,agentRec:"Emergency PO recommended — needed for sealer inspection WO-4421",poRaised:false},
];

// ── TECHNICIAN PERFORMANCE DATA ───────────────────────────────────────────────
const techPerformance = [
  {
    name:"Carlos Rivera",role:"Senior Technician",avatar:"CR",
    thisWeek:{completed:8,target:10,onTime:7,lateCount:1},
    efficiency:{avgActualVsEstimate:0.92,trend:"Improving"},
    wosThisWeek:[
      {id:"WO-4418",asset:"Line 1 Conveyor",estHrs:2,actualHrs:1.8,onTime:true,status:"Complete"},
      {id:"WO-4419",asset:"Line 2 Filler",estHrs:3,actualHrs:2.7,onTime:true,status:"Complete"},
      {id:"WO-4420",asset:"Line 3 Crimping Unit",estHrs:1.5,actualHrs:1.6,onTime:false,status:"Complete"},
      {id:"WO-4421",asset:"Line 3 Heat Sealer",estHrs:4,actualHrs:1.5,onTime:null,status:"In Progress"},
    ],
    coachingSuggestions:[],
    strengths:["Fastest diagnosis on electrical faults","Mentors junior technicians well"],
  },
  {
    name:"Marcus Webb",role:"Technician",avatar:"MW",
    thisWeek:{completed:5,target:8,onTime:3,lateCount:2},
    efficiency:{avgActualVsEstimate:1.38,trend:"Declining"},
    wosThisWeek:[
      {id:"WO-4415",asset:"Line 2 Heat Tunnel",estHrs:2,actualHrs:3.1,onTime:false,status:"Complete"},
      {id:"WO-4416",asset:"Line 2 Conveyor Belt",estHrs:1,actualHrs:1.4,onTime:true,status:"Complete"},
      {id:"WO-4417",asset:"Line 1 Packaging",estHrs:2,actualHrs:2.6,onTime:false,status:"Complete"},
      {id:"WO-4425",asset:"Line 2 Conveyor Belt",estHrs:1,actualHrs:0.5,onTime:null,status:"In Progress"},
    ],
    coachingSuggestions:[
      {type:"SOP",note:"Averaging 1.38x estimated time on heat tunnel work — recommend Co-Pilot SOP walkthrough before WO-4422 to improve first-time completion rate"},
      {type:"Training",note:"Heat Tunnel PM Checklist v1.1 not completed since Nov 2025 — refresh recommended before first PM execution"},
    ],
    strengths:["Strong on conveyor and packaging","Good safety compliance record"],
  },
  {
    name:"Priya Singh",role:"Technician",avatar:"PS",
    thisWeek:{completed:6,target:8,onTime:6,lateCount:0},
    efficiency:{avgActualVsEstimate:1.05,trend:"Stable"},
    wosThisWeek:[
      {id:"WO-4412",asset:"Line 3 Filler",estHrs:3,actualHrs:3.1,onTime:true,status:"Complete"},
      {id:"WO-4413",asset:"Line 1 Label Applicator",estHrs:1.5,actualHrs:1.6,onTime:true,status:"Complete"},
      {id:"WO-4414",asset:"Line 1 Mixing Motor",estHrs:0.5,actualHrs:0.5,onTime:true,status:"Complete"},
      {id:"WO-4424",asset:"Line 1 Label Applicator",estHrs:1.5,actualHrs:0,onTime:null,status:"Open"},
    ],
    coachingSuggestions:[
      {type:"Upskill",note:"Priya is consistently on-time and accurate — recommend expanding certifications to Heat Tunnel to increase coverage flexibility"},
    ],
    strengths:["Most on-time technician this week","Filler calibration specialist"],
  },
  {
    name:"James Okafor",role:"Junior Technician",avatar:"JO",
    thisWeek:{completed:2,target:6,onTime:1,lateCount:1},
    efficiency:{avgActualVsEstimate:1.72,trend:"Needs Support"},
    wosThisWeek:[
      {id:"WO-4410",asset:"Line 2 Conveyor",estHrs:1,actualHrs:1.9,onTime:false,status:"Complete"},
      {id:"WO-4411",asset:"Line 1 Conveyor",estHrs:1,actualHrs:1.6,onTime:true,status:"Complete"},
    ],
    coachingSuggestions:[
      {type:"SOP",note:"Averaging 1.72x estimated time — Co-Pilot guided walkthroughs recommended for all assigned WOs until average drops below 1.2x"},
      {type:"Pairing",note:"Recommend pairing James with Carlos Rivera on next complex WO for on-the-job mentoring"},
      {type:"Training",note:"Only 2 certifications (Conveyor, General) limits assignment flexibility — suggest Filler or Packaging certification next"},
    ],
    strengths:["Improving safety checklist compliance","Proactive in asking for help"],
  },
];

// ── ORCHESTRATOR RECS (cross-domain + maintenance-specific) ───────────────────
const crossDomainMaintRecs = [
  {id:"cd1",priority:"Critical",domain:"Maintenance",icon:"🌐",lines:["All","Line 3"],title:"Line 3 Sealer Failure Will Halt Production & Miss Friday Customer Order",summary:"Plant Orchestration Agent has identified that the Line 3 sealer failure risk directly threatens SKU 3801 production and conflicts with a maintenance window needed today.",suggestedAction:"Coordinate maintenance window with Scheduler to protect SKU 3801 order — reschedule to Line 1 Thursday before executing sealer repair.",agents:["Asset Health Monitoring Agent","Scheduling Agent","Plant Orchestration Agent"],detail:{issue:"Line 3 heat sealer failure risk (vibration 8.4, threshold 7.0) directly conflicts with SKU 3801 customer order due Friday.",compounding:"SKU 3801 requires the heat sealer. If sealer fails before maintenance window, CO-8820 (6,200 units) cannot be fulfilled.",risk:"Customer order CO-8820 missed. ~$42,000 unplanned downtime cost. Quality escapes on in-process product.",action:"Reschedule SKU 3801 to Line 1 Thursday 1–5pm before executing sealer maintenance. Confirm labor reallocation for Thursday.",steps:[{agent:"Plant Orchestration Agent",domain:"Maintenance",action:"Flag cross-domain conflict: sealer failure risk vs. SKU 3801 production schedule.",status:"complete"},{agent:"Scheduling Agent",domain:"Planning",action:"Reschedule SKU 3801 from Line 3 to Line 1, Thursday 1–5pm.",status:"complete"},{agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Lock in Line 3 maintenance window today 2–4pm after SKU 3801 rescheduled.",status:"pending"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Notify Line 3 supervisor of maintenance window and schedule change.",status:"pending"}],approvers:[{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},{name:"Carlos Rivera",role:"Maintenance Manager",avatar:"MM"},{name:"Priya Nair",role:"Scheduler",avatar:"SC"}]}},
  {id:"cd2",priority:"High",domain:"Maintenance",icon:"🌐",lines:["All","Line 2"],title:"Line 2 Heat Tunnel — Safety & Maintenance Risk Flagged Across Two Domains",summary:"Safety Agent and Maintenance Strategy Agent both flagging the Line 2 Heat Tunnel. No PM program despite High criticality and burn risk. 3 operators also have overdue LOTO recertification.",suggestedAction:"Initiate PM program and complete LOTO recertification before first PM is executed.",agents:["Safety Agent","Maintenance Strategy Agent","Plant Orchestration Agent"],detail:{issue:"Line 2 Heat Tunnel has no PM program. Safety Agent flags burn risk. 3 operators have overdue LOTO recertification.",compounding:"Executing the first PM without LOTO-certified operators creates a compliance violation.",risk:"Operator safety incident during maintenance. LOTO audit failure. Heat tunnel failure causing quality escapes.",action:"Complete LOTO recertification by Mar 4. Initiate PM program with first inspection week of Mar 9.",steps:[{agent:"Safety Agent",domain:"Safety",action:"Confirm LOTO recertification status — 3 operators overdue, deadline Mar 4.",status:"complete"},{agent:"Maintenance Strategy Agent",domain:"Maintenance",action:"Define PM program for Line 2 Heat Tunnel — 6-week cycle, starting Mar 9.",status:"pending"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Schedule LOTO recertification session for J. Park, D. Williams, M. Santos.",status:"pending"}],approvers:[{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},{name:"Carlos Rivera",role:"Maintenance Manager",avatar:"MM"},{name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"}]}},
];

const maintOnlyRecs = [
  {id:"m2",priority:"High",domain:"Maintenance",icon:"🔧",lines:["All","Line 2"],title:"Line 2 Heat Tunnel Has No PM Program — Initiate Immediately",summary:"Maintenance Strategy Agent flagged Line 2 Heat Tunnel as reactive with no PM schedule despite High criticality and safety impact. Failure risk is increasing.",suggestedAction:"Assign WO-4422 to Marcus Webb this afternoon and initiate 6-week PM cycle.",agents:["Maintenance Strategy Agent","Maintenance Planning & Scheduling Agent"],detail:{issue:"Line 2 Heat Tunnel has zero PM history. Reactive-only strategy is unacceptable given High criticality and Medium safety impact.",compounding:"Current health score 67 and unknown degradation trend. No baseline data to detect future anomalies.",risk:"Undetected heating element failure. Safety incident. Quality escapes on Line 2 seal integrity.",action:"Raise WO-4422, assign to Marcus Webb today after WO-4425 completes. Initiate 6-week PM cycle.",steps:[{agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Assign WO-4422 to Marcus Webb — heat tunnel certified, available 1pm today.",status:"pending"},{agent:"Technician Co-Pilot",domain:"Maintenance",action:"Pre-load heat tunnel PM checklist (v1.1) for Marcus Webb.",status:"pending"}],approvers:[{name:"Carlos Rivera",role:"Maintenance Manager",avatar:"MM"},{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"}]}},
  {id:"m3",priority:"High",domain:"Maintenance",icon:"👷",lines:["All"],title:"2 High-Priority Work Orders Unassigned — Technician Reallocation Needed",summary:"WO-4422 and WO-4423 are both unassigned. Priya Singh has 6.5hrs available today. James Okafor is fully unassigned.",suggestedAction:"Assign WO-4423 to Priya Singh now and WO-4422 to Marcus Webb after WO-4425 completes at 1pm.",agents:["Maintenance Planning & Scheduling Agent"],detail:{issue:"WO-4422 (Heat Tunnel PM, High priority, due Mar 3) and WO-4423 (Filler calibration, High priority, due Mar 4) are both unassigned.",compounding:"Overall technician utilization is 27% — capacity exists but is not being allocated to priority work.",risk:"Both work orders miss due dates. Line 2 heat tunnel remains uninspected. Line 3 filler calibration drift continues.",action:"Assign WO-4423 to Priya Singh immediately. Assign WO-4422 to Marcus Webb when WO-4425 completes (~1pm).",steps:[{agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Assign WO-4423 to Priya Singh — filler-certified, 6.5hrs available today.",status:"pending"},{agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Schedule WO-4422 for Marcus Webb post-1pm after WO-4425 completes.",status:"pending"},{agent:"Technician Co-Pilot",domain:"Maintenance",action:"Notify Priya Singh and Marcus Webb of new assignments with WO context.",status:"pending"}],approvers:[{name:"Carlos Rivera",role:"Maintenance Manager",avatar:"MM"}]}},
  {id:"m4",priority:"Medium",domain:"Maintenance",icon:"📦",lines:["All","Line 3"],title:"2 Parts Stock-Outs Blocking Active Work Orders",summary:"Part #SE-442 (Sealer Temperature Probe) and Part #FC-112 (Filler Calibration Weight Set) are both at zero stock and blocking WO-4421 and WO-4423.",suggestedAction:"Raise emergency PO for Part #FC-112 today. Part #SE-441 PO already in transit.",agents:["Maintenance Planning & Scheduling Agent"],detail:{issue:"SE-442 and FC-112 are both at zero stock. WO-4421 and WO-4423 cannot be fully completed without these parts.",compounding:"Part #SE-441 already has an emergency PO in transit (arriving tomorrow). FC-112 and SE-442 have not been ordered yet.",risk:"WO-4423 cannot proceed. Sealer inspection incomplete without temperature probe.",action:"Raise emergency PO for FC-112 from Supplier C ($130, 1-day delivery). Raise emergency PO for SE-442 from Supplier B ($360, 1-day delivery).",steps:[{agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Raise emergency PO for Part #FC-112 from Supplier C — next-day AM delivery.",status:"pending"},{agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Raise emergency PO for Part #SE-442 from Supplier B — next-day AM delivery.",status:"pending"}],approvers:[{name:"Carlos Rivera",role:"Maintenance Manager",avatar:"MM"},{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"}]}},
];

// ── PM SCHEDULE DATA ──────────────────────────────────────────────────────────
const pmSchedule = [
  {id:"PM-001",asset:"Line 3 Heat Sealer",line:"Line 3",interval:"4 weeks",lastPM:"Jan 15, 2026",nextPM:"Feb 12, 2026",daysOverdue:16,status:"Overdue",woCoverage:"WO-4421 (Corrective)",notes:"Scheduled PM missed — asset now in corrective mode"},
  {id:"PM-002",asset:"Line 2 Heat Tunnel",line:"Line 2",interval:"None",lastPM:"Never",nextPM:"Not scheduled",daysOverdue:null,status:"No Program",woCoverage:"WO-4422 (First PM pending)",notes:"Strategy Agent recommends initiating 6-week PM cycle"},
  {id:"PM-003",asset:"Line 3 Packaging Filler",line:"Line 3",interval:"8 weeks",lastPM:"Jan 28, 2026",nextPM:"Mar 25, 2026",daysOverdue:null,status:"Upcoming",woCoverage:"WO-4423 (Preventive)",notes:"Strategy Agent recommends reducing to 5-week cycle"},
  {id:"PM-004",asset:"Line 1 Label Applicator",line:"Line 1",interval:"8 weeks",lastPM:"Feb 10, 2026",nextPM:"Apr 7, 2026",daysOverdue:null,status:"On Track",woCoverage:null,notes:"Current cycle appropriate"},
  {id:"PM-005",asset:"Line 2 Conveyor Belt",line:"Line 2",interval:"4 weeks",lastPM:"Feb 20, 2026",nextPM:"Mar 20, 2026",daysOverdue:null,status:"On Track",woCoverage:"WO-4425 (In Progress)",notes:"Strategy Agent recommends extending to 10-week cycle"},
  {id:"PM-006",asset:"Line 3 Crimping Unit",line:"Line 3",interval:"6 weeks",lastPM:"Feb 5, 2026",nextPM:"Mar 19, 2026",daysOverdue:null,status:"On Track",woCoverage:null,notes:"Continue monitoring"},
  {id:"PM-007",asset:"Line 1 Mixing Motor",line:"Line 1",interval:"4 weeks",lastPM:"Feb 1, 2026",nextPM:"Mar 1, 2026",daysOverdue:null,status:"Upcoming",woCoverage:"WO-4426 (Consider cancelling)",notes:"Strategy Agent recommends run-to-failure — cancel PM WO"},
  {id:"PM-008",asset:"Line 2 Heat Tunnel Filters",line:"Line 2",interval:"12 weeks",lastPM:"Nov 20, 2025",nextPM:"Feb 12, 2026",daysOverdue:16,status:"Overdue",woCoverage:null,notes:"No WO raised — needs immediate attention"},
];

// ── VIEW ALL BUTTON ───────────────────────────────────────────────────────────
function ViewAllBtn({label,total}){
  return(
    <div style={{padding:"12px 20px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <span style={{fontSize:11,color:T.gray400}}>{total!=null?`Showing priority items · ${total} total`:"Full view available in production"}</span>
      <button style={{background:"none",border:`1px solid ${T.border}`,borderRadius:4,padding:"5px 14px",fontSize:11,fontWeight:700,color:T.gray900,cursor:"pointer"}}>{label||"View All →"}</button>
    </div>
  );
}

// ── COLLAPSIBLE SECTION ───────────────────────────────────────────────────────
function Section({title,subtitle,icon,count,countColor,defaultOpen=true,children}){
  const [open,setOpen]=useState(defaultOpen);
  return(
    <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",overflow:"hidden"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{padding:"14px 20px",borderBottom:open?`1px solid ${T.border}`:"none",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",userSelect:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:16}}>{icon}</span>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:13,fontWeight:800,color:T.black}}>{title}</span>
              {count!=null&&<span style={{background:(countColor||T.negative)+"18",color:countColor||T.negative,border:`1px solid ${(countColor||T.negative)}40`,borderRadius:10,padding:"1px 8px",fontSize:11,fontWeight:700}}>{count}</span>}
            </div>
            {subtitle&&<div style={{fontSize:11,color:T.gray900,marginTop:1}}>{subtitle}</div>}
          </div>
        </div>
        <div style={{fontSize:12,color:T.gray400,fontWeight:700}}>{open?"▲":"▼"}</div>
      </div>
      {open&&<div>{children}</div>}
    </div>
  );
}

// ── PROMETHEUS INTEGRATION BANNER ────────────────────────────────────────────
function PrometheusBanner({entity="data"}){
  return(
    <div style={{background:"#EEF2FF",border:`1px solid #C7D2FE`,borderRadius:4,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:"#4F46E5",boxShadow:"0 0 0 2px #C7D2FE"}}/>
        <div>
          <span style={{fontSize:12,fontWeight:700,color:"#3730A3"}}>🔗 Live from Prometheus CMMS</span>
          <span style={{fontSize:11,color:"#6366F1",marginLeft:8}}>Last synced 7:02am · {entity} pulled directly from your system of record</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:11,color:"#6366F1"}}>Agents read from Prometheus — recommendations surface here</span>
        <button style={{background:"#4F46E5",color:"#FFFFFF",border:"none",borderRadius:4,padding:"4px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Open Prometheus →</button>
      </div>
    </div>
  );
}

// ── MAINTENANCE DASHBOARD ─────────────────────────────────────────────────────
function MaintenanceDashboard({onSelectRec}){
  const [activeTab,setActiveTab]=useState("overview");
  const [appliedWOs,setAppliedWOs]=useState({});
  const [appliedPOs,setAppliedPOs]=useState({});
  const [pmFilter,setPmFilter]=useState("Action Required");
  const assignWO=(woId)=>setAppliedWOs(prev=>({...prev,[woId]:true}));
  const raisePO=(partId)=>setAppliedPOs(prev=>({...prev,[partId]:true}));

  const critColor=(c)=>c==="Critical"?T.negative:c==="High"?T.warning:c==="Medium"?T.info:T.neutral;
  const healthColor=(s)=>s>=80?T.positive:s>=60?T.warning:T.negative;
  const recColor=(r)=>r==="Run to Failure"?T.neutral:r==="Increase PM Frequency"?T.negative:r==="Initiate PM Program"?T.negative:r==="Reduce Frequency"?T.positive:T.info;
  const pmStatusColor=(s)=>s==="Overdue"?T.negative:s==="No Program"?T.negative:s==="Upcoming"?T.warning:T.positive;
  const effColor=(r)=>r<=1.0?T.positive:r<=1.2?T.warning:T.negative;

  const attentionWOs=maintWorkOrders.filter(wo=>!wo.assignedTo||wo.status==="Overdue"||wo.agentSuggestion);
  const stockIssues=spareParts.filter(p=>p.status==="Stock-Out"||p.status==="Low Stock"||p.status==="At Min");
  const changeAssets=maintAssets.filter(a=>a.agentRec!=="Maintain Current");
  const alertAssets=maintAssets.filter(a=>a.healthScore<80||a.failureRisk==="Critical"||a.failureRisk==="High"||a.trend==="Degrading"||a.trend==="Unknown");
  const displayPMs=pmFilter==="Action Required"?pmSchedule.filter(p=>p.status==="Overdue"||p.status==="No Program"||p.status==="Upcoming"):pmSchedule;

  const TABS=[
    {id:"overview",label:"Overview",icon:"▦",alert:crossDomainMaintRecs.length+maintOnlyRecs.length},
    {id:"workorders",label:"Work Orders",icon:"📋",alert:attentionWOs.length},
    {id:"technicians",label:"Technicians",icon:"👷",alert:maintTechnicians.filter(t=>t.utilization<30).length},
    {id:"assets",label:"Asset Health",icon:"📡",alert:alertAssets.length},
    {id:"parts",label:"Spare Parts",icon:"📦",alert:stockIssues.filter(p=>p.status==="Stock-Out").length},
    {id:"pm",label:"PM Schedule",icon:"🗓",alert:pmSchedule.filter(p=>p.status==="Overdue"||p.status==="No Program").length},
    {id:"strategy",label:"Strategy",icon:"⚙️",alert:changeAssets.length},
    {id:"performance",label:"Performance",icon:"📊",alert:techPerformance.filter(t=>t.coachingSuggestions.length>0).length},
  ];

  const Tab=({tab})=>{
    const isActive=activeTab===tab.id;
    const alertColor=tab.alert>0?(tab.id==="overview"?T.negative:tab.id==="technicians"?T.warning:T.negative):null;
    return(
      <button onClick={()=>setActiveTab(tab.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"12px 16px",border:"none",borderBottom:isActive?`2px solid ${T.primary}`:"2px solid transparent",background:"transparent",cursor:"pointer",fontWeight:isActive?800:500,fontSize:12,color:isActive?T.primary:T.gray900,whiteSpace:"nowrap",position:"relative"}}>
        <span>{tab.icon}</span>
        <span>{tab.label}</span>
        {tab.alert>0&&<span style={{background:alertColor||T.negative,color:T.white,borderRadius:10,padding:"1px 6px",fontSize:10,fontWeight:800,minWidth:16,textAlign:"center"}}>{tab.alert}</span>}
      </button>
    );
  };

  return(<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
    {/* Header */}
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"16px 24px 0",flexShrink:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,color:T.black}}>Maintenance Dashboard</div>
          <div style={{fontSize:12,color:T.gray900,marginTop:2}}>Austin Plant · Feb 28, 2026 · Good morning, Carlos 👋</div>
        </div>
      </div>
      {/* Tab bar */}
      <div style={{display:"flex",gap:0,overflowX:"auto"}}>
        {TABS.map(t=><Tab key={t.id} tab={t}/>)}
      </div>
    </div>

    {/* Tab content */}
    <div style={{flex:1,overflowY:"auto",background:T.gray100}}>

      {/* ── OVERVIEW TAB ── */}
      {activeTab==="overview"&&<div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
        {/* KPI strip */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[
            {label:"Open Work Orders",value:6,sub:"2 unassigned",color:T.negative,tab:"workorders"},
            {label:"Overdue PMs",value:2,sub:"Line 3 sealer, Line 2 tunnel",color:T.negative,tab:"pm"},
            {label:"Planned vs Unplanned",value:"58%",sub:"planned · target 80%",color:T.negative,tab:"workorders"},
            {label:"Avg Technician Utilization",value:"27%",sub:"across 4 technicians",color:T.negative,tab:"technicians"},
            {label:"Assets at Risk",value:3,sub:"Critical or High failure risk",color:T.negative,tab:"assets"},
            {label:"Parts Stock-Outs",value:3,sub:"2 blocking active WOs",color:T.negative,tab:"parts"},
          ].map(k=>(<div key={k.label} onClick={()=>setActiveTab(k.tab)} style={{flex:1,minWidth:120,background:T.white,borderRadius:4,borderLeft:`4px solid ${k.color}`,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",padding:"10px 14px",cursor:"pointer"}}>
            <div style={{fontSize:10,color:T.gray900,fontWeight:600,marginBottom:4}}>{k.label}</div>
            <div style={{fontSize:20,fontWeight:800,color:k.color}}>{k.value}</div>
            <div style={{fontSize:10,color:T.gray400,marginTop:2}}>{k.sub}</div>
            <div style={{fontSize:10,color:T.primary,marginTop:4,fontWeight:600}}>View details →</div>
          </div>))}
        </div>
        {/* Cross-domain recs */}
        <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
          <div style={{background:T.primary,padding:"12px 20px",borderRadius:"4px 4px 0 0",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14}}>🌐</span>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:T.white}}>Plant Orchestration Agent — Cross-Domain Recommendations</div>
              <div style={{fontSize:11,color:"#ffffff99",marginTop:1}}>Issues where maintenance intersects with production, quality, planning & scheduling, or safety</div>
            </div>
          </div>
          <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:10}}>
            {crossDomainMaintRecs.map(r=>(<div key={r.id} onClick={()=>onSelectRec(r)} style={{background:T.gray100,borderRadius:4,borderLeft:`4px solid ${PriorityColor(r.priority)}`,padding:"12px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}><Badge label={r.priority} color={PriorityColor(r.priority)}/><Badge label="Cross-Domain" color={T.primary}/>{r.agents.slice(0,2).map(a=><Badge key={a} label={a} color={T.neutral}/>)}</div>
                <div style={{fontSize:13,fontWeight:800,color:T.black,marginBottom:3}}>{r.title}</div>
                <div style={{fontSize:12,color:T.gray900}}>{r.summary}</div>
                <div style={{fontSize:12,color:T.primary,fontWeight:600,marginTop:4}}>💡 {r.suggestedAction}</div>
              </div>
              <div style={{fontSize:12,color:T.primary,fontWeight:700,whiteSpace:"nowrap"}}>View Detail →</div>
            </div>))}
          </div>
          <ViewAllBtn label="View All Recommendations →" total={crossDomainMaintRecs.length+maintOnlyRecs.length}/>
        </div>
        {/* Maintenance-only recs */}
        <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
          <div style={{background:"#673AB7",padding:"12px 20px",borderRadius:"4px 4px 0 0",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14}}>⚙️</span>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:T.white}}>Maintenance Orchestrator — Maintenance Recommendations</div>
              <div style={{fontSize:11,color:"#ffffff99",marginTop:1}}>Synthesised from Strategy Agent, Asset Health Agent, and Planning & Scheduling Agent</div>
            </div>
          </div>
          <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:10}}>
            {maintOnlyRecs.map(r=>(<div key={r.id} onClick={()=>onSelectRec(r)} style={{background:T.gray100,borderRadius:4,borderLeft:`4px solid ${PriorityColor(r.priority)}`,padding:"12px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}><Badge label={r.priority} color={PriorityColor(r.priority)}/><Badge label="Maintenance" color="#673AB7"/>{r.agents.map(a=><Badge key={a} label={a} color={T.neutral}/>)}</div>
                <div style={{fontSize:13,fontWeight:800,color:T.black,marginBottom:3}}>{r.icon} {r.title}</div>
                <div style={{fontSize:12,color:T.gray900}}>{r.summary}</div>
                <div style={{fontSize:12,color:"#673AB7",fontWeight:600,marginTop:4}}>💡 {r.suggestedAction}</div>
              </div>
              <div style={{fontSize:12,color:"#673AB7",fontWeight:700,whiteSpace:"nowrap"}}>View Detail →</div>
            </div>))}
          </div>
          <ViewAllBtn label="View All Recommendations →" total={crossDomainMaintRecs.length+maintOnlyRecs.length}/>
        </div>
      </div>}

      {/* ── WORK ORDERS TAB ── */}
      {activeTab==="workorders"&&<div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:T.black}}>📋 Work Orders — Requiring Attention</div>
              <div style={{fontSize:11,color:T.gray900,marginTop:2}}>Unassigned, overdue, or agent-flagged · {attentionWOs.length} of {maintWorkOrders.length} total</div>
            </div>
          </div>
          <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:10}}>
            {attentionWOs.map(wo=>(
              <div key={wo.id} style={{background:T.gray100,borderRadius:4,borderLeft:`4px solid ${wo.priority==="Critical"?T.negative:wo.priority==="High"?T.warning:wo.priority==="Medium"?T.info:T.neutral}`,padding:"12px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:800,color:T.black}}>{wo.id}</span>
                      <Badge label={wo.priority} color={wo.priority==="Critical"?T.negative:wo.priority==="High"?T.warning:wo.priority==="Medium"?T.info:T.neutral}/>
                      <Badge label={wo.type} color={wo.type==="Corrective"?T.negative:T.primary}/>
                      <Badge label={wo.status} color={statusColor(wo.status)}/>
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:T.black,marginBottom:2}}>{wo.asset} — {wo.line}</div>
                    <div style={{fontSize:11,color:T.gray900,marginBottom:4}}>{wo.description}</div>
                    <div style={{display:"flex",gap:12,fontSize:11,color:T.gray900,flexWrap:"wrap",alignItems:"center"}}>
                      <span>👤 {wo.assignedTo?wo.assignedTo:<span style={{color:T.negative,fontWeight:700}}>⚠ Unassigned</span>}</span>
                      <span>⏱ Est: {wo.estimatedHrs}h{wo.actualHrs>0?` · Actual: ${wo.actualHrs}h`:""}</span>
                      <span>📅 Due: {wo.dueDate}</span>
                      <button style={{background:"none",border:`1px solid #C7D2FE`,borderRadius:3,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#4F46E5",cursor:"pointer"}}>Open in Prometheus →</button>
                    </div>
                  </div>
                </div>
                {wo.agentSuggestion&&!appliedWOs[wo.id]&&(
                  <div style={{marginTop:10,background:T.white,border:`1px solid ${T.primary}40`,borderLeft:`3px solid ${T.primary}`,borderRadius:4,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:700,color:T.primary,marginBottom:2}}>🧠 Maintenance Planning & Scheduling Agent</div>
                      <div style={{fontSize:11,color:T.black}}>{wo.agentSuggestion}</div>
                    </div>
                    <button onClick={()=>assignWO(wo.id)} style={{background:T.primary,color:T.white,border:"none",borderRadius:4,padding:"5px 12px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>Apply</button>
                  </div>
                )}
                {appliedWOs[wo.id]&&<div style={{marginTop:8,background:"#F0FDF4",border:`1px solid ${T.positive}`,borderRadius:4,padding:"6px 12px"}}><span style={{fontSize:11,fontWeight:700,color:T.positive}}>✅ Assignment applied — synced to Prometheus · technician notified via Co-Pilot</span></div>}
              </div>
            ))}
          </div>
          <ViewAllBtn label="View All Work Orders in Prometheus →" total={maintWorkOrders.length}/>
        </div>
      </div>}

      {/* ── TECHNICIANS TAB ── */}
      {activeTab==="technicians"&&<div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}>
            <div style={{fontSize:13,fontWeight:800,color:T.black}}>👷 Technician Load & Assignments</div>
            <div style={{fontSize:11,color:T.gray900,marginTop:2}}>Today's capacity, current jobs, and agent-recommended reallocation · {maintTechnicians.length} technicians on shift</div>
          </div>
          <div style={{padding:"16px 20px",display:"flex",gap:12,flexWrap:"wrap"}}>
            {maintTechnicians.map(t=>{
              const utilColor=t.utilization>=70?T.positive:t.utilization>=40?T.warning:T.negative;
              const hasAgentFlag=t.utilization<30;
              return(<div key={t.name} style={{flex:"1 1 200px",background:T.gray100,borderRadius:4,borderLeft:`4px solid ${utilColor}`,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div><div style={{fontSize:12,fontWeight:800,color:T.black}}>{t.name}</div><div style={{fontSize:10,color:T.gray900}}>{t.role}</div></div>
                  <Badge label={t.status} color={t.status==="On Job"?T.info:t.status==="Available"?T.positive:T.negative}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:T.gray900}}>Utilization</span><span style={{fontSize:13,fontWeight:800,color:utilColor}}>{t.utilization}%</span></div>
                <div style={{height:6,background:T.border,borderRadius:3,marginBottom:8}}><div style={{height:6,width:`${t.utilization}%`,background:utilColor,borderRadius:3}}/></div>
                <div style={{fontSize:11,color:T.gray900,marginBottom:4}}>{t.allocatedHrs}h allocated · <strong>{t.availableHrs}h free</strong> today</div>
                <div style={{fontSize:10,color:T.gray400,marginBottom:6}}>Certified: {t.certifications.join(", ")}</div>
                {t.currentWOs.length>0&&<div style={{fontSize:11,color:T.gray900,marginBottom:4}}>Active: {t.currentWOs.join(", ")}</div>}
                {hasAgentFlag&&<div style={{background:T.warning+"18",border:`1px solid ${T.warning}40`,borderRadius:3,padding:"4px 8px",fontSize:10,fontWeight:700,color:T.warning}}>⚠ Under-utilised — agent has reallocation suggestion in Overview</div>}
              </div>);
            })}
          </div>
          <ViewAllBtn label="View Full Technician Schedule in Prometheus →" total={maintTechnicians.length}/>
        </div>
      </div>}

      {/* ── ASSET HEALTH TAB ── */}
      {activeTab==="assets"&&<div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}>
            <div style={{fontSize:13,fontWeight:800,color:T.black}}>📡 Asset Health Monitoring Agent — Live Degradation Signals</div>
            <div style={{fontSize:11,color:T.gray900,marginTop:2}}>Showing {alertAssets.length} assets with active alerts or degradation signals · Real-time sensor data</div>
          </div>
          <div style={{padding:"16px 20px",display:"flex",gap:12,flexWrap:"wrap"}}>
            {alertAssets.map(a=>(
              <div key={a.id} style={{flex:"1 1 200px",background:T.gray100,borderRadius:4,borderTop:`4px solid ${healthColor(a.healthScore)}`,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{fontSize:12,fontWeight:800,color:T.black,flex:1,paddingRight:8}}>{a.name}</div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:900,color:healthColor(a.healthScore),lineHeight:1}}>{a.healthScore}</div>
                    <div style={{fontSize:9,color:T.gray400}}>Health Score</div>
                  </div>
                </div>
                <div style={{height:4,background:T.border,borderRadius:2,marginBottom:8}}><div style={{height:4,width:`${a.healthScore}%`,background:healthColor(a.healthScore),borderRadius:2}}/></div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:T.gray900}}>Vibration</span><span style={{fontWeight:700,color:a.vibration>=7?T.negative:a.vibration>=5?T.warning:T.positive}}>{a.vibration}<span style={{color:T.gray400,fontWeight:400}}>/7.0</span></span></div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:T.gray900}}>Temp Variance</span><span style={{fontWeight:700,color:a.tempVariance>=5?T.negative:a.tempVariance>=3?T.warning:T.positive}}>±{a.tempVariance}°C</span></div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}><span style={{color:T.gray900}}>Next PM</span><span style={{fontWeight:700,color:a.nextPM==="Overdue"||a.nextPM==="Not scheduled"||a.nextPM==="Never"?T.negative:T.gray900}}>{a.nextPM}</span></div>
                </div>
                <div style={{marginTop:8,display:"flex",gap:4,flexWrap:"wrap"}}>
                  <Badge label={a.trend} color={a.trend==="Degrading"?T.negative:a.trend==="Unknown"?T.warning:T.positive}/>
                  <Badge label={`${a.failureRisk} Risk`} color={a.failureRisk==="Critical"?T.negative:a.failureRisk==="High"?T.warning:T.positive}/>
                </div>
              </div>
            ))}
          </div>
          <ViewAllBtn label="View All Assets →" total={maintAssets.length}/>
        </div>
      </div>}

      {/* ── SPARE PARTS TAB ── */}
      {activeTab==="parts"&&<div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}>
            <div style={{fontSize:13,fontWeight:800,color:T.black}}>📦 Spare Parts — Stock-Outs & Low Stock</div>
            <div style={{fontSize:11,color:T.gray900,marginTop:2}}>Parts at zero or below minimum · Blocked work orders · Agent PO recommendations</div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.gray100}}>
                {["Part","Part No.","Asset / Line","Stock","Status","Blocking WOs","Supplier","Lead Time","Agent Recommendation","Action"].map(h=>(<th key={h} style={{padding:"9px 14px",textAlign:"left",fontWeight:700,color:T.gray900,fontSize:11,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{h}</th>))}
              </tr></thead>
              <tbody>{stockIssues.map((p,i)=>(<tr key={p.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?T.white:T.gray100+"88"}}>
                <td style={{padding:"10px 14px",fontWeight:700,color:T.black}}>{p.name}</td>
                <td style={{padding:"10px 14px",color:T.gray400,fontFamily:"monospace",fontSize:11}}>{p.partNo}</td>
                <td style={{padding:"10px 14px",color:T.gray900,whiteSpace:"nowrap"}}>{p.asset}<br/><span style={{fontSize:10,color:T.gray400}}>{p.line}</span></td>
                <td style={{padding:"10px 14px",fontWeight:800,color:p.stock===0?T.negative:T.warning}}>{p.stock} units</td>
                <td style={{padding:"10px 14px",whiteSpace:"nowrap"}}><Badge label={p.status} color={p.status==="Stock-Out"?T.negative:p.status==="Low Stock"?T.warning:T.info}/></td>
                <td style={{padding:"10px 14px"}}>{p.blockedWOs.length>0?p.blockedWOs.map(wo=><div key={wo} style={{fontSize:11,color:T.negative,fontWeight:700}}>⚠ {wo}</div>):<span style={{fontSize:11,color:T.gray400}}>None</span>}</td>
                <td style={{padding:"10px 14px",color:T.gray900,whiteSpace:"nowrap"}}>{p.supplier}</td>
                <td style={{padding:"10px 14px",color:T.gray900,whiteSpace:"nowrap"}}>
                  <div style={{fontSize:11}}>Standard: {p.leadTimeDays}d</div>
                  {p.emergencyLeadTimeDays&&<div style={{fontSize:11,color:T.warning}}>Emergency: {p.emergencyLeadTimeDays}d (${p.emergencyUnitCost}/unit)</div>}
                </td>
                <td style={{padding:"10px 14px",fontSize:11,color:T.gray900,maxWidth:200}}>{p.agentRec}</td>
                <td style={{padding:"10px 14px",whiteSpace:"nowrap"}}>
                  {p.poRaised||appliedPOs[p.id]?<Badge label="✓ PO Raised" color={T.positive}/>:
                  p.emergencyLeadTimeDays?<button onClick={()=>raisePO(p.id)} style={{background:T.negative,color:T.white,border:"none",borderRadius:4,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Raise Emergency PO</button>:
                  <button onClick={()=>raisePO(p.id)} style={{background:T.primary,color:T.white,border:"none",borderRadius:4,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>Raise PO</button>}
                </td>
              </tr>))}</tbody>
            </table>
          </div>
          <ViewAllBtn label="View Full Parts Catalog in Prometheus →" total={spareParts.length}/>
        </div>
      </div>}

      {/* ── PM SCHEDULE TAB ── */}
      {activeTab==="pm"&&<div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:T.black}}>🗓 Preventive Maintenance Schedule</div>
              <div style={{fontSize:11,color:T.gray900,marginTop:2}}>Upcoming, overdue, and program-less assets needing attention</div>
            </div>
            <div style={{display:"flex",gap:4}}>
              {["Action Required","All PMs"].map(f=>(<button key={f} onClick={()=>setPmFilter(f)} style={{padding:"4px 10px",borderRadius:4,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${pmFilter===f?T.primary:T.border}`,background:pmFilter===f?T.primary:T.white,color:pmFilter===f?T.white:T.gray900}}>{f}</button>))}
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.gray100}}>
                {["Asset","Line","PM Interval","Last PM","Next PM","Status","WO Coverage","Agent Note",""].map(h=>(<th key={h} style={{padding:"9px 14px",textAlign:"left",fontWeight:700,color:T.gray900,fontSize:11,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{h}</th>))}
              </tr></thead>
              <tbody>{displayPMs.map((p,i)=>(<tr key={p.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?T.white:T.gray100+"88"}}>
                <td style={{padding:"9px 14px",fontWeight:700,color:T.black,whiteSpace:"nowrap"}}>{p.asset}</td>
                <td style={{padding:"9px 14px",color:T.gray900}}>{p.line}</td>
                <td style={{padding:"9px 14px",color:T.gray900}}>{p.interval}</td>
                <td style={{padding:"9px 14px",color:T.gray900,whiteSpace:"nowrap"}}>{p.lastPM}</td>
                <td style={{padding:"9px 14px",fontWeight:700,color:p.status==="Overdue"||p.status==="No Program"?T.negative:T.gray900,whiteSpace:"nowrap"}}>{p.nextPM}{p.daysOverdue&&<span style={{color:T.negative,fontSize:10,marginLeft:4}}>({p.daysOverdue}d overdue)</span>}</td>
                <td style={{padding:"9px 14px",whiteSpace:"nowrap"}}><Badge label={p.status} color={pmStatusColor(p.status)}/></td>
                <td style={{padding:"9px 14px",fontSize:11,color:p.woCoverage?T.primary:T.gray400}}>{p.woCoverage||"No WO raised"}</td>
                <td style={{padding:"9px 14px",fontSize:11,color:T.gray900,maxWidth:200}}>{p.notes}</td>
                <td style={{padding:"9px 14px",whiteSpace:"nowrap"}}><button style={{background:"none",border:`1px solid #C7D2FE`,borderRadius:3,padding:"3px 8px",fontSize:10,fontWeight:700,color:"#4F46E5",cursor:"pointer"}}>Open in Prometheus →</button></td>
              </tr>))}</tbody>
            </table>
          </div>
          <ViewAllBtn label="View Full PM Schedule in Prometheus →" total={pmSchedule.length}/>
        </div>
      </div>}

      {/* ── STRATEGY TAB ── */}
      {activeTab==="strategy"&&<div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:T.black}}>⚙️ Maintenance Strategy Agent — Assets Requiring Strategy Change</div>
              <div style={{fontSize:11,color:T.gray900,marginTop:2}}>{changeAssets.length} assets where agent recommends a strategy change · Driven by criticality and consequence of failure</div>
            </div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:T.gray100}}>
                {["Asset","Line","Criticality","Failure Impact","Current Strategy","Recommended Change","Reason"].map(h=>(<th key={h} style={{padding:"9px 14px",textAlign:"left",fontWeight:700,color:T.gray900,fontSize:11,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{h}</th>))}
              </tr></thead>
              <tbody>{changeAssets.map((a,i)=>(<tr key={a.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?T.white:T.gray100+"88"}}>
                <td style={{padding:"10px 14px",fontWeight:700,color:T.black,whiteSpace:"nowrap"}}>{a.name}</td>
                <td style={{padding:"10px 14px",color:T.gray900}}>{a.line}</td>
                <td style={{padding:"10px 14px"}}><Badge label={a.criticality} color={critColor(a.criticality)}/></td>
                <td style={{padding:"10px 14px",fontSize:11,color:T.gray900,lineHeight:1.6}}>
                  <span style={{color:a.safetyImpact!=="Low"?T.warning:T.gray400}}>Safety: {a.safetyImpact}</span>{" · "}
                  <span style={{color:a.qualityImpact==="High"?T.negative:T.gray900}}>Quality: {a.qualityImpact}</span>{" · "}
                  <span style={{color:a.productionImpact==="High"?T.negative:T.gray900}}>Prod: {a.productionImpact}</span>
                  <div style={{color:T.gray400}}>Failure cost: <strong style={{color:a.failureCost>10000?T.negative:T.gray900}}>${a.failureCost.toLocaleString()}</strong></div>
                </td>
                <td style={{padding:"10px 14px",color:T.gray900,whiteSpace:"nowrap"}}>{a.currentStrategy}</td>
                <td style={{padding:"10px 14px",whiteSpace:"nowrap"}}><Badge label={a.agentRec} color={recColor(a.agentRec)}/></td>
                <td style={{padding:"10px 14px",maxWidth:240,fontSize:11,color:T.gray900,lineHeight:1.5}}>{a.recReason}</td>
              </tr>))}</tbody>
            </table>
          </div>
          <ViewAllBtn label="View All Assets →" total={maintAssets.length}/>
        </div>
      </div>}

      {/* ── PERFORMANCE TAB ── */}
      {activeTab==="performance"&&<div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
        <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}>
            <div style={{fontSize:13,fontWeight:800,color:T.black}}>📊 Technician Performance & Coaching</div>
            <div style={{fontSize:11,color:T.gray900,marginTop:2}}>On-time completion rate, efficiency vs. estimate, and Co-Pilot coaching suggestions</div>
          </div>
          <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:16}}>
            {techPerformance.map(t=>(
              <div key={t.name} style={{background:T.gray100,borderRadius:4,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:T.white,flexShrink:0}}>{t.avatar}</div>
                    <div><div style={{fontSize:13,fontWeight:800,color:T.black}}>{t.name}</div><div style={{fontSize:11,color:T.gray900}}>{t.role}</div></div>
                  </div>
                  <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:10,color:T.gray900,marginBottom:2}}>WOs Completed</div>
                      <div style={{fontSize:16,fontWeight:800,color:t.thisWeek.completed>=t.thisWeek.target?T.positive:T.warning}}>{t.thisWeek.completed}<span style={{fontSize:11,color:T.gray400,fontWeight:400}}>/{t.thisWeek.target}</span></div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:10,color:T.gray900,marginBottom:2}}>On-Time Rate</div>
                      <div style={{fontSize:16,fontWeight:800,color:t.thisWeek.onTime/Math.max(t.thisWeek.completed,1)>=0.8?T.positive:T.warning}}>{Math.round(t.thisWeek.onTime/Math.max(t.thisWeek.completed,1)*100)}%</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:10,color:T.gray900,marginBottom:2}}>Avg Efficiency</div>
                      <div style={{fontSize:16,fontWeight:800,color:effColor(t.efficiency.avgActualVsEstimate)}}>{t.efficiency.avgActualVsEstimate}x</div>
                      <div style={{fontSize:9,color:T.gray400}}>actual vs. est.</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:10,color:T.gray900,marginBottom:2}}>Trend</div>
                      <div style={{fontSize:12,fontWeight:700,color:t.efficiency.trend==="Improving"?T.positive:t.efficiency.trend==="Stable"?T.info:T.negative}}>{t.efficiency.trend==="Improving"?"↑ Improving":t.efficiency.trend==="Stable"?"→ Stable":t.efficiency.trend==="Declining"?"↓ Declining":"⚠ Needs Support"}</div>
                    </div>
                  </div>
                </div>
                <div style={{marginBottom:t.coachingSuggestions.length>0?12:0}}>
                  <div style={{fontSize:11,fontWeight:700,color:T.gray900,marginBottom:6}}>This Week's Work Orders</div>
                  <div style={{display:"flex",flexDirection:"column",gap:3}}>
                    {t.wosThisWeek.map(wo=>(
                      <div key={wo.id} style={{display:"flex",gap:8,alignItems:"center",fontSize:11,background:T.white,borderRadius:3,padding:"5px 10px"}}>
                        <span style={{fontWeight:700,color:T.black,minWidth:70}}>{wo.id}</span>
                        <span style={{flex:1,color:T.gray900}}>{wo.asset}</span>
                        <span style={{color:T.gray900,minWidth:80}}>Est: {wo.estHrs}h</span>
                        <span style={{fontWeight:700,color:wo.actualHrs===0?T.gray400:effColor(wo.actualHrs/wo.estHrs),minWidth:80}}>{wo.actualHrs>0?`Actual: ${wo.actualHrs}h`:"In progress"}</span>
                        <span>{wo.onTime===null?<Badge label="In Progress" color={T.info}/>:wo.onTime?<Badge label="On Time" color={T.positive}/>:<Badge label="Late" color={T.negative}/>}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {t.coachingSuggestions.length>0&&(
                  <div style={{background:T.white,borderRadius:4,border:`1px solid ${"#673AB7"}40`,borderLeft:`3px solid ${"#673AB7"}`,padding:"10px 14px"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#673AB7",marginBottom:6}}>🤖 Co-Pilot Coaching Suggestions</div>
                    {t.coachingSuggestions.map((c,i)=>(
                      <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:i<t.coachingSuggestions.length-1?6:0}}>
                        <Badge label={c.type} color={c.type==="SOP"?T.primary:c.type==="Training"?T.info:c.type==="Pairing"?T.warning:"#673AB7"}/>
                        <span style={{fontSize:11,color:T.gray900,flex:1}}>{c.note}</span>
                      </div>
                    ))}
                  </div>
                )}
                {t.strengths.length>0&&(
                  <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
                    {t.strengths.map(s=><span key={s} style={{fontSize:10,color:T.positive,background:T.positive+"12",border:`1px solid ${T.positive}30`,borderRadius:3,padding:"2px 8px"}}>✓ {s}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <ViewAllBtn label="View Full Performance History →" total={techPerformance.length}/>
        </div>
      </div>}

    </div>
  </div>);
}



const COPILOT_SYSTEM_PROMPT = `You are the Technician Co-Pilot for Austin Plant. You help maintenance technicians, operators, and supervisors with on-the-job tasks. You are practical, direct, and safety-first. You do NOT do strategic analysis — that's the Scenario Simulation's job. Your job is to help the person in front of you get their work done safely and correctly right now.

You help with:
- Step-by-step SOP guidance for specific work orders
- Fault code lookups and troubleshooting
- LOTO procedures before any maintenance task
- Tool and parts lists for specific jobs
- Safe work practices and safety checks
- Work order context and history
- Technician assignment questions

PLANT CONTEXT (today, Feb 28, 2026):
- Line 3 Heat Sealer (A-001): WO-4421 open, Carlos Rivera assigned, vibration 8.4/7.0 threshold, Part #SE-441 out of stock (arriving tomorrow 7am)
- Line 2 Heat Tunnel (A-006): WO-4422 open, unassigned, first PM ever — Marcus Webb recommended
- Line 3 Packaging Filler (A-004): WO-4423 open, unassigned, calibration drift — Priya Singh recommended
- Line 1 Label Applicator (A-002): WO-4424 open, Priya Singh assigned
- Line 2 Conveyor Belt (A-003): WO-4425 in progress, Marcus Webb assigned

TECHNICIANS ON SHIFT:
- Carlos Rivera (Senior): On WO-4421, certified Heat Sealer/Filler/Electrical, 4hrs available after current job
- Marcus Webb: On WO-4425 (done ~1pm), certified Heat Tunnel/Conveyor/Packaging
- Priya Singh: On WO-4424, certified Filler/Label Applicator/Mixing, 6.5hrs available
- James Okafor (Junior): Unassigned, certified Conveyor/General only

SOPs AVAILABLE:
- Heat Sealer Inspection & Replacement SOP v3.2 — covers vibration diagnosis, element replacement, calibration
- Heat Tunnel PM Checklist v1.1 — covers heating element inspection, safety interlock check, temp calibration
- Packaging Filler Calibration Procedure v2.4 — covers zero-point calibration, seal weight check
- LOTO Procedure — All Lines v4.0 — mandatory before ANY maintenance task
- Emergency Shutdown Protocol v2.1

Always start any maintenance task response with the LOTO step. Be concise. Use numbered steps where helpful. If you don't know something specific, say so clearly.`;

const COPILOT_SUGGESTIONS = [
  "I'm starting WO-4421 on the Line 3 sealer — walk me through the LOTO steps first",
  "What tools and parts do I need for the Line 2 heat tunnel PM (WO-4422)?",
  "The Line 3 sealer is showing fault code E-14 — what does that mean?",
  "I'm calibrating the Line 3 filler (WO-4423) — what's the zero-point calibration procedure?",
];
const COPILOT_SUGGESTION_LABELS = [
  "🔒 WO-4421 sealer — walk me through LOTO first",
  "🔧 WO-4422 heat tunnel PM — tools and parts list?",
  "⚠️ Line 3 sealer fault code E-14 — what is it?",
  "📋 WO-4423 filler calibration — zero-point procedure",
];

// ── LINE DATA (same as before) ─────────────────────────────────────────────
const lineData = {
  "All":{ oee:75,oeeTarget:85,availability:81,downtimeMins:142,downtimeTarget:60,qualityRate:95,qualityTarget:98,firstPassYield:93,unitsProduced:18400,unitsTarget:21000,scrap:2.8,scrapTarget:1.5,openWorkOrders:7,overdueWorkOrders:2,plannedUnplannedRatio:58,scheduleAdherence:82,scheduleTarget:95,safetyIncidents:0,nearMisses:1,otif:87,otifTarget:95,planStatus:-3.8,
    shifts:[{shift:"Night (Feb 27)",oee:71,units:5800,target:7000,quality:94,downtime:58,status:"Below Target"},{shift:"Afternoon (Feb 27)",oee:76,units:6200,target:7000,quality:95,downtime:49,status:"Below Target"},{shift:"Day (Feb 27)",oee:79,units:6400,target:7000,quality:96,downtime:35,status:"Below Target"}],
    alerts:["Line 3 sealer degradation unresolved across all 3 shifts","Labor shortage flagged for afternoon shift","Inbound materials out of spec for SKU 4412"]},
  "Line 1":{ oee:80,oeeTarget:85,availability:88,downtimeMins:44,downtimeTarget:30,qualityRate:97,qualityTarget:98,firstPassYield:96,unitsProduced:6800,unitsTarget:7000,scrap:1.4,scrapTarget:1.5,openWorkOrders:2,overdueWorkOrders:0,plannedUnplannedRatio:80,scheduleAdherence:91,scheduleTarget:95,safetyIncidents:0,nearMisses:0,otif:93,otifTarget:95,planStatus:-0.7,
    shifts:[{shift:"Night (Feb 27)",oee:78,units:2180,target:2333,quality:96,downtime:18,status:"Near Target"},{shift:"Afternoon (Feb 27)",oee:80,units:2260,target:2333,quality:97,downtime:15,status:"Near Target"},{shift:"Day (Feb 27)",oee:83,units:2360,target:2333,quality:98,downtime:11,status:"On Target"}],
    alerts:["Label misalignment recurred on afternoon shift","Inbound seasoning blend out of spec — SKU 4412 at risk"]},
  "Line 2":{ oee:87,oeeTarget:85,availability:93,downtimeMins:22,downtimeTarget:30,qualityRate:99,qualityTarget:98,firstPassYield:98,unitsProduced:7200,unitsTarget:7000,scrap:0.8,scrapTarget:1.5,openWorkOrders:1,overdueWorkOrders:0,plannedUnplannedRatio:91,scheduleAdherence:97,scheduleTarget:95,safetyIncidents:0,nearMisses:0,otif:98,otifTarget:95,planStatus:0.6,
    shifts:[{shift:"Night (Feb 27)",oee:86,units:2380,target:2333,quality:99,downtime:8,status:"On Target"},{shift:"Afternoon (Feb 27)",oee:87,units:2400,target:2333,quality:99,downtime:7,status:"On Target"},{shift:"Day (Feb 27)",oee:89,units:2420,target:2333,quality:99,downtime:7,status:"On Target"}],
    alerts:["3 operators overdue on safety recertification"]},
  "Line 3":{ oee:55,oeeTarget:85,availability:62,downtimeMins:276,downtimeTarget:60,qualityRate:89,qualityTarget:98,firstPassYield:86,unitsProduced:4400,unitsTarget:7000,scrap:6.1,scrapTarget:1.5,openWorkOrders:4,overdueWorkOrders:2,plannedUnplannedRatio:22,scheduleAdherence:58,scheduleTarget:95,safetyIncidents:0,nearMisses:1,otif:71,otifTarget:95,planStatus:-5.2,
    shifts:[{shift:"Night (Feb 27)",oee:52,units:1240,target:2333,quality:88,downtime:104,status:"Critical"},{shift:"Afternoon (Feb 27)",oee:55,units:1540,target:2333,quality:89,downtime:92,status:"Critical"},{shift:"Day (Feb 27)",oee:59,units:1620,target:2333,quality:90,downtime:80,status:"Critical"}],
    alerts:["Sealer temperature instability across all 3 shifts — 9 escalations","Spare part #SE-441 out of stock","Schedule adherence critically low"]},
};

const domainActions = {
  "All":{
    Safety:[{id:"s1",text:"Conduct pre-shift safety briefing — all 3 lines",status:"Complete",owner:"Shift Supervisors"},{id:"s2",text:"LOTO recertification scheduled for J. Park, D. Williams, M. Santos",status:"In Progress",owner:"Tom Kowalski"},{id:"s3",text:"Near miss report filed — Line 3 overnight",status:"Complete",owner:"Safety Lead"}],
    Quality:[{id:"q1",text:"Inbound materials inspection — Lot #SB-2291 flagged, hold placed",status:"Action Required",owner:"Quality Manager"},{id:"q2",text:"First pass yield review — Line 3 below threshold 3rd consecutive shift",status:"Action Required",owner:"Quality Manager"},{id:"q3",text:"Deviation report submitted for Line 1 label misalignment",status:"Complete",owner:"Line 1 Supervisor"}],
    Production:[{id:"p1",text:"Shift handover completed — Line 3 sealer issue carried forward",status:"Complete",owner:"Shift Supervisors"},{id:"p2",text:"Afternoon shift coverage gap — 2 operators short",status:"Action Required",owner:"Tom Kowalski"},{id:"p3",text:"Line 2 changeover executed on schedule — no issues",status:"Complete",owner:"Line 2 Supervisor"}],
    Maintenance:[{id:"m1",text:"Work order raised — Line 3 sealer inspection (WO-4421)",status:"In Progress",owner:"Carlos Rivera"},{id:"m2",text:"Emergency PO initiated — Part #SE-441 from Supplier B",status:"Action Required",owner:"Carlos Rivera"},{id:"m3",text:"PM checks completed on Line 1 and Line 2",status:"Complete",owner:"Maintenance Team"}],
    Planning:[{id:"pl1",text:"Production plan reviewed — Line 3 shortfall flagged to scheduling",status:"Complete",owner:"Priya Nair"},{id:"pl2",text:"Customer order CO-8821 at risk — SKU 4412 materials issue",status:"Action Required",owner:"Priya Nair"},{id:"pl3",text:"Labor plan updated for afternoon shift — voluntary OT requested",status:"In Progress",owner:"Priya Nair"}],
  },
  "Line 1":{Safety:[{id:"s1",text:"Pre-shift safety briefing completed",status:"Complete",owner:"Line 1 Supervisor"},{id:"s2",text:"No incidents or near misses overnight",status:"Complete",owner:"Line 1 Supervisor"}],Quality:[{id:"q1",text:"Label misalignment deviation report filed",status:"Complete",owner:"Quality Lead"},{id:"q2",text:"Inbound seasoning blend Lot #SB-2291 on hold — affects SKU 4412",status:"Action Required",owner:"Quality Manager"}],Production:[{id:"p1",text:"Shift handover completed — no open escalations",status:"Complete",owner:"Line 1 Supervisor"},{id:"p2",text:"3pm changeover requires 2 operators — coverage at risk",status:"Action Required",owner:"Tom Kowalski"}],Maintenance:[{id:"m1",text:"PM checks completed — no issues found",status:"Complete",owner:"Maintenance Team"}],Planning:[{id:"pl1",text:"SKU 4412 volume at risk — plan adjustment needed",status:"Action Required",owner:"Priya Nair"}]},
  "Line 2":{Safety:[{id:"s1",text:"LOTO recertification overdue — 3 operators flagged",status:"Action Required",owner:"Tom Kowalski"},{id:"s2",text:"Pre-shift briefing completed — no incidents",status:"Complete",owner:"Line 2 Supervisor"}],Quality:[{id:"q1",text:"Quality rate at 99% — no deviations to report",status:"Complete",owner:"Quality Lead"}],Production:[{id:"p1",text:"Best OEE of the week — no escalations",status:"Complete",owner:"Line 2 Supervisor"},{id:"p2",text:"Changeover completed ahead of schedule",status:"Complete",owner:"Line 2 Supervisor"}],Maintenance:[{id:"m1",text:"1 open work order — non-urgent belt inspection",status:"In Progress",owner:"Maintenance Team"}],Planning:[{id:"pl1",text:"Schedule adherence at 97% — on track for Friday orders",status:"Complete",owner:"Priya Nair"}]},
  "Line 3":{Safety:[{id:"s1",text:"Near miss filed — operator exposure during sealer fault",status:"Complete",owner:"Safety Lead"},{id:"s2",text:"Pre-shift briefing included sealer risk advisory",status:"Complete",owner:"Line 3 Supervisor"}],Quality:[{id:"q1",text:"FPY below 90% — 3rd consecutive shift. Escalated to QM",status:"Action Required",owner:"Quality Manager"},{id:"q2",text:"Scrap rate at 6.1% — root cause linked to sealer instability",status:"Action Required",owner:"Quality Manager"}],Production:[{id:"p1",text:"Sealer issue carried forward from all 3 overnight shifts",status:"Action Required",owner:"Line 3 Supervisor"},{id:"p2",text:"Production 37% below target — schedule impact flagged",status:"Action Required",owner:"Tom Kowalski"}],Maintenance:[{id:"m1",text:"WO-4421 open — sealer inspection in progress",status:"In Progress",owner:"Carlos Rivera"},{id:"m2",text:"Part #SE-441 out of stock — emergency PO raised",status:"Action Required",owner:"Carlos Rivera"},{id:"m3",text:"2 overdue work orders — need immediate review",status:"Action Required",owner:"Carlos Rivera"}],Planning:[{id:"pl1",text:"Schedule adherence at 58% — customer orders at risk",status:"Action Required",owner:"Priya Nair"},{id:"pl2",text:"SKU 3801 run conflicting with maintenance window",status:"Action Required",owner:"Priya Nair"}]},
};

const domainRecMap = { Safety:[5], Quality:[], Production:[3,4], Maintenance:[1,2], "Planning & Scheduling":[3,4] };

const VALID_AGENTS = ["Asset Health Monitoring Agent","Maintenance Planning & Scheduling Agent","Technician Co-Pilot","Maintenance Strategy Agent","Scheduling Agent","Planning Agent","Supervisor & Operator Co-Pilot","Quality Monitoring Agent","Inbound Materials Agent","Final Quality Agent","Setpoint & Recipe Optimization Agent","Root Cause Analysis Agent","Safety Agent","Plant Orchestration Agent"];
const VALID_APPROVERS = {"Plant Leader":{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},"Maintenance Manager":{name:"Carlos Rivera",role:"Maintenance Manager",avatar:"MM"},"Scheduler":{name:"Priya Nair",role:"Scheduler",avatar:"SC"},"Production Supervisor":{name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"},"Quality Manager":{name:"Quality Manager",role:"Quality Manager",avatar:"QM"}};
const DOMAIN_ICONS = { Safety:"🦺", Quality:"✅", Production:"⚙️", Maintenance:"🔧", Planning:"📋" };

const initialRecommendations = [
  {id:1,lines:["All","Line 3"],priority:"Critical",domain:"Maintenance",icon:"🔧",fromChat:false,title:"Line 3 Sealer — Unplanned Failure Risk Within 48hrs",summary:"Asset Health Monitoring Agent detected vibration index 8.4 (threshold 7.0) and temp variance ±6°C on the Line 3 heat sealer. Unplanned failure likely within 48 hours.",agents:["Asset Health Monitoring Agent","Maintenance Planning & Scheduling Agent","Scheduling Agent"],suggestedAction:"Perform planned maintenance during today's 2–4pm changeover window and expedite spare part procurement.",detail:{issue:"Asset Health Monitoring Agent has detected vibration index 8.4 (threshold: 7.0) and temperature variance of ±6°C on the Line 3 heat sealer.",compounding:"Part #SE-441 is out of stock. Emergency procurement from Supplier B can deliver by tomorrow 7am.",risk:"Unplanned failure would result in 4–6 hours unplanned downtime and ~8,000 units of lost output.",action:"Perform planned maintenance during today's 2:00–4:00pm changeover window. Raise emergency PO for Part #SE-441.",steps:[{agent:"Asset Health Monitoring Agent",domain:"Maintenance",action:"Confirm degradation signal — vibration index 8.4, temp variance ±6°C.",status:"complete"},{agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Check Part #SE-441 inventory — out of stock. Raise emergency PO.",status:"complete"},{agent:"Scheduling Agent",domain:"Planning",action:"Identify 2:00–4:00pm changeover slot on Line 3.",status:"complete"},{agent:"Planning Agent",domain:"Planning",action:"Reallocate 1 operator from Line 2 to Line 1 Thursday afternoon.",status:"pending"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Notify supervisors of maintenance window and schedule change.",status:"pending"},{agent:"Technician Co-Pilot",domain:"Maintenance",action:"Pre-load sealer maintenance SOP for technician.",status:"pending"}],approvers:[{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},{name:"Carlos Rivera",role:"Maintenance Manager",avatar:"MM"},{name:"Priya Nair",role:"Scheduler",avatar:"SC"},{name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"}]}},
  {id:2,lines:["All","Line 3"],priority:"Critical",domain:"Maintenance",icon:"🔩",fromChat:false,title:"Spare Part Stock-Out — Sealer Heating Element Unavailable",summary:"Part #SE-441 is out of stock. Standard lead time 3 days. Emergency procurement available for next-morning delivery.",agents:["Maintenance Planning & Scheduling Agent","Technician Co-Pilot"],suggestedAction:"Raise emergency PO to approved supplier for next-day delivery.",detail:{issue:"Part #SE-441 has zero inventory. Required for the Line 3 maintenance intervention.",compounding:"Without the part, planned maintenance cannot be completed during today's window.",risk:"If not raised today, earliest arrival is Tuesday — by which time failure is highly likely.",action:"Raise emergency PO to Supplier B ($340/unit). Confirm next-day AM delivery.",steps:[{agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Confirm Part #SE-441 stock — zero units on hand.",status:"complete"},{agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Raise emergency PO to Supplier B — next-day AM delivery confirmed.",status:"pending"},{agent:"Technician Co-Pilot",domain:"Maintenance",action:"Flag part dependency in maintenance work order.",status:"pending"}],approvers:[{name:"Carlos Rivera",role:"Maintenance Manager",avatar:"MM"},{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"}]}},
  {id:3,lines:["All","Line 3","Line 1"],priority:"High",domain:"Planning",icon:"📋",fromChat:false,title:"Scheduling Conflict — Maintenance Window vs. Friday Customer Order",summary:"Conflict between proposed Line 3 maintenance window and high-priority customer order for SKU 3801 due Friday.",agents:["Scheduling Agent","Planning Agent","Supervisor & Operator Co-Pilot"],suggestedAction:"Shift SKU 3801 run to Line 1 for Thursday afternoon.",detail:{issue:"Line 3 maintenance window conflicts with SKU 3801 order — 6,200 units due Friday.",compounding:"Line 3 capacity already constrained due to sealer issue.",risk:"Either maintenance is missed or customer order is late.",action:"Move SKU 3801 to Line 1, Thursday 1–5pm slot.",steps:[{agent:"Scheduling Agent",domain:"Planning",action:"Model SKU 3801 on Line 1 Thursday — capacity confirmed.",status:"complete"},{agent:"Planning Agent",domain:"Planning",action:"Reallocate operator from Line 2 to Line 1.",status:"pending"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Notify supervisors of schedule change.",status:"pending"}],approvers:[{name:"Priya Nair",role:"Scheduler",avatar:"SC"},{name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"},{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"}]}},
  {id:4,lines:["All","Line 1","Line 3"],priority:"High",domain:"Planning",icon:"👷",fromChat:false,title:"Labor Shortage — Afternoon Shift Short 2 Operators",summary:"Afternoon shift is short 2 operators. Lines 1 and 3 will have coverage gaps unless resolved before 2pm handover.",agents:["Planning Agent","Supervisor & Operator Co-Pilot"],suggestedAction:"Offer voluntary overtime to 3 identified Day shift operators.",detail:{issue:"Two afternoon shift operators called out — Lines 1 and 3 under-staffed.",compounding:"Labor shortage coincides with planned maintenance window on Line 3.",risk:"Line 1 changeover may be delayed and Line 3 requires minimum 1 operator during maintenance.",action:"Contact 3 Day shift operators for voluntary overtime.",steps:[{agent:"Planning Agent",domain:"Planning",action:"Identify Day shift operators for voluntary overtime — 3 candidates.",status:"complete"},{agent:"Planning Agent",domain:"Planning",action:"Send overtime offer. Response required by 12pm.",status:"pending"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"If declined, activate single-operator protocol on Line 3.",status:"pending"}],approvers:[{name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"},{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"}]}},
  {id:5,lines:["All","Line 2"],priority:"Medium",domain:"Safety",icon:"🦺",fromChat:false,title:"Safety Recertification Overdue — 3 Operators on Line 2",summary:"3 Line 2 operators have overdue LOTO recertification. Policy requires completion within 5 working days.",agents:["Safety Agent","Supervisor & Operator Co-Pilot"],suggestedAction:"Schedule 45-minute recertification session during Line 2 downtime window.",detail:{issue:"J. Park, D. Williams, M. Santos have not completed annual LOTO recertification.",compounding:"Non-compliance creates audit risk on the best-performing line.",risk:"If not completed by Mar 4, operators removed from LOTO-related tasks.",action:"Schedule recertification session Wednesday 10–11am.",steps:[{agent:"Safety Agent",domain:"Safety",action:"Flag 3 overdue LOTO recertifications. Deadline Mar 4.",status:"complete"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Training slot confirmed — Wed 10–11am.",status:"complete"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Book trainer, notify 3 operators.",status:"pending"}],approvers:[{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},{name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"}]}},
];

const actionLog = [
  {id:"a1",source:"Routine",domain:"Safety",line:"Line 2",description:"LOTO recertification — J. Park, D. Williams, M. Santos",owner:"Tom Kowalski",dueDate:"Mar 4, 2026",status:"In Progress",daysOpen:5},
  {id:"a2",source:"Routine",domain:"Safety",line:"All",description:"Near miss investigation report — Line 3 overnight incident",owner:"Safety Lead",dueDate:"Mar 1, 2026",status:"In Progress",daysOpen:2},
  {id:"a3",source:"Routine",domain:"Quality",line:"Line 1",description:"Deviation report closed — label misalignment root cause confirmed",owner:"Quality Lead",dueDate:"Feb 28, 2026",status:"Complete",daysOpen:1},
  {id:"a4",source:"Routine",domain:"Quality",line:"Line 1",description:"Inbound materials hold — Lot #SB-2291 disposition decision required",owner:"Quality Manager",dueDate:"Feb 28, 2026",status:"Open",daysOpen:1},
  {id:"a5",source:"Routine",domain:"Production",line:"Line 3",description:"Shift handover — sealer issue formal escalation to maintenance",owner:"Line 3 Supervisor",dueDate:"Feb 28, 2026",status:"Complete",daysOpen:1},
  {id:"a6",source:"Routine",domain:"Production",line:"All",description:"Afternoon shift coverage gap — voluntary OT offers sent",owner:"Tom Kowalski",dueDate:"Feb 28, 2026",status:"In Progress",daysOpen:1},
  {id:"a7",source:"Routine",domain:"Maintenance",line:"Line 3",description:"WO-4421 raised — Line 3 sealer inspection initiated",owner:"Carlos Rivera",dueDate:"Feb 28, 2026",status:"In Progress",daysOpen:1},
  {id:"a8",source:"Routine",domain:"Maintenance",line:"Line 1",description:"PM checks completed — Line 1 and Line 2 signed off",owner:"Maintenance Team",dueDate:"Feb 28, 2026",status:"Complete",daysOpen:1},
  {id:"a9",source:"Routine",domain:"Planning",line:"Line 3",description:"Customer order CO-8821 at risk — procurement notified",owner:"Priya Nair",dueDate:"Feb 28, 2026",status:"In Progress",daysOpen:1},
  {id:"a10",source:"Routine",domain:"Planning",line:"All",description:"Labor plan updated — voluntary OT requested for afternoon shift",owner:"Priya Nair",dueDate:"Feb 28, 2026",status:"In Progress",daysOpen:1},
  {id:"a11",source:"Recommendation",domain:"Maintenance",line:"Line 3",description:"Emergency PO raised — Part #SE-441 from Supplier B",owner:"Carlos Rivera",dueDate:"Mar 1, 2026",status:"In Progress",daysOpen:1},
  {id:"a12",source:"Recommendation",domain:"Maintenance",line:"Line 3",description:"Planned maintenance window confirmed — Line 3 sealer, today 2–4pm",owner:"Carlos Rivera",dueDate:"Feb 28, 2026",status:"Open",daysOpen:1},
  {id:"a13",source:"Recommendation",domain:"Planning",line:"Line 3",description:"SKU 3801 rescheduled to Line 1 — Thursday 1–5pm",owner:"Priya Nair",dueDate:"Mar 5, 2026",status:"Open",daysOpen:1},
  {id:"a14",source:"Recommendation",domain:"Planning",line:"Line 1",description:"Operator reallocation — Line 2 to Line 1 Thursday afternoon",owner:"Tom Kowalski",dueDate:"Mar 5, 2026",status:"Open",daysOpen:1},
  {id:"a15",source:"Recommendation",domain:"Safety",line:"Line 2",description:"LOTO recertification session booked — Wed 10–11am",owner:"Tom Kowalski",dueDate:"Mar 4, 2026",status:"In Progress",daysOpen:3},
  {id:"a16",source:"Recommendation",domain:"Maintenance",line:"Line 3",description:"Sealer maintenance SOP pre-loaded for technician",owner:"Maintenance Team",dueDate:"Feb 28, 2026",status:"Open",daysOpen:1},
  {id:"a17",source:"Recommendation",domain:"Quality",line:"Line 1",description:"SKU swap to 3802 executed — quality checks completed",owner:"Quality Manager",dueDate:"Feb 28, 2026",status:"Complete",daysOpen:1},
  {id:"a18",source:"Routine",domain:"Safety",line:"All",description:"Monthly safety walk scheduled — all supervisors required",owner:"Safety Lead",dueDate:"Mar 7, 2026",status:"Open",daysOpen:8},
  {id:"a19",source:"Routine",domain:"Maintenance",line:"Line 2",description:"Quarterly belt inspection overdue — WO to be raised this week",owner:"Carlos Rivera",dueDate:"Mar 3, 2026",status:"Open",daysOpen:4},
  {id:"a20",source:"Recommendation",domain:"Production",line:"Line 3",description:"Single-operator protocol activated on Line 3 for afternoon shift",owner:"Tom Kowalski",dueDate:"Feb 28, 2026",status:"In Progress",daysOpen:1},
];

const disruptionAlert = {id:"RT-001",severity:"Critical",time:"07:43am",title:"Inbound Materials Out of Spec — SKU 4412 at Risk",description:"Inbound Materials Agent has flagged that the arriving seasoning blend batch (Lot #SB-2291) for SKU 4412 is out of spec. Sodium content is 14% above acceptable range.",impacts:["Line 1 Day shift production plan cannot proceed as scheduled","Quality Monitoring Agent will reject batch at intake","SKU 4412 volume of 4,200 units at risk for today","Customer order #CO-8821 (due Thursday) may be impacted"],options:[{id:"A",label:"Swap to SKU 3802",description:"SKU 3802 materials confirmed in stock. Feasible with 35-min changeover. Minor OEE impact (~3%). Recommended.",recommended:true,impact:"Low"},{id:"B",label:"Source replacement batch",description:"Emergency same-day delivery. 60% confidence on timing. Line 1 idle 2–3 hours.",recommended:false,impact:"Medium"},{id:"C",label:"Hold Line 1 until tomorrow",description:"Safest quality option but results in full Day shift loss on Line 1.",recommended:false,impact:"High"}],notifyList:["Plant Leader","Production Supervisor","Quality Manager","Scheduler","Procurement Lead"]};

const generateDays=(n,label)=>Array.from({length:n},(_,i)=>{const d=new Date(2026,1,28);d.setDate(d.getDate()-(n-1-i));return label==="24h"?`${String(i*2).padStart(2,"0")}:00`:`${d.getMonth()+1}/${d.getDate()}`;});
const seed=(base,variance,n)=>Array.from({length:n},()=>Math.round((base+(Math.random()-0.5)*variance*2)*10)/10);
const buildLinePerf=(n,label)=>({days:generateDays(n,label),oee:{"Line 1":seed(80,5,n),"Line 2":seed(87,4,n),"Line 3":seed(57,8,n)},availability:{"Line 1":seed(88,4,n),"Line 2":seed(93,3,n),"Line 3":seed(63,9,n)},units:{"Line 1":seed(6800,400,n),"Line 2":seed(7200,300,n),"Line 3":seed(4400,600,n)},quality:{"Line 1":seed(97,1.5,n),"Line 2":seed(99,0.8,n),"Line 3":seed(89,2.5,n)},scrap:{"Line 1":seed(1.4,0.4,n),"Line 2":seed(0.8,0.3,n),"Line 3":seed(6.1,1.2,n)},plannedRatio:{"Line 1":seed(80,6,n),"Line 2":seed(91,4,n),"Line 3":seed(22,8,n)},downtime:{"Line 1":seed(44,15,n),"Line 2":seed(22,8,n),"Line 3":seed(276,40,n)},schedAdherence:{"Line 1":seed(91,5,n),"Line 2":seed(97,3,n),"Line 3":seed(58,10,n)},otif:{"Line 1":seed(93,4,n),"Line 2":seed(98,2,n),"Line 3":seed(71,8,n)}});
const perfDatasets={"24h":buildLinePerf(12,"24h"),"2w":buildLinePerf(14,"2w"),"1m":buildLinePerf(30,"1m")};
const LINE_COLORS_PERF={"Line 1":T.primary,"Line 2":T.positive,"Line 3":T.negative};

const INIT_ORDERS=[{id:"RUN-1021",line:"Line 1",sku:"SKU 3802",desc:"Original Chips",units:4200,target:4500,start:"Feb 28 06:00",end:"Feb 28 11:30",dueDate:"Feb 28",dc:"DC-East"},{id:"RUN-1022",line:"Line 1",sku:"SKU 4412",desc:"Seasoned Chips",units:4200,target:4500,start:"Feb 28 12:00",end:"Feb 28 17:30",dueDate:"Feb 28",dc:"DC-West",riskReason:"Inbound materials out of spec"},{id:"RUN-1023",line:"Line 1",sku:"SKU 2204",desc:"Crimped Seal Chips",units:3800,target:4000,start:"Mar 1 06:00",end:"Mar 1 11:00",dueDate:"Mar 3",dc:"DC-South"},{id:"RUN-1024",line:"Line 1",sku:"SKU 3801",desc:"Premium Chips",units:6200,target:6200,start:"Mar 1 13:00",end:"Mar 1 18:00",dueDate:"Mar 7",dc:"DC-East",riskReason:"Moved from Line 3 per orchestration rec"},{id:"RUN-1025",line:"Line 1",sku:"SKU 3804",desc:"BBQ Chips",units:5000,target:5000,start:"Mar 2 06:00",end:"Mar 2 12:30",dueDate:"Mar 5",dc:"DC-West"},{id:"RUN-1026",line:"Line 2",sku:"SKU 3802",desc:"Original Chips",units:7000,target:7000,start:"Feb 28 06:00",end:"Feb 28 14:00",dueDate:"Feb 28",dc:"DC-North"},{id:"RUN-1027",line:"Line 2",sku:"SKU 2204",desc:"Crimped Seal Chips",units:6500,target:6500,start:"Mar 1 06:00",end:"Mar 1 13:00",dueDate:"Mar 4",dc:"DC-East"},{id:"RUN-1028",line:"Line 2",sku:"SKU 3804",desc:"BBQ Chips",units:7000,target:7000,start:"Mar 2 06:00",end:"Mar 2 14:00",dueDate:"Mar 6",dc:"DC-South"},{id:"RUN-1029",line:"Line 2",sku:"SKU 3801",desc:"Premium Chips",units:3500,target:3500,start:"Mar 3 08:00",end:"Mar 3 12:30",dueDate:"Mar 7",dc:"DC-West"},{id:"RUN-1030",line:"Line 3",sku:"SKU 2204",desc:"Crimped Seal Chips",units:2800,target:4500,start:"Feb 28 10:00",end:"Feb 28 14:00",dueDate:"Mar 1",dc:"DC-North",riskReason:"Sealer downtime constraining output"},{id:"RUN-1031",line:"Line 3",sku:"SKU 2204",desc:"Crimped Seal Chips",units:4000,target:4000,start:"Mar 1 06:00",end:"Mar 1 14:00",dueDate:"Mar 3",dc:"DC-East"},{id:"RUN-1032",line:"Line 3",sku:"SKU 3804",desc:"BBQ Chips",units:5500,target:5500,start:"Mar 2 08:00",end:"Mar 2 16:00",dueDate:"Mar 5",dc:"DC-South",riskReason:"Dependent on sealer repair"}];
const schedAgentRecs=[{id:"sa1",priority:"High",title:"Sequence Optimisation — Line 1 Thursday",impact:"Save 45 min changeover",action:"Resequence RUN-1023 → RUN-1025 on Line 1 Thursday",detail:"Grouping RUN-1023 (SKU 2204) and RUN-1025 (SKU 3804) back-to-back on Line 1 Thursday saves an estimated 45 min of changeover time."},{id:"sa2",priority:"Medium",title:"Idle Capacity — Line 2 Friday Afternoon",impact:"~1,800 units buffer stock",action:"Add SKU 2204 buffer run to Line 2, Mar 6 1–3:30pm",detail:"Line 2 has 2.5 hours of unallocated capacity Friday afternoon."},{id:"sa3",priority:"Medium",title:"Changeover Reduction — Line 3 Next Week",impact:"Save ~1.5 hrs changeover",action:"Regroup Line 3 schedule Mar 2–3 by SKU family",detail:"Current Line 3 schedule alternates between incompatible SKU families."}];
const orchSchedulingRecs=[{id:3,priority:"High",title:"SKU 3801 Rescheduled to Line 1 — Thursday Afternoon",status:"Partially Executed",detail:"SKU 3801 (RUN-1024) moved from Line 3 to Line 1, Thursday 1–5pm due to Line 3 sealer risk."},{id:1,priority:"Critical",title:"Line 3 Maintenance Window — Today 2–4pm",status:"Action Required",detail:"Planned maintenance window approved on Line 3 today 2–4pm. RUN-1030 volume shortfall of ~1,700 units vs DC-North target."}];
const GANTT_SKUS={"SKU 3802":T.primary,"SKU 4412":T.negative,"SKU 2204":T.positive,"SKU 3801":"#673AB7","SKU 3804":T.warning};
const GANTT_DAYS=["Feb 28","Mar 1","Mar 2","Mar 3"];
const GANTT_HOURS=[6,8,10,12,14,16,18];
const DAY_START=6;const DAY_END=18;

function timeToFrac(str){if(!str)return null;const parts=str.trim().split(" ");if(parts.length<3)return null;const date=parts[0]+" "+parts[1];const time=parts[2];const timeParts=time.split(":");const h=parseInt(timeParts[0],10);const m=timeParts[1]?parseInt(timeParts[1],10):0;const dayIdx=GANTT_DAYS.indexOf(date);if(dayIdx<0)return null;return dayIdx+(h-DAY_START+m/60)/(DAY_END-DAY_START);}

const PERSONA_DOMAINS={plant_leader:["Safety","Quality","Production","Maintenance","Planning & Scheduling"],maint_manager:["Maintenance","Safety"],scheduler:["Planning & Scheduling"],quality_manager:["Quality"],safety_lead:["Safety"]};
const PERSONA_ROLES={plant_leader:["Plant Leader","Plant Manager"],maint_manager:["Maintenance Manager"],scheduler:["Scheduler","Scheduling Manager"],quality_manager:["Quality Manager"],safety_lead:["Safety Lead"]};
function recVisibleToPersona(rec,persona){if(persona==="plant_leader")return true;const roles=PERSONA_ROLES[persona]||[];const domains=PERSONA_DOMAINS[persona]||[];const isApprover=(rec.detail?.approvers||[]).some(a=>roles.includes(a.role));const domainMatch=domains.includes(rec.domain);const stepMatch=(rec.detail?.steps||[]).some(s=>domains.includes(s.domain));const agentMatch=(rec.agents||[]).some(a=>domains.some(d=>a.toLowerCase().includes(d.toLowerCase())));return isApprover||domainMatch||stepMatch||agentMatch;}

const SCENARIO_SYSTEM_PROMPT=`You are the Plant Orchestration Agent for Austin Plant, a snack food manufacturing facility with 3 production lines. You have full visibility across Safety, Quality, Production, Maintenance, and Planning & Scheduling.
PLANT DATA: ${JSON.stringify(lineData).substring(0,2000)}
TODAY: Friday Feb 28, 2026 — 7:00am DDS. Be direct, concise, use lean manufacturing language.
AVAILABLE AGENTS: Asset Health Monitoring Agent, Maintenance Planning & Scheduling Agent, Technician Co-Pilot, Maintenance Strategy Agent, Scheduling Agent, Planning Agent, Supervisor & Operator Co-Pilot, Quality Monitoring Agent, Inbound Materials Agent, Safety Agent, Plant Orchestration Agent
When you reach a clear actionable conclusion, output BOTH blocks EXACTLY:
---RECOMMENDATION---
TITLE: [short title]
PRIORITY: [Critical / High / Medium]
DOMAIN: [Safety / Quality / Production / Maintenance / Planning]
LINES: [All / Line 1 / Line 2 / Line 3]
ACTION: [one sentence recommended action]
AGENTS: [comma-separated]
SUMMARY: [2-3 sentences]
---END---
---STEPS---
[{"agent":"Agent Name","domain":"Domain","action":"Specific action","status":"pending"},...]
---ENDSTEPS---
---APPROVERS---
[{"role":"Role Name"},...]
---ENDAPPROVERS---`;

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────

function DetailPage({rec,onBack}){
  const d=rec.detail||{};
  const [approverState,setApproverState]=useState((d.approvers||[]).map(a=>({...a,status:"pending"})));
  const [executed,setExecuted]=useState(false);const [executing,setExecuting]=useState(false);
  const allApproved=approverState.length>0&&approverState.every(a=>a.status==="approved");
  const approve=i=>{const u=[...approverState];u[i].status="approved";setApproverState(u);};
  const execute=()=>{setExecuting(true);setTimeout(()=>{setExecuting(false);setExecuted(true);},2000);};
  return(<div>
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"16px 24px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <button onClick={onBack} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:4,padding:"6px 12px",fontSize:12,cursor:"pointer",color:T.gray900,fontWeight:700}}>← Back</button>
      <div style={{flex:1}}><div style={{fontSize:16,fontWeight:800,color:T.black}}>{rec.icon} {rec.title}</div><div style={{fontSize:12,color:T.gray900,marginTop:2}}>Recommendation Detail & Orchestrated Response Plan</div></div>
      <Badge label={rec.priority} color={PriorityColor(rec.priority)}/>
    </div>
    <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16,background:T.gray100}}>
      {executed&&<div style={{background:"#F0FDF4",border:`2px solid ${T.positive}`,borderRadius:4,padding:"14px 18px"}}><div style={{fontSize:14,fontWeight:800,color:T.positive}}>✅ Orchestrated Response Executed</div><div style={{fontSize:12,color:T.black,marginTop:4}}>All agent actions dispatched. Relevant supervisors and managers notified.</div></div>}
      <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",overflow:"hidden"}}>
        <div style={{background:PriorityColor(rec.priority),padding:"10px 18px",display:"flex",gap:10,alignItems:"center"}}><Badge label={rec.priority} color={T.white}/><span style={{fontSize:13,fontWeight:800,color:T.white}}>{rec.domain}</span></div>
        <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
          {[["ISSUE",d.issue],["COMPOUNDING FACTOR",d.compounding],["RISK IF NOT ACTED ON",d.risk]].filter(([,v])=>v).map(([lbl,txt])=>(<div key={lbl}><div style={{fontSize:11,fontWeight:700,color:T.gray900,marginBottom:3}}>{lbl}</div><div style={{fontSize:12,color:T.black,lineHeight:1.6}}>{txt}</div></div>))}
          {!d.issue&&<div style={{fontSize:12,color:T.black,lineHeight:1.6}}>{rec.summary}</div>}
          <div style={{background:T.primary+"10",borderLeft:`3px solid ${T.primary}`,borderRadius:4,padding:"10px 14px"}}><div style={{fontSize:11,fontWeight:700,color:T.primary,marginBottom:3}}>RECOMMENDED ACTION</div><div style={{fontSize:12,color:T.black,lineHeight:1.6}}>{d.action||rec.suggestedAction}</div></div>
        </div>
      </div>
      {(d.steps||[]).length>0&&<div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:13,fontWeight:800,color:T.black}}>🌐 Orchestrated Agent Response Plan</div></div>
        <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:8}}>
          {d.steps.map((s,i)=>(<div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"10px 14px",background:T.gray100,borderRadius:4}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:executed||s.status==="complete"?T.positive:T.gray400,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.white,fontWeight:800,flexShrink:0}}>{executed||s.status==="complete"?"✓":i+1}</div>
            <div style={{flex:1}}><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:3}}><Badge label={s.agent} color={T.primary}/><Badge label={s.domain} color={T.neutral}/></div><div style={{fontSize:12,color:T.black}}>{s.action}</div></div>
            <Badge label={executed?"dispatched":s.status} color={executed||s.status==="complete"?T.positive:T.warning}/>
          </div>))}
        </div>
      </div>}
      {approverState.length>0&&<div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:13,fontWeight:800,color:T.black}}>✍️ Approval Required Before Execution</div></div>
        <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:8}}>
          {approverState.map((a,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:T.gray100,borderRadius:4,gap:8,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:32,height:32,borderRadius:"50%",background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.white,fontWeight:800}}>{a.avatar}</div><div><div style={{fontSize:13,fontWeight:700,color:T.black}}>{a.name}</div><div style={{fontSize:11,color:T.gray900}}>{a.role}</div></div></div>
            {a.status==="approved"||executed?<Badge label="✓ Approved" color={T.positive}/>:<button onClick={()=>approve(i)} style={{background:T.primary,color:T.white,border:"none",borderRadius:4,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Approve</button>}
          </div>))}
        </div>
        <div style={{padding:"0 20px 20px"}}><button onClick={execute} disabled={!allApproved||executed||executing} style={{width:"100%",padding:"12px",background:allApproved&&!executed?T.primary:T.gray400,color:T.white,border:"none",borderRadius:4,fontSize:14,fontWeight:800,cursor:allApproved&&!executed?"pointer":"not-allowed"}}>{executing?"⏳ Dispatching...":executed?"✅ Response Executed":allApproved?"🚀 Execute Orchestrated Response":`Waiting for approvals (${approverState.filter(a=>a.status==="approved").length}/${approverState.length})`}</button></div>
      </div>}
    </div>
  </div>);
}

function DomainColumn({domain,icon,metrics,actions,recCount,onScrollToRecs}){
  const [expanded,setExpanded]=useState(false);
  const actionRequired=actions.filter(a=>a.status==="Action Required").length;
  return(<div style={{flex:1,minWidth:130,display:"flex",flexDirection:"column",gap:6}}>
    <div style={{fontSize:11,fontWeight:800,color:T.gray900,borderBottom:`2px solid ${T.border}`,paddingBottom:6,marginBottom:2}}>{icon} {domain}</div>
    {metrics.map(m=>(<div key={m.label} style={{padding:"10px 12px",background:T.gray100,borderRadius:4,borderLeft:`3px solid ${m.bad?T.negative:m.good?T.positive:T.warning}`}}><Metric {...m}/></div>))}
    <div style={{marginTop:4}}>
      <button onClick={()=>setExpanded(e=>!e)} style={{width:"100%",background:actionRequired>0?"#FEF2F2":T.gray100,border:`1px solid ${actionRequired>0?T.negative+"40":T.border}`,borderRadius:4,padding:"6px 10px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:4}}>
        <span style={{fontSize:11,fontWeight:700,color:actionRequired>0?T.negative:T.gray900}}>{actionRequired>0?`⚠ ${actionRequired} Action Required`:`📋 ${actions.length} Actions`}</span>
        <span style={{fontSize:10,color:T.gray400}}>{expanded?"▲":"▼"}</span>
      </button>
      {expanded&&<div style={{display:"flex",flexDirection:"column",gap:4,marginTop:4}}>{actions.map(a=>(<div key={a.id} style={{background:T.white,borderRadius:4,padding:"8px 10px",borderLeft:`3px solid ${statusColor(a.status)}`,fontSize:11}}><div style={{color:T.black,marginBottom:3,lineHeight:1.4}}>{a.text}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}><span style={{color:T.gray900,fontSize:10}}>{a.owner}</span><Badge label={a.status} color={statusColor(a.status)}/></div></div>))}</div>}
    </div>
    {recCount>0&&<button onClick={onScrollToRecs} style={{marginTop:2,background:T.primary+"10",border:`1px solid ${T.primary}40`,borderRadius:4,padding:"6px 10px",cursor:"pointer",textAlign:"left",width:"100%"}}><span style={{fontSize:11,fontWeight:700,color:T.primary}}>🧠 {recCount} recommendation{recCount>1?"s":""} below ↓</span></button>}
  </div>);
}


// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({recs,onSelectRec,onShowDisruption,disruptionActive,persona}){
  const [lineFilter,setLineFilter]=useState("All");
  const recsRef=useRef();
  const d=lineData[lineFilter];const actions=domainActions[lineFilter]||domainActions["All"];
  const pct=(v,t)=>v>=t;const inv=(v,t)=>v<=t;
  const personaDomains=PERSONA_DOMAINS[persona]||PERSONA_DOMAINS.plant_leader;
  const filteredRecs=recs.filter(r=>r.lines.includes(lineFilter)).filter(r=>recVisibleToPersona(r,persona));
  const chatRecs=filteredRecs.filter(r=>r.fromChat);
  const disruptionRecs=filteredRecs.filter(r=>r.fromDisruption);
  const standardRecs=filteredRecs.filter(r=>!r.fromChat&&!r.fromDisruption);
  const scrollToRecs=()=>recsRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
  const allDomainColumns=[
    {domain:"Safety",icon:"🦺",metrics:[{label:"Safety Incidents",value:d.safetyIncidents,target:0,unit:"",good:d.safetyIncidents===0,bad:d.safetyIncidents>0},{label:"Near Misses",value:d.nearMisses,target:0,unit:"",good:d.nearMisses===0,bad:d.nearMisses>1}],actions:actions.Safety||[]},
    {domain:"Quality",icon:"✅",metrics:[{label:"Quality Rate",value:d.qualityRate,target:d.qualityTarget,unit:"%",good:pct(d.qualityRate,d.qualityTarget),bad:!pct(d.qualityRate,d.qualityTarget)},{label:"First Pass Yield",value:d.firstPassYield,target:95,unit:"%",good:pct(d.firstPassYield,95),bad:!pct(d.firstPassYield,95)}],actions:actions.Quality||[]},
    {domain:"Production",icon:"⚙️",metrics:[{label:"Units Produced",value:d.unitsProduced.toLocaleString(),target:d.unitsTarget.toLocaleString(),unit:"",good:pct(d.unitsProduced,d.unitsTarget),bad:!pct(d.unitsProduced,d.unitsTarget)},{label:"OEE",value:d.oee,target:d.oeeTarget,unit:"%",good:pct(d.oee,d.oeeTarget),bad:!pct(d.oee,d.oeeTarget)},{label:"Availability",value:d.availability,target:85,unit:"%",good:pct(d.availability,85),bad:!pct(d.availability,85)},{label:"Downtime",value:d.downtimeMins,target:d.downtimeTarget,unit:" min",good:inv(d.downtimeMins,d.downtimeTarget),bad:!inv(d.downtimeMins,d.downtimeTarget)},{label:"Scrap / Waste",value:d.scrap,target:d.scrapTarget,unit:"%",good:inv(d.scrap,d.scrapTarget),bad:!inv(d.scrap,d.scrapTarget)}],actions:actions.Production||[]},
    {domain:"Maintenance",icon:"🔧",metrics:[{label:"Planned/Unplanned",value:`${d.plannedUnplannedRatio}% / ${100-d.plannedUnplannedRatio}%`,target:null,unit:"",good:d.plannedUnplannedRatio>=80,bad:d.plannedUnplannedRatio<60},{label:"Open Work Orders",value:d.openWorkOrders,target:null,unit:"",good:d.openWorkOrders<=2,bad:d.openWorkOrders>4},{label:"Overdue WOs",value:d.overdueWorkOrders,target:0,unit:"",good:d.overdueWorkOrders===0,bad:d.overdueWorkOrders>0}],actions:actions.Maintenance||[]},
    {domain:"Planning & Scheduling",icon:"📋",metrics:[{label:"Plan Status",value:d.planStatus>0?`${d.planStatus} hrs ahead`:`${Math.abs(d.planStatus)} hrs behind`,target:null,unit:"",good:d.planStatus>=0,bad:d.planStatus<-2},{label:"Sched. Adherence",value:d.scheduleAdherence,target:d.scheduleTarget,unit:"%",good:pct(d.scheduleAdherence,d.scheduleTarget),bad:!pct(d.scheduleAdherence,d.scheduleTarget)},{label:"OTIF",value:d.otif,target:d.otifTarget,unit:"%",good:pct(d.otif,d.otifTarget),bad:!pct(d.otif,d.otifTarget)}],actions:actions.Planning||[]},
  ];
  const visibleDomainColumns=allDomainColumns.map(col=>({...col,actions:personaDomains.includes(col.domain)?col.actions:[]}));
  return(<div>
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
      <div><div style={{fontSize:18,fontWeight:800,color:T.black}}>Good morning, Austin Plant 👋</div><div style={{fontSize:12,color:T.gray900,marginTop:2}}>Daily Direction Setting · Friday Feb 28, 2026 · 7:00am · Prior 24 hours</div></div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["All","Line 1","Line 2","Line 3"].map(l=>(<button key={l} onClick={()=>setLineFilter(l)} style={{padding:"6px 14px",borderRadius:4,fontSize:12,fontWeight:700,cursor:"pointer",border:`1px solid ${lineFilter===l?T.primary:T.border}`,background:lineFilter===l?T.primary:T.white,color:lineFilter===l?T.white:T.gray900}}>{l}</button>))}</div>
    </div>
    <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:20,background:T.gray100}}>
      {disruptionActive&&<div onClick={onShowDisruption} style={{background:"#FEF2F2",border:`2px solid ${T.negative}`,borderRadius:4,padding:"12px 18px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:18}}>🚨</span><div><div style={{fontSize:13,fontWeight:800,color:T.negative}}>REAL-TIME DISRUPTION · {disruptionAlert.time}</div><div style={{fontSize:12,color:T.black,marginTop:2}}>{disruptionAlert.title}</div></div></div>
        <Badge label="View & Respond →" color={T.negative}/>
      </div>}
      <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
          <div><div style={{fontSize:13,fontWeight:800,color:T.black}}>Performance Scorecard — {lineFilter==="All"?"All Lines":lineFilter}</div><div style={{fontSize:11,color:T.gray900,marginTop:2}}>Prior 24 hours · 3 shifts</div></div>
          {lineFilter!=="All"&&d.alerts.length>0&&<div style={{display:"flex",flexDirection:"column",gap:4}}>{d.alerts.map((a,i)=><div key={i} style={{fontSize:11,color:T.negative,fontWeight:600}}>⚠ {a}</div>)}</div>}
        </div>
        <div style={{padding:"16px 20px",overflowX:"auto"}}><div style={{display:"flex",gap:12,minWidth:500}}>{visibleDomainColumns.map(col=>(<DomainColumn key={col.domain} {...col} recCount={0} onScrollToRecs={scrollToRecs}/>))}</div></div>
        <div style={{borderTop:`1px solid ${T.border}`,padding:"14px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:T.gray900,marginBottom:10}}>Shift Breakdown</div>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr style={{background:T.gray100}}>{["Shift","OEE","Units","Target","Quality","Downtime","Status"].map(h=>(<th key={h} style={{padding:"7px 12px",textAlign:"left",fontWeight:700,color:T.gray900,fontSize:11,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead>
            <tbody>{d.shifts.map((s,i)=>(<tr key={i} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?T.white:T.gray100+"88"}}>
              <td style={{padding:"8px 12px",fontWeight:700,color:T.black,whiteSpace:"nowrap"}}>{s.shift}</td>
              <td style={{padding:"8px 12px",fontWeight:700,color:s.oee>=85?T.positive:s.oee>=75?T.warning:T.negative}}>{s.oee}%</td>
              <td style={{padding:"8px 12px",color:T.black}}>{s.units.toLocaleString()}</td>
              <td style={{padding:"8px 12px",color:T.gray900}}>{s.target.toLocaleString()}</td>
              <td style={{padding:"8px 12px",color:s.quality>=98?T.positive:s.quality>=95?T.warning:T.negative}}>{s.quality}%</td>
              <td style={{padding:"8px 12px",color:s.downtime>60?T.negative:T.gray900}}>{s.downtime} min</td>
              <td style={{padding:"8px 12px"}}><Badge label={s.status} color={s.status==="On Target"?T.positive:s.status==="Near Target"||s.status==="Below Target"?T.warning:T.negative}/></td>
            </tr>))}</tbody>
          </table></div>
        </div>
      </div>
      <div ref={recsRef}>
        {disruptionRecs.length>0&&<div style={{marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{fontSize:13,fontWeight:800,color:T.black}}>🚨 From Disruption Response</div><Badge label={`${disruptionRecs.length} active`} color={T.negative}/></div><div style={{display:"flex",flexDirection:"column",gap:8}}>{disruptionRecs.map(r=>(<div key={r.id} onClick={()=>onSelectRec(r)} style={{background:T.white,borderRadius:4,borderLeft:`4px solid ${PriorityColor(r.priority)}`,boxShadow:`0 0 0 2px ${T.negative}22`,padding:"14px 18px",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}><div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}><Badge label={r.priority} color={PriorityColor(r.priority)}/><Badge label={r.domain} color={T.primary}/><Badge label="🚨 Disruption" color={T.negative}/></div><div style={{fontSize:13,fontWeight:800,color:T.black,marginBottom:4}}>{r.icon} {r.title}</div><div style={{fontSize:12,color:T.gray900}}>{r.summary}</div><div style={{fontSize:12,color:T.primary,fontWeight:600,marginTop:6}}>💡 {r.suggestedAction}</div></div><div style={{fontSize:12,color:T.primary,fontWeight:700}}>View Detail →</div></div></div>))}</div></div>}
        {chatRecs.length>0&&<div style={{marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{fontSize:13,fontWeight:800,color:T.black}}>✦ From Scenario Simulation</div><Badge label={`${chatRecs.length} new`} color={T.info}/></div><div style={{display:"flex",flexDirection:"column",gap:8}}>{chatRecs.map(r=>(<div key={r.id} onClick={()=>onSelectRec(r)} style={{background:T.white,borderRadius:4,borderLeft:`4px solid ${PriorityColor(r.priority)}`,boxShadow:`0 0 0 2px ${T.info}22`,padding:"14px 18px",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}><div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}><Badge label={r.priority} color={PriorityColor(r.priority)}/><Badge label={r.domain} color={T.primary}/><Badge label="✦ From Chat" color={T.info}/></div><div style={{fontSize:13,fontWeight:800,color:T.black,marginBottom:4}}>{r.icon} {r.title}</div><div style={{fontSize:12,color:T.gray900}}>{r.summary}</div><div style={{fontSize:12,color:T.primary,fontWeight:600,marginTop:6}}>💡 {r.suggestedAction}</div></div><div style={{fontSize:12,color:T.primary,fontWeight:700}}>View Detail →</div></div></div>))}</div></div>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:8}}><div style={{fontSize:13,fontWeight:800,color:T.black}}>🧠 Orchestration Agent — Recommendations</div>{persona!=="plant_leader"&&<Badge label={`Filtered for your role · ${standardRecs.length} relevant`} color={T.primary}/>}</div>
        <div style={{fontSize:11,color:T.gray900,marginBottom:12}}>{persona==="plant_leader"?"Synthesized across all domain agents · Ranked by urgency and cross-domain impact":"Showing recommendations where you are tagged as an approver or your domain is impacted"}</div>
        {standardRecs.length===0&&<div style={{background:T.white,borderRadius:4,padding:"20px",textAlign:"center",color:T.gray400,fontSize:13,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>No recommendations currently require your attention.</div>}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>{standardRecs.map(r=>(<div key={r.id} onClick={()=>onSelectRec(r)} style={{background:T.white,borderRadius:4,borderLeft:`4px solid ${PriorityColor(r.priority)}`,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",padding:"14px 18px",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}><div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}><Badge label={r.priority} color={PriorityColor(r.priority)}/><Badge label={r.domain} color={T.primary}/>{r.agents.slice(0,2).map(a=><Badge key={a} label={a} color={T.neutral}/>)}{r.agents.length>2&&<Badge label={`+${r.agents.length-2} more`} color={T.neutral}/>}</div><div style={{fontSize:13,fontWeight:800,color:T.black,marginBottom:4}}>{r.icon} {r.title}</div><div style={{fontSize:12,color:T.gray900}}>{r.summary}</div><div style={{fontSize:12,color:T.primary,fontWeight:600,marginTop:6}}>💡 {r.suggestedAction}</div></div><div style={{fontSize:12,color:T.primary,fontWeight:700}}>View Detail →</div></div></div>))}</div>
      </div>
    </div>
  </div>);
}

// ── ACTION LOG ────────────────────────────────────────────────────────────────
function ActionLog(){
  const [filterDomain,setFilterDomain]=useState("All");const [filterSource,setFilterSource]=useState("All");const [filterStatus,setFilterStatus]=useState("Open & In Progress");const [filterLine,setFilterLine]=useState("All");
  const [localActions,setLocalActions]=useState(actionLog);
  const filtered=localActions.filter(a=>{if(filterDomain!=="All"&&a.domain!==filterDomain)return false;if(filterSource!=="All"&&a.source!==filterSource)return false;if(filterLine!=="All"&&a.line!==filterLine&&a.line!=="All")return false;if(filterStatus==="Open & In Progress")return a.status==="Open"||a.status==="In Progress";if(filterStatus!=="All"&&a.status!==filterStatus)return false;return true;});
  const cycleStatus=id=>setLocalActions(prev=>prev.map(a=>{if(a.id!==id)return a;const next=a.status==="Open"?"In Progress":a.status==="In Progress"?"Complete":"Open";return{...a,status:next};}));
  const FB=({label,value,current,onChange})=>(<button onClick={()=>onChange(value)} style={{padding:"5px 12px",borderRadius:4,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${current===value?T.primary:T.border}`,background:current===value?T.primary:T.white,color:current===value?T.white:T.gray900}}>{label}</button>);
  return(<div>
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
      <div><div style={{fontSize:18,fontWeight:800,color:T.black}}>Action Log</div><div style={{fontSize:12,color:T.gray900,marginTop:2}}>All open actions across domains · Austin Plant</div></div>
      <div style={{display:"flex",gap:12,fontSize:12}}><span style={{color:T.negative,fontWeight:700}}>● {localActions.filter(a=>a.status==="Open").length} Open</span><span style={{color:T.info,fontWeight:700}}>● {localActions.filter(a=>a.status==="In Progress").length} In Progress</span><span style={{color:T.positive,fontWeight:700}}>● {localActions.filter(a=>a.status==="Complete").length} Complete</span></div>
    </div>
    <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16,background:T.gray100}}>
      <div style={{background:T.white,borderRadius:4,padding:"14px 16px",boxShadow:"0 1px 3px rgba(0,0,0,0.07)",display:"flex",flexDirection:"column",gap:10}}>
        {[{opts:["All","Open & In Progress","Open","In Progress","Complete"],cur:filterStatus,setter:setFilterStatus,lbl:"STATUS"},{opts:["All","Safety","Quality","Production","Maintenance","Planning & Scheduling"],cur:filterDomain,setter:setFilterDomain,lbl:"DOMAIN"},{opts:["All","Routine","Recommendation"],cur:filterSource,setter:setFilterSource,lbl:"SOURCE"},{opts:["All","Line 1","Line 2","Line 3"],cur:filterLine,setter:setFilterLine,lbl:"LINE"}].map(({opts,cur,setter,lbl})=>(
          <div key={lbl} style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:11,fontWeight:700,color:T.gray900,width:60}}>{lbl}</span>{opts.map(o=><FB key={o} label={o} value={o} current={cur} onChange={setter}/>)}</div>
        ))}
      </div>
      <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",overflow:"hidden"}}>
        <div style={{padding:"12px 20px",borderBottom:`1px solid ${T.border}`,fontSize:12,color:T.gray900,fontWeight:600}}>Showing {filtered.length} of {localActions.length} actions</div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:T.gray100}}>{["Action","Domain","Line","Owner","Source","Due Date","Days Open","Status"].map(h=>(<th key={h} style={{padding:"9px 14px",textAlign:"left",fontWeight:700,color:T.gray900,fontSize:11,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead>
          <tbody>{filtered.length===0&&<tr><td colSpan={8} style={{padding:"24px",textAlign:"center",color:T.gray400}}>No actions match current filters</td></tr>}{filtered.map((a,i)=>(<tr key={a.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?T.white:T.gray100+"88"}}>
            <td style={{padding:"10px 14px",color:T.black,maxWidth:280,lineHeight:1.5}}>{a.description}</td>
            <td style={{padding:"10px 14px",whiteSpace:"nowrap"}}><Badge label={a.domain} color={a.domain==="Safety"?T.warning:a.domain==="Quality"?T.positive:a.domain==="Production"?T.info:a.domain==="Maintenance"?"#673AB7":T.primary}/></td>
            <td style={{padding:"10px 14px",color:T.gray900,whiteSpace:"nowrap"}}>{a.line}</td>
            <td style={{padding:"10px 14px",color:T.gray900,whiteSpace:"nowrap"}}>{a.owner}</td>
            <td style={{padding:"10px 14px",whiteSpace:"nowrap"}}><span style={{fontSize:11,fontWeight:700,color:a.source==="Recommendation"?T.primary:T.neutral}}>{a.source==="Recommendation"?"🧠 Rec":"📋 Routine"}</span></td>
            <td style={{padding:"10px 14px",color:T.gray900,whiteSpace:"nowrap"}}>{a.dueDate}</td>
            <td style={{padding:"10px 14px",fontWeight:700,color:a.daysOpen>=5?T.negative:a.daysOpen>=3?T.warning:T.gray900,whiteSpace:"nowrap"}}>{a.daysOpen}d</td>
            <td style={{padding:"10px 14px"}}><button onClick={()=>cycleStatus(a.id)} style={{background:statusColor(a.status)+"18",color:statusColor(a.status),border:`1px solid ${statusColor(a.status)}40`,borderRadius:3,padding:"3px 10px",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>{a.status}</button></td>
          </tr>))}</tbody>
        </table></div>
      </div>
    </div>
  </div>);
}

// ── LINE PERFORMANCE ──────────────────────────────────────────────────────────
function MiniLineChart({data,lines,yMin=0,yMax=100,height=80,target}){
  const w=320,h=height,pad=4;
  const targetY=target!=null?h-pad-((target-yMin)/(yMax-yMin))*(h-pad*2):null;
  return(<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height,display:"block"}}>
    {targetY!=null&&<line x1={pad} y1={targetY} x2={w-pad} y2={targetY} stroke={T.gray400} strokeWidth={1} strokeDasharray="4,3"/>}
    {lines.map(line=>{const vals=data[line]||[];const n=vals.length;const color=LINE_COLORS_PERF[line]||T.neutral;const d=vals.map((v,i)=>{const x=pad+(i/(n-1||1))*(w-pad*2);const y=h-pad-((v-yMin)/(yMax-yMin))*(h-pad*2);return`${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`;}).join(" ");const lx=n>0?pad+((n-1)/(n-1||1))*(w-pad*2):0;const ly=n>0?h-pad-((vals[n-1]-yMin)/(yMax-yMin))*(h-pad*2):0;return(<g key={line}><path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round"/>{n>0&&<circle cx={lx} cy={ly} r={3} fill={color}/>}</g>);})}
  </svg>);
}
function MiniBarChart({data,lines,yMax=100,height=80,target}){
  const w=320,h=height,pad=4;const n=data[lines[0]]?.length||1;const barW=Math.max(2,(w-pad*2)/n/lines.length-1);const groupW=(w-pad*2)/n;const targetY=target!=null?h-pad-(target/yMax)*(h-pad*2):null;const rects=[];
  if(targetY!=null)rects.push(<line key="tgt" x1={pad} y1={targetY} x2={w-pad} y2={targetY} stroke={T.gray400} strokeWidth={1} strokeDasharray="4,3"/>);
  lines.forEach((line,li)=>{const vals=data[line]||[];const color=LINE_COLORS_PERF[line]||T.neutral;vals.forEach((v,i)=>{const bh=Math.max(1,(v/yMax)*(h-pad*2));const x=pad+i*groupW+li*(barW+1);rects.push(<rect key={`${line}-${i}`} x={x} y={h-pad-bh} width={barW} height={bh} fill={color} opacity={0.85} rx={1}/>);});});
  return(<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height,display:"block"}}>{rects}</svg>);
}
function MiniStackedBar({data,height=80}){
  const w=320,h=height,pad=4;const lines=["Line 1","Line 2","Line 3"];const n=data[lines[0]]?.length||1;const barW=Math.max(2,(w-pad*2)/n/lines.length-1);const groupW=(w-pad*2)/n;const rects=[];
  lines.forEach((line,li)=>{const vals=data[line]||[];vals.forEach((v,i)=>{const planned=v/100*(h-pad*2);const x=pad+i*groupW+li*(barW+1);rects.push(<rect key={`p-${line}-${i}`} x={x} y={h-pad-planned} width={barW} height={Math.max(1,planned)} fill={LINE_COLORS_PERF[line]} opacity={0.85} rx={1}/>);rects.push(<rect key={`u-${line}-${i}`} x={x} y={pad} width={barW} height={Math.max(1,(h-pad*2)-planned)} fill={LINE_COLORS_PERF[line]} opacity={0.25} rx={1}/>);});});
  return(<svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height,display:"block"}}>{rects}</svg>);
}
function ChartCard({title,subtitle,children,legend,lines}){
  return(<div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",padding:"14px 16px",display:"flex",flexDirection:"column",gap:8}}>
    <div><div style={{fontSize:12,fontWeight:800,color:T.black}}>{title}</div>{subtitle&&<div style={{fontSize:10,color:T.gray900,marginTop:1}}>{subtitle}</div>}</div>
    {children}
    {legend&&<div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{lines.map(l=>(<div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.gray900}}><span style={{width:16,height:3,background:LINE_COLORS_PERF[l],display:"inline-block",borderRadius:2}}/>{l}</div>))}</div>}
  </div>);
}
function LinePerformanceView(){
  const [timeframe,setTimeframe]=useState("2w");const [selLines,setSelLines]=useState(["Line 1","Line 2","Line 3"]);const [startDate,setStartDate]=useState("2026-02-14");const [endDate,setEndDate]=useState("2026-02-28");const [useCustom,setUseCustom]=useState(false);
  const allLines=["Line 1","Line 2","Line 3"];
  const toggleLine=l=>setSelLines(prev=>prev.includes(l)?prev.length>1?prev.filter(x=>x!==l):prev:[...prev,l]);
  const tfLabels={"24h":"Last 24 Hours","2w":"Last 2 Weeks","1m":"Last Month"};
  const customDays=Math.max(1,Math.round((new Date(endDate)-new Date(startDate))/(1000*60*60*24))+1);
  const perf=useCustom?buildLinePerf(Math.min(customDays,30),"2w"):perfDatasets[timeframe];
  const displayLabel=useCustom?`${startDate} → ${endDate}`:tfLabels[timeframe];
  const avg=(metric,line)=>{const v=perf[metric][line];return v?Math.round(v.reduce((a,b)=>a+b,0)/v.length*10)/10:0;};
  const kpis=selLines.map(l=>({line:l,oee:avg("oee",l),quality:avg("quality",l),downtime:Math.round(avg("downtime",l)),otif:avg("otif",l)}));
  return(<div>
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
      <div><div style={{fontSize:18,fontWeight:800,color:T.black}}>Line Performance</div><div style={{fontSize:12,color:T.gray900,marginTop:2}}>Historical trends · Austin Plant · {displayLabel}</div></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",gap:4}}>{allLines.map(l=>(<button key={l} onClick={()=>toggleLine(l)} style={{padding:"5px 12px",borderRadius:4,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${selLines.includes(l)?LINE_COLORS_PERF[l]:T.border}`,background:selLines.includes(l)?LINE_COLORS_PERF[l]+"15":T.white,color:selLines.includes(l)?LINE_COLORS_PERF[l]:T.gray900}}>{l}</button>))}</div>
        <div style={{display:"flex",gap:4}}>{[["24h","24 hrs"],["2w","2 wks"],["1m","1 mo"]].map(([v,lbl])=>(<button key={v} onClick={()=>{setTimeframe(v);setUseCustom(false);}} style={{padding:"5px 12px",borderRadius:4,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${!useCustom&&timeframe===v?T.primary:T.border}`,background:!useCustom&&timeframe===v?T.primary:T.white,color:!useCustom&&timeframe===v?T.white:T.gray900}}>{lbl}</button>))}</div>
        <div style={{display:"flex",alignItems:"center",gap:6,background:useCustom?T.primary+"10":T.white,border:`1px solid ${useCustom?T.primary:T.border}`,borderRadius:4,padding:"4px 10px"}}>
          <span style={{fontSize:11,fontWeight:700,color:useCustom?T.primary:T.gray900}}>Custom</span>
          <input type="date" value={startDate} onChange={e=>{setStartDate(e.target.value);setUseCustom(true);}} style={{border:"none",outline:"none",fontSize:11,color:T.black,background:"transparent",cursor:"pointer"}}/>
          <span style={{fontSize:11,color:T.gray400}}>→</span>
          <input type="date" value={endDate} onChange={e=>{setEndDate(e.target.value);setUseCustom(true);}} style={{border:"none",outline:"none",fontSize:11,color:T.black,background:"transparent",cursor:"pointer"}}/>
        </div>
      </div>
    </div>
    <div style={{padding:"20px 24px",background:T.gray100,display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{kpis.map(k=>(<div key={k.line} style={{flex:1,minWidth:140,background:T.white,borderRadius:4,borderLeft:`4px solid ${LINE_COLORS_PERF[k.line]}`,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",padding:"12px 14px"}}><div style={{fontSize:11,fontWeight:800,color:LINE_COLORS_PERF[k.line],marginBottom:6}}>{k.line}</div><div style={{display:"flex",gap:16,flexWrap:"wrap"}}><div><div style={{fontSize:10,color:T.gray900}}>Avg OEE</div><div style={{fontSize:18,fontWeight:800,color:k.oee>=80?T.positive:T.negative}}>{k.oee}%</div></div><div><div style={{fontSize:10,color:T.gray900}}>Avg Quality</div><div style={{fontSize:18,fontWeight:800,color:k.quality>=97?T.positive:T.warning}}>{k.quality}%</div></div><div><div style={{fontSize:10,color:T.gray900}}>Avg Downtime</div><div style={{fontSize:18,fontWeight:800,color:k.downtime>60?T.negative:T.gray900}}>{k.downtime}m</div></div><div><div style={{fontSize:10,color:T.gray900}}>Avg OTIF</div><div style={{fontSize:18,fontWeight:800,color:k.otif>=95?T.positive:T.warning}}>{k.otif}%</div></div></div></div>))}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <ChartCard title="OEE Trend" subtitle="Overall Equipment Effectiveness %" legend lines={selLines}><MiniLineChart data={perf.oee} lines={selLines} yMin={40} yMax={100} target={85}/></ChartCard>
        <ChartCard title="Availability Trend" subtitle="% scheduled time running" legend lines={selLines}><MiniLineChart data={perf.availability} lines={selLines} yMin={40} yMax={100} target={90}/></ChartCard>
        <ChartCard title="Units Produced vs Target" subtitle="Daily units produced" legend lines={selLines}><MiniBarChart data={perf.units} lines={selLines} yMax={8500} target={7000}/></ChartCard>
        <ChartCard title="Quality Rate / FPY" subtitle="% product meeting spec" legend lines={selLines}><MiniLineChart data={perf.quality} lines={selLines} yMin={75} yMax={100} target={98}/></ChartCard>
        <ChartCard title="Scrap & Waste %" subtitle="% of output scrapped" legend lines={selLines}><MiniLineChart data={perf.scrap} lines={selLines} yMin={0} yMax={10} target={1.5}/></ChartCard>
        <ChartCard title="Downtime Minutes" subtitle="Unplanned downtime per period" legend lines={selLines}><MiniBarChart data={perf.downtime} lines={selLines} yMax={350} target={60}/></ChartCard>
        <ChartCard title="Planned vs Unplanned Maintenance" subtitle="Solid = planned, faded = unplanned" legend lines={selLines}><MiniStackedBar data={perf.plannedRatio}/></ChartCard>
        <ChartCard title="Schedule Adherence" subtitle="% of schedule executed as planned" legend lines={selLines}><MiniLineChart data={perf.schedAdherence} lines={selLines} yMin={40} yMax={100} target={95}/></ChartCard>
        <ChartCard title="OTIF" subtitle="On Time In Full %" legend lines={selLines}><MiniLineChart data={perf.otif} lines={selLines} yMin={50} yMax={100} target={95}/></ChartCard>
      </div>
    </div>
  </div>);
}

// ── GANTT & SCHEDULE ──────────────────────────────────────────────────────────
function GanttChart({filterLine,orders}){
  const lines=filterLine==="All"?["Line 1","Line 2","Line 3"]:[filterLine];const totalCols=GANTT_DAYS.length;
  const buildBlocks=(lineOrders)=>{const blocks=[];GANTT_DAYS.forEach((day,di)=>{const dayOrders=lineOrders.filter(o=>o.start.startsWith(day)).sort((a,b)=>timeToFrac(a.start)-timeToFrac(b.start));const dayEnd=di+1;let cursor=di;dayOrders.forEach(o=>{const s=timeToFrac(o.start);const e=timeToFrac(o.end);if(s===null||e===null)return;if(s>cursor+0.005)blocks.push({type:"gap",start:cursor,end:s});blocks.push({type:"order",order:o,start:s,end:e});cursor=e;});if(cursor<dayEnd-0.005)blocks.push({type:"gap",start:cursor,end:dayEnd});});return blocks;};
  return(<div style={{overflowX:"auto"}}><div style={{minWidth:700}}>
    <div style={{display:"flex",marginLeft:80,marginBottom:4}}>{GANTT_DAYS.map(d=>(<div key={d} style={{flex:1,textAlign:"center",fontSize:11,fontWeight:700,color:T.gray900,borderLeft:`1px solid ${T.border}`,paddingLeft:4}}>{d}</div>))}</div>
    <div style={{display:"flex",marginLeft:80,marginBottom:8}}>{GANTT_DAYS.map(d=>(<div key={d} style={{flex:1,display:"flex",justifyContent:"space-between"}}>{GANTT_HOURS.map(h=><span key={h} style={{fontSize:9,color:T.gray400}}>{h}:00</span>)}</div>))}</div>
    {lines.map(line=>{const lineOrders=orders.filter(o=>o.line===line);const blocks=buildBlocks(lineOrders);return(<div key={line} style={{display:"flex",alignItems:"center",marginBottom:8}}><div style={{width:80,fontSize:11,fontWeight:800,color:T.black,flexShrink:0}}>{line}</div><div style={{flex:1,height:36,background:T.gray100,borderRadius:4,position:"relative",border:`1px solid ${T.border}`}}>{GANTT_DAYS.map((_,i)=>(<div key={i} style={{position:"absolute",left:`${(i/totalCols)*100}%`,top:0,bottom:0,borderLeft:`1px dashed ${T.border}40`,zIndex:0}}/>))}{line==="Line 3"&&(()=>{const ms=timeToFrac("Feb 28 14:00");const me=timeToFrac("Feb 28 16:00");if(ms===null||me===null)return null;const ml=(ms/totalCols)*100;const mw=((me-ms)/totalCols)*100;return<div key="maint" style={{position:"absolute",left:`${ml}%`,width:`${mw}%`,top:0,bottom:0,background:"#ef444430",borderLeft:`2px dashed ${T.negative}`,borderRight:`2px dashed ${T.negative}`,zIndex:4,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,color:T.negative,fontWeight:800,whiteSpace:"nowrap"}}>MAINT</span></div>;})()}{blocks.map((b,bi)=>{const left=(b.start/totalCols)*100;const width=((b.end-b.start)/totalCols)*100;if(b.type==="gap")return(<div key={bi} title="Changeover / Sanitation" style={{position:"absolute",left:`${left}%`,width:`${width}%`,top:3,bottom:3,background:"#cbd5e1",borderRadius:3,zIndex:1,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>{width>2&&<span style={{fontSize:8,color:"#64748b",fontWeight:600}}>⟳</span>}</div>);const o=b.order;const color=GANTT_SKUS[o.sku]||T.neutral;return(<div key={bi} title={`${o.id} · ${o.sku} · ${o.units.toLocaleString()} units${o.riskReason?"\n"+o.riskReason:""}`} style={{position:"absolute",left:`${left}%`,width:`${width}%`,top:3,bottom:3,background:color,borderRadius:3,opacity:0.88,zIndex:2,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}><span style={{fontSize:9,color:T.white,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",padding:"0 3px"}}>{o.sku}</span></div>);})}
    </div></div>);})}
    <div style={{display:"flex",gap:12,marginLeft:80,marginTop:8,flexWrap:"wrap"}}>{Object.entries(GANTT_SKUS).map(([sku,color])=>(<div key={sku} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.gray900}}><span style={{width:12,height:12,borderRadius:2,background:color,display:"inline-block"}}/>{sku}</div>))}<div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.gray900}}><span style={{width:12,height:12,borderRadius:2,background:"#cbd5e1",display:"inline-block"}}/>Changeover</div><div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.gray900}}><span style={{width:12,height:12,borderRadius:2,background:"#ef444430",border:`1px dashed ${T.negative}`,display:"inline-block"}}/>Maintenance Window</div></div>
  </div></div>);
}

function ProductionScheduleView({onViewDashboardRec}){
  const [filterLine,setFilterLine]=useState("All");const [expandedOrch,setExpandedOrch]=useState(null);const [expandedSched,setExpandedSched]=useState(null);const [appliedRecs,setAppliedRecs]=useState([]);const [orders,setOrders]=useState(INIT_ORDERS);
  const filteredOrders=filterLine==="All"?orders:orders.filter(o=>o.line===filterLine);
  const applyRec=(id)=>{setAppliedRecs(prev=>[...prev,id]);setExpandedSched(null);if(id==="sa1"){setOrders(prev=>prev.map(o=>{if(o.id==="RUN-1023")return{...o,start:"Mar 1 13:00",end:"Mar 1 18:00",desc:"Crimped Seal Chips (resequenced)"};if(o.id==="RUN-1025")return{...o,start:"Mar 1 06:00",end:"Mar 1 12:00",desc:"BBQ Chips (resequenced)"};return o;}));}if(id==="sa2"){setOrders(prev=>[...prev,{id:"RUN-1033",line:"Line 2",sku:"SKU 2204",desc:"Buffer Run (added)",units:1800,target:1800,start:"Mar 3 13:00",end:"Mar 3 15:30",dueDate:"Mar 10",dc:"DC-East Buffer"}]);}if(id==="sa3"){setOrders(prev=>prev.map(o=>{if(o.id==="RUN-1032")return{...o,start:"Mar 3 06:00",end:"Mar 3 14:00",desc:"BBQ Chips (regrouped)"};return o;}));}};
  return(<div>
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
      <div><div style={{fontSize:18,fontWeight:800,color:T.black}}>Production Schedule</div><div style={{fontSize:12,color:T.gray900,marginTop:2}}>Feb 28 – Mar 3, 2026 · Austin Plant</div></div>
      <div style={{display:"flex",gap:6}}>{["All","Line 1","Line 2","Line 3"].map(l=>(<button key={l} onClick={()=>setFilterLine(l)} style={{padding:"6px 14px",borderRadius:4,fontSize:12,fontWeight:700,cursor:"pointer",border:`1px solid ${filterLine===l?T.primary:T.border}`,background:filterLine===l?T.primary:T.white,color:filterLine===l?T.white:T.gray900}}>{l}</button>))}</div>
    </div>
    <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16,background:T.gray100}}>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{[{label:"Total Units Today",value:"18,400",sub:"vs 21,000 target",good:false},{label:"Total Units This Week",value:"85,400",sub:"vs 105,000 target",good:false},{label:"Total Changeover Today",value:"3 hrs 20 min",sub:"across all lines",good:null},{label:"Overall Schedule Adherence",value:"82%",sub:"vs 95% target",good:false},{label:"Overall OTIF",value:"87%",sub:"vs 95% target",good:false}].map(k=>(<div key={k.label} style={{flex:1,minWidth:130,background:T.white,borderRadius:4,borderLeft:`4px solid ${k.good===true?T.positive:k.good===false?T.negative:T.warning}`,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",padding:"10px 14px"}}><div style={{fontSize:10,color:T.gray900,fontWeight:600,marginBottom:4}}>{k.label}</div><div style={{fontSize:18,fontWeight:800,color:k.good===true?T.positive:k.good===false?T.negative:T.warning}}>{k.value}</div><div style={{fontSize:10,color:T.gray400,marginTop:2}}>{k.sub}</div></div>))}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}><div style={{fontSize:12,fontWeight:800,color:T.black}}>🌐 From Plant Orchestration Agent</div>{orchSchedulingRecs.map(r=>(<div key={r.id} style={{background:T.white,borderRadius:4,borderLeft:`4px solid ${PriorityColor(r.priority)}`,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",overflow:"hidden"}}><div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap",cursor:"pointer"}} onClick={()=>setExpandedOrch(expandedOrch===r.id?null:r.id)}><div style={{display:"flex",gap:8,alignItems:"center",flex:1,flexWrap:"wrap"}}><Badge label={r.priority} color={PriorityColor(r.priority)}/><Badge label="🌐 Orchestration" color={T.info}/><Badge label={r.status} color={r.status==="Action Required"?T.negative:T.warning}/><span style={{fontSize:13,fontWeight:700,color:T.black}}>{r.title}</span></div><span style={{fontSize:11,color:T.gray400}}>{expandedOrch===r.id?"▲":"▼"}</span></div>{expandedOrch===r.id&&<div style={{padding:"12px 16px 14px",borderTop:`1px solid ${T.border}`}}><div style={{fontSize:12,color:T.black,lineHeight:1.6,marginBottom:10}}>{r.detail}</div><button onClick={()=>onViewDashboardRec(r.id)} style={{background:T.info,color:T.white,border:"none",borderRadius:4,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>View in Dashboard →</button></div>}</div>))}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}><div style={{fontSize:12,fontWeight:800,color:T.black}}>🗓 Scheduling Agent — Optimisation Opportunities</div>{schedAgentRecs.map(r=>(<div key={r.id} style={{background:T.white,borderRadius:4,borderLeft:`4px solid ${PriorityColor(r.priority)}`,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",overflow:"hidden",opacity:appliedRecs.includes(r.id)?0.6:1}}><div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap",cursor:"pointer"}} onClick={()=>!appliedRecs.includes(r.id)&&setExpandedSched(expandedSched===r.id?null:r.id)}><div style={{display:"flex",gap:8,alignItems:"center",flex:1,flexWrap:"wrap"}}><Badge label={r.priority} color={PriorityColor(r.priority)}/><Badge label="🗓 Scheduling Agent" color={T.primary}/><Badge label={r.impact} color={T.positive}/>{appliedRecs.includes(r.id)&&<Badge label="✓ Applied" color={T.positive}/>}<span style={{fontSize:13,fontWeight:700,color:T.black}}>{r.title}</span></div>{!appliedRecs.includes(r.id)&&<span style={{fontSize:11,color:T.gray400}}>{expandedSched===r.id?"▲":"▼"}</span>}</div>{expandedSched===r.id&&!appliedRecs.includes(r.id)&&<div style={{padding:"12px 16px 14px",borderTop:`1px solid ${T.border}`}}><div style={{fontSize:12,color:T.black,lineHeight:1.6,marginBottom:6}}>{r.detail}</div><div style={{background:T.primary+"10",borderLeft:`3px solid ${T.primary}`,borderRadius:4,padding:"8px 12px",marginBottom:10}}><div style={{fontSize:11,fontWeight:700,color:T.primary,marginBottom:2}}>RECOMMENDED ACTION</div><div style={{fontSize:12,color:T.black}}>{r.action}</div></div><div style={{display:"flex",gap:8}}><button onClick={()=>applyRec(r.id)} style={{background:T.primary,color:T.white,border:"none",borderRadius:4,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓ Apply to Schedule</button><button onClick={()=>setExpandedSched(null)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:4,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",color:T.gray900}}>Dismiss</button></div></div>}</div>))}</div>
      {appliedRecs.length>0&&<div style={{background:"#F0FDF4",border:`2px solid ${T.positive}`,borderRadius:4,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:16}}>✅</span><div><div style={{fontSize:13,fontWeight:800,color:T.positive}}>Schedule Updated</div><div style={{fontSize:12,color:T.black,marginTop:2}}>{appliedRecs.length} optimisation{appliedRecs.length>1?"s":""} applied.</div></div></div>}
      <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}><div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:13,fontWeight:800,color:T.black}}>Production Schedule — Gantt View</div></div><div style={{padding:"16px 20px"}}><GanttChart filterLine={filterLine} orders={orders}/></div></div>
      <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}><div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:13,fontWeight:800,color:T.black}}>Production Run Schedule</div><div style={{fontSize:11,color:T.gray900,marginTop:2}}>{filteredOrders.length} runs scheduled</div></div><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{background:T.gray100}}>{["Run","Line","SKU","Description","Units","Target","% vs Target","Start","End","DC","Notes"].map(h=>(<th key={h} style={{padding:"9px 14px",textAlign:"left",fontWeight:700,color:T.gray900,fontSize:11,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{filteredOrders.map((o,i)=>{const pct=o.target?Math.round(o.units/o.target*100):100;const volColor=pct>=100?T.positive:pct>=85?T.warning:T.negative;return(<tr key={o.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?T.white:T.gray100+"88"}}><td style={{padding:"9px 14px",fontWeight:700,color:T.black}}>{o.id}</td><td style={{padding:"9px 14px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:"50%",background:LINE_COLORS_PERF[o.line],display:"inline-block"}}/>{o.line}</div></td><td style={{padding:"9px 14px"}}><span style={{background:(GANTT_SKUS[o.sku]||T.neutral)+"20",color:GANTT_SKUS[o.sku]||T.neutral,border:`1px solid ${(GANTT_SKUS[o.sku]||T.neutral)}40`,borderRadius:3,padding:"2px 7px",fontSize:11,fontWeight:700}}>{o.sku}</span></td><td style={{padding:"9px 14px",color:T.gray900}}>{o.desc}</td><td style={{padding:"9px 14px",fontWeight:700,color:T.black}}>{o.units.toLocaleString()}</td><td style={{padding:"9px 14px",color:T.gray400}}>{o.target?o.target.toLocaleString():"-"}</td><td style={{padding:"9px 14px",fontWeight:700,color:volColor}}>{pct}%</td><td style={{padding:"9px 14px",color:T.gray900,whiteSpace:"nowrap"}}>{o.start}</td><td style={{padding:"9px 14px",color:T.gray900,whiteSpace:"nowrap"}}>{o.end}</td><td style={{padding:"9px 14px",color:T.gray900}}>{o.dc||"-"}</td><td style={{padding:"9px 14px"}}>{o.riskReason&&<div style={{fontSize:10,color:T.negative}}>⚠ {o.riskReason}</div>}</td></tr>);})}</tbody></table></div></div>
    </div>
  </div>);
}

// ── SCENARIO SIMULATION CHAT ──────────────────────────────────────────────────
function parseRec(text){
  if(!text.includes("---RECOMMENDATION---"))return null;
  try{const block=text.split("---RECOMMENDATION---")[1].split("---END---")[0];const get=key=>{const m=block.match(new RegExp(`${key}:\\s*(.+)`));return m?m[1].trim():"";};const ls=get("LINES").split(",").map(l=>l.trim()).filter(Boolean);if(!ls.includes("All"))ls.push("All");const domain=get("DOMAIN")||"Production";const agents=get("AGENTS").split(",").map(a=>a.trim()).filter(a=>VALID_AGENTS.includes(a));let steps=[];if(text.includes("---STEPS---")){try{const stepsRaw=text.split("---STEPS---")[1].split("---ENDSTEPS---")[0].trim();const parsed=JSON.parse(stepsRaw);steps=parsed.map(s=>({agent:VALID_AGENTS.includes(s.agent)?s.agent:(agents[0]||"Supervisor & Operator Co-Pilot"),domain:s.domain||domain,action:s.action||"Review and execute recommended action.",status:"pending"}));}catch(e){steps=[];}}if(steps.length===0&&agents.length>0){steps=agents.map(agent=>({agent,domain,action:`Review recommendation and execute assigned action within ${domain} domain.`,status:"pending"}));}let approvers=[];if(text.includes("---APPROVERS---")){try{const appRaw=text.split("---APPROVERS---")[1].split("---ENDAPPROVERS---")[0].trim();const parsed=JSON.parse(appRaw);approvers=parsed.map(a=>VALID_APPROVERS[a.role]).filter(Boolean);}catch(e){approvers=[];}}if(approvers.length===0){const defaultRoles={Safety:["Plant Leader","Production Supervisor"],Quality:["Plant Leader","Quality Manager"],Production:["Plant Leader","Production Supervisor"],Maintenance:["Plant Leader","Maintenance Manager"],Planning:["Plant Leader","Scheduler"]};approvers=(defaultRoles[domain]||["Plant Leader"]).map(r=>VALID_APPROVERS[r]).filter(Boolean);}return{id:Date.now(),fromChat:true,title:get("TITLE"),priority:get("PRIORITY"),domain,icon:DOMAIN_ICONS[domain]||"🧠",lines:ls,agents,suggestedAction:get("ACTION"),summary:get("SUMMARY"),detail:{issue:get("SUMMARY"),action:get("ACTION"),steps,approvers}};}catch{return null;}}
const stripRec=text=>text.replace(/---RECOMMENDATION---[\s\S]*?---END---/,"").replace(/---STEPS---[\s\S]*?---ENDSTEPS---/,"").replace(/---APPROVERS---[\s\S]*?---ENDAPPROVERS---/,"").trim();

const SCENARIO_SUGGESTIONS=["The Line 3 heat sealer has just failed completely and cannot be repaired until tomorrow morning. SKU 3801 requires the sealer. We have SKU 2204 which uses a crimped seal. What do I do with Line 3 for the rest of the day?","If I take Line 3 offline today, what's the impact on Friday's orders?","How should I prioritize the afternoon shift labor shortage?","What's the fastest path to resolving the sealer issue?"];
const SCENARIO_LABELS=["🔧 Line 3 sealer failed — swap to SKU 2204?","📋 Take Line 3 offline — Friday order impact?","👷 How to handle afternoon labor shortage?","⚡ Fastest path to fix the sealer?"];

function ScenarioChat({recs,onAddRec}){
  const [msgs,setMsgs]=useState([{role:"assistant",content:"👋 I'm the Plant Orchestration Agent. I have full visibility across all domains.\n\nAsk me anything — scenario simulations, trade-off analysis, or what to prioritize. When I reach a clear recommendation, I'll ask if you want to add it to the dashboard."}]);
  const [input,setInput]=useState("");const [loading,setLoading]=useState(false);const [pendingRec,setPendingRec]=useState(null);
  const bottomRef=useRef();
  useEffect(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),[msgs]);
  const send=async(text)=>{
    const q=(text||input).trim();if(!q||loading)return;
    const userMsg={role:"user",content:q};setMsgs(prev=>[...prev,userMsg]);setInput("");setLoading(true);setPendingRec(null);
    try{
      const history=[...msgs.slice(1),userMsg].map(m=>({role:m.role,content:m.content}));
      const sys=SCENARIO_SYSTEM_PROMPT+`\nACTIVE RECOMMENDATIONS: ${JSON.stringify(recs.map(r=>({id:r.id,title:r.title,priority:r.priority})))}`;
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,system:sys,messages:history})});
      const data=await res.json();const raw=data.content?.[0]?.text||"No response.";const rec=parseRec(raw);
      setMsgs(prev=>[...prev,{role:"assistant",content:stripRec(raw)}]);if(rec)setPendingRec(rec);
    }catch{setMsgs(prev=>[...prev,{role:"assistant",content:"⚠️ Connection error. Please try again."}]);}
    setLoading(false);
  };
  const confirmAdd=()=>{if(pendingRec){onAddRec(pendingRec);setPendingRec(null);setMsgs(prev=>[...prev,{role:"assistant",content:"✅ Recommendation added to the dashboard."}]);}};
  return(<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"16px 24px"}}><div style={{fontSize:18,fontWeight:800,color:T.black}}>Scenario Simulation</div><div style={{fontSize:12,color:T.gray900,marginTop:2}}>Ask the Plant Orchestration Agent to model any scenario or trade-off</div></div>
    <div style={{flex:1,padding:"20px 24px",display:"flex",flexDirection:"column",gap:16,background:T.gray100,overflow:"hidden"}}>
      {msgs.length<=1&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{SCENARIO_LABELS.map((label,i)=><button key={i} onClick={()=>send(SCENARIO_SUGGESTIONS[i])} style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:4,padding:"7px 12px",fontSize:11,color:T.gray900,cursor:"pointer",fontWeight:600}}>{label}</button>)}</div>}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12}}>
        {msgs.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
          {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:"50%",background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.white,fontWeight:800,flexShrink:0,marginRight:8,marginTop:2}}>POA</div>}
          <div style={{maxWidth:"75%",padding:"11px 15px",borderRadius:4,fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap",background:m.role==="user"?T.primary:T.white,color:m.role==="user"?T.white:T.black,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",borderLeft:m.role==="assistant"?`3px solid ${T.primary}`:"none"}}>{m.content}</div>
        </div>))}
        {loading&&<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.white,fontWeight:800,flexShrink:0}}>POA</div><div style={{background:T.white,borderRadius:4,padding:"11px 15px",fontSize:13,color:T.gray900,borderLeft:`3px solid ${T.primary}`,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>Modelling scenario across all domains...</div></div>}
        {pendingRec&&!loading&&<div style={{background:T.white,border:`2px solid ${T.info}`,borderRadius:4,padding:"14px 16px"}}>
          <div style={{fontSize:12,fontWeight:800,color:T.info,marginBottom:8}}>✦ Recommendation Ready — Add to Dashboard?</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}><Badge label={pendingRec.priority} color={PriorityColor(pendingRec.priority)}/><Badge label={pendingRec.domain} color={T.primary}/></div>
          <div style={{fontSize:13,fontWeight:800,color:T.black,marginBottom:4}}>{pendingRec.icon} {pendingRec.title}</div>
          <div style={{fontSize:12,color:T.gray900,marginBottom:10}}>{pendingRec.summary}</div>
          <div style={{display:"flex",gap:8}}><button onClick={confirmAdd} style={{background:T.primary,color:T.white,border:"none",borderRadius:4,padding:"8px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}}>✦ Add to Dashboard</button><button onClick={()=>setPendingRec(null)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:4,padding:"8px 18px",fontSize:13,fontWeight:600,cursor:"pointer",color:T.gray900}}>Dismiss</button></div>
        </div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{display:"flex",gap:8,background:T.white,border:`1px solid ${T.border}`,borderRadius:4,padding:"8px 12px"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Describe a scenario or ask a what-if question..." style={{flex:1,border:"none",outline:"none",fontSize:13,color:T.black,background:"transparent"}}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?T.gray400:T.primary,color:T.white,border:"none",borderRadius:4,padding:"7px 16px",fontWeight:700,cursor:loading||!input.trim()?"not-allowed":"pointer",fontSize:13}}>Send</button>
      </div>
    </div>
  </div>);
}

// ── CO-PILOT CHAT ─────────────────────────────────────────────────────────────
function CoPilotChat({activeTab}){
  const contextLabel = activeTab==="maintenance"?"🔧 Technician Co-Pilot":activeTab==="lineperf"||activeTab==="dashboard"?"👷 Supervisor Co-Pilot":"🤖 Co-Pilot";
  const introMsg = activeTab==="maintenance"
    ? "👋 I'm your Technician Co-Pilot. I can walk you through SOPs, help with LOTO procedures, look up fault codes, give you tools and parts lists for your work orders, and troubleshoot equipment issues.\n\nTell me what you're working on and I'll help you get it done safely."
    : "👋 I'm your Co-Pilot. Tell me what you're working on and I'll help.";
  const [msgs,setMsgs]=useState([{role:"assistant",content:introMsg}]);
  const [input,setInput]=useState("");const [loading,setLoading]=useState(false);
  const bottomRef=useRef();
  useEffect(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),[msgs]);
  const send=async(text)=>{
    const q=(text||input).trim();if(!q||loading)return;
    const userMsg={role:"user",content:q};setMsgs(prev=>[...prev,userMsg]);setInput("");setLoading(true);
    try{
      const history=[...msgs.slice(1),userMsg].map(m=>({role:m.role,content:m.content}));
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:COPILOT_SYSTEM_PROMPT,messages:history})});
      const data=await res.json();const raw=data.content?.[0]?.text||"No response.";
      setMsgs(prev=>[...prev,{role:"assistant",content:raw}]);
    }catch{setMsgs(prev=>[...prev,{role:"assistant",content:"⚠️ Connection error. Please try again."}]);}
    setLoading(false);
  };
  return(<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"16px 24px"}}><div style={{fontSize:18,fontWeight:800,color:T.black}}>{contextLabel}</div><div style={{fontSize:12,color:T.gray900,marginTop:2}}>SOP guidance · LOTO procedures · Fault code lookup · Work order help · Parts lists</div></div>
    <div style={{flex:1,padding:"20px 24px",display:"flex",flexDirection:"column",gap:16,background:T.gray100,overflow:"hidden"}}>
      {msgs.length<=1&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{COPILOT_SUGGESTION_LABELS.map((label,i)=><button key={i} onClick={()=>send(COPILOT_SUGGESTIONS[i])} style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:4,padding:"7px 12px",fontSize:11,color:T.gray900,cursor:"pointer",fontWeight:600}}>{label}</button>)}</div>}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12}}>
        {msgs.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
          {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:"50%",background:"#673AB7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.white,fontWeight:800,flexShrink:0,marginRight:8,marginTop:2}}>CP</div>}
          <div style={{maxWidth:"75%",padding:"11px 15px",borderRadius:4,fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap",background:m.role==="user"?"#673AB7":T.white,color:m.role==="user"?T.white:T.black,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",borderLeft:m.role==="assistant"?"3px solid #673AB7":"none"}}>{m.content}</div>
        </div>))}
        {loading&&<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:"#673AB7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.white,fontWeight:800,flexShrink:0}}>CP</div><div style={{background:T.white,borderRadius:4,padding:"11px 15px",fontSize:13,color:T.gray900,borderLeft:"3px solid #673AB7",boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>Looking up guidance...</div></div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{display:"flex",gap:8,background:T.white,border:`1px solid ${T.border}`,borderRadius:4,padding:"8px 12px"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask for guidance, SOP help, or troubleshooting..." style={{flex:1,border:"none",outline:"none",fontSize:13,color:T.black,background:"transparent"}}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?T.gray400:"#673AB7",color:T.white,border:"none",borderRadius:4,padding:"7px 16px",fontWeight:700,cursor:loading||!input.trim()?"not-allowed":"pointer",fontSize:13}}>Send</button>
      </div>
    </div>
  </div>);
}

// ── DISRUPTION MODAL ──────────────────────────────────────────────────────────
const DISRUPTION_RECS={A:{title:"SKU 4412 → SKU 3802 Swap Executed — Line 1",priority:"High",domain:"Production",icon:"⚙️",lines:["All","Line 1"],agents:["Scheduling Agent","Inbound Materials Agent","Quality Monitoring Agent","Supervisor & Operator Co-Pilot"],suggestedAction:"Monitor Line 1 changeover to SKU 3802, confirm quality checks pass.",summary:"Line 1 switched from SKU 4412 to SKU 3802 following inbound materials failure. 35-min changeover underway.",detail:{issue:"Inbound seasoning blend Lot #SB-2291 for SKU 4412 was rejected at intake — sodium content 14% above spec.",action:"Monitor changeover progress, confirm quality sign-off on SKU 3802 first run.",steps:[{agent:"Inbound Materials Agent",domain:"Quality",action:"Quarantine Lot #SB-2291 and raise supplier deviation report.",status:"complete"},{agent:"Scheduling Agent",domain:"Planning",action:"Update Line 1 production schedule — replace SKU 4412 run with SKU 3802.",status:"complete"},{agent:"Quality Monitoring Agent",domain:"Quality",action:"Monitor first-pass yield on SKU 3802 run.",status:"pending"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Guide Line 1 operator through SKU 3802 changeover SOP.",status:"pending"}],approvers:[{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},{name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"}]}},B:{title:"Emergency SKU 4412 Batch Sourcing — Line 1 On Hold",priority:"Critical",domain:"Production",icon:"📦",lines:["All","Line 1"],agents:["Inbound Materials Agent","Planning Agent","Scheduling Agent"],suggestedAction:"Track emergency batch delivery ETA, hold Line 1.",summary:"Emergency replacement batch ordered. Line 1 on hold pending delivery.",detail:{issue:"SKU 4412 inbound materials rejected. Emergency batch ordered — 60% confidence on timing.",action:"Monitor delivery ETA. If batch arrives by 11am, proceed. If delayed, activate SKU 3802 contingency.",steps:[{agent:"Inbound Materials Agent",domain:"Quality",action:"Raise emergency PO with approved seasoning supplier.",status:"complete"},{agent:"Planning Agent",domain:"Planning",action:"Place Line 1 on hold. Prepare SKU 3802 contingency.",status:"pending"}],approvers:[{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},{name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"}]}},C:{title:"Line 1 Held — SKU 4412 Rescheduled to Tomorrow",priority:"High",domain:"Planning",icon:"📋",lines:["All","Line 1"],agents:["Planning Agent","Scheduling Agent"],suggestedAction:"Confirm Line 1 hold and reschedule SKU 4412 to tomorrow.",summary:"Line 1 Day shift held. SKU 4412 rescheduled to tomorrow pending fresh batch.",detail:{issue:"SKU 4412 cannot run today. Full Day shift volume on Line 1 lost.",action:"Reschedule SKU 4412 to tomorrow's Day shift. Notify DC-West.",steps:[{agent:"Scheduling Agent",domain:"Planning",action:"Reschedule SKU 4412 Line 1 run to tomorrow Day shift.",status:"complete"},{agent:"Planning Agent",domain:"Planning",action:"Notify DC-West of one-day delay.",status:"pending"}],approvers:[{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},{name:"Priya Nair",role:"Scheduler",avatar:"SC"}]}}};

function DisruptionModal({onClose,onAddRec}){
  const [selected,setSelected]=useState(null);const [dispatched,setDispatched]=useState(false);const [dispatching,setDispatching]=useState(false);
  const dispatch=()=>{if(!selected)return;setDispatching(true);setTimeout(()=>{setDispatching(false);setDispatched(true);const recTemplate=DISRUPTION_RECS[selected];if(recTemplate&&onAddRec){onAddRec({...recTemplate,id:Date.now(),fromDisruption:true});}},1800);};
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{background:T.white,borderRadius:6,width:"100%",maxWidth:680,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
      <div style={{background:T.negative,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:11,fontWeight:700,color:"#ffffff99",marginBottom:2}}>🚨 REAL-TIME DISRUPTION · {disruptionAlert.time}</div><div style={{fontSize:15,fontWeight:800,color:T.white}}>{disruptionAlert.title}</div></div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:4,padding:"6px 12px",color:T.white,cursor:"pointer",fontWeight:700,fontSize:12}}>✕ Close</button>
      </div>
      <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:16}}>
        {dispatched&&<div style={{background:"#F0FDF4",border:`2px solid ${T.positive}`,borderRadius:4,padding:"12px 16px"}}><div style={{fontSize:13,fontWeight:800,color:T.positive}}>✅ Response Dispatched</div><div style={{fontSize:12,color:T.black,marginTop:3}}>{disruptionAlert.notifyList.join(", ")} notified. Recommendation added to dashboard.</div></div>}
        <div style={{fontSize:12,color:T.black,lineHeight:1.6}}>{disruptionAlert.description}</div>
        <div style={{background:"#FEF2F2",borderRadius:4,padding:"12px 16px",borderLeft:`3px solid ${T.negative}`}}><div style={{fontSize:11,fontWeight:700,color:T.negative,marginBottom:6}}>IMMEDIATE IMPACTS</div>{disruptionAlert.impacts.map((imp,i)=><div key={i} style={{fontSize:12,color:T.black,marginBottom:3}}>• {imp}</div>)}</div>
        <div><div style={{fontSize:13,fontWeight:800,color:T.black,marginBottom:10}}>Select Response Option</div><div style={{display:"flex",flexDirection:"column",gap:8}}>{disruptionAlert.options.map(opt=>(<div key={opt.id} onClick={()=>!dispatched&&setSelected(opt.id)} style={{padding:"12px 16px",borderRadius:4,border:`2px solid ${selected===opt.id?T.primary:T.border}`,background:selected===opt.id?T.primary+"08":T.white,cursor:dispatched?"default":"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,gap:8,flexWrap:"wrap"}}><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:13,fontWeight:800,color:T.black}}>Option {opt.id}: {opt.label}</span>{opt.recommended&&<Badge label="✓ Recommended" color={T.positive}/>}</div><Badge label={`Impact: ${opt.impact}`} color={opt.impact==="Low"?T.positive:opt.impact==="Medium"?T.warning:T.negative}/></div>
          <div style={{fontSize:12,color:T.gray900}}>{opt.description}</div>
        </div>))}</div></div>
        <div style={{background:T.gray100,borderRadius:4,padding:"10px 14px"}}><div style={{fontSize:11,fontWeight:700,color:T.gray900,marginBottom:4}}>WILL NOTIFY</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{disruptionAlert.notifyList.map(n=><Badge key={n} label={n} color={T.primary}/>)}</div></div>
        <button onClick={dispatch} disabled={!selected||dispatched||dispatching} style={{width:"100%",padding:"12px",background:selected&&!dispatched?T.negative:T.gray400,color:T.white,border:"none",borderRadius:4,fontSize:14,fontWeight:800,cursor:selected&&!dispatched?"pointer":"not-allowed"}}>{dispatching?"⏳ Dispatching response...":dispatched?"✅ Response Dispatched":selected?`🚨 Execute Option ${selected} & Notify Team`:"Select a response option above"}</button>
      </div>
    </div>
  </div>);
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("dashboard");
  const [selectedRec,setSelectedRec]=useState(null);
  const [showDisruption,setShowDisruption]=useState(false);
  const [disruptionActive,setDisruptionActive]=useState(true);
  const [recs,setRecs]=useState(initialRecommendations);
  const [persona,setPersona]=useState("plant_leader");
  const [personaOpen,setPersonaOpen]=useState(false);
  const [chatMode,setChatMode]=useState(null); // null | 'scenario' | 'copilot'
  const personaRef=useRef(null);
  useEffect(()=>{const h=(e)=>{if(personaRef.current&&!personaRef.current.contains(e.target))setPersonaOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const addRec=rec=>setRecs(prev=>[rec,...prev]);
  const handleViewDashboardRec=(recId)=>{const rec=[...recs,...initialRecommendations].find(r=>r.id===recId);if(rec){setSelectedRec(rec);setTab("dashboard");setChatMode(null);}};

  const personas=[{id:"plant_leader",label:"Plant Leader",avatar:"PL"},{id:"maint_manager",label:"Maintenance Manager",avatar:"MM"},{id:"scheduler",label:"Scheduler",avatar:"SC"},{id:"quality_manager",label:"Quality Manager",avatar:"QM"},{id:"safety_lead",label:"Safety Lead",avatar:"SL"}];
  const personaNav={plant_leader:["dashboard","actions","lineperf","quality","maintenance","assethealth","materials","schedule","labor","safety"],maint_manager:["dashboard","actions","lineperf","maintenance","assethealth","schedule"],scheduler:["dashboard","actions","schedule","materials","labor","lineperf"],quality_manager:["dashboard","actions","quality","materials","lineperf"],safety_lead:["dashboard","actions","safety","lineperf"]};
  const allNavItems=[{id:"dashboard",icon:"▦",label:"Summary Dashboard"},{id:"actions",icon:"☑",label:"Action Log"},{id:"lineperf",icon:"↗",label:"Line Performance"},{id:"quality",icon:"◎",label:"Quality Dashboard"},{id:"maintenance",icon:"⚙",label:"Maintenance Dashboard"},{id:"assethealth",icon:"♡",label:"Asset Health"},{id:"materials",icon:"▤",label:"Inbound Materials"},{id:"schedule",icon:"▦",label:"Production Schedule"},{id:"labor",icon:"♟",label:"Labor Scheduling"},{id:"safety",icon:"◬",label:"Safety & EHS"}];
  const activeNavIds=personaNav[persona]||personaNav.plant_leader;
  const builtTabs=["dashboard","actions","lineperf","schedule","maintenance"];

  const handleTabClick=(id)=>{setTab(id);setSelectedRec(null);setChatMode(null);};

  return(<div style={{background:T.gray100,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
    {/* Top bar */}
    <div style={{background:T.primary,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:48,flexShrink:0,gap:8}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{color:T.white,fontWeight:800,fontSize:15}}>🏭 Plant Orchestration Agent</span><span style={{color:"#ffffff60",fontSize:12}}>Austin Plant · Snack Chips</span></div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {recs.some(r=>r.fromChat)&&<span style={{background:T.info,borderRadius:4,padding:"3px 10px",fontSize:11,color:T.white,fontWeight:700}}>✦ {recs.filter(r=>r.fromChat).length} new from chat</span>}
        {disruptionActive&&<button onClick={()=>setShowDisruption(true)} style={{background:T.negative,border:"none",borderRadius:4,padding:"5px 12px",color:T.white,fontWeight:700,fontSize:11,cursor:"pointer"}}>🚨 Live Disruption</button>}

        {/* Scenario Simulation button */}
        <button onClick={()=>{setChatMode(chatMode==="scenario"?null:"scenario");setSelectedRec(null);}}
          style={{background:chatMode==="scenario"?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:4,padding:"6px 14px",color:T.white,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
          💬 Scenario Simulation
        </button>

        {/* Co-Pilot button */}
        <button onClick={()=>{setChatMode(chatMode==="copilot"?null:"copilot");setSelectedRec(null);}}
          style={{background:chatMode==="copilot"?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.12)",border:`1px solid ${chatMode==="copilot"?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.3)"}`,borderRadius:4,padding:"6px 14px",color:T.white,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
          🤖 Co-Pilot
        </button>

        {/* Persona switcher */}
        <div ref={personaRef} style={{position:"relative"}}>
          <button onClick={()=>setPersonaOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:4,padding:"5px 10px",cursor:"pointer",color:T.white}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800}}>{personas.find(p=>p.id===persona)?.avatar}</div>
            <span style={{fontSize:12,fontWeight:700}}>{personas.find(p=>p.id===persona)?.label}</span>
            <span style={{fontSize:9}}>▼</span>
          </button>
          {personaOpen&&<div style={{position:"absolute",right:0,top:"110%",background:T.white,border:`1px solid ${T.border}`,borderRadius:4,boxShadow:"0 4px 16px rgba(0,0,0,0.15)",zIndex:200,minWidth:200,overflow:"hidden"}}>
            <div style={{padding:"8px 14px 6px",fontSize:10,fontWeight:800,color:T.gray400,textTransform:"uppercase",letterSpacing:"0.06em"}}>Switch Persona</div>
            {personas.map(p=>(<button key={p.id} onClick={()=>{setPersona(p.id);setPersonaOpen(false);setTab("dashboard");setSelectedRec(null);setChatMode(null);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 14px",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,background:persona===p.id?T.primary+"10":"transparent",fontWeight:persona===p.id?800:400,color:persona===p.id?T.primary:T.black}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:persona===p.id?T.primary:T.gray100,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:persona===p.id?T.white:T.gray900,flexShrink:0}}>{p.avatar}</div>
              <span>{p.label}</span>
              {persona===p.id&&<span style={{marginLeft:"auto",fontSize:11,color:T.primary}}>✓</span>}
            </button>))}
          </div>}
        </div>
      </div>
    </div>

    {/* Body */}
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      {/* Left nav */}
      <div style={{width:52,background:T.white,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:8,flexShrink:0}}>
        {allNavItems.map(item=>{const isActive=tab===item.id&&!chatMode;const isEnabled=activeNavIds.includes(item.id);return(<div key={item.id} style={{position:"relative",width:"100%"}} title={`${item.label}${!isEnabled?" (not available for your role)":""}`}>
          <button onClick={()=>{if(isEnabled)handleTabClick(item.id);}} style={{width:"100%",height:44,border:"none",cursor:isEnabled?"pointer":"default",background:isActive?T.primary+"18":"transparent",borderLeft:isActive?`3px solid ${T.primary}`:"3px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:600,color:isActive?T.primary:isEnabled?T.gray900:T.gray400,opacity:isEnabled?1:0.3}}>
            {item.icon}
            {item.id==="actions"&&isEnabled&&actionLog.filter(a=>a.status==="Open"||a.status==="In Progress").length>0&&<span style={{position:"absolute",top:6,right:6,width:7,height:7,borderRadius:"50%",background:T.negative,display:"block"}}/>}
          </button>
        </div>);})}
        <div style={{marginTop:"auto",paddingBottom:12,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
          <div style={{width:24,height:1,background:T.border,marginBottom:4}}/>
          {[{c:T.warning,l:"L1"},{c:T.positive,l:"L2"},{c:T.negative,l:"L3"}].map(l=>(<div key={l.l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{width:7,height:7,borderRadius:"50%",background:l.c,display:"inline-block"}}/><span style={{fontSize:8,color:T.gray400,fontWeight:700}}>{l.l}</span></div>))}
        </div>
      </div>

      {/* Main content */}
      <div style={{flex:1,overflowY:"auto"}}>
        {/* Chat modes */}
        {chatMode==="scenario"&&<ScenarioChat recs={recs} onAddRec={addRec}/>}
        {chatMode==="copilot"&&<CoPilotChat activeTab={tab}/>}

        {/* Tab content (only when chat not open) */}
        {!chatMode&&(<>
          {tab==="dashboard"&&!selectedRec&&<Dashboard recs={recs} onSelectRec={r=>setSelectedRec(r)} onShowDisruption={()=>setShowDisruption(true)} disruptionActive={disruptionActive} persona={persona}/>}
          {tab==="dashboard"&&selectedRec&&<DetailPage rec={selectedRec} onBack={()=>setSelectedRec(null)}/>}
          {tab==="actions"&&<ActionLog/>}
          {tab==="lineperf"&&<LinePerformanceView/>}
          {tab==="schedule"&&<ProductionScheduleView onViewDashboardRec={handleViewDashboardRec}/>}
          {tab==="maintenance"&&!selectedRec&&<MaintenanceDashboard onSelectRec={r=>setSelectedRec(r)}/>}
          {tab==="maintenance"&&selectedRec&&<DetailPage rec={selectedRec} onBack={()=>setSelectedRec(null)}/>}
          {!builtTabs.includes(tab)&&(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60vh",gap:12}}>
            <div style={{fontSize:40}}>{allNavItems.find(n=>n.id===tab)?.icon}</div>
            <div style={{fontSize:16,fontWeight:800,color:T.black}}>{allNavItems.find(n=>n.id===tab)?.label}</div>
            <div style={{fontSize:13,color:T.gray900}}>This view is part of the full vision — coming in a future build.</div>
            <div style={{background:T.primary+"12",border:`1px solid ${T.primary}30`,borderRadius:4,padding:"10px 20px",fontSize:12,color:T.primary,fontWeight:600}}>💬 Use Scenario Simulation to ask questions about this domain</div>
          </div>)}
        </>)}
      </div>
    </div>

    {showDisruption&&<DisruptionModal onClose={()=>{setShowDisruption(false);setDisruptionActive(false);}} onAddRec={addRec}/>}
  </div>);
}
