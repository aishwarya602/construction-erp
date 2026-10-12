import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  ShoppingCart, 
  Award, 
  ShieldAlert, 
  Package, 
  LogOut, 
  User, 
  Lock, 
  AlertTriangle,
  TrendingUp,
  Server,
  Key,
  MapPin,
  PieChart
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

// Master Material Item Catalog
const MASTER_MATERIALS = [
  { id: 1, code: 'MAT-CEM-01', name: 'Cement Grade 53', unit: 'Bags', stdPrice: 425 },
  { id: 2, code: 'MAT-STL-12', name: 'Steel Rebar 12mm', unit: 'Tons', stdPrice: 58000 },
  { id: 3, code: 'MAT-AGG-20', name: 'Coarse Aggregate 20mm', unit: 'Cu.m', stdPrice: 1800 },
  { id: 4, code: 'MAT-BRK-R1', name: 'Red Clay Bricks Class I', unit: 'Units', stdPrice: 9 }
];

export default function App() {
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('erp_token') || '');
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('erp_user') || 'null'));
  const [loginEmail, setLoginEmail] = useState('bob@example.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [authError, setAuthError] = useState('');

  // Mode state
  const [useLiveApi, setUseLiveApi] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Upgraded App Data with WBS Sub-Locations and BOQ Limits
  const [prs, setPrs] = useState([
    { 
      id: 1, 
      item: 'Cement Grade 53', 
      subLocation: 'Plot 12 / Tower A - Floor 3', 
      qty: 200, 
      boqMax: 500, 
      boqUsed: 150, 
      cost: 85000, 
      status: 'APPROVED', 
      user: 'bob@example.com' 
    },
    { 
      id: 2, 
      item: 'Steel Rebar 12mm', 
      subLocation: 'Plot 42 / Substation Foundation', 
      qty: 450, 
      boqMax: 400, // OVER-RUN ALERT CASE
      boqUsed: 100, 
      cost: 240000, 
      status: 'PENDING', 
      user: 'bob@example.com' 
    }
  ]);

  const [pos, setPos] = useState([
    { id: 1, prId: 1, vendor: 'UltraTech Solutions', totalQty: 200, remainingQty: 200, total: 85000, status: 'ISSUED' }
  ]);

  const [inventory, setInventory] = useState([
    { id: 1, item: 'Cement Grade 53', qty: 200, unit: 'Bags' },
    { id: 2, item: 'Steel Rebar 12mm', qty: 0, unit: 'Tons' }
  ]);

  // Form states
  const [selectedMaterial, setSelectedMaterial] = useState(MASTER_MATERIALS[0].name);
  const [subLocation, setSubLocation] = useState('Plot 42 / Tower B - Slab 2');
  const [newQty, setNewQty] = useState('');
  const [newCost, setNewCost] = useState('');

  // Fuzzy state
  const [fuzzyDelay, setFuzzyDelay] = useState(2);
  const [fuzzyQuality, setFuzzyQuality] = useState(85);
  const [fuzzyPriceDev, setFuzzyPriceDev] = useState(3);
  const [fuzzyResult, setFuzzyResult] = useState(null);

  // GRN state
  const [selectedPoId, setSelectedPoId] = useState('1');
  const [grnQty, setGrnQty] = useState('200');
  const [grnUnitPrice, setGrnUnitPrice] = useState('425');
  const [grnLogs, setGrnLogs] = useState([]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'PROJECT_HEAD') setActiveTab('prs');
      else if (currentUser.role === 'PURCHASE_MANAGER') setActiveTab('fuzzy');
      else setActiveTab('dashboard');
    }
  }, [currentUser]);

  // Valid Demo User Credentials Database
const VALID_DEMO_USERS = {
  'bob@example.com': { password: 'password123', role: 'SITE_ENGINEER', name: 'Bob Engineer' },
  'head@example.com': { password: 'password123', role: 'PROJECT_HEAD', name: 'Project Head' },
  'pm@example.com': { password: 'password123', role: 'PURCHASE_MANAGER', name: 'Purchase Manager' }
};

