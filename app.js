const KEY="cargobridge_mvp_v1";
const seed={
 trucks:[{id:"TR-001",owner:"Example Owner",driver:"Example Driver",phone:"09XXXXXXXX",plate:"AA-00000",type:"Isuzu FSR",capacity:10,location:"Jimma",destination:"Addis Ababa",status:"Available",notes:"Demo row"}],
 customers:[{id:"CUS-001",company:"Example Trading",contact:"Example Contact",phone:"09XXXXXXXX",location:"Jimma",business:"Trader",loads:0,notes:"Demo row"}],
 loads:[{id:"LD-001",customerId:"CUS-001",customer:"Example Trading",pickup:"Jimma",destination:"Addis Ababa",cargo:"General Cargo",weight:8,truckType:"Isuzu FSR",date:"2026-10-07",freight:0,price:0,status:"New",truck:"",created:"2026-10-06",notes:"Demo row"}],
 trips:[],
 history:[]
};
let db=JSON.parse(localStorage.getItem(KEY)||"null")||seed;
function save(){localStorage.setItem(KEY,JSON.stringify(db));renderAll()}
function money(n){return "ETB "+Number(n||0).toLocaleString()}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function badge(s){let c=s==="Cancelled"?"red":["New","Searching"].includes(s)?"warn":["Confirmed","Picked Up","In Transit","Delivered"].includes(s)?"blue":"";return `<span class="badge ${c}">${esc(s)}</span>`}
function go(page){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById(page).classList.add("active");document.querySelectorAll(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.page===page));document.getElementById("pageTitle").textContent=page==="trips"?"Active Trips":page[0].toUpperCase()+page.slice(1);if(innerWidth<901)document.querySelector(".sidebar").classList.remove("open")}
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>go(b.dataset.page));
document.querySelectorAll("[data-page-link]").forEach(b=>b.onclick=()=>go(b.dataset.pageLink));
document.getElementById("menuBtn").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
document.getElementById("today").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"});

