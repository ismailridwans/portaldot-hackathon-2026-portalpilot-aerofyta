// Zero-dependency Portaldot mainnet connectivity probe (Node 24 global WebSocket)
const URL = process.env.PORTALDOT_WS || "wss://mainnet.portaldot.io";
const calls = [
  ["system_chain", []],
  ["system_name", []],
  ["system_version", []],
  ["system_properties", []],
  ["system_health", []],
  ["system_chainType", []],
  ["state_getRuntimeVersion", []],
  ["chain_getHeader", []],
  ["chain_getFinalizedHead", []],
  ["rpc_methods", []],
];

const ws = new WebSocket(URL);
let id = 1;
const pending = new Map();
const results = {};
const timeout = setTimeout(() => {
  console.log("TIMEOUT after 20s. Partial results:\n" + JSON.stringify(results, null, 2));
  try { ws.close(); } catch {}
  process.exit(1);
}, 20000);

ws.addEventListener("open", () => {
  console.log("OPEN " + URL);
  for (const [method, params] of calls) {
    const myid = id++;
    pending.set(myid, method);
    ws.send(JSON.stringify({ jsonrpc: "2.0", id: myid, method, params }));
  }
});

ws.addEventListener("message", (ev) => {
  let msg;
  try { msg = JSON.parse(ev.data); } catch { return; }
  const method = pending.get(msg.id);
  if (!method) return;
  pending.delete(msg.id);
  results[method] = msg.result ?? msg.error;
  if (pending.size === 0) {
    clearTimeout(timeout);
    console.log(JSON.stringify(results, null, 2));
    try { ws.close(); } catch {}
    process.exit(0);
  }
});

ws.addEventListener("error", (e) => {
  console.log("WS ERROR: " + (e && (e.message || e.error || JSON.stringify(e)) || "unknown"));
  clearTimeout(timeout);
  process.exit(2);
});
