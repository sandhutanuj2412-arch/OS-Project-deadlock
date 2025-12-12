// Data model
const state = {
  processes: [], // ['P1']
  resources: [], // ['R1']
  holds: [], // {proc:'P1', res:'R1'}
  waits: [], // {proc:'P2', res:'R1'}
};

// DOM refs
const procName = document.getElementById("procName");
const resName = document.getElementById("resName");
const addProcBtn = document.getElementById("addProc");
const addResBtn = document.getElementById("addRes");
const holdProc = document.getElementById("holdProc");
const holdRes = document.getElementById("holdRes");
const addHoldBtn = document.getElementById("addHold");
const waitProc = document.getElementById("waitProc");
const waitRes = document.getElementById("waitRes");
const addWaitBtn = document.getElementById("addWait");
const lists = document.getElementById("lists");
const detectBtn = document.getElementById("detect");
const svg = document.getElementById("svg");
const resultTitle = document.getElementById("resultTitle");
const resultBody = document.getElementById("resultBody");
const downloadReport = document.getElementById("downloadReport");

// Notification system (replaces alerts)
function showNotification(message, type = "info", duration = 3000) {
  const container = document.getElementById("notificationContainer");
  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.setAttribute("role", "alert");
  const icons = { error: "⚠️", success: "✓", warning: "⚠", info: "ℹ️" };
  notif.innerHTML = `
    <span>${icons[type] || ""} ${message}</span>
    <button class="notification-close" aria-label="Close notification" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(notif);
  if (duration > 0) {
    setTimeout(() => {
      if (notif.parentElement) notif.remove();
    }, duration);
  }
  return notif;
}

// Keyboard navigation support
function setupKeyboardNavigation() {
  procName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addProc();
  });
  resName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addRes();
  });
}

// helpers
function unique(arr) {
  return [...new Set(arr)];
}

function refreshSelects() {
  const procs = state.processes;
  const ress = state.resources;
  [holdProc, waitProc].forEach((sel) => {
    sel.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "-- select --";
    sel.appendChild(opt);
    procs.forEach((p) => {
      const o = document.createElement("option");
      o.value = p;
      o.textContent = p;
      sel.appendChild(o);
    });
  });
  [holdRes, waitRes].forEach((sel) => {
    sel.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "-- select --";
    sel.appendChild(opt);
    ress.forEach((r) => {
      const o = document.createElement("option");
      o.value = r;
      o.textContent = r;
      sel.appendChild(o);
    });
  });
  renderLists();
}

function renderLists() {
  lists.innerHTML = "";
  const pBox = document.createElement("div");
  pBox.innerHTML =
    '<div style="font-weight:700;margin-bottom:6px">Processes</div>';
  state.processes.forEach((p) => {
    const it = document.createElement("div");
    it.className = "item";
    it.innerHTML = `<div><span class='name'>${p}</span></div><div class='controls'><button class='small secondary' onclick="removeProc('${p}')">Del</button></div>`;
    pBox.appendChild(it);
  });
  const rBox = document.createElement("div");
  rBox.style.marginTop = "10px";
  rBox.innerHTML =
    '<div style="font-weight:700;margin-bottom:6px">Resources</div>';
  state.resources.forEach((r) => {
    const it = document.createElement("div");
    it.className = "item";
    it.innerHTML = `<div><span class='name'>${r}</span></div><div class='controls'><button class='small secondary' onclick="removeRes('${r}')">Del</button></div>`;
    rBox.appendChild(it);
  });

  const hBox = document.createElement("div");
  hBox.style.marginTop = "10px";
  hBox.innerHTML = '<div style="font-weight:700;margin-bottom:6px">Holds</div>';
  state.holds.forEach((h, i) => {
    const it = document.createElement("div");
    it.className = "item";
    it.innerHTML = `<div>${h.proc} → ${h.res}</div><div class='controls'><button class='small secondary' onclick="removeHold(${i})">Del</button></div>`;
    hBox.appendChild(it);
  });

  const wBox = document.createElement("div");
  wBox.style.marginTop = "10px";
  wBox.innerHTML = '<div style="font-weight:700;margin-bottom:6px">Waits</div>';
  state.waits.forEach((w, i) => {
    const it = document.createElement("div");
    it.className = "item";
    it.innerHTML = `<div>${w.proc} waits → ${w.res}</div><div class='controls'><button class='small secondary' onclick="removeWait(${i})">Del</button></div>`;
    wBox.appendChild(it);
  });

  lists.appendChild(pBox);
  lists.appendChild(rBox);
  lists.appendChild(hBox);
  lists.appendChild(wBox);
}

// CRUD actions
function addProc() {
  const name = procName.value.trim();
  if (!name) return showNotification("Please enter a process name", "error");
  if (state.processes.includes(name))
    return showNotification("Process already exists", "warning");
  state.processes.push(name);
  refreshSelects();
  procName.value = "";
  showNotification(`Process "${name}" added`, "success", 2000);
}
function addRes() {
  const name = resName.value.trim();
  if (!name) return showNotification("Please enter a resource name", "error");
  if (state.resources.includes(name))
    return showNotification("Resource already exists", "warning");
  state.resources.push(name);
  refreshSelects();
  resName.value = "";
  showNotification(`Resource "${name}" added`, "success", 2000);
}
function removeProc(name) {
  state.processes = state.processes.filter((p) => p !== name);
  state.holds = state.holds.filter((h) => h.proc !== name);
  state.waits = state.waits.filter((w) => w.proc !== name);
  refreshSelects();
  drawGraph();
  showNotification(`Process "${name}" removed`, "success", 2000);
}
function removeRes(name) {
  state.resources = state.resources.filter((r) => r !== name);
  state.holds = state.holds.filter((h) => h.res !== name);
  state.waits = state.waits.filter((w) => w.res !== name);
  refreshSelects();
  drawGraph();
  showNotification(`Resource "${name}" removed`, "success", 2000);
}
function removeHold(i) {
  const hold = state.holds[i];
  state.holds.splice(i, 1);
  refreshSelects();
  drawGraph();
  if (hold)
    showNotification(
      `Hold ${hold.proc} → ${hold.res} removed`,
      "success",
      2000
    );
}
function removeWait(i) {
  const wait = state.waits[i];
  state.waits.splice(i, 1);
  refreshSelects();
  drawGraph();
  if (wait)
    showNotification(
      `Wait ${wait.proc} → ${wait.res} removed`,
      "success",
      2000
    );
}

addProcBtn.onclick = addProc;
addResBtn.onclick = addRes;
addHoldBtn.onclick = () => {
  const p = holdProc.value,
    r = holdRes.value;
  if (!p || !r)
    return showNotification("Please select both process and resource", "error");
  // avoid duplicates
  if (state.holds.find((h) => h.proc === p && h.res === r))
    return showNotification("This hold relationship already exists", "warning");
  state.holds.push({ proc: p, res: r });
  refreshSelects();
  drawGraph();
  showNotification(`Hold: ${p} → ${r}`, "success", 2000);
};
addWaitBtn.onclick = () => {
  const p = waitProc.value,
    r = waitRes.value;
  if (!p || !r)
    return showNotification("Please select both process and resource", "error");
  if (state.waits.find((w) => w.proc === p && w.res === r))
    return showNotification("This wait relationship already exists", "warning");
  state.waits.push({ proc: p, res: r });
  refreshSelects();
  drawGraph();
  showNotification(`Wait: ${p} waits for ${r}`, "success", 2000);
};

document.getElementById("clearHolds").onclick = () => {
  if (state.holds.length === 0)
    return showNotification("No holds to clear", "info");
  state.holds = [];
  refreshSelects();
  drawGraph();
  showNotification("All holds cleared", "success", 2000);
};
document.getElementById("clearWaits").onclick = () => {
  if (state.waits.length === 0)
    return showNotification("No waits to clear", "info");
  state.waits = [];
  refreshSelects();
  drawGraph();
  showNotification("All waits cleared", "success", 2000);
};
document.getElementById("resetAll").onclick = () => {
  if (state.processes.length === 0 && state.resources.length === 0)
    return showNotification("Nothing to reset", "info");
  if (!confirm("Reset everything? This cannot be undone.")) return;
  state.processes = [];
  state.resources = [];
  state.holds = [];
  state.waits = [];
  refreshSelects();
  drawGraph();
  resultTitle.textContent = "Reset complete.";
  resultBody.textContent = "";
  showNotification("All data reset", "success");
};

// sample scenarios
document.getElementById("sample1").onclick = () => {
  // Simple deadlock: P1 holds R1; P2 holds R2; P1 waits R2; P2 waits R1
  state.processes = ["P1", "P2"];
  state.resources = ["R1", "R2"];
  state.holds = [
    { proc: "P1", res: "R1" },
    { proc: "P2", res: "R2" },
  ];
  state.waits = [
    { proc: "P1", res: "R2" },
    { proc: "P2", res: "R1" },
  ];
  refreshSelects();
  drawGraph();
  resultTitle.textContent = "Loaded sample: Simple Deadlock";
  resultBody.textContent = "Click Detect Deadlock to analyze.";
  showNotification("Simple deadlock sample loaded", "info");
};
document.getElementById("sample2").onclick = () => {
  // No deadlock: P1 holds R1; P2 waits R1; P2 holds R2
  state.processes = ["P1", "P2"];
  state.resources = ["R1", "R2"];
  state.holds = [
    { proc: "P1", res: "R1" },
    { proc: "P2", res: "R2" },
  ];
  state.waits = [{ proc: "P2", res: "R1" }];
  refreshSelects();
  drawGraph();
  resultTitle.textContent = "Loaded sample: No Deadlock";
  resultBody.textContent = "Click Detect Deadlock to analyze.";
  showNotification("No deadlock sample loaded", "info");
};

// Build wait-for graph: nodes are processes; edge P_a -> P_b if P_a waits for R and P_b holds R
function buildWaitForGraph() {
  const graph = {};
  // Handle empty case
  if (state.processes.length === 0) return graph;

  state.processes.forEach((p) => (graph[p] = []));
  state.waits.forEach((w) => {
    // Edge case: process might not exist in graph if it was removed
    if (!state.processes.includes(w.proc)) return;

    const holders = state.holds
      .filter((h) => h.res === w.res)
      .map((h) => h.proc);
    holders.forEach((hp) => {
      // Edge case: holder might not exist if process was removed
      if (!state.processes.includes(hp)) return;

      if (!graph[w.proc]) graph[w.proc] = [];
      if (hp !== w.proc && !graph[w.proc].includes(hp)) graph[w.proc].push(hp);
    });
  });
  return graph;
}

// DFS cycle detection that returns a cycle path (array) or null
function findCycle(graph) {
  // Edge case: empty graph
  if (Object.keys(graph).length === 0) return null;

  const visited = new Set();
  const stack = [];
  const onstack = new Set();
  let foundCycle = null;

  function dfs(node) {
    if (foundCycle) return true;
    if (!graph[node]) return false; // Edge case: node not in graph

    visited.add(node);
    stack.push(node);
    onstack.add(node);
    const neigh = graph[node] || [];

    for (const n of neigh) {
      if (!visited.has(n)) {
        if (dfs(n)) return true;
      } else if (onstack.has(n)) {
        // cycle found: extract path from stack
        const idx = stack.indexOf(n);
        foundCycle = stack.slice(idx).concat(n); // close cycle
        return true;
      }
    }
    stack.pop();
    onstack.delete(node);
    return false;
  }

  for (const node in graph) {
    if (!visited.has(node)) {
      if (dfs(node)) break;
    }
  }
  return foundCycle; // array path or null
}

// Step-by-step DFS cycle detection - generates steps for visualization
let algorithmSteps = [];
let currentStepIndex = 0;
let autoPlayInterval = null;

function findCycleStepByStep(graph) {
  algorithmSteps = [];
  currentStepIndex = 0;

  if (Object.keys(graph).length === 0) {
    algorithmSteps.push({
      step: 0,
      description: "Graph is empty. No cycles possible.",
      visited: [],
      stack: [],
      currentNode: null,
      checking: null,
      cycle: null,
    });
    return algorithmSteps;
  }

  const visited = new Set();
  const stack = [];
  const onstack = new Set();
  let foundCycle = null;
  let stepCounter = 0;

  function dfs(node, parent = null) {
    if (foundCycle) return true;
    if (!graph[node]) return false;

    // Step: Visit node
    stepCounter++;
    visited.add(node);
    stack.push(node);
    onstack.add(node);

    algorithmSteps.push({
      step: stepCounter,
      description: `Visiting node ${node}. Added to visited set and stack.`,
      visited: Array.from(visited),
      stack: [...stack],
      currentNode: node,
      checking: null,
      cycle: null,
      action: "visit",
    });

    const neigh = graph[node] || [];

    for (const n of neigh) {
      if (foundCycle) break;

      // Step: Check neighbor
      stepCounter++;
      algorithmSteps.push({
        step: stepCounter,
        description: `Checking neighbor ${n} of ${node}...`,
        visited: Array.from(visited),
        stack: [...stack],
        currentNode: node,
        checking: n,
        cycle: null,
        action: "check",
      });

      if (!visited.has(n)) {
        // Step: Recursive call
        stepCounter++;
        algorithmSteps.push({
          step: stepCounter,
          description: `${n} not visited. Recursively exploring ${n}...`,
          visited: Array.from(visited),
          stack: [...stack],
          currentNode: node,
          checking: n,
          cycle: null,
          action: "recurse",
        });

        if (dfs(n, node)) return true;
      } else if (onstack.has(n)) {
        // Cycle found!
        const idx = stack.indexOf(n);
        foundCycle = stack.slice(idx).concat(n);

        stepCounter++;
        algorithmSteps.push({
          step: stepCounter,
          description: `CYCLE DETECTED! ${n} is on the stack. Cycle: ${foundCycle.join(
            " → "
          )}`,
          visited: Array.from(visited),
          stack: [...stack],
          currentNode: node,
          checking: n,
          cycle: foundCycle,
          action: "cycle",
        });
        return true;
      } else {
        // Already visited but not on stack
        stepCounter++;
        algorithmSteps.push({
          step: stepCounter,
          description: `${n} was already visited and processed. No cycle through this path.`,
          visited: Array.from(visited),
          stack: [...stack],
          currentNode: node,
          checking: n,
          cycle: null,
          action: "skip",
        });
      }
    }

    // Step: Backtrack
    stack.pop();
    onstack.delete(node);
    stepCounter++;
    algorithmSteps.push({
      step: stepCounter,
      description: `Backtracking from ${node}. Removed from stack.`,
      visited: Array.from(visited),
      stack: [...stack],
      currentNode: null,
      checking: null,
      cycle: null,
      action: "backtrack",
    });

    return false;
  }

  // Start DFS from each unvisited node
  for (const node in graph) {
    if (!visited.has(node)) {
      stepCounter++;
      algorithmSteps.push({
        step: stepCounter,
        description: `Starting DFS from node ${node}...`,
        visited: Array.from(visited),
        stack: [...stack],
        currentNode: null,
        checking: null,
        cycle: null,
        action: "start",
      });

      if (dfs(node)) break;
    }
  }

  // Final step
  if (!foundCycle) {
    stepCounter++;
    algorithmSteps.push({
      step: stepCounter,
      description: "No cycles found. System is deadlock-free.",
      visited: Array.from(visited),
      stack: [],
      currentNode: null,
      checking: null,
      cycle: null,
      action: "complete",
    });
  }

  return algorithmSteps;
}

// Drawing
function drawGraph(cycle = null) {
  // Edge case: empty graph
  if (state.processes.length === 0 && state.resources.length === 0) {
    svg.innerHTML =
      '<text x="550" y="310" text-anchor="middle" fill="var(--muted)" font-size="14">Add processes and resources to visualize</text>';
    return;
  }

  // build positions: processes left column, resources right column
  const width = 1100,
    height = 620,
    margin = 40;
  const px = 200,
    rx = width - 200;
  const pCount = state.processes.length,
    rCount = state.resources.length;
  const pGap = Math.max(80, (height - 2 * margin) / Math.max(1, pCount));
  const rGap = Math.max(80, (height - 2 * margin) / Math.max(1, rCount));

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML =
    '<defs><marker id="arrowhead-hold" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="rgba(100,200,255,0.12)" /></marker><marker id="arrowhead-wait" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="rgba(160,200,255,0.18)" /></marker><marker id="arrowhead-cycle" markerWidth="12" markerHeight="12" refX="11" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#fb7185" /></marker></defs>';

  const procPositions = {};
  const resPositions = {};

  state.processes.forEach((p, i) => {
    const y = margin + i * pGap + 40;
    procPositions[p] = { x: px, y };
  });
  state.resources.forEach((r, i) => {
    const y = margin + i * rGap + 40;
    resPositions[r] = { x: rx, y };
  });

  // draw holds as solid arrows from process -> resource
  state.holds.forEach((h) => {
    const from = procPositions[h.proc];
    const to = resPositions[h.res];
    if (!from || !to) return;
    const path = makeArrowPath(from.x + 28, from.y, to.x - 28, to.y);
    const el = createPathElement(path, "hold");
    svg.appendChild(el);
  });

  // draw waits as dashed arrows from process -> resource (colored by cycle)
  state.waits.forEach((w) => {
    const from = procPositions[w.proc];
    const to = resPositions[w.res];
    if (!from || !to) return;
    const path = makeArrowPath(from.x + 28, from.y, to.x - 28, to.y);
    const el = createPathElement(path, "wait");
    svg.appendChild(el);
  });

  // Draw nodes (resources & processes)
  // first resources
  state.resources.forEach((r) => {
    const pos = resPositions[r];
    if (!pos) return;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${pos.x},${pos.y})`);
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", -28);
    rect.setAttribute("y", -18);
    rect.setAttribute("width", 56);
    rect.setAttribute("height", 36);
    rect.setAttribute("rx", 6);
    rect.setAttribute("fill", "#0b2540");
    rect.setAttribute("stroke", "rgba(255,255,255,0.03)");
    rect.setAttribute("stroke-width", 1);
    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", 0);
    txt.setAttribute("y", 5);
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("font-size", "12");
    txt.textContent = r;
    txt.setAttribute("fill", "#bfe0ff");
    g.appendChild(rect);
    g.appendChild(txt);
    svg.appendChild(g);
  });

  // processes
  state.processes.forEach((p) => {
    const pos = procPositions[p];
    if (!pos) return;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${pos.x},${pos.y})`);
    const circ = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circ.setAttribute("r", 18);
    circ.setAttribute("fill", "#042b46");
    circ.setAttribute("stroke", "rgba(255,255,255,0.03)");
    circ.setAttribute("stroke-width", 1);
    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", 0);
    txt.setAttribute("y", 5);
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("font-size", "12");
    txt.textContent = p;
    txt.setAttribute("fill", "#bfe0ff");
    g.appendChild(circ);
    g.appendChild(txt);
    svg.appendChild(g);
  });

  // if cycle provided, highlight implicated edges and nodes
  if (cycle) {
    // cycle is array like [A,B,C,A]; nodes in cycle are unique elements except last repeated
    const nodes = Array.from(new Set(cycle.slice(0, -1)));
    // highlight nodes
    nodes.forEach((n) => {
      // find process? Only processes are nodes in WFG
      const pos = procPositions[n];
      if (pos) {
        const highlight = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        highlight.setAttribute("cx", pos.x);
        highlight.setAttribute("cy", pos.y);
        highlight.setAttribute("r", 28);
        highlight.setAttribute("fill", "none");
        highlight.setAttribute(
          "stroke",
          getComputedStyle(document.documentElement).getPropertyValue(
            "--danger"
          ) || "#fb7185"
        );
        highlight.setAttribute("stroke-width", 3);
        svg.appendChild(highlight);
      }
    });

    // highlight edges between processes according to waits->holders mapping
    for (let i = 0; i < cycle.length - 1; i++) {
      const a = cycle[i];
      const b = cycle[i + 1];
      // find resource(s) that cause a -> b (i.e., a waits for res held by b)
      const matched = state.waits
        .filter((w) => w.proc === a)
        .map((w) =>
          state.holds
            .filter((h) => h.res === w.res && h.proc === b)
            .map((h) => h.res)
        )
        .flat();
      matched.forEach((resName) => {
        const from = procPositions[a];
        const to = resPositions[resName];
        if (!from || !to) return;
        const path = makeArrowPath(from.x + 28, from.y, to.x - 28, to.y);
        const el = createPathElement(path, "cycle");
        svg.appendChild(el);
        // also draw resource->holding process edge as highlight
        const holdPath = makeArrowPath(
          to.x - 28,
          to.y,
          procPositions[b].x + 28,
          procPositions[b].y
        );
        const el2 = createPathElement(holdPath, "cycle");
        svg.appendChild(el2);
      });
    }
  }
}

function makeArrowPath(x1, y1, x2, y2) {
  // simple curved path
  const dx = Math.abs(x2 - x1);
  const dy = y2 - y1;
  const cx1 = x1 + (x2 - x1) / 2;
  const cy1 = y1;
  const cx2 = x1 + (x2 - x1) / 2;
  const cy2 = y2;
  return `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`;
}

function createPathElement(d, type) {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  if (type === "hold") {
    path.setAttribute("stroke", "rgba(100,200,255,0.12)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("marker-end", "url(#arrowhead-hold)");
  } else if (type === "wait") {
    path.setAttribute("stroke", "rgba(160,200,255,0.18)");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-dasharray", "6,6");
    path.setAttribute("marker-end", "url(#arrowhead-wait)");
  } else if (type === "cycle") {
    path.setAttribute(
      "stroke",
      getComputedStyle(document.documentElement).getPropertyValue("--danger") ||
        "#fb7185"
    );
    path.setAttribute("stroke-width", "3");
    path.setAttribute("marker-end", "url(#arrowhead-cycle)");
  }
  return path;
}

// Step-by-step visualization functions
function showStep(stepIndex) {
  if (!algorithmSteps || algorithmSteps.length === 0) return;

  if (stepIndex < 0) stepIndex = 0;
  if (stepIndex >= algorithmSteps.length) stepIndex = algorithmSteps.length - 1;

  currentStepIndex = stepIndex;
  const step = algorithmSteps[stepIndex];

  // Update UI
  document.getElementById("currentStepNum").textContent = step.step;
  document.getElementById("totalSteps").textContent = algorithmSteps.length;
  document.getElementById("stepDescription").textContent = step.description;
  document.getElementById("visitedNodes").textContent =
    step.visited.length > 0 ? step.visited.join(", ") : "-";
  document.getElementById("stackState").textContent =
    step.stack.length > 0 ? `[${step.stack.join(" → ")}]` : "[]";

  // Update buttons
  document.getElementById("prevStep").disabled = stepIndex === 0;
  document.getElementById("nextStep").disabled =
    stepIndex === algorithmSteps.length - 1;

  // Draw graph with step highlighting
  drawGraphWithStep(step);

  // Update result
  if (step.cycle) {
    resultTitle.textContent = "Deadlock Detected ☠️";
    resultBody.innerHTML = `<div style="color:var(--muted)">Cycle found: <strong>${step.cycle.join(
      " → "
    )}</strong></div>`;
  } else if (step.action === "complete") {
    resultTitle.textContent = "No Deadlock Detected ✅";
    resultBody.textContent = "No cycles found in the wait-for graph.";
  } else {
    resultTitle.textContent = "Algorithm Running...";
    resultBody.textContent = step.description;
  }
}

function drawGraphWithStep(step) {
  const graph = buildWaitForGraph();
  const cycle = step.cycle || null;

  // Edge case: empty graph
  if (state.processes.length === 0 && state.resources.length === 0) {
    svg.innerHTML =
      '<text x="550" y="310" text-anchor="middle" fill="var(--muted)" font-size="14">Add processes and resources to visualize</text>';
    return;
  }

  // build positions: processes in a grid layout for WFG
  const width = 1100,
    height = 620,
    margin = 40;
  const pCount = state.processes.length;
  const cols = Math.ceil(Math.sqrt(pCount));
  const rows = Math.ceil(pCount / cols);
  const cellWidth = (width - 2 * margin) / cols;
  const cellHeight = (height - 2 * margin) / rows;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML =
    '<defs><marker id="arrowhead-wait" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="rgba(160,200,255,0.5)" /></marker><marker id="arrowhead-cycle" markerWidth="12" markerHeight="12" refX="11" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#fb7185" /></marker></defs>';

  const procPositions = {};

  // Position processes in grid
  state.processes.forEach((p, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = margin + col * cellWidth + cellWidth / 2;
    const y = margin + row * cellHeight + cellHeight / 2;
    procPositions[p] = { x, y };
  });

  // Draw wait-for graph edges (process to process)
  const wfg = buildWaitForGraph();
  for (const proc in wfg) {
    wfg[proc].forEach((targetProc) => {
      const from = procPositions[proc];
      const to = procPositions[targetProc];
      if (from && to) {
        const path = makeArrowPath(from.x, from.y, to.x, to.y);
        const el = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        el.setAttribute("d", path);
        el.setAttribute("fill", "none");
        el.setAttribute("stroke", "rgba(160,200,255,0.5)");
        el.setAttribute("stroke-width", "2");
        el.setAttribute("marker-end", "url(#arrowhead-wait)");
        svg.appendChild(el);
      }
    });
  }

  // Draw nodes (processes only for WFG)
  state.processes.forEach((p) => {
    const pos = procPositions[p];
    if (!pos) return;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${pos.x},${pos.y})`);

    // Highlight current node
    let fillColor = "#042b46";
    let strokeColor = "rgba(255,255,255,0.1)";
    let strokeWidth = 1;
    let r = 20;

    if (step.currentNode === p) {
      fillColor = "#1e40af";
      strokeColor = "#60a5fa";
      strokeWidth = 4;
      r = 24;
    } else if (step.visited.includes(p)) {
      fillColor = "#065f46";
      strokeColor = "#34d399";
      strokeWidth = 2;
    }

    // Highlight node being checked
    if (step.checking === p && step.currentNode !== p) {
      fillColor = "#7c2d12";
      strokeColor = "#fbbf24";
      strokeWidth = 3;
    }

    const circ = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circ.setAttribute("r", r);
    circ.setAttribute("fill", fillColor);
    circ.setAttribute("stroke", strokeColor);
    circ.setAttribute("stroke-width", strokeWidth);

    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", 0);
    txt.setAttribute("y", 6);
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("font-size", "13");
    txt.setAttribute("font-weight", "600");
    txt.textContent = p;
    txt.setAttribute("fill", "#bfe0ff");

    g.appendChild(circ);
    g.appendChild(txt);
    svg.appendChild(g);
  });

  // Highlight cycle if found
  if (cycle) {
    const nodes = Array.from(new Set(cycle.slice(0, -1)));
    nodes.forEach((n) => {
      const pos = procPositions[n];
      if (pos) {
        const highlight = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        highlight.setAttribute("cx", pos.x);
        highlight.setAttribute("cy", pos.y);
        highlight.setAttribute("r", 32);
        highlight.setAttribute("fill", "none");
        highlight.setAttribute("stroke", "#fb7185");
        highlight.setAttribute("stroke-width", 4);
        highlight.setAttribute("opacity", "0.8");
        svg.appendChild(highlight);
      }
    });

    // Draw cycle edges
    for (let i = 0; i < cycle.length - 1; i++) {
      const from = procPositions[cycle[i]];
      const to = procPositions[cycle[i + 1]];
      if (from && to) {
        const path = makeArrowPath(from.x, from.y, to.x, to.y);
        const el = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        el.setAttribute("d", path);
        el.setAttribute("fill", "none");
        el.setAttribute("stroke", "#fb7185");
        el.setAttribute("stroke-width", "4");
        el.setAttribute("marker-end", "url(#arrowhead-cycle)");
        svg.appendChild(el);
      }
    }
  }

  // Add label
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", width / 2);
  label.setAttribute("y", 25);
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("font-size", "14");
  label.setAttribute("fill", "var(--accent)");
  label.setAttribute("font-weight", "600");
  label.textContent = "Wait-For Graph (WFG) - Process to Process";
  svg.appendChild(label);
}

