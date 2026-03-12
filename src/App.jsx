import { useState, useRef, useEffect } from "react";

const T = {
  primary:"#197A56", positive:"#29BA74", negative:"#D64454", neutral:"#7C7C7C",
  warning:"#F59E0B", info:"#1976D2", black:"#000000", gray900:"#4C4D4D",
  gray400:"#B1B1B7", gray100:"#F3F3F3", white:"#FFFFFF", border:"#E0E0E0",
};

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

const domainRecMap = { Safety:[5], Quality:[], Production:[3,4], Maintenance:[1,2], Planning:[3,4] };

const VALID_AGENTS = [
  "Asset Health Monitoring Agent","Maintenance Planning & Scheduling Agent","Technician Co-Pilot","Maintenance Strategy Agent",
  "Scheduling Agent","Planning Agent","Supervisor & Operator Co-Pilot",
  "Quality Monitoring Agent","Inbound Materials Agent","Final Quality Agent",
  "Setpoint & Recipe Optimization Agent","Root Cause Analysis Agent",
  "Safety Agent","Plant Orchestration Agent",
];

const VALID_APPROVERS = {
  "Plant Leader":          {name:"Sarah Mitchell",  role:"Plant Leader",          avatar:"PL"},
  "Maintenance Manager":   {name:"Carlos Rivera",   role:"Maintenance Manager",   avatar:"MM"},
  "Scheduler":             {name:"Priya Nair",      role:"Scheduler",             avatar:"SC"},
  "Production Supervisor": {name:"Tom Kowalski",    role:"Production Supervisor", avatar:"PS"},
  "Quality Manager":       {name:"Quality Manager", role:"Quality Manager",       avatar:"QM"},
};

const DOMAIN_ICONS = { Safety:"🦺", Quality:"✅", Production:"⚙️", Maintenance:"🔧", Planning:"📋" };

const initialRecommendations = [
  {id:1,lines:["All","Line 3"],priority:"Critical",domain:"Maintenance",icon:"🔧",fromChat:false,title:"Line 3 Sealer — Unplanned Failure Risk Within 48hrs",summary:"Asset Health Monitoring Agent detected vibration index 8.4 (threshold 7.0) and temp variance ±6°C on the Line 3 heat sealer. Unplanned failure likely within 48 hours.",agents:["Asset Health Monitoring Agent","Maintenance Planning & Scheduling Agent","Scheduling Agent"],suggestedAction:"Perform planned maintenance during today's 2–4pm changeover window and expedite spare part procurement.",
    detail:{issue:"Asset Health Monitoring Agent has detected vibration index 8.4 (threshold: 7.0) and temperature variance of ±6°C on the Line 3 heat sealer. Based on historical degradation patterns, unplanned failure is likely within 48 hours.",compounding:"Maintenance Planning & Scheduling Agent confirms the required heating element (Part #SE-441) is out of stock. Emergency procurement from Supplier B can deliver by tomorrow 7am.",risk:"Unplanned failure during production would result in estimated 4–6 hours unplanned downtime, ~8,000 units of lost output, and potential quality escapes on in-process product.",action:"Perform planned maintenance during today's 2:00–4:00pm changeover window. Raise emergency PO for Part #SE-441. Reschedule SKU 3801 to Line 1 Thursday afternoon. Reallocate 1 operator to support.",
    steps:[{agent:"Asset Health Monitoring Agent",domain:"Maintenance",action:"Confirm degradation signal — vibration index 8.4, temp variance ±6°C.",status:"complete"},{agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Check Part #SE-441 inventory — out of stock. Raise emergency PO.",status:"complete"},{agent:"Scheduling Agent",domain:"Planning",action:"Identify 2:00–4:00pm changeover slot on Line 3.",status:"complete"},{agent:"Scheduling Agent",domain:"Planning",action:"Reschedule SKU 3801 from Line 3 to Line 1, Thursday afternoon.",status:"complete"},{agent:"Planning Agent",domain:"Planning",action:"Reallocate 1 operator from Line 2 to Line 1 Thursday afternoon.",status:"pending"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Notify supervisors of maintenance window and schedule change.",status:"pending"},{agent:"Technician Co-Pilot",domain:"Maintenance",action:"Pre-load sealer maintenance SOP for technician.",status:"pending"}],
    approvers:[{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},{name:"Carlos Rivera",role:"Maintenance Manager",avatar:"MM"},{name:"Priya Nair",role:"Scheduler",avatar:"SC"},{name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"}]}},
  {id:2,lines:["All","Line 3"],priority:"Critical",domain:"Maintenance",icon:"🔩",fromChat:false,title:"Spare Part Stock-Out — Sealer Heating Element Unavailable",summary:"Part #SE-441 is out of stock. Standard lead time 3 days. Emergency procurement available for next-morning delivery.",agents:["Maintenance Planning & Scheduling Agent","Technician Co-Pilot"],suggestedAction:"Raise emergency PO to approved supplier for next-day delivery.",
    detail:{issue:"Part #SE-441 has zero inventory. Required for the Line 3 maintenance intervention.",compounding:"Without the part, planned maintenance cannot be completed during today's window.",risk:"If not raised today, earliest arrival is Tuesday — by which time failure is highly likely.",action:"Raise emergency PO to Supplier B ($340/unit). Confirm next-day AM delivery.",
    steps:[{agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Confirm Part #SE-441 stock — zero units on hand.",status:"complete"},{agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Raise emergency PO to Supplier B — next-day AM delivery confirmed.",status:"pending"},{agent:"Technician Co-Pilot",domain:"Maintenance",action:"Flag part dependency in maintenance work order.",status:"pending"}],
    approvers:[{name:"Carlos Rivera",role:"Maintenance Manager",avatar:"MM"},{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"}]}},
  {id:3,lines:["All","Line 3","Line 1"],priority:"High",domain:"Planning",icon:"📋",fromChat:false,title:"Scheduling Conflict — Maintenance Window vs. Friday Customer Order",summary:"Conflict between proposed Line 3 maintenance window and high-priority customer order for SKU 3801 due Friday.",agents:["Scheduling Agent","Planning Agent","Supervisor & Operator Co-Pilot"],suggestedAction:"Shift SKU 3801 run to Line 1 for Thursday afternoon.",
    detail:{issue:"Line 3 maintenance window conflicts with SKU 3801 order — 6,200 units due Friday for customer CO-8820.",compounding:"Line 3 capacity already constrained due to sealer issue.",risk:"Either maintenance is missed or customer order is late.",action:"Move SKU 3801 to Line 1, Thursday 1–5pm slot.",
    steps:[{agent:"Scheduling Agent",domain:"Planning",action:"Model SKU 3801 on Line 1 Thursday — capacity confirmed.",status:"complete"},{agent:"Planning Agent",domain:"Planning",action:"Check labor — 1 additional operator needed.",status:"complete"},{agent:"Planning Agent",domain:"Planning",action:"Reallocate operator from Line 2 to Line 1.",status:"pending"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Notify supervisors of schedule change.",status:"pending"}],
    approvers:[{name:"Priya Nair",role:"Scheduler",avatar:"SC"},{name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"},{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"}]}},
  {id:4,lines:["All","Line 1","Line 3"],priority:"High",domain:"Planning",icon:"👷",fromChat:false,title:"Labor Shortage — Afternoon Shift Short 2 Operators",summary:"Afternoon shift is short 2 operators. Lines 1 and 3 will have coverage gaps unless resolved before 2pm handover.",agents:["Planning Agent","Supervisor & Operator Co-Pilot"],suggestedAction:"Offer voluntary overtime to 3 identified Day shift operators.",
    detail:{issue:"Two afternoon shift operators called out — Lines 1 and 3 under-staffed.",compounding:"Labor shortage coincides with planned maintenance window on Line 3.",risk:"Line 1 changeover may be delayed and Line 3 requires minimum 1 operator during maintenance.",action:"Contact 3 Day shift operators for voluntary overtime. If declined, consolidate Line 3 to single-operator mode.",
    steps:[{agent:"Planning Agent",domain:"Planning",action:"Identify Day shift operators for voluntary overtime — 3 candidates.",status:"complete"},{agent:"Planning Agent",domain:"Planning",action:"Send overtime offer. Response required by 12pm.",status:"pending"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"If declined, activate single-operator protocol on Line 3.",status:"pending"}],
    approvers:[{name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"},{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"}]}},
  {id:5,lines:["All","Line 2"],priority:"Medium",domain:"Safety",icon:"🦺",fromChat:false,title:"Safety Recertification Overdue — 3 Operators on Line 2",summary:"3 Line 2 operators have overdue LOTO recertification. Policy requires completion within 5 working days.",agents:["Safety Agent","Supervisor & Operator Co-Pilot"],suggestedAction:"Schedule 45-minute recertification session during Line 2 downtime window.",
    detail:{issue:"J. Park, D. Williams, M. Santos have not completed annual LOTO recertification.",compounding:"Non-compliance creates audit risk on the best-performing line.",risk:"If not completed by Mar 4, operators removed from LOTO-related tasks.",action:"Schedule recertification session Wednesday 10–11am during Line 2 downtime window.",
    steps:[{agent:"Safety Agent",domain:"Safety",action:"Flag 3 overdue LOTO recertifications. Deadline Mar 4.",status:"complete"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Training slot confirmed — Wed 10–11am.",status:"complete"},{agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Book trainer, notify 3 operators.",status:"pending"}],
    approvers:[{name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},{name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"}]}},
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

const disruptionAlert = {
  id:"RT-001",severity:"Critical",time:"07:43am",
  title:"Inbound Materials Out of Spec — SKU 4412 at Risk",
  description:"Inbound Materials Agent has flagged that the arriving seasoning blend batch (Lot #SB-2291) for SKU 4412 is out of spec. Sodium content is 14% above acceptable range.",
  impacts:["Line 1 Day shift production plan cannot proceed as scheduled","Quality Monitoring Agent will reject batch at intake","SKU 4412 volume of 4,200 units at risk for today","Customer order #CO-8821 (due Thursday) may be impacted"],
  options:[
    {id:"A",label:"Swap to SKU 3802",description:"SKU 3802 materials confirmed in stock. Feasible with 35-min changeover. Minor OEE impact (~3%). Recommended.",recommended:true,impact:"Low"},
    {id:"B",label:"Source replacement batch",description:"Emergency same-day delivery. 60% confidence on timing. Line 1 idle 2–3 hours.",recommended:false,impact:"Medium"},
    {id:"C",label:"Hold Line 1 until tomorrow",description:"Safest quality option but results in full Day shift loss on Line 1.",recommended:false,impact:"High"},
  ],
  notifyList:["Plant Leader","Production Supervisor","Quality Manager","Scheduler","Procurement Lead"],
};

const DISRUPTION_RECS = {
  A: {
    title:"SKU 4412 → SKU 3802 Swap Executed — Line 1",
    priority:"High", domain:"Production", icon:"⚙️",
    lines:["All","Line 1"],
    agents:["Scheduling Agent","Inbound Materials Agent","Quality Monitoring Agent","Supervisor & Operator Co-Pilot"],
    suggestedAction:"Monitor Line 1 changeover to SKU 3802, confirm quality checks pass, and update DC-West shipment plan.",
    summary:"Line 1 has been switched from SKU 4412 to SKU 3802 following inbound materials failure on Lot #SB-2291. 35-min changeover underway. Quality Monitoring Agent to verify first-pass yield before full rate production resumes.",
    detail:{
      issue:"Inbound seasoning blend Lot #SB-2291 for SKU 4412 was rejected at intake — sodium content 14% above spec. Line 1 Day shift switched to SKU 3802 to maintain output.",
      action:"Monitor changeover progress, confirm quality sign-off on SKU 3802 first run, and notify DC-West of SKU 4412 volume shortfall.",
      steps:[
        {agent:"Inbound Materials Agent",domain:"Quality",action:"Quarantine Lot #SB-2291 and raise supplier deviation report.",status:"complete"},
        {agent:"Scheduling Agent",domain:"Planning",action:"Update Line 1 production schedule — replace SKU 4412 run with SKU 3802.",status:"complete"},
        {agent:"Quality Monitoring Agent",domain:"Quality",action:"Monitor first-pass yield on SKU 3802 run.",status:"pending"},
        {agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Guide Line 1 operator through SKU 3802 changeover SOP.",status:"pending"},
        {agent:"Planning Agent",domain:"Planning",action:"Notify DC-West of SKU 4412 shortfall and revised delivery timeline.",status:"pending"},
      ],
      approvers:[
        {name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},
        {name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"},
        {name:"Priya Nair",role:"Scheduler",avatar:"SC"},
      ],
    },
  },
  B: {
    title:"Emergency SKU 4412 Batch Sourcing — Line 1 On Hold",
    priority:"Critical", domain:"Production", icon:"📦",
    lines:["All","Line 1"],
    agents:["Inbound Materials Agent","Planning Agent","Scheduling Agent","Supervisor & Operator Co-Pilot"],
    suggestedAction:"Track emergency batch delivery ETA, hold Line 1, and prepare contingency switch to SKU 3802 if delivery is delayed past 11am.",
    summary:"Emergency replacement batch for SKU 4412 has been ordered. Line 1 is on hold pending delivery. If batch does not arrive by 11am, contingency switch to SKU 3802 will be activated.",
    detail:{
      issue:"SKU 4412 inbound materials rejected. Emergency same-day batch ordered — 60% confidence on timing. Line 1 currently idle.",
      action:"Monitor delivery ETA. If batch arrives by 11am, proceed with SKU 4412. If delayed, activate SKU 3802 contingency.",
      steps:[
        {agent:"Inbound Materials Agent",domain:"Quality",action:"Raise emergency PO with approved seasoning supplier. Confirm ETA.",status:"complete"},
        {agent:"Planning Agent",domain:"Planning",action:"Place Line 1 on hold. Prepare SKU 3802 contingency plan.",status:"complete"},
        {agent:"Scheduling Agent",domain:"Planning",action:"Set 11am decision gate — auto-trigger SKU 3802 switch if batch not received.",status:"pending"},
        {agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Keep Line 1 crew on standby. Brief on both SKU procedures.",status:"pending"},
      ],
      approvers:[
        {name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},
        {name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"},
      ],
    },
  },
  C: {
    title:"Line 1 Held — SKU 4412 Rescheduled to Tomorrow",
    priority:"High", domain:"Planning", icon:"📋",
    lines:["All","Line 1"],
    agents:["Planning Agent","Scheduling Agent","Supervisor & Operator Co-Pilot"],
    suggestedAction:"Confirm Line 1 hold, reschedule SKU 4412 to tomorrow's Day shift, and notify DC-West of delay.",
    summary:"Line 1 Day shift held due to out-of-spec inbound materials for SKU 4412. Rescheduled to tomorrow pending fresh batch. DC-West notified of delay.",
    detail:{
      issue:"SKU 4412 cannot run today. Full Day shift volume on Line 1 lost. DC-West shipment delayed by one day.",
      action:"Reschedule SKU 4412 to tomorrow's Day shift. Notify DC-West. Use Line 1 downtime for planned cleaning.",
      steps:[
        {agent:"Scheduling Agent",domain:"Planning",action:"Reschedule SKU 4412 Line 1 run to tomorrow Day shift.",status:"complete"},
        {agent:"Planning Agent",domain:"Planning",action:"Notify DC-West of one-day delay on SKU 4412 shipment.",status:"pending"},
        {agent:"Supervisor & Operator Co-Pilot",domain:"Production",action:"Redirect Line 1 crew to planned cleaning and minor maintenance.",status:"pending"},
        {agent:"Maintenance Planning & Scheduling Agent",domain:"Maintenance",action:"Identify opportunistic PM tasks during unplanned Line 1 downtime.",status:"pending"},
      ],
      approvers:[
        {name:"Sarah Mitchell",role:"Plant Leader",avatar:"PL"},
        {name:"Priya Nair",role:"Scheduler",avatar:"SC"},
        {name:"Tom Kowalski",role:"Production Supervisor",avatar:"PS"},
      ],
    },
  },
};

const generateDays=(n,label)=>Array.from({length:n},(_,i)=>{const d=new Date(2026,1,28);d.setDate(d.getDate()-(n-1-i));return label==="24h"?`${String(i*2).padStart(2,"0")}:00`:`${d.getMonth()+1}/${d.getDate()}`;});
const seed=(base,variance,n)=>Array.from({length:n},()=>Math.round((base+(Math.random()-0.5)*variance*2)*10)/10);
const buildLinePerf=(n,label)=>({days:generateDays(n,label),oee:{"Line 1":seed(80,5,n),"Line 2":seed(87,4,n),"Line 3":seed(57,8,n)},availability:{"Line 1":seed(88,4,n),"Line 2":seed(93,3,n),"Line 3":seed(63,9,n)},units:{"Line 1":seed(6800,400,n),"Line 2":seed(7200,300,n),"Line 3":seed(4400,600,n)},quality:{"Line 1":seed(97,1.5,n),"Line 2":seed(99,0.8,n),"Line 3":seed(89,2.5,n)},scrap:{"Line 1":seed(1.4,0.4,n),"Line 2":seed(0.8,0.3,n),"Line 3":seed(6.1,1.2,n)},plannedRatio:{"Line 1":seed(80,6,n),"Line 2":seed(91,4,n),"Line 3":seed(22,8,n)},downtime:{"Line 1":seed(44,15,n),"Line 2":seed(22,8,n),"Line 3":seed(276,40,n)},schedAdherence:{"Line 1":seed(91,5,n),"Line 2":seed(97,3,n),"Line 3":seed(58,10,n)},otif:{"Line 1":seed(93,4,n),"Line 2":seed(98,2,n),"Line 3":seed(71,8,n)}});
const perfDatasets={"24h":buildLinePerf(12,"24h"),"2w":buildLinePerf(14,"2w"),"1m":buildLinePerf(30,"1m")};
const LINE_COLORS_PERF={"Line 1":T.primary,"Line 2":T.positive,"Line 3":T.negative};

const INIT_ORDERS = [
  {id:"RUN-1021",line:"Line 1",sku:"SKU 3802",desc:"Original Chips",units:4200,target:4500,start:"Feb 28 06:00",end:"Feb 28 11:30",dueDate:"Feb 28",dc:"DC-East"},
  {id:"RUN-1022",line:"Line 1",sku:"SKU 4412",desc:"Seasoned Chips",units:4200,target:4500,start:"Feb 28 12:00",end:"Feb 28 17:30",dueDate:"Feb 28",dc:"DC-West",riskReason:"Inbound materials out of spec"},
  {id:"RUN-1023",line:"Line 1",sku:"SKU 2204",desc:"Crimped Seal Chips",units:3800,target:4000,start:"Mar 1 06:00",end:"Mar 1 11:00",dueDate:"Mar 3",dc:"DC-South"},
  {id:"RUN-1024",line:"Line 1",sku:"SKU 3801",desc:"Premium Chips",units:6200,target:6200,start:"Mar 1 13:00",end:"Mar 1 18:00",dueDate:"Mar 7",dc:"DC-East",riskReason:"Moved from Line 3 per orchestration rec"},
  {id:"RUN-1025",line:"Line 1",sku:"SKU 3804",desc:"BBQ Chips",units:5000,target:5000,start:"Mar 2 06:00",end:"Mar 2 12:30",dueDate:"Mar 5",dc:"DC-West"},
  {id:"RUN-1026",line:"Line 2",sku:"SKU 3802",desc:"Original Chips",units:7000,target:7000,start:"Feb 28 06:00",end:"Feb 28 14:00",dueDate:"Feb 28",dc:"DC-North"},
  {id:"RUN-1027",line:"Line 2",sku:"SKU 2204",desc:"Crimped Seal Chips",units:6500,target:6500,start:"Mar 1 06:00",end:"Mar 1 13:00",dueDate:"Mar 4",dc:"DC-East"},
  {id:"RUN-1028",line:"Line 2",sku:"SKU 3804",desc:"BBQ Chips",units:7000,target:7000,start:"Mar 2 06:00",end:"Mar 2 14:00",dueDate:"Mar 6",dc:"DC-South"},
  {id:"RUN-1029",line:"Line 2",sku:"SKU 3801",desc:"Premium Chips",units:3500,target:3500,start:"Mar 3 08:00",end:"Mar 3 12:30",dueDate:"Mar 7",dc:"DC-West"},
  {id:"RUN-1030",line:"Line 3",sku:"SKU 2204",desc:"Crimped Seal Chips",units:2800,target:4500,start:"Feb 28 10:00",end:"Feb 28 14:00",dueDate:"Mar 1",dc:"DC-North",riskReason:"Sealer downtime constraining output"},
  {id:"RUN-1031",line:"Line 3",sku:"SKU 2204",desc:"Crimped Seal Chips",units:4000,target:4000,start:"Mar 1 06:00",end:"Mar 1 14:00",dueDate:"Mar 3",dc:"DC-East"},
  {id:"RUN-1032",line:"Line 3",sku:"SKU 3804",desc:"BBQ Chips",units:5500,target:5500,start:"Mar 2 08:00",end:"Mar 2 16:00",dueDate:"Mar 5",dc:"DC-South",riskReason:"Dependent on sealer repair"},
];

const schedAgentRecs=[
  {id:"sa1",priority:"High",title:"Sequence Optimisation — Line 1 Thursday",impact:"Save 45 min changeover",action:"Resequence RUN-1023 → RUN-1025 on Line 1 Thursday",detail:"Grouping RUN-1023 (SKU 2204) and RUN-1025 (SKU 3804) back-to-back on Line 1 Thursday saves an estimated 45 min of changeover time."},
  {id:"sa2",priority:"Medium",title:"Idle Capacity — Line 2 Friday Afternoon",impact:"~1,800 units buffer stock",action:"Add SKU 2204 buffer run to Line 2, Mar 6 1–3:30pm",detail:"Line 2 has 2.5 hours of unallocated capacity Friday afternoon. Suggest filling with SKU 2204 buffer run (~1,800 units)."},
  {id:"sa3",priority:"Medium",title:"Changeover Reduction — Line 3 Next Week",impact:"Save ~1.5 hrs changeover",action:"Regroup Line 3 schedule Mar 2–3 by SKU family",detail:"Current Line 3 schedule alternates between incompatible SKU families, creating 3 extended changeovers. Grouping same-family SKUs reduces total changeover time by ~1.5 hrs."},
];

const orchSchedulingRecs=[
  {id:3,priority:"High",title:"SKU 3801 Rescheduled to Line 1 — Thursday Afternoon",status:"Partially Executed",detail:"SKU 3801 (RUN-1024) moved from Line 3 to Line 1, Thursday 1–5pm due to Line 3 sealer risk. Volume target of 6,200 units maintained. Labor reallocation still pending approval."},
  {id:1,priority:"Critical",title:"Line 3 Maintenance Window — Today 2–4pm",status:"Action Required",detail:"Planned maintenance window approved on Line 3 today 2–4pm. RUN-1030 volume shortfall of ~1,700 units vs DC-North target. Confirm whether shortfall can be recovered on next shift or whether DC-North needs to be notified."},
];

const GANTT_SKUS={"SKU 3802":T.primary,"SKU 4412":T.negative,"SKU 2204":T.positive,"SKU 3801":"#673AB7","SKU 3804":T.warning};
const GANTT_DAYS=["Feb 28","Mar 1","Mar 2","Mar 3"];
const GANTT_HOURS=[6,8,10,12,14,16,18];
const DAY_START=6; const DAY_END=18;

function timeToFrac(str) {
  if(!str) return null;
  const parts = str.trim().split(" ");
  if(parts.length < 3) return null;
  const date = parts[0]+" "+parts[1];
  const time = parts[2];
  const timeParts = time.split(":");
  const h = parseInt(timeParts[0],10);
  const m = timeParts[1] ? parseInt(timeParts[1],10) : 0;
  const dayIdx = GANTT_DAYS.indexOf(date);
  if(dayIdx < 0) return null;
  return dayIdx + (h - DAY_START + m/60) / (DAY_END - DAY_START);
}

const PERSONA_DOMAINS = {
  plant_leader:["Safety","Quality","Production","Maintenance","Planning"],
  maint_manager:["Maintenance","Safety"],
  scheduler:["Planning"],
  quality_manager:["Quality"],
  safety_lead:["Safety"],
};
const PERSONA_ROLES = {
  plant_leader:["Plant Leader","Plant Manager"],
  maint_manager:["Maintenance Manager"],
  scheduler:["Scheduler","Scheduling Manager"],
  quality_manager:["Quality Manager"],
  safety_lead:["Safety Lead"],
};

function recVisibleToPersona(rec, persona) {
  if (persona === "plant_leader") return true;
  const roles = PERSONA_ROLES[persona] || [];
  const domains = PERSONA_DOMAINS[persona] || [];
  const isApprover = (rec.detail?.approvers||[]).some(a => roles.includes(a.role));
  const domainMatch = domains.includes(rec.domain);
  const stepMatch = (rec.detail?.steps||[]).some(s => domains.includes(s.domain));
  const agentMatch = (rec.agents||[]).some(a => domains.some(d => a.toLowerCase().includes(d.toLowerCase())));
  return isApprover || domainMatch || stepMatch || agentMatch;
}

const VALID_AGENTS_LIST = "Asset Health Monitoring Agent, Maintenance Planning & Scheduling Agent, Technician Co-Pilot, Maintenance Strategy Agent, Scheduling Agent, Planning Agent, Supervisor & Operator Co-Pilot, Quality Monitoring Agent, Inbound Materials Agent, Final Quality Agent, Setpoint & Recipe Optimization Agent, Root Cause Analysis Agent, Safety Agent, Plant Orchestration Agent";

const SYSTEM_PROMPT_BASE = `You are the Plant Orchestration Agent for Austin Plant, a snack food manufacturing facility with 3 production lines. You have full visibility across Safety, Quality, Production, Maintenance, and Planning & Scheduling.
PLANT DATA: ${JSON.stringify(lineData)}
DISRUPTION: ${JSON.stringify(disruptionAlert)}
SKUs: SKU 3801 requires heat sealer. SKU 2204 uses crimped seal (no sealer needed), materials in stock. SKU 3802 standard chips, in stock. SKU 4412 needs seasoning blend Lot #SB-2291 (out of spec).
TODAY: Friday Feb 28, 2026 — 7:00am DDS
Be direct, concise, use lean manufacturing language.

AVAILABLE AGENTS (use only these exact names): ${VALID_AGENTS_LIST}
AVAILABLE APPROVERS (use only these exact role names): Plant Leader, Maintenance Manager, Scheduler, Production Supervisor, Quality Manager

When you reach a clear actionable conclusion, output BOTH blocks EXACTLY as shown:

---RECOMMENDATION---
TITLE: [short title]
PRIORITY: [Critical / High / Medium]
DOMAIN: [Safety / Quality / Production / Maintenance / Planning]
LINES: [All / Line 1 / Line 2 / Line 3]
ACTION: [one sentence recommended action]
AGENTS: [comma-separated from the available agents list above]
SUMMARY: [2-3 sentences]
---END---

---STEPS---
[{"agent":"Agent Name","domain":"Domain","action":"Specific action this agent takes","status":"pending"},...]
---ENDSTEPS---

---APPROVERS---
[{"role":"Role Name"},...]
---ENDAPPROVERS---

Only output these blocks when you have a clear actionable recommendation.`;

const Badge=({label,color})=>(<span style={{background:color+"18",color,border:`1px solid ${color}40`,borderRadius:3,padding:"2px 8px",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>);
const PriorityColor=p=>p==="Critical"?T.negative:p==="High"?T.warning:p==="Medium"?T.info:T.neutral;
const statusColor=s=>s==="Complete"?T.positive:s==="In Progress"?T.info:s==="Action Required"?T.negative:T.warning;
const Metric=({label,value,target,unit="",good,bad})=>{
  const color=good?T.positive:bad?T.negative:T.warning;
  return(<div style={{display:"flex",flexDirection:"column",gap:2}}><div style={{fontSize:10,color:T.gray900,fontWeight:600,whiteSpace:"nowrap"}}>{label}</div><div style={{fontSize:16,fontWeight:800,color,lineHeight:1}}>{value}{unit}</div>{target!=null&&<div style={{fontSize:10,color:T.gray400}}>Target: {target}{unit}</div>}</div>);
};

function DetailPage({rec,onBack}){
  const d=rec.detail||{};
  const [approverState,setApproverState]=useState((d.approvers||[]).map(a=>({...a,status:"pending"})));
  const [executed,setExecuted]=useState(false);
  const [executing,setExecuting]=useState(false);
  const allApproved=approverState.length>0&&approverState.every(a=>a.status==="approved");
  const approve=i=>{const u=[...approverState];u[i].status="approved";setApproverState(u);};
  const execute=()=>{setExecuting(true);setTimeout(()=>{setExecuting(false);setExecuted(true);},2000);};
  return(<div>
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"16px 24px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <button onClick={onBack} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:4,padding:"6px 12px",fontSize:12,cursor:"pointer",color:T.gray900,fontWeight:700}}>← Back</button>
      <div style={{flex:1}}><div style={{fontSize:16,fontWeight:800,color:T.black}}>{rec.icon} {rec.title}</div><div style={{fontSize:12,color:T.gray900,marginTop:2}}>Recommendation Detail & Orchestrated Response Plan{rec.fromChat&&<span style={{marginLeft:8,background:T.info+"18",color:T.info,border:`1px solid ${T.info}40`,borderRadius:3,padding:"1px 7px",fontSize:11,fontWeight:700}}>✦ From Chat</span>}</div></div>
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

function Dashboard({recs,onSelectRec,onShowDisruption,disruptionActive,persona}){
  const [lineFilter,setLineFilter]=useState("All");
  const recsRef=useRef();
  const d=lineData[lineFilter]; const actions=domainActions[lineFilter]||domainActions["All"];
  const pct=(v,t)=>v>=t; const inv=(v,t)=>v<=t;
  const personaDomains=PERSONA_DOMAINS[persona]||PERSONA_DOMAINS.plant_leader;
  const filteredRecs=recs.filter(r=>r.lines.includes(lineFilter)).filter(r=>recVisibleToPersona(r,persona));
  const chatRecs=filteredRecs.filter(r=>r.fromChat);
  const disruptionRecs=filteredRecs.filter(r=>r.fromDisruption);
  const standardRecs=filteredRecs.filter(r=>!r.fromChat&&!r.fromDisruption);
  const recsForDomain=domain=>filteredRecs.filter(r=>!r.fromChat&&!r.fromDisruption&&(r.domain===domain||([]==[]))).length;
  const scrollToRecs=()=>recsRef.current?.scrollIntoView({behavior:"smooth",block:"start"});
  const allDomainColumns=[
    {domain:"Safety",icon:"🦺",metrics:[{label:"Safety Incidents",value:d.safetyIncidents,target:0,unit:"",good:d.safetyIncidents===0,bad:d.safetyIncidents>0},{label:"Near Misses",value:d.nearMisses,target:0,unit:"",good:d.nearMisses===0,bad:d.nearMisses>1}],actions:actions.Safety||[]},
    {domain:"Quality",icon:"✅",metrics:[{label:"Quality Rate",value:d.qualityRate,target:d.qualityTarget,unit:"%",good:pct(d.qualityRate,d.qualityTarget),bad:!pct(d.qualityRate,d.qualityTarget)},{label:"First Pass Yield",value:d.firstPassYield,target:95,unit:"%",good:pct(d.firstPassYield,95),bad:!pct(d.firstPassYield,95)}],actions:actions.Quality||[]},
    {domain:"Production",icon:"⚙️",metrics:[{label:"Units Produced",value:d.unitsProduced.toLocaleString(),target:d.unitsTarget.toLocaleString(),unit:"",good:pct(d.unitsProduced,d.unitsTarget),bad:!pct(d.unitsProduced,d.unitsTarget)},{label:"OEE",value:d.oee,target:d.oeeTarget,unit:"%",good:pct(d.oee,d.oeeTarget),bad:!pct(d.oee,d.oeeTarget)},{label:"Availability",value:d.availability,target:85,unit:"%",good:pct(d.availability,85),bad:!pct(d.availability,85)},{label:"Downtime",value:d.downtimeMins,target:d.downtimeTarget,unit:" min",good:inv(d.downtimeMins,d.downtimeTarget),bad:!inv(d.downtimeMins,d.downtimeTarget)},{label:"Scrap / Waste",value:d.scrap,target:d.scrapTarget,unit:"%",good:inv(d.scrap,d.scrapTarget),bad:!inv(d.scrap,d.scrapTarget)}],actions:actions.Production||[]},
    {domain:"Maintenance",icon:"🔧",metrics:[{label:"Planned/Unplanned",value:`${d.plannedUnplannedRatio}% / ${100-d.plannedUnplannedRatio}%`,target:null,unit:"",good:d.plannedUnplannedRatio>=80,bad:d.plannedUnplannedRatio<60},{label:"Open Work Orders",value:d.openWorkOrders,target:null,unit:"",good:d.openWorkOrders<=2,bad:d.openWorkOrders>4},{label:"Overdue WOs",value:d.overdueWorkOrders,target:0,unit:"",good:d.overdueWorkOrders===0,bad:d.overdueWorkOrders>0}],actions:actions.Maintenance||[]},
    {domain:"Planning",icon:"📋",metrics:[{label:"Plan Status",value:d.planStatus>0?`${d.planStatus} hrs ahead`:`${Math.abs(d.planStatus)} hrs behind`,target:null,unit:"",good:d.planStatus>=0,bad:d.planStatus<-2},{label:"Sched. Adherence",value:d.scheduleAdherence,target:d.scheduleTarget,unit:"%",good:pct(d.scheduleAdherence,d.scheduleTarget),bad:!pct(d.scheduleAdherence,d.scheduleTarget)},{label:"OTIF",value:d.otif,target:d.otifTarget,unit:"%",good:pct(d.otif,d.otifTarget),bad:!pct(d.otif,d.otifTarget)}],actions:actions.Planning||[]},
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
        {disruptionRecs.length>0&&<div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{fontSize:13,fontWeight:800,color:T.black}}>🚨 From Disruption Response</div><Badge label={`${disruptionRecs.length} active`} color={T.negative}/></div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>{disruptionRecs.map(r=>(<div key={r.id} onClick={()=>onSelectRec(r)} style={{background:T.white,borderRadius:4,borderLeft:`4px solid ${PriorityColor(r.priority)}`,boxShadow:`0 0 0 2px ${T.negative}22`,padding:"14px 18px",cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}><div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}><Badge label={r.priority} color={PriorityColor(r.priority)}/><Badge label={r.domain} color={T.primary}/><Badge label="🚨 Disruption" color={T.negative}/></div><div style={{fontSize:13,fontWeight:800,color:T.black,marginBottom:4}}>{r.icon} {r.title}</div><div style={{fontSize:12,color:T.gray900}}>{r.summary}</div><div style={{fontSize:12,color:T.primary,fontWeight:600,marginTop:6}}>💡 {r.suggestedAction}</div></div><div style={{fontSize:12,color:T.primary,fontWeight:700}}>View Detail →</div></div>
          </div>))}</div>
        </div>}
        {chatRecs.length>0&&<div style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><div style={{fontSize:13,fontWeight:800,color:T.black}}>✦ From Scenario Simulation</div><Badge label={`${chatRecs.length} new`} color={T.info}/></div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>{chatRecs.map(r=>(<div key={r.id} onClick={()=>onSelectRec(r)} style={{background:T.white,borderRadius:4,borderLeft:`4px solid ${PriorityColor(r.priority)}`,boxShadow:`0 0 0 2px ${T.info}22`,padding:"14px 18px",cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}><div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}><Badge label={r.priority} color={PriorityColor(r.priority)}/><Badge label={r.domain} color={T.primary}/><Badge label="✦ From Chat" color={T.info}/></div><div style={{fontSize:13,fontWeight:800,color:T.black,marginBottom:4}}>{r.icon} {r.title}</div><div style={{fontSize:12,color:T.gray900}}>{r.summary}</div><div style={{fontSize:12,color:T.primary,fontWeight:600,marginTop:6}}>💡 {r.suggestedAction}</div></div><div style={{fontSize:12,color:T.primary,fontWeight:700}}>View Detail →</div></div>
          </div>))}</div>
        </div>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:13,fontWeight:800,color:T.black}}>🧠 Orchestration Agent — Recommendations</div>
          {persona!=="plant_leader"&&<Badge label={`Filtered for your role · ${standardRecs.length} relevant`} color={T.primary}/>}
        </div>
        <div style={{fontSize:11,color:T.gray900,marginBottom:12}}>{persona==="plant_leader"?"Synthesized across all domain agents · Ranked by urgency and cross-domain impact":"Showing recommendations where you are tagged as an approver or your domain is impacted"}</div>
        {standardRecs.length===0&&<div style={{background:T.white,borderRadius:4,padding:"20px",textAlign:"center",color:T.gray400,fontSize:13,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>No recommendations currently require your attention.</div>}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>{standardRecs.map(r=>(<div key={r.id} onClick={()=>onSelectRec(r)} style={{background:T.white,borderRadius:4,borderLeft:`4px solid ${PriorityColor(r.priority)}`,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",padding:"14px 18px",cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}><div style={{flex:1}}><div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}><Badge label={r.priority} color={PriorityColor(r.priority)}/><Badge label={r.domain} color={T.primary}/>{r.agents.slice(0,2).map(a=><Badge key={a} label={a} color={T.neutral}/>)}{r.agents.length>2&&<Badge label={`+${r.agents.length-2} more`} color={T.neutral}/>}</div><div style={{fontSize:13,fontWeight:800,color:T.black,marginBottom:4}}>{r.icon} {r.title}</div><div style={{fontSize:12,color:T.gray900}}>{r.summary}</div><div style={{fontSize:12,color:T.primary,fontWeight:600,marginTop:6}}>💡 {r.suggestedAction}</div></div><div style={{fontSize:12,color:T.primary,fontWeight:700}}>View Detail →</div></div>
        </div>))}</div>
      </div>
    </div>
  </div>);
}

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
        {[{opts:["All","Open & In Progress","Open","In Progress","Complete"],cur:filterStatus,setter:setFilterStatus,lbl:"STATUS"},{opts:["All","Safety","Quality","Production","Maintenance","Planning"],cur:filterDomain,setter:setFilterDomain,lbl:"DOMAIN"},{opts:["All","Routine","Recommendation"],cur:filterSource,setter:setFilterSource,lbl:"SOURCE"},{opts:["All","Line 1","Line 2","Line 3"],cur:filterLine,setter:setFilterLine,lbl:"LINE"}].map(({opts,cur,setter,lbl})=>(
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
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{kpis.map(k=>(<div key={k.line} style={{flex:1,minWidth:140,background:T.white,borderRadius:4,borderLeft:`4px solid ${LINE_COLORS_PERF[k.line]}`,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",padding:"12px 14px"}}>
        <div style={{fontSize:11,fontWeight:800,color:LINE_COLORS_PERF[k.line],marginBottom:6}}>{k.line}</div>
        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          <div><div style={{fontSize:10,color:T.gray900}}>Avg OEE</div><div style={{fontSize:18,fontWeight:800,color:k.oee>=80?T.positive:T.negative}}>{k.oee}%</div></div>
          <div><div style={{fontSize:10,color:T.gray900}}>Avg Quality</div><div style={{fontSize:18,fontWeight:800,color:k.quality>=97?T.positive:T.warning}}>{k.quality}%</div></div>
          <div><div style={{fontSize:10,color:T.gray900}}>Avg Downtime</div><div style={{fontSize:18,fontWeight:800,color:k.downtime>60?T.negative:T.gray900}}>{k.downtime}m</div></div>
          <div><div style={{fontSize:10,color:T.gray900}}>Avg OTIF</div><div style={{fontSize:18,fontWeight:800,color:k.otif>=95?T.positive:T.warning}}>{k.otif}%</div></div>
        </div>
      </div>))}</div>
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

function GanttChart({filterLine,orders}){
  const lines=filterLine==="All"?["Line 1","Line 2","Line 3"]:[filterLine];
  const totalCols=GANTT_DAYS.length;
  const buildBlocks=(lineOrders)=>{
    const blocks=[];
    GANTT_DAYS.forEach((day,di)=>{
      const dayOrders=lineOrders.filter(o=>o.start.startsWith(day)).sort((a,b)=>timeToFrac(a.start)-timeToFrac(b.start));
      const dayEnd=di+1;let cursor=di;
      dayOrders.forEach(o=>{const s=timeToFrac(o.start);const e=timeToFrac(o.end);if(s===null||e===null)return;if(s>cursor+0.005)blocks.push({type:"gap",start:cursor,end:s});blocks.push({type:"order",order:o,start:s,end:e});cursor=e;});
      if(cursor<dayEnd-0.005)blocks.push({type:"gap",start:cursor,end:dayEnd});
    });
    return blocks;
  };
  return(<div style={{overflowX:"auto"}}><div style={{minWidth:700}}>
    <div style={{display:"flex",marginLeft:80,marginBottom:4}}>{GANTT_DAYS.map(d=>(<div key={d} style={{flex:1,textAlign:"center",fontSize:11,fontWeight:700,color:T.gray900,borderLeft:`1px solid ${T.border}`,paddingLeft:4}}>{d}</div>))}</div>
    <div style={{display:"flex",marginLeft:80,marginBottom:8}}>{GANTT_DAYS.map(d=>(<div key={d} style={{flex:1,display:"flex",justifyContent:"space-between"}}>{GANTT_HOURS.map(h=><span key={h} style={{fontSize:9,color:T.gray400}}>{h}:00</span>)}</div>))}</div>
    {lines.map(line=>{const lineOrders=orders.filter(o=>o.line===line);const blocks=buildBlocks(lineOrders);return(<div key={line} style={{display:"flex",alignItems:"center",marginBottom:8}}>
      <div style={{width:80,fontSize:11,fontWeight:800,color:T.black,flexShrink:0}}>{line}</div>
      <div style={{flex:1,height:36,background:T.gray100,borderRadius:4,position:"relative",border:`1px solid ${T.border}`}}>
        {GANTT_DAYS.map((_,i)=>(<div key={i} style={{position:"absolute",left:`${(i/totalCols)*100}%`,top:0,bottom:0,borderLeft:`1px dashed ${T.border}40`,zIndex:0}}/>))}
        {line==="Line 3"&&(()=>{const ms=timeToFrac("Feb 28 14:00");const me=timeToFrac("Feb 28 16:00");if(ms===null||me===null)return null;const ml=(ms/totalCols)*100;const mw=((me-ms)/totalCols)*100;return<div key="maint" style={{position:"absolute",left:`${ml}%`,width:`${mw}%`,top:0,bottom:0,background:"#ef444430",borderLeft:`2px dashed ${T.negative}`,borderRight:`2px dashed ${T.negative}`,zIndex:4,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:8,color:T.negative,fontWeight:800,whiteSpace:"nowrap"}}>MAINT</span></div>;})()}
        {blocks.map((b,bi)=>{const left=(b.start/totalCols)*100;const width=((b.end-b.start)/totalCols)*100;if(b.type==="gap")return(<div key={bi} title="Changeover / Sanitation" style={{position:"absolute",left:`${left}%`,width:`${width}%`,top:3,bottom:3,background:"#cbd5e1",borderRadius:3,zIndex:1,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>{width>2&&<span style={{fontSize:8,color:"#64748b",fontWeight:600}}>⟳</span>}</div>);const o=b.order;const color=GANTT_SKUS[o.sku]||T.neutral;return(<div key={bi} title={`${o.id} · ${o.sku} · ${o.units.toLocaleString()} units${o.riskReason?"\n"+o.riskReason:""}`} style={{position:"absolute",left:`${left}%`,width:`${width}%`,top:3,bottom:3,background:color,borderRadius:3,opacity:0.88,zIndex:2,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}><span style={{fontSize:9,color:T.white,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",padding:"0 3px"}}>{o.sku}</span></div>);})}
      </div>
    </div>);})}
    <div style={{display:"flex",gap:12,marginLeft:80,marginTop:8,flexWrap:"wrap"}}>
      {Object.entries(GANTT_SKUS).map(([sku,color])=>(<div key={sku} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.gray900}}><span style={{width:12,height:12,borderRadius:2,background:color,display:"inline-block"}}/>{sku}</div>))}
      <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.gray900}}><span style={{width:12,height:12,borderRadius:2,background:"#cbd5e1",display:"inline-block"}}/>Changeover</div>
      <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.gray900}}><span style={{width:12,height:12,borderRadius:2,background:"#ef444430",border:`1px dashed ${T.negative}`,display:"inline-block"}}/>Maintenance Window</div>
    </div>
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
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <div style={{fontSize:12,fontWeight:800,color:T.black}}>🌐 From Plant Orchestration Agent</div>
        {orchSchedulingRecs.map(r=>(<div key={r.id} style={{background:T.white,borderRadius:4,borderLeft:`4px solid ${PriorityColor(r.priority)}`,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",overflow:"hidden"}}>
          <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap",cursor:"pointer"}} onClick={()=>setExpandedOrch(expandedOrch===r.id?null:r.id)}>
            <div style={{display:"flex",gap:8,alignItems:"center",flex:1,flexWrap:"wrap"}}><Badge label={r.priority} color={PriorityColor(r.priority)}/><Badge label="🌐 Orchestration" color={T.info}/><Badge label={r.status} color={r.status==="Action Required"?T.negative:T.warning}/><span style={{fontSize:13,fontWeight:700,color:T.black}}>{r.title}</span></div>
            <span style={{fontSize:11,color:T.gray400}}>{expandedOrch===r.id?"▲":"▼"}</span>
          </div>
          {expandedOrch===r.id&&<div style={{padding:"12px 16px 14px",borderTop:`1px solid ${T.border}`}}><div style={{fontSize:12,color:T.black,lineHeight:1.6,marginBottom:10}}>{r.detail}</div><button onClick={()=>onViewDashboardRec(r.id)} style={{background:T.info,color:T.white,border:"none",borderRadius:4,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>View in Dashboard →</button></div>}
        </div>))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <div style={{fontSize:12,fontWeight:800,color:T.black}}>🗓 Scheduling Agent — Optimisation Opportunities</div>
        {schedAgentRecs.map(r=>(<div key={r.id} style={{background:T.white,borderRadius:4,borderLeft:`4px solid ${PriorityColor(r.priority)}`,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",overflow:"hidden",opacity:appliedRecs.includes(r.id)?0.6:1}}>
          <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap",cursor:"pointer"}} onClick={()=>!appliedRecs.includes(r.id)&&setExpandedSched(expandedSched===r.id?null:r.id)}>
            <div style={{display:"flex",gap:8,alignItems:"center",flex:1,flexWrap:"wrap"}}><Badge label={r.priority} color={PriorityColor(r.priority)}/><Badge label="🗓 Scheduling Agent" color={T.primary}/><Badge label={r.impact} color={T.positive}/>{appliedRecs.includes(r.id)&&<Badge label="✓ Applied" color={T.positive}/>}<span style={{fontSize:13,fontWeight:700,color:T.black}}>{r.title}</span></div>
            {!appliedRecs.includes(r.id)&&<span style={{fontSize:11,color:T.gray400}}>{expandedSched===r.id?"▲":"▼"}</span>}
          </div>
          {expandedSched===r.id&&!appliedRecs.includes(r.id)&&<div style={{padding:"12px 16px 14px",borderTop:`1px solid ${T.border}`}}><div style={{fontSize:12,color:T.black,lineHeight:1.6,marginBottom:6}}>{r.detail}</div><div style={{background:T.primary+"10",borderLeft:`3px solid ${T.primary}`,borderRadius:4,padding:"8px 12px",marginBottom:10}}><div style={{fontSize:11,fontWeight:700,color:T.primary,marginBottom:2}}>RECOMMENDED ACTION</div><div style={{fontSize:12,color:T.black}}>{r.action}</div></div><div style={{display:"flex",gap:8}}><button onClick={()=>applyRec(r.id)} style={{background:T.primary,color:T.white,border:"none",borderRadius:4,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓ Apply to Schedule</button><button onClick={()=>setExpandedSched(null)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:4,padding:"6px 14px",fontSize:12,fontWeight:600,cursor:"pointer",color:T.gray900}}>Dismiss</button></div></div>}
        </div>))}
      </div>
      {appliedRecs.length>0&&<div style={{background:"#F0FDF4",border:`2px solid ${T.positive}`,borderRadius:4,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:16}}>✅</span><div><div style={{fontSize:13,fontWeight:800,color:T.positive}}>Schedule Updated</div><div style={{fontSize:12,color:T.black,marginTop:2}}>{appliedRecs.length} optimisation{appliedRecs.length>1?"s":""} applied.</div></div></div>}
      <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:13,fontWeight:800,color:T.black}}>Production Schedule — Gantt View</div></div>
        <div style={{padding:"16px 20px"}}><GanttChart filterLine={filterLine} orders={orders}/></div>
      </div>
      <div style={{background:T.white,borderRadius:4,boxShadow:"0 1px 3px rgba(0,0,0,0.07)"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:13,fontWeight:800,color:T.black}}>Production Run Schedule</div><div style={{fontSize:11,color:T.gray900,marginTop:2}}>{filteredOrders.length} runs scheduled</div></div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:T.gray100}}>{["Run","Line","SKU","Description","Units","Target","% vs Target","Start","End","DC","Notes"].map(h=>(<th key={h} style={{padding:"9px 14px",textAlign:"left",fontWeight:700,color:T.gray900,fontSize:11,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead>
          <tbody>{filteredOrders.map((o,i)=>{const pct=o.target?Math.round(o.units/o.target*100):100;const volColor=pct>=100?T.positive:pct>=85?T.warning:T.negative;return(<tr key={o.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?T.white:T.gray100+"88"}}>
            <td style={{padding:"9px 14px",fontWeight:700,color:T.black}}>{o.id}</td>
            <td style={{padding:"9px 14px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:"50%",background:LINE_COLORS_PERF[o.line],display:"inline-block"}}/>{o.line}</div></td>
            <td style={{padding:"9px 14px"}}><span style={{background:(GANTT_SKUS[o.sku]||T.neutral)+"20",color:GANTT_SKUS[o.sku]||T.neutral,border:`1px solid ${(GANTT_SKUS[o.sku]||T.neutral)}40`,borderRadius:3,padding:"2px 7px",fontSize:11,fontWeight:700}}>{o.sku}</span></td>
            <td style={{padding:"9px 14px",color:T.gray900}}>{o.desc}</td>
            <td style={{padding:"9px 14px",fontWeight:700,color:T.black}}>{o.units.toLocaleString()}</td>
            <td style={{padding:"9px 14px",color:T.gray400}}>{o.target?o.target.toLocaleString():"-"}</td>
            <td style={{padding:"9px 14px",fontWeight:700,color:volColor}}>{pct}%</td>
            <td style={{padding:"9px 14px",color:T.gray900,whiteSpace:"nowrap"}}>{o.start}</td>
            <td style={{padding:"9px 14px",color:T.gray900,whiteSpace:"nowrap"}}>{o.end}</td>
            <td style={{padding:"9px 14px",color:T.gray900}}>{o.dc||"-"}</td>
            <td style={{padding:"9px 14px"}}>{o.riskReason&&<div style={{fontSize:10,color:T.negative}}>⚠ {o.riskReason}</div>}</td>
          </tr>);})}</tbody>
        </table></div>
      </div>
    </div>
  </div>);
}

function parseRec(text){
  if(!text.includes("---RECOMMENDATION---")) return null;
  try {
    const block=text.split("---RECOMMENDATION---")[1].split("---END---")[0];
    const get=key=>{const m=block.match(new RegExp(`${key}:\\s*(.+)`));return m?m[1].trim():"";};
    const ls=get("LINES").split(",").map(l=>l.trim()).filter(Boolean);
    if(!ls.includes("All"))ls.push("All");
    const domain=get("DOMAIN")||"Production";
    const agents=get("AGENTS").split(",").map(a=>a.trim()).filter(a=>VALID_AGENTS.includes(a));
    let steps=[];
    if(text.includes("---STEPS---")){try{const stepsRaw=text.split("---STEPS---")[1].split("---ENDSTEPS---")[0].trim();const parsed=JSON.parse(stepsRaw);steps=parsed.map(s=>({agent:VALID_AGENTS.includes(s.agent)?s.agent:(agents[0]||"Supervisor & Operator Co-Pilot"),domain:s.domain||domain,action:s.action||"Review and execute recommended action.",status:"pending"}));}catch(e){steps=[];}}
    if(steps.length===0&&agents.length>0){steps=agents.map(agent=>({agent,domain,action:`Review recommendation and execute assigned action within ${domain} domain.`,status:"pending"}));}
    let approvers=[];
    if(text.includes("---APPROVERS---")){try{const appRaw=text.split("---APPROVERS---")[1].split("---ENDAPPROVERS---")[0].trim();const parsed=JSON.parse(appRaw);approvers=parsed.map(a=>VALID_APPROVERS[a.role]).filter(Boolean);}catch(e){approvers=[];}}
    if(approvers.length===0){const defaultRoles={Safety:["Plant Leader","Production Supervisor"],Quality:["Plant Leader","Quality Manager"],Production:["Plant Leader","Production Supervisor"],Maintenance:["Plant Leader","Maintenance Manager"],Planning:["Plant Leader","Scheduler"]};approvers=(defaultRoles[domain]||["Plant Leader"]).map(r=>VALID_APPROVERS[r]).filter(Boolean);}
    return{id:Date.now(),fromChat:true,title:get("TITLE"),priority:get("PRIORITY"),domain,icon:DOMAIN_ICONS[domain]||"🧠",lines:ls,agents,suggestedAction:get("ACTION"),summary:get("SUMMARY"),detail:{issue:get("SUMMARY"),action:get("ACTION"),steps,approvers}};
  }catch{return null;}
}

const stripRec=text=>text.replace(/---RECOMMENDATION---[\s\S]*?---END---/,"").replace(/---STEPS---[\s\S]*?---ENDSTEPS---/,"").replace(/---APPROVERS---[\s\S]*?---ENDAPPROVERS---/,"").trim();

const SUGGESTIONS=["The Line 3 heat sealer has just failed completely and cannot be repaired until tomorrow morning. SKU 3801 requires the sealer. We have SKU 2204 which uses a crimped seal. What do I do with Line 3 for the rest of the day?","If I take Line 3 offline today, what's the impact on Friday's orders?","How should I prioritize the afternoon shift labor shortage?","What's the fastest path to resolving the sealer issue?"];
const SUGGESTION_LABELS=["🔧 Line 3 sealer failed — swap to SKU 2204?","📋 Take Line 3 offline — Friday order impact?","👷 How to handle afternoon labor shortage?","⚡ Fastest path to fix the sealer?"];

// ── THE FIX: Chat now manages its own pendingRec state internally ─────────────
function Chat({recs, onAddRec}){
  const [msgs,setMsgs]=useState([{role:"assistant",content:"👋 I'm the Plant Orchestration Agent. I have full visibility across all domains.\n\nAsk me anything — scenario simulations, trade-off analysis, or what to prioritize. When I reach a clear recommendation, I'll ask if you want to add it to the dashboard."}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [pendingRec,setPendingRec]=useState(null); // ← managed internally, no longer a prop
  const bottomRef=useRef();
  useEffect(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),[msgs]);

  const send=async(text)=>{
    const q=(text||input).trim();if(!q||loading)return;
    const userMsg={role:"user",content:q};setMsgs(prev=>[...prev,userMsg]);setInput("");setLoading(true);setPendingRec(null);
    try{
      const history=[...msgs.slice(1),userMsg].map(m=>({role:m.role,content:m.content}));
      const sys=SYSTEM_PROMPT_BASE+`\nACTIVE RECOMMENDATIONS: ${JSON.stringify(recs.map(r=>({id:r.id,title:r.title,priority:r.priority,summary:r.summary})))}`;
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,system:sys,messages:history})});
      const data=await res.json();
      const raw=data.content?.[0]?.text||"No response.";
      const rec=parseRec(raw);
      const clean=stripRec(raw);
      setMsgs(prev=>[...prev,{role:"assistant",content:clean}]);
      if(rec) setPendingRec(rec);
    }catch(e){setMsgs(prev=>[...prev,{role:"assistant",content:"⚠️ Connection error. Please try again."}]);}
    setLoading(false);
  };

  const confirmAdd=()=>{if(pendingRec){onAddRec(pendingRec);setPendingRec(null);setMsgs(prev=>[...prev,{role:"assistant",content:"✅ Recommendation added to the dashboard. Switch to the Dashboard tab to view it."}]);}};

  return(<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
    <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,padding:"16px 24px"}}><div style={{fontSize:18,fontWeight:800,color:T.black}}>Scenario Simulation</div><div style={{fontSize:12,color:T.gray900,marginTop:2}}>Ask the Plant Orchestration Agent to model any scenario or trade-off</div></div>
    <div style={{flex:1,padding:"20px 24px",display:"flex",flexDirection:"column",gap:16,background:T.gray100,overflow:"hidden"}}>
      {msgs.length<=1&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{SUGGESTION_LABELS.map((label,i)=><button key={i} onClick={()=>send(SUGGESTIONS[i])} style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:4,padding:"7px 12px",fontSize:11,color:T.gray900,cursor:"pointer",fontWeight:600}}>{label}</button>)}</div>}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12}}>
        {msgs.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
          {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:"50%",background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.white,fontWeight:800,flexShrink:0,marginRight:8,marginTop:2}}>POA</div>}
          <div style={{maxWidth:"75%",padding:"11px 15px",borderRadius:4,fontSize:13,lineHeight:1.65,whiteSpace:"pre-wrap",background:m.role==="user"?T.primary:T.white,color:m.role==="user"?T.white:T.black,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",borderLeft:m.role==="assistant"?`3px solid ${T.primary}`:"none"}}>{m.content}</div>
        </div>))}
        {loading&&<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:28,height:28,borderRadius:"50%",background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.white,fontWeight:800,flexShrink:0}}>POA</div><div style={{background:T.white,borderRadius:4,padding:"11px 15px",fontSize:13,color:T.gray900,borderLeft:`3px solid ${T.primary}`,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>Modelling scenario across all domains...</div></div>}
        {pendingRec&&!loading&&<div style={{background:T.white,border:`2px solid ${T.info}`,borderRadius:4,padding:"14px 16px",boxShadow:`0 0 0 3px ${T.info}18`}}>
          <div style={{fontSize:12,fontWeight:800,color:T.info,marginBottom:8}}>✦ Recommendation Ready — Add to Dashboard?</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}><Badge label={pendingRec.priority} color={PriorityColor(pendingRec.priority)}/><Badge label={pendingRec.domain} color={T.primary}/>{pendingRec.lines.filter(l=>l!=="All").map(l=><Badge key={l} label={l} color={T.neutral}/>)}</div>
          <div style={{fontSize:13,fontWeight:800,color:T.black,marginBottom:4}}>{pendingRec.icon} {pendingRec.title}</div>
          <div style={{fontSize:12,color:T.gray900,marginBottom:10}}>{pendingRec.summary}</div>
          <div style={{display:"flex",gap:8}}><button onClick={confirmAdd} style={{background:T.primary,color:T.white,border:"none",borderRadius:4,padding:"8px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}}>✦ Add to Dashboard</button><button onClick={()=>setPendingRec(null)} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:4,padding:"8px 18px",fontSize:13,fontWeight:600,cursor:"pointer",color:T.gray900}}>Dismiss</button></div>
        </div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{display:"flex",gap:8,background:T.white,border:`1px solid ${T.border}`,borderRadius:4,padding:"8px 12px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Describe a scenario or ask a what-if question..." style={{flex:1,border:"none",outline:"none",fontSize:13,color:T.black,background:"transparent"}}/>
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?T.gray400:T.primary,color:T.white,border:"none",borderRadius:4,padding:"7px 16px",fontWeight:700,cursor:loading||!input.trim()?"not-allowed":"pointer",fontSize:13}}>Send</button>
      </div>
    </div>
  </div>);
}

function DisruptionModal({onClose,onAddRec}){
  const [selected,setSelected]=useState(null);const [dispatched,setDispatched]=useState(false);const [dispatching,setDispatching]=useState(false);
  const dispatch=()=>{if(!selected)return;setDispatching(true);setTimeout(()=>{setDispatching(false);setDispatched(true);const recTemplate=DISRUPTION_RECS[selected];if(recTemplate&&onAddRec){onAddRec({...recTemplate,id:Date.now(),fromDisruption:true,lines:recTemplate.lines||["All"]});}},1800);};
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{background:T.white,borderRadius:6,width:"100%",maxWidth:680,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
      <div style={{background:T.negative,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:11,fontWeight:700,color:"#ffffff99",marginBottom:2}}>🚨 REAL-TIME DISRUPTION · {disruptionAlert.time} · {disruptionAlert.id}</div><div style={{fontSize:15,fontWeight:800,color:T.white}}>{disruptionAlert.title}</div></div>
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

export default function App(){
  const [tab,setTab]=useState("dashboard");
  const [selectedRec,setSelectedRec]=useState(null);
  const [showDisruption,setShowDisruption]=useState(false);
  const [disruptionActive,setDisruptionActive]=useState(true);
  const [recs,setRecs]=useState(initialRecommendations);
  const [persona,setPersona]=useState("plant_leader");
  const [personaOpen,setPersonaOpen]=useState(false);
  const personaRef=useRef(null);
  useEffect(()=>{const h=(e)=>{if(personaRef.current&&!personaRef.current.contains(e.target))setPersonaOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const addRec=rec=>setRecs(prev=>[rec,...prev]);
  const handleViewDashboardRec=(recId)=>{const rec=[...recs,...initialRecommendations].find(r=>r.id===recId);if(rec){setSelectedRec(rec);setTab("dashboard");}};
  const personas=[{id:"plant_leader",label:"Plant Leader",avatar:"PL"},{id:"maint_manager",label:"Maintenance Manager",avatar:"MM"},{id:"scheduler",label:"Scheduler",avatar:"SC"},{id:"quality_manager",label:"Quality Manager",avatar:"QM"},{id:"safety_lead",label:"Safety Lead",avatar:"SL"}];
  const personaNav={plant_leader:["dashboard","actions","lineperf","quality","maintenance","assethealth","materials","schedule","labor","safety"],maint_manager:["dashboard","actions","lineperf","maintenance","assethealth","schedule"],scheduler:["dashboard","actions","schedule","materials","labor","lineperf"],quality_manager:["dashboard","actions","quality","materials","lineperf"],safety_lead:["dashboard","actions","safety","lineperf"]};
  const allNavItems=[{id:"dashboard",icon:"▦",label:"Summary Dashboard"},{id:"actions",icon:"☑",label:"Action Log"},{id:"lineperf",icon:"↗",label:"Line Performance"},{id:"quality",icon:"◎",label:"Quality Dashboard"},{id:"maintenance",icon:"⚙",label:"Maintenance Dashboard"},{id:"assethealth",icon:"♡",label:"Asset Health"},{id:"materials",icon:"▤",label:"Inbound Materials"},{id:"schedule",icon:"▦",label:"Production Schedule"},{id:"labor",icon:"♟",label:"Labor Scheduling"},{id:"safety",icon:"◬",label:"Safety & EHS"}];
  const activeNavIds=personaNav[persona]||personaNav.plant_leader;
  const builtTabs=["dashboard","actions","lineperf","schedule"];

  return(<div style={{background:T.gray100,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
    <div style={{background:T.primary,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:48,flexShrink:0,gap:8}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{color:T.white,fontWeight:800,fontSize:15}}>🏭 Plant Orchestration Agent</span><span style={{color:"#ffffff60",fontSize:12}}>Austin Plant · Snack Chips</span></div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {recs.some(r=>r.fromChat)&&<span style={{background:T.info,borderRadius:4,padding:"3px 10px",fontSize:11,color:T.white,fontWeight:700}}>✦ {recs.filter(r=>r.fromChat).length} new from chat</span>}
        {disruptionActive&&<button onClick={()=>setShowDisruption(true)} style={{background:T.negative,border:"none",borderRadius:4,padding:"5px 12px",color:T.white,fontWeight:700,fontSize:11,cursor:"pointer"}}>🚨 Live Disruption</button>}
        <button onClick={()=>{setTab("chat");setSelectedRec(null);}} style={{background:tab==="chat"?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:4,padding:"6px 14px",color:T.white,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>💬 Scenario Simulation</button>
        <div ref={personaRef} style={{position:"relative"}}>
          <button onClick={()=>setPersonaOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:4,padding:"5px 10px",cursor:"pointer",color:T.white}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800}}>{personas.find(p=>p.id===persona)?.avatar}</div>
            <span style={{fontSize:12,fontWeight:700}}>{personas.find(p=>p.id===persona)?.label}</span>
            <span style={{fontSize:9}}>▼</span>
          </button>
          {personaOpen&&<div style={{position:"absolute",right:0,top:"110%",background:T.white,border:`1px solid ${T.border}`,borderRadius:4,boxShadow:"0 4px 16px rgba(0,0,0,0.15)",zIndex:200,minWidth:200,overflow:"hidden"}}>
            <div style={{padding:"8px 14px 6px",fontSize:10,fontWeight:800,color:T.gray400,textTransform:"uppercase",letterSpacing:"0.06em"}}>Switch Persona</div>
            {personas.map(p=>(<button key={p.id} onClick={()=>{setPersona(p.id);setPersonaOpen(false);setTab("dashboard");setSelectedRec(null);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 14px",border:"none",cursor:"pointer",textAlign:"left",fontSize:13,background:persona===p.id?T.primary+"10":"transparent",fontWeight:persona===p.id?800:400,color:persona===p.id?T.primary:T.black}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:persona===p.id?T.primary:T.gray100,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:persona===p.id?T.white:T.gray900,flexShrink:0}}>{p.avatar}</div>
              <span>{p.label}</span>
              {persona===p.id&&<span style={{marginLeft:"auto",fontSize:11,color:T.primary}}>✓</span>}
            </button>))}
          </div>}
        </div>
      </div>
    </div>
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div style={{width:52,background:T.white,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:8,flexShrink:0}}>
        {allNavItems.map(item=>{const isActive=tab===item.id;const isEnabled=activeNavIds.includes(item.id);return(<div key={item.id} style={{position:"relative",width:"100%"}} title={`${item.label}${!isEnabled?" (not available for your role)":""}`}>
          <button onClick={()=>{if(isEnabled){setTab(item.id);setSelectedRec(null);}}} style={{width:"100%",height:44,border:"none",cursor:isEnabled?"pointer":"default",background:isActive?T.primary+"18":"transparent",borderLeft:isActive?`3px solid ${T.primary}`:"3px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:600,color:isActive?T.primary:isEnabled?T.gray900:T.gray400,opacity:isEnabled?1:0.3}}>
            {item.icon}
            {item.id==="actions"&&isEnabled&&actionLog.filter(a=>a.status==="Open"||a.status==="In Progress").length>0&&<span style={{position:"absolute",top:6,right:6,width:7,height:7,borderRadius:"50%",background:T.negative,display:"block"}}/>}
          </button>
        </div>);})}
        <div style={{marginTop:"auto",paddingBottom:12,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
          <div style={{width:24,height:1,background:T.border,marginBottom:4}}/>
          {[{c:T.warning,l:"L1"},{c:T.positive,l:"L2"},{c:T.negative,l:"L3"}].map(l=>(<div key={l.l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{width:7,height:7,borderRadius:"50%",background:l.c,display:"inline-block"}}/><span style={{fontSize:8,color:T.gray400,fontWeight:700}}>{l.l}</span></div>))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {tab==="dashboard"&&!selectedRec&&<Dashboard recs={recs} onSelectRec={r=>setSelectedRec(r)} onShowDisruption={()=>setShowDisruption(true)} disruptionActive={disruptionActive} persona={persona}/>}
        {tab==="dashboard"&&selectedRec&&<DetailPage rec={selectedRec} onBack={()=>setSelectedRec(null)}/>}
        {tab==="actions"&&<ActionLog/>}
        {tab==="lineperf"&&<LinePerformanceView/>}
        {tab==="schedule"&&<ProductionScheduleView onViewDashboardRec={handleViewDashboardRec}/>}
        {tab==="chat"&&<Chat recs={recs} onAddRec={addRec}/>}
        {!builtTabs.includes(tab)&&tab!=="chat"&&(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60vh",gap:12}}>
          <div style={{fontSize:40}}>{allNavItems.find(n=>n.id===tab)?.icon}</div>
          <div style={{fontSize:16,fontWeight:800,color:T.black}}>{allNavItems.find(n=>n.id===tab)?.label}</div>
          <div style={{fontSize:13,color:T.gray900}}>This view is part of the full vision — coming in a future build.</div>
          <div style={{background:T.primary+"12",border:`1px solid ${T.primary}30`,borderRadius:4,padding:"10px 20px",fontSize:12,color:T.primary,fontWeight:600}}>💬 Use Scenario Simulation to ask questions about this domain</div>
        </div>)}
      </div>
    </div>
    {showDisruption&&<DisruptionModal onClose={()=>{setShowDisruption(false);setDisruptionActive(false);}} onAddRec={addRec}/>}
  </div>);
}