function renderAll(){
 document.getElementById("statNew").textContent=db.loads.filter(x=>x.status==="New").length;
 document.getElementById("statTrucks").textContent=db.trucks.filter(x=>x.status==="Available").length;
 document.getElementById("statTrips").textContent=db.loads.filter(x=>["Confirmed","Picked Up","In Transit"].includes(x.status)).length;
 document.getElementById("statDelivered").textContent=db.loads.filter(x=>x.status==="Delivered").length;
 document.getElementById("statCommission").textContent=money(db.history.reduce((a,x)=>a+Number(x.commission||0),0));
 document.getElementById("recentLoads").innerHTML=db.loads.slice(-5).reverse().map(x=>`<div class="listrow"><b>${esc(x.id)}</b> ${esc(x.customer)}<br><small>${esc(x.pickup)} → ${esc(x.destination)} · ${badge(x.status)}</small></div>`).join("")||'<div class="empty">No loads yet.</div>';
 document.getElementById("recentTrucks").innerHTML=db.trucks.filter(x=>x.status==="Available").slice(0,5).map(x=>`<div class="listrow"><b>${esc(x.plate)}</b> ${esc(x.driver)}<br><small>${esc(x.type)} · ${x.capacity} ton · ${esc(x.location)}</small></div>`).join("")||'<div class="empty">No available trucks.</div>';
 renderLoads();renderTrucks();renderCustomers();renderTrips();renderFinance();
}
function renderLoads(){
 let q=(document.getElementById("loadSearch")?.value||"").toLowerCase(), f=document.getElementById("loadStatusFilter")?.value||"";
 let rows=db.loads.filter(x=>(!f||x.status===f)&&JSON.stringify(x).toLowerCase().includes(q));
 document.getElementById("loadsTable").innerHTML=rows.map(x=>`<tr><td>${esc(x.id)}</td><td>${esc(x.customer)}</td><td>${esc(x.pickup)} → ${esc(x.destination)}</td><td>${esc(x.cargo)}</td><td>${x.weight} t</td><td>${money(x.price||x.freight)}</td><td>${badge(x.status)}</td><td><button class="action" onclick="advanceLoad('${x.id}')">Update</button></td></tr>`).join("")||'<tr><td colspan="8" class="empty">No loads found.</td></tr>';
}
function renderTrucks(){
 let q=(document.getElementById("truckSearch")?.value||"").toLowerCase(), f=document.getElementById("truckStatusFilter")?.value||"";
 let rows=db.trucks.filter(x=>(!f||x.status===f)&&JSON.stringify(x).toLowerCase().includes(q));
 document.getElementById("trucksTable").innerHTML=rows.map(x=>`<tr><td>${esc(x.id)}</td><td>${esc(x.plate)}</td><td>${esc(x.driver)}</td><td>${esc(x.phone)}</td><td>${esc(x.type)}</td><td>${x.capacity} t</td><td>${esc(x.location)}</td><td>${badge(x.status)}</td></tr>`).join("")||'<tr><td colspan="8" class="empty">No trucks found.</td></tr>';
}
function renderCustomers(){
 let q=(document.getElementById("customerSearch")?.value||"").toLowerCase();
 let rows=db.customers.filter(x=>JSON.stringify(x).toLowerCase().includes(q));
 document.getElementById("customersTable").innerHTML=rows.map(x=>`<tr><td>${esc(x.id)}</td><td>${esc(x.company)}</td><td>${esc(x.contact)}</td><td>${esc(x.phone)}</td><td>${esc(x.location)}</td><td>${esc(x.business)}</td><td>${x.loads||0}</td></tr>`).join("")||'<tr><td colspan="7" class="empty">No customers found.</td></tr>';
}
function renderTrips(){
 let trips=db.trips;
 document.getElementById("tripCards").innerHTML=trips.map(t=>`<div class="trip"><h3>${esc(t.id)} ${badge(t.status)}</h3><div class="route">${esc(t.pickup)} → ${esc(t.destination)}</div><div class="trip-meta"><div>Customer<br><b>${esc(t.customer)}</b></div><div>Driver<br><b>${esc(t.driver)}</b></div><div>Truck<br><b>${esc(t.truck)}</b></div><div>Cargo<br><b>${esc(t.cargo)} · ${t.weight}t</b></div></div><button class="action" onclick="finishTrip('${t.id}')">Mark Delivered</button></div>`).join("")||'<div class="panel empty">No active trips yet. Confirm a load to create one.</div>';
}
function renderFinance(){
 let h=db.history, freight=h.reduce((a,x)=>a+Number(x.freight||0),0), commission=h.reduce((a,x)=>a+Number(x.commission||0),0), driver=h.reduce((a,x)=>a+Number(x.driver||0),0), profit=h.reduce((a,x)=>a+Number(x.profit||0),0);
 document.getElementById("financeFreight").textContent=money(freight);document.getElementById("financeCommission").textContent=money(commission);document.getElementById("financeDriver").textContent=money(driver);document.getElementById("financeProfit").textContent=money(profit);
 document.getElementById("financeTable").innerHTML=h.map(x=>`<tr><td>${esc(x.trip)}</td><td>${esc(x.customer)}</td><td>${esc(x.route)}</td><td>${money(x.freight)}</td><td>${money(x.commission)}</td><td>${money(x.profit)}</td><td>${esc(x.date)}</td></tr>`).join("")||'<tr><td colspan="7" class="empty">No completed trips yet.</td></tr>';
}
function openModal(title,html){document.getElementById("modalTitle").textContent=title;document.getElementById("modalForm").innerHTML=html;document.getElementById("modal").classList.add("show")}
function closeModal(){document.getElementById("modal").classList.remove("show")}
document.getElementById("closeModal").onclick=closeModal;
document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
function formField(label,name,placeholder="",type="text",full=false){return `<div class="field ${full?"full":""}"><label>${label}</label><input name="${name}" type="${type}" placeholder="${placeholder}" required></div>`}
function newLoad(){
 openModal("Create New Load",`<div class="form-grid">
 ${formField("Customer","customer","Customer/company")}
 ${formField("Customer Phone","phone","09...")}
 ${formField("Pickup","pickup","Jimma")}
 ${formField("Destination","destination","Addis Ababa")}
 ${formField("Cargo","cargo","Coffee, cement, general cargo")}
 ${formField("Weight (ton)","weight","8","number")}
 ${formField("Truck Type Needed","truckType","Isuzu FSR")}
 ${formField("Pickup Date","date","","date")}
 ${formField("Freight Price (ETB)","price","0","number")}
 ${formField("Notes","notes","Optional", "text", true)}
 </div><div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Create Load</button></div>`);
 document.getElementById("modalForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target), customer=f.get("customer"), cid="CUS-"+String(db.customers.length+1).padStart(3,"0");if(!db.customers.some(c=>c.company===customer)){db.customers.push({id:cid,company:customer,contact:"",phone:f.get("phone"),location:f.get("pickup"),business:"Customer",loads:0,notes:""})}let c=db.customers.find(c=>c.company===customer);c.loads=(c.loads||0)+1;db.loads.push({id:"LD-"+String(db.loads.length+1).padStart(3,"0"),customerId:c.id,customer,pickup:f.get("pickup"),destination:f.get("destination"),cargo:f.get("cargo"),weight:Number(f.get("weight")),truckType:f.get("truckType"),date:f.get("date"),freight:Number(f.get("price")),price:Number(f.get("price")),status:"New",truck:"",created:new Date().toISOString().slice(0,10),notes:f.get("notes")});save();closeModal();go("loads")};
}
function newTruck(){
 openModal("Add Truck",`<div class="form-grid">${formField("Owner","owner","Owner name")}${formField("Driver","driver","Driver name")}${formField("Driver Phone","phone","09...")}${formField("Plate Number","plate","AA-12345")}${formField("Truck Type","type","Isuzu FSR")}${formField("Capacity (Ton)","capacity","10","number")}${formField("Current Location","location","Jimma")}${formField("Destination","destination","Addis Ababa")}</div><div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Save Truck</button></div>`);
 document.getElementById("modalForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);db.trucks.push({id:"TR-"+String(db.trucks.length+1).padStart(3,"0"),owner:f.get("owner"),driver:f.get("driver"),phone:f.get("phone"),plate:f.get("plate"),type:f.get("type"),capacity:Number(f.get("capacity")),location:f.get("location"),destination:f.get("destination"),status:"Available",notes:""});save();closeModal();go("trucks")};
}
function newCustomer(){
 openModal("Add Customer",`<div class="form-grid">${formField("Company","company","Company/trader")}${formField("Contact Person","contact","Name")}${formField("Phone","phone","09...")}${formField("Location","location","Jimma")}${formField("Business Type","business","Trader/importer/producer")}${formField("Notes","notes","Optional","text",true)}</div><div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Cancel</button><button class="primary">Save Customer</button></div>`);
 document.getElementById("modalForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);db.customers.push({id:"CUS-"+String(db.customers.length+1).padStart(3,"0"),company:f.get("company"),contact:f.get("contact"),phone:f.get("phone"),location:f.get("location"),business:f.get("business"),loads:0,notes:f.get("notes")});save();closeModal();go("customers")};
}
function advanceLoad(id){
 let l=db.loads.find(x=>x.id===id); if(!l)return;
 if(l.status==="New"||l.status==="Searching"){let available=db.trucks.find(t=>t.status==="Available"&&t.capacity>=l.weight); if(available){l.status="Matched";l.truck=available.id;available.status="Reserved";}}
 else if(l.status==="Matched"){l.status="Confirmed";let t=db.trucks.find(t=>t.id===l.truck);if(t){t.status="On Trip";db.trips.push({id:"TRIP-"+String(db.trips.length+1).padStart(3,"0"),loadId:l.id,truck:t.plate,driver:t.driver,customer:l.customer,pickup:l.pickup,destination:l.destination,cargo:l.cargo,weight:l.weight,start:new Date().toISOString().slice(0,10),expected:l.date,status:"In Transit",last:new Date().toISOString().slice(0,10)})}}
 else if(l.status==="Confirmed"){l.status="In Transit"}
 else if(l.status==="In Transit"){finishTripForLoad(l)}
 save();
}
function finishTrip(id){let t=db.trips.find(x=>x.id===id);if(t)finishTripForLoad(db.loads.find(l=>l.id===t.loadId))}
function finishTripForLoad(l){if(!l)return;let t=db.trips.find(x=>x.loadId===l.id);l.status="Delivered";if(t){t.status="Delivered";let truck=db.trucks.find(x=>x.plate===t.truck);if(truck)truck.status="Available";let commission=Number(l.price||l.freight||0)*0.10;db.history.push({trip:t.id,customer:l.customer,route:`${l.pickup} → ${l.destination}`,freight:Number(l.price||l.freight||0),commission,driver:Math.max(0,Number(l.price||l.freight||0)-commission),profit:commission,date:new Date().toISOString().slice(0,10)});db.trips=db.trips.filter(x=>x.id!==t.id)}}
document.getElementById("newLoadBtn").onclick=newLoad;document.getElementById("newLoadTop").onclick=newLoad;document.getElementById("heroNewLoad").onclick=newLoad;document.getElementById("newTruckBtn").onclick=newTruck;document.getElementById("newCustomerBtn").onclick=newCustomer;
["loadSearch","loadStatusFilter"].forEach(id=>document.getElementById(id).addEventListener("input",renderLoads));
["truckSearch","truckStatusFilter"].forEach(id=>document.getElementById(id).addEventListener("input",renderTrucks));
document.getElementById("customerSearch").addEventListener("input",renderCustomers);
renderAll();