// Analysis
detectBtn.onclick = () => {
  // Edge case: no processes
  if (state.processes.length === 0) {
    showNotification("Add at least one process to detect deadlocks", "warning");
    return;
  }

  const graph = buildWaitForGraph();
  const cycle = findCycle(graph);
  if (cycle) {
    resultTitle.textContent = "Deadlock Detected ☠️";
    resultBody.innerHTML = `<div style="color:var(--muted)">A cycle was found in the wait-for graph: <strong>${cycle.join(
      " → "
    )}</strong></div>`;
    drawGraph(cycle);
    showNotification(
      `Deadlock detected: ${cycle.slice(0, -1).join(" → ")}`,
      "error",
      5000
    );
  } else {
    resultTitle.textContent = "No Deadlock Detected ✅";
    resultBody.textContent = "No cycles found in the wait-for graph.";
    drawGraph();
    showNotification("No deadlock detected - system is safe", "success", 3000);
  }
};

// Step-by-step mode
document.getElementById("stepByStep").onclick = () => {
  if (state.processes.length === 0) {
    showNotification("Add at least one process to detect deadlocks", "warning");
    return;
  }

  const graph = buildWaitForGraph();
  findCycleStepByStep(graph);

  // Show controls
  document.getElementById("stepControls").style.display = "block";
  currentStepIndex = 0;
  showStep(0);
  showNotification("Step-by-step mode activated", "info");
};

// Step navigation
document.getElementById("nextStep").onclick = () => {
  if (currentStepIndex < algorithmSteps.length - 1) {
    showStep(currentStepIndex + 1);
  }
};

document.getElementById("prevStep").onclick = () => {
  if (currentStepIndex > 0) {
    showStep(currentStepIndex - 1);
  }
};

document.getElementById("resetSteps").onclick = () => {
  currentStepIndex = 0;
  showStep(0);
};

document.getElementById("closeStepMode").onclick = () => {
  document.getElementById("stepControls").style.display = "none";
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
  drawGraph();
};

// Auto-play
document.getElementById("autoPlay").onclick = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
    document.getElementById("autoPlay").textContent = "▶ Auto Play";
    return;
  }

  document.getElementById("autoPlay").textContent = "⏸ Pause";
  autoPlayInterval = setInterval(() => {
    if (currentStepIndex < algorithmSteps.length - 1) {
      showStep(currentStepIndex + 1);
    } else {
      clearInterval(autoPlayInterval);
      autoPlayInterval = null;
      document.getElementById("autoPlay").textContent = "▶ Auto Play";
    }
  }, 1500);
};

// Download report
downloadReport.onclick = () => {
  if (state.processes.length === 0 && state.resources.length === 0) {
    showNotification("No data to export", "warning");
    return;
  }

  const graph = buildWaitForGraph();
  const cycle = findCycle(graph);
  const report = {
    timestamp: new Date().toISOString(),
    processes: state.processes.slice(),
    resources: state.resources.slice(),
    holds: state.holds.slice(),
    waits: state.waits.slice(),
    waitForGraph: graph,
    cycle: cycle,
    deadlockDetected: cycle !== null,
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `deadlock-report-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showNotification("Report downloaded successfully", "success", 2000);
};

// initial draw
refreshSelects();
drawGraph();
setupKeyboardNavigation();

// expose helpers for inline onclick usage (remove etc.)
window.removeProc = removeProc;
window.removeRes = removeRes;
window.removeHold = removeHold;
window.removeWait = removeWait;
window.drawGraph = drawGraph;

// 2025-11-30T17:13:05 - Rev 5: improve cycle highlight visuals

// 2025-11-30T17:13:15 - Rev 7: code cleanup and comments