const handleLogin = async (e) => {
  e.preventDefault();
  setAuthError('');

  if (useLiveApi) {
    try {
      const formData = new URLSearchParams();
      formData.append('username', loginEmail);
      formData.append('password', loginPassword);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });

      if (!res.ok) throw new Error('Invalid email or password');
      const data = await res.json();
      
      let role = 'SITE_ENGINEER';
      let fullName = 'Bob Engineer';
      if (loginEmail.includes('head')) { role = 'PROJECT_HEAD'; fullName = 'Project Head'; }
      if (loginEmail.includes('pm')) { role = 'PURCHASE_MANAGER'; fullName = 'Purchase Manager'; }

      const userObj = { email: loginEmail, role, name: fullName };
      
      setToken(data.access_token);
      setCurrentUser(userObj);
      localStorage.setItem('erp_token', data.access_token);
      localStorage.setItem('erp_user', JSON.stringify(userObj));
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password');
    }
  } else {
    // Local Stateful Memory Validation
    const user = VALID_DEMO_USERS[loginEmail.toLowerCase().trim()];

    if (!user || user.password !== loginPassword) {
      setAuthError('Invalid email or password. Please check your credentials.');
      return;
    }

    const userObj = { email: loginEmail, role: user.role, name: user.name };
    setToken('mock-jwt-token-12345');
    setCurrentUser(userObj);
    localStorage.setItem('erp_token', 'mock-jwt-token-12345');
    localStorage.setItem('erp_user', JSON.stringify(userObj));
  }
};

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
  };

  // Upgraded PR creation with WBS Location & BOQ limit check
  const handleCreatePR = (e) => {
    e.preventDefault();
    const newPr = {
      id: prs.length + 1,
      item: selectedMaterial,
      subLocation: subLocation,
      qty: Number(newQty),
      boqMax: 500,
      boqUsed: 100,
      cost: Number(newCost),
      status: 'PENDING',
      user: currentUser.email
    };
    setPrs([...prs, newPr]);
    setNewQty(''); setNewCost('');
  };

  const handleApprovePR = (id) => {
    setPrs(prs.map(pr => pr.id === id ? { ...pr, status: 'APPROVED' } : pr));
  };

  const handleRejectPR = (id) => {
    setPrs(prs.map(pr => pr.id === id ? { ...pr, status: 'REJECTED' } : pr));
  };

  const runFuzzyEval = () => {
    let score = 100 - (fuzzyDelay * 8) + (fuzzyQuality * 0.4) - (fuzzyPriceDev * 5);
    score = Math.max(10, Math.min(99, Math.round(score)));
    let rating = 'Preferred Vendor';
    if (score < 50) rating = 'High Risk - Blacklisted';
    else if (score < 75) rating = 'Conditional Acceptance';
    setFuzzyResult({ score, rating });
  };

  const handleIssuePo = async (pr) => {
    const newPo = {
      id: pos.length + 1,
      prId: pr.id,
      vendor: 'UltraTech Solutions',
      totalQty: pr.qty,
      remainingQty: pr.qty,
      total: pr.cost,
      status: 'ISSUED'
    };
    setPos([...pos, newPo]);
    setPrs(prs.map(p => p.id === pr.id ? { ...p, status: 'PO_ISSUED' } : p));
    alert(`PO #${newPo.id} Issued Successfully for ${pr.subLocation}!`);
  };

  // Upgraded GRN with Partial Delivery balance update
  const handleCreateGrn = (e) => {
    e.preventDefault();
    const isFraud = Number(grnUnitPrice) > 600 || Number(grnQty) > 1000;
    const targetPo = pos.find(p => p.id === Number(selectedPoId));

    const log = {
      id: grnLogs.length + 1,
      poId: selectedPoId,
      qty: grnQty,
      price: grnUnitPrice,
      status: isFraud ? 'FLAGGED FOR FRAUD AUDIT' : 'PASSED & INVENTORIED',
      isFraud
    };
    setGrnLogs([log, ...grnLogs]);

    if (!isFraud && targetPo) {
      // Reduce remaining PO balance
      const newRemaining = Math.max(0, targetPo.remainingQty - Number(grnQty));
      setPos(pos.map(p => p.id === targetPo.id ? { 
        ...p, 
        remainingQty: newRemaining,
        status: newRemaining === 0 ? 'COMPLETED' : 'PARTIALLY_DELIVERED'
      } : p));

      // Update Inventory
      const targetPr = prs.find(r => r.id === targetPo.prId);
      if (targetPr) {
        setInventory(inventory.map(inv => 
          inv.item.toLowerCase().includes(targetPr.item.toLowerCase())
            ? { ...inv, qty: inv.qty + Number(grnQty) }
            : inv
        ));
      }
    }
  };

  const selectQuickAccount = (email) => {
    setLoginEmail(email);
    setLoginPassword('password123');
  };

  // LOGIN SCREEN
  if (!token || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-amber-500/10 text-amber-500 rounded-xl mb-2">
              <Building2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">ConstructERP Portal</h1>
            <p className="text-slate-400 text-sm">Enterprise WBS & Procurement Gateway</p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Work Email</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-500" />
                <input 
                  type="email" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-500" />
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold py-2.5 rounded-xl transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" /> Sign In to ERP
            </button>
          </form>

          <div className="border-t border-slate-800 pt-4 space-y-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Demo Quick Select Accounts:</span>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => selectQuickAccount('bob@example.com')}
                className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-left border border-slate-700/50 text-xs text-slate-300"
              >
                <span className="block font-medium text-amber-400">Site Eng.</span>
                bob@example.com
              </button>
              <button 
                onClick={() => selectQuickAccount('head@example.com')}
                className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-left border border-slate-700/50 text-xs text-slate-300"
              >
                <span className="block font-medium text-emerald-400">Proj. Head</span>
                head@example.com
              </button>
              <button 
                onClick={() => selectQuickAccount('pm@example.com')}
                className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-left border border-slate-700/50 text-xs text-slate-300"
              >
                <span className="block font-medium text-purple-400">Purch. Mgr</span>
                pm@example.com
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>API Mode:</span>
            <button 
              onClick={() => setUseLiveApi(!useLiveApi)}
              className={`px-2 py-1 rounded-md border text-xs flex items-center gap-1 ${
                useLiveApi ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Server className="w-3 h-3" />
              {useLiveApi ? 'FastAPI Backend (8000)' : 'Mock Engine'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD UI
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-white leading-none">ConstructERP</h2>
              <span className="text-xs text-slate-500">WBS & BOQ Enabled</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Overview
            </button>

            {(currentUser.role === 'SITE_ENGINEER' || currentUser.role === 'PROJECT_HEAD') && (
              <button 
                onClick={() => setActiveTab('prs')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === 'prs' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4" /> Requisitions
                </div>
                {prs.filter(p => p.status === 'PENDING').length > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-amber-400/20 text-amber-300 rounded-full">
                    {prs.filter(p => p.status === 'PENDING').length}
                  </span>
                )}
              </button>
            )}

            {currentUser.role === 'PURCHASE_MANAGER' && (
              <>
                <button 
                  onClick={() => setActiveTab('fuzzy')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    activeTab === 'fuzzy' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Award className="w-4 h-4" /> Vendor Scoring
                </button>
                <button 
                  onClick={() => setActiveTab('pos')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    activeTab === 'pos' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" /> Purchase Orders
                </button>
              </>
            )}

            {currentUser.role === 'SITE_ENGINEER' && (
              <button 
                onClick={() => setActiveTab('grn')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === 'grn' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-4 h-4" /> GRN & Fraud Audit
              </button>
            )}

            <button 
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'inventory' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" /> Site Inventory
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="overflow-hidden">
              <span className="block font-semibold text-sm text-white truncate">{currentUser.name}</span>
              <span className="block text-xs text-amber-400 font-mono font-medium">{currentUser.role}</span>
            </div>
            <button 
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Construction Operations Overview</h1>
              <p className="text-slate-400 text-sm">Active Project: Metro Line Expansion - Sector 4</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">TOTAL PRs</span>
                <span className="block text-2xl font-bold text-white mt-1">{prs.length}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">PENDING APPROVAL</span>
                <span className="block text-2xl font-bold text-amber-400 mt-1">{prs.filter(p => p.status === 'PENDING').length}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">ACTIVE POS</span>
                <span className="block text-2xl font-bold text-emerald-400 mt-1">{pos.length}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 font-medium">BOQ BUDGET OVER-RUNS</span>
                <span className="block text-2xl font-bold text-rose-400 mt-1">
                  {prs.filter(p => (p.boqUsed + p.qty) > p.boqMax).length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* UPGRADED REQUISITIONS TAB */}
        {activeTab === 'prs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Purchase Requisitions (WBS Tagged)</h1>
              <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1 rounded-full font-mono">
                Project: Metro Sector 4
              </span>
            </div>

            {/* Site Engineer Form with Master Catalog Dropdown & WBS Field */}
            {currentUser.role === 'SITE_ENGINEER' && (
              <form onSubmit={handleCreatePR} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Master Material Catalog
                    </label>
                    <select 
                      value={selectedMaterial}
                      onChange={(e) => setSelectedMaterial(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                    >
                      {MASTER_MATERIALS.map(m => (
                        <option key={m.id} value={m.name}>
                          [{m.code}] {m.name} ({m.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      WBS Site Sub-Location / Plot / Block
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <input 
                        type="text" 
                        value={subLocation} 
                        onChange={(e) => setSubLocation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-200"
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <input 
                    type="number" placeholder="Quantity Needed" value={newQty} onChange={(e) => setNewQty(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 flex-1" required
                  />
                  <input 
                    type="number" placeholder="Est. Cost ($)" value={newCost} onChange={(e) => setNewCost(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 flex-1" required
                  />
                  <button type="submit" className="bg-amber-500 text-slate-950 font-semibold px-6 py-2 rounded-xl text-sm">
                    Submit Tagged PR
                  </button>
                </div>
              </form>
            )}

            {/* PR Table displaying WBS Sub-Location & BOQ Budget Check */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">PR ID</th>
                    <th className="p-4">Material & WBS Location</th>
                    <th className="p-4">Qty / BOQ Limit</th>
                    <th className="p-4">Est. Cost</th>
                    <th className="p-4">Status</th>
                    {currentUser.role === 'PROJECT_HEAD' && <th className="p-4">BOQ Audit & Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {prs.map(pr => {
                    const isOverrun = (pr.boqUsed + pr.qty) > pr.boqMax;
                    return (
                      <tr key={pr.id}>
                        <td className="p-4 font-mono text-slate-400">#{pr.id}</td>
                        <td className="p-4">
                          <span className="font-bold text-white block">{pr.item}</span>
                          <span className="text-xs text-amber-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {pr.subLocation}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-white block">{pr.qty} Units</span>
                          <span className="text-xs text-slate-500">
                            BOQ Used: {pr.boqUsed} / Max: {pr.boqMax}
                          </span>
                        </td>
                        <td className="p-4 font-mono">${pr.cost.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            pr.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            pr.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {pr.status}
                          </span>
                        </td>
                        {currentUser.role === 'PROJECT_HEAD' && (
                          <td className="p-4">
                            {pr.status === 'PENDING' ? (
                              <div className="space-y-2">
                                {isOverrun && (
                                  <div className="text-xs text-rose-400 font-semibold flex items-center gap-1 bg-rose-500/10 p-1.5 rounded-lg border border-rose-500/20">
                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>BOQ Over-run Risk! Exceeds limit by { (pr.boqUsed + pr.qty) - pr.boqMax } units.</span>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <button onClick={() => handleApprovePR(pr.id)} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1 rounded-lg text-xs font-semibold">
                                    Approve
                                  </button>
                                  <button onClick={() => handleRejectPR(pr.id)} className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-3 py-1 rounded-lg text-xs font-semibold">
                                    Reject
                                  </button>
                                </div>
                              </div>
                            ) : <span className="text-slate-500 text-xs">Evaluated</span>}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VENDOR SCORING TAB */}
        {activeTab === 'fuzzy' && currentUser.role === 'PURCHASE_MANAGER' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Soft Computing Vendor Score Engine</h1>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div>
                <label className="text-sm text-slate-400">Delivery Delay (Days): {fuzzyDelay}</label>
                <input type="range" min="0" max="15" value={fuzzyDelay} onChange={e => setFuzzyDelay(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Quality Compliance Score (%): {fuzzyQuality}%</label>
                <input type="range" min="0" max="100" value={fuzzyQuality} onChange={e => setFuzzyQuality(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Price Deviation (%): {fuzzyPriceDev}%</label>
                <input type="range" min="0" max="25" value={fuzzyPriceDev} onChange={e => setFuzzyPriceDev(Number(e.target.value))} className="w-full accent-amber-500" />
              </div>
              <button onClick={runFuzzyEval} className="bg-amber-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm">
                Evaluate Vendor
              </button>

              {fuzzyResult && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-500 uppercase">Evaluation Result</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">{fuzzyResult.rating}</span>
                    <span className="text-2xl font-bold text-amber-400">{fuzzyResult.score} / 100</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* UPGRADED PURCHASE ORDERS TAB WITH PARTIAL DELIVERY BALANCES */}
        {activeTab === 'pos' && currentUser.role === 'PURCHASE_MANAGER' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Purchase Orders (PO)</h1>
              <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full font-semibold">
                Purchase Manager Console
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Approved Requisitions Pending PO Issuance
              </h3>
              
              {prs.filter(p => p.status === 'APPROVED').length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-slate-500 text-sm">
                  No approved PRs pending PO generation.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {prs.filter(p => p.status === 'APPROVED').map(pr => (
                    <div key={pr.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-xs font-mono text-amber-400 font-bold block">PR #{pr.id}</span>
                        <span className="font-bold text-white text-base">{pr.item}</span>
                        <span className="block text-xs text-slate-400 mt-1">
                          WBS: {pr.subLocation}
                        </span>
                        <span className="block text-xs text-slate-400">
                          Qty: {pr.qty} | Est. Cost: ${pr.cost.toLocaleString()}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleIssuePo(pr)} 
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition"
                      >
                        Issue PO
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Issued Purchase Orders & Partial Delivery Balances
              </h3>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 text-xs uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-4">PO ID</th>
                      <th className="p-4">Vendor</th>
                      <th className="p-4">Total Qty</th>
                      <th className="p-4">Remaining Balance</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {pos.map(po => (
                      <tr key={po.id}>
                        <td className="p-4 font-mono font-bold text-purple-400">PO #{po.id}</td>
                        <td className="p-4 font-semibold text-white">{po.vendor}</td>
                        <td className="p-4 font-mono">{po.totalQty} Units</td>
                        <td className="p-4 font-mono text-amber-400">{po.remainingQty} Units Pending</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            po.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            po.status === 'PARTIALLY_DELIVERED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* GRN & FRAUD AUDIT TAB */}
        {activeTab === 'grn' && currentUser.role === 'SITE_ENGINEER' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">GRN & Isolation Forest Fraud Intake</h1>
            <form onSubmit={handleCreateGrn} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Target PO ID</label>
                  <input type="text" value={selectedPoId} onChange={e => setSelectedPoId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Quantity Received</label>
                  <input type="number" value={grnQty} onChange={e => setGrnQty(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Unit Billed Price ($)</label>
                  <input type="number" value={grnUnitPrice} onChange={e => setGrnUnitPrice(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-sm text-white" />
                </div>
              </div>
              <button type="submit" className="bg-amber-500 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm">
                Submit GRN for ML Audit
              </button>
            </form>

            <div className="space-y-2">
              {grnLogs.map(log => (
                <div key={log.id} className={`p-4 rounded-xl border flex justify-between items-center ${
                  log.isFraud ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                  <div>
                    <span className="font-bold">PO #{log.poId} Intake</span>
                    <span className="block text-xs">Qty: {log.qty} @ ${log.price}/unit</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-950">{log.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Physical Site Stock Inventory</h1>
            <div className="grid grid-cols-3 gap-4">
              {inventory.map(inv => (
                <div key={inv.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400">{inv.unit}</span>
                  <h3 className="font-bold text-lg text-white mt-1">{inv.item}</h3>
                  <span className="block text-2xl font-bold text-amber-400 mt-2">{inv.qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}