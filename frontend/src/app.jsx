import React, { useState } from 'react';
import { 
  Building2, HardHat, ClipboardList, ShoppingCart, ShieldAlert, 
  Search, Filter, Plus, CheckCircle, XCircle, AlertTriangle, 
  TrendingUp, Layers, IndianRupee, Truck, Store, Calendar, LogOut,
  FileText, CheckSquare, Layers3, X, Download, Trash2, Archive, PlayCircle,
  Upload, Database, Paperclip, FileCheck
} from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('erp_user')) || null);
  const [token, setToken] = useState(localStorage.getItem('erp_token') || null);
  const [activeTab, setActiveTab] = useState('overview');

  // Credentials & Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Filtering & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [wbsFilter, setWbsFilter] = useState('ALL');
  const [projectStatusFilter, setProjectStatusFilter] = useState('ALL');

  // New Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', location: '', budget: '', physical_progress: 0 });

  // Master Construction Projects Data State
  const [projects, setProjects] = useState([
    { id: 1, name: "Skyline Residency - Block A", location: "Plot 42, Sector 5", budget: 45000000, physical_progress: 48, status: "ACTIVE" },
    { id: 2, name: "Substation Infrastructure Phase 2", location: "Industrial Zone C", budget: 12000000, physical_progress: 70, status: "ACTIVE" }
  ]);

  // Extended Requisitions (PR)
  const [prs, setPrs] = useState([
    { id: 101, project_id: 1, project: "Skyline Residency - Block A", sub_location: "Plot 42 / Foundation", item: "Fe-550 TMT Steel Rebar 12mm", company: "Tata Tiscon", qty: 450, unit: "MT", unit_price: 62000, gst_pct: 18, total_price: 32922000, status: "APPROVED", boq_limit: 400, boq_consumed: 380, date: "2026-10-10" },
    { id: 102, project_id: 2, project: "Substation Infrastructure Phase 2", sub_location: "Control Building Slab", item: "OPC 53 Grade Portland Cement", company: "UltraTech", qty: 800, unit: "Bags", unit_price: 380, gst_pct: 28, total_price: 389120, status: "APPROVED", boq_limit: 1000, boq_consumed: 150, date: "2026-10-11" },
    { id: 103, project_id: 1, project: "Skyline Residency - Block A", sub_location: "Tower B / 2nd Floor", item: "M25 Ready Mix Concrete (RMC)", company: "ACC Concrete", qty: 120, unit: "Cu.m", unit_price: 4500, gst_pct: 18, total_price: 637200, status: "PENDING", boq_limit: 300, boq_consumed: 80, date: "2026-10-12" }
  ]);

  // Purchase Orders (PO)
  const [pos, setPos] = useState([
    { id: 201, pr_id: 102, vendor: "UltraTech Cement Ltd", item: "OPC 53 Grade Portland Cement", company: "UltraTech", total_qty: 800, remaining_qty: 300, unit_price: 380, gst_pct: 28, agreed_inr: 389120, status: "PARTIALLY_DELIVERED", date: "2026-10-11" }
  ]);

  // Goods Received Notes (GRN) with Physical Challan Attachment
  const [grns, setGrns] = useState([
    { id: 301, po_id: 201, vendor: "UltraTech Cement Ltd", item: "OPC 53 Grade Portland Cement", company: "UltraTech", qty_received: 500, unit_price: 380, total_inr: 243200, is_flagged: false, challan_doc: "DC-99201.pdf", timestamp: "2026-10-12 14:30" }
  ]);

  // Store Issue Notes (SIN)
  const [sins, setSins] = useState([
    { id: 401, sub_location: "Plot 42 / Foundation", item: "OPC 53 Grade Portland Cement", qty_issued: 250, unit: "Bags", issued_to: "L&T Casting Subcontractor", date: "2026-10-12" }
  ]);

  // New GRN Intake Form State
  const [newGrn, setNewGrn] = useState({ po_id: 201, qty_received: '', unit_price: '', challan_file: null });

  // Database Migration State
  const [migrationStatus, setMigrationStatus] = useState(null);

  // Form State for New Requisitions
  const [newPr, setNewPr] = useState({ 
    project_id: 1,
    item: 'Fe-550 TMT Steel Rebar 16mm', 
    company: 'JSW Neosteel', 
    qty: 100, 
    unit: 'MT', 
    unit_price: 64000, 
    gst_pct: 18,
    sub_location: 'Tower B / 3rd Slab Casting' 
  });

  // Soft Computing Sliders State
  const [fuzzyParams, setFuzzyParams] = useState({ delay_days: 2, defect_rate: 3, price_dev: 4 });
  const [fuzzyResult, setFuzzyResult] = useState(null);

  // Dynamic Financial Spent Calculation per Project
  const calculateProjectFinancials = (projectId) => {
    const approvedPrs = prs.filter(p => p.project_id === projectId && p.status === 'APPROVED');
    return approvedPrs.reduce((acc, curr) => acc + curr.total_price, 0);
  };

  // Auth Handling (Ensures User Lands on 'overview' Tab On Login)
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    
    const validUsers = {
      'bob@example.com': { password: 'password123', role: 'SITE_ENGINEER', name: 'Bob Engineer (Site Ops)' },
      'head@example.com': { password: 'password123', role: 'PROJECT_HEAD', name: 'Project Head (Governance)' },
      'pm@example.com': { password: 'password123', role: 'PURCHASE_MANAGER', name: 'Purchase Manager (Procurement)' }
    };

    const user = validUsers[loginEmail.toLowerCase().trim()];
    if (!user || user.password !== loginPassword) {
      setAuthError('Invalid credentials. Please verify email and password.');
      return;
    }

    const userObj = { email: loginEmail, role: user.role, name: user.name };
    setCurrentUser(userObj);
    setToken('mock-jwt-token');
    setActiveTab('overview');
    localStorage.setItem('erp_user', JSON.stringify(userObj));
    localStorage.setItem('erp_token', 'mock-jwt-token');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    setActiveTab('overview');
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_token');
  };

  // Project Management Actions
  const handleCreateProject = (e) => {
    e.preventDefault();
    const projectObj = {
      id: projects.length + 1,
      name: newProject.name,
      location: newProject.location,
      budget: parseFloat(newProject.budget) || 0,
      physical_progress: parseInt(newProject.physical_progress) || 0,
      status: "ACTIVE"
    };

    setProjects([projectObj, ...projects]);
    setIsProjectModalOpen(false);
    setNewProject({ name: '', location: '', budget: '', physical_progress: 0 });
  };

  const toggleProjectStatus = (id) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
        const nextPhysical = nextStatus === 'COMPLETED' ? 100 : p.physical_progress;
        return { ...p, status: nextStatus, physical_progress: nextPhysical };
      }
      return p;
    }));
  };

  const deleteProject = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this project record?")) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  // Requisition Creation
  const handleCreatePr = (e) => {
    e.preventDefault();
    const basePrice = newPr.qty * newPr.unit_price;
    const gstAmount = basePrice * (newPr.gst_pct / 100);
    const totalPrice = basePrice + gstAmount;

    const selectedProj = projects.find(p => p.id === parseInt(newPr.project_id)) || projects[0];

    const prObj = {
      id: 100 + prs.length + 1,
      project_id: selectedProj.id,
      project: selectedProj.name,
      sub_location: newPr.sub_location,
      item: newPr.item,
      company: newPr.company,
      qty: parseInt(newPr.qty),
      unit: newPr.unit,
      unit_price: parseFloat(newPr.unit_price),
      gst_pct: parseFloat(newPr.gst_pct),
      total_price: totalPrice,
      status: "PENDING",
      boq_limit: 300,
      boq_consumed: 210,
      date: new Date().toISOString().split('T')[0]
    };
    setPrs([prObj, ...prs]);
    alert("Requisition submitted successfully!");
  };

  // Submit GRN with Challan
  const handleCreateGrn = (e) => {
    e.preventDefault();
    const po = pos.find(p => p.id === parseInt(newGrn.po_id)) || pos[0];
    const qty = parseInt(newGrn.qty_received);
    const price = parseFloat(newGrn.unit_price);
    const total = qty * price * (1 + po.gst_pct / 100);

    const isPriceAnomaly = price > po.unit_price * 1.25;
    const isQtyAnomaly = qty > po.remaining_qty;
    const flagged = isPriceAnomaly || isQtyAnomaly;

    const grnObj = {
      id: 300 + grns.length + 1,
      po_id: po.id,
      vendor: po.vendor,
      item: po.item,
      company: po.company,
      qty_received: qty,
      unit_price: price,
      total_inr: Math.round(total),
      is_flagged: flagged,
      challan_doc: newGrn.challan_file ? newGrn.challan_file.name : "DC-ATTACHMENT.pdf",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setGrns([grnObj, ...grns]);
    alert(flagged ? "WARNING: GRN submitted but FLAGGED FOR FRAUD AUDIT." : "GRN submitted successfully!");
    setNewGrn({ po_id: 201, qty_received: '', unit_price: '', challan_file: null });
  };

  // Database Migration Loader Simulation
  const handleDatabaseMigration = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMigrationStatus("Processing legacy database migration schema...");
    setTimeout(() => {
      setMigrationStatus(`Successfully imported 142 Master Catalog Items and 8 Historical Projects from '${file.name}'.`);
    }, 1500);
  };

  // Export CSV Helper
  const exportToCsv = (filename, rows) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => keys.map(k => `"${(row[k] ?? '').toString().replace(/"/g, '""')}"`).join(separator)).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Soft Computing Fuzzy Evaluation
  const runFuzzyEvaluation = () => {
    const { delay_days, defect_rate, price_dev } = fuzzyParams;
    let score = 100 - (delay_days * 3 + defect_rate * 4 + price_dev * 2.5);
    score = Math.max(10, Math.min(98, Math.round(score)));
    
    let category = "Preferred Vendor";
    if (score < 50) category = "High Risk - Blacklisted";
    else if (score < 75) category = "Conditional Acceptance";

    setFuzzyResult({ score, category });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#292524] flex items-center justify-center p-4">
        <div className="bg-[#F3EFE0] border border-[#E5DECA] p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Building2 className="w-10 h-10 text-[#B45309]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#292524]">ConstructERP</h1>
          </div>
          
          {authError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[#57534E]">Email Address</label>
              <input 
                type="email" 
                required 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full p-2.5 bg-[#FDFBF7] border border-[#D6CEB8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#B45309]" 
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[#57534E]">Password</label>
              <input 
                type="password" 
                required 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-2.5 bg-[#FDFBF7] border border-[#D6CEB8] rounded-md focus:outline-none focus:ring-2 focus:ring-[#B45309]" 
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-[#B45309] hover:bg-[#92400E] text-white font-semibold rounded-md transition shadow">
              Sign In to ERP Portal
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E5DECA]">
            <p className="text-xs text-[#78716C] mb-2 font-medium">Quick Select Demo Persona:</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => { setLoginEmail('bob@example.com'); setLoginPassword('password123'); }} className="p-2 bg-[#E5DECA] text-xs font-medium rounded hover:bg-[#D6CEB8]">Site Eng.</button>
              <button onClick={() => { setLoginEmail('head@example.com'); setLoginPassword('password123'); }} className="p-2 bg-[#E5DECA] text-xs font-medium rounded hover:bg-[#D6CEB8]">Proj. Head</button>
              <button onClick={() => { setLoginEmail('pm@example.com'); setLoginPassword('password123'); }} className="p-2 bg-[#E5DECA] text-xs font-medium rounded hover:bg-[#D6CEB8]">Purch. Mgr</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter Logic
  const filteredPrs = prs.filter(pr => {
    const matchesSearch = pr.item.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pr.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pr.sub_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pr.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || pr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProjects = projects.filter(p => {
    if (projectStatusFilter === 'ALL') return true;
    return p.status === projectStatusFilter;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#292524] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#F3EFE0] border-r border-[#E5DECA] flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-[#E5DECA] flex items-center gap-3">
            <Building2 className="w-7 h-7 text-[#B45309]" />
            <div>
              <h2 className="font-bold text-lg text-[#292524]">ConstructERP</h2>
              <span className="text-xs text-[#78716C] capitalize">{currentUser.role.replace('_', ' ')}</span>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition ${activeTab === 'overview' ? 'bg-[#B45309] text-white' : 'text-[#57534E] hover:bg-[#E5DECA]'}`}>
              <TrendingUp className="w-4 h-4" /> Overview Dashboard
            </button>

            <button onClick={() => setActiveTab('requisitions')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition ${activeTab === 'requisitions' ? 'bg-[#B45309] text-white' : 'text-[#57534E] hover:bg-[#E5DECA]'}`}>
              <ClipboardList className="w-4 h-4" /> Requisitions (PR)
            </button>

            {['PURCHASE_MANAGER', 'PROJECT_HEAD'].includes(currentUser.role) && (
              <>
                <button onClick={() => setActiveTab('fuzzy')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition ${activeTab === 'fuzzy' ? 'bg-[#B45309] text-white' : 'text-[#57534E] hover:bg-[#E5DECA]'}`}>
                  <Layers3 className="w-4 h-4" /> Fuzzy Vendor Scoring
                </button>
                <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition ${activeTab === 'orders' ? 'bg-[#B45309] text-white' : 'text-[#57534E] hover:bg-[#E5DECA]'}`}>
                  <ShoppingCart className="w-4 h-4" /> Purchase Orders (PO)
                </button>
              </>
            )}

            <button onClick={() => setActiveTab('grn')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition ${activeTab === 'grn' ? 'bg-[#B45309] text-white' : 'text-[#57534E] hover:bg-[#E5DECA]'}`}>
              <Truck className="w-4 h-4" /> Goods Receipts & Audit
            </button>

            <button onClick={() => setActiveTab('store')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition ${activeTab === 'store' ? 'bg-[#B45309] text-white' : 'text-[#57534E] hover:bg-[#E5DECA]'}`}>
              <Store className="w-4 h-4" /> Store Issue Notes (SIN)
            </button>

            <button onClick={() => setActiveTab('migration')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition ${activeTab === 'migration' ? 'bg-[#B45309] text-white' : 'text-[#57534E] hover:bg-[#E5DECA]'}`}>
              <Database className="w-4 h-4" /> Database Migration
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#E5DECA]">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-semibold text-[#292524]">{currentUser.name}</p>
              <p className="text-xs text-[#78716C]">{currentUser.email}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="p-2 hover:bg-[#E5DECA] text-[#78716C] hover:text-[#B45309] rounded">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-[#292524]">Executive Construction Overview</h1>
                <p className="text-sm text-[#78716C]">Physical vs. Financial Progress, BOQ Consumption & Site Inventory</p>
              </div>

              <div className="flex items-center gap-3">
                <select 
                  value={projectStatusFilter} 
                  onChange={e => setProjectStatusFilter(e.target.value)}
                  className="p-2 bg-[#F3EFE0] border border-[#E5DECA] text-xs font-semibold rounded text-[#57534E]"
                >
                  <option value="ALL">All Projects ({projects.length})</option>
                  <option value="ACTIVE">Active Sites ({projects.filter(p=>p.status==='ACTIVE').length})</option>
                  <option value="COMPLETED">Completed ({projects.filter(p=>p.status==='COMPLETED').length})</option>
                </select>

                {currentUser.role === 'PROJECT_HEAD' && (
                  <button 
                    onClick={() => setIsProjectModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#B45309] hover:bg-[#92400E] text-white font-medium rounded-md shadow transition text-sm"
                  >
                    <Plus className="w-4 h-4" /> Add New Project
                  </button>
                )}
              </div>
            </header>

            {/* Project Financial vs Physical Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map(p => {
                const spentAmount = calculateProjectFinancials(p.id);
                const financialPct = Math.min(100, Math.round((spentAmount / p.budget) * 100));

                return (
                  <div key={p.id} className="bg-[#F3EFE0] border border-[#E5DECA] p-5 rounded-lg shadow-sm space-y-3 relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-[#292524]">{p.name}</h3>
                          {p.status === 'COMPLETED' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-bold rounded">
                              COMPLETED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#78716C]">{p.location}</p>
                      </div>

                      {/* Project Head Actions: Toggle Complete or Delete */}
                      {currentUser.role === 'PROJECT_HEAD' && (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => toggleProjectStatus(p.id)} 
                            title={p.status === 'ACTIVE' ? "Mark Project Completed" : "Reactivate Project"}
                            className="p-1.5 hover:bg-[#E5DECA] text-[#78716C] hover:text-[#B45309] rounded"
                          >
                            {p.status === 'ACTIVE' ? <CheckCircle className="w-4 h-4 text-green-700" /> : <PlayCircle className="w-4 h-4 text-amber-700" />}
                          </button>
                          <button 
                            onClick={() => deleteProject(p.id)} 
                            title="Delete Project"
                            className="p-1.5 hover:bg-[#E5DECA] text-[#78716C] hover:text-red-700 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Financial Spent Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-[#57534E]">Financial Budget Spent (Auto-Updated)</span>
                        <span className="text-[#B45309] font-bold">{financialPct}%</span>
                      </div>
                      <div className="w-full bg-[#E5DECA] rounded-full h-2">
                        <div className="bg-[#B45309] h-2 rounded-full transition-all duration-500" style={{ width: `${financialPct}%` }}></div>
                      </div>
                    </div>

                    {/* Physical Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-[#57534E]">Physical Site Completion</span>
                        <span className="text-green-800 font-bold">{p.physical_progress}%</span>
                      </div>
                      <div className="w-full bg-[#E5DECA] rounded-full h-2">
                        <div className="bg-green-700 h-2 rounded-full transition-all duration-500" style={{ width: `${p.physical_progress}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm border-t border-[#E5DECA] pt-3">
                      <div>
                        <span className="text-xs text-[#78716C] block">Approved BOQ Budget</span>
                        <span className="font-semibold text-[#292524]">₹{(p.budget / 100000).toFixed(1)} Lakhs</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#78716C] block">Live Spent (Inc. GST)</span>
                        <span className="font-semibold text-[#B45309]">₹{(spentAmount / 100000).toFixed(2)} Lakhs</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metric Tiles */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#F3EFE0] p-4 rounded-lg border border-[#E5DECA]">
                <span className="text-xs text-[#78716C]">Pending Requisitions</span>
                <p className="text-2xl font-bold text-[#292524] mt-1">{prs.filter(p => p.status === 'PENDING').length}</p>
              </div>
              <div className="bg-[#F3EFE0] p-4 rounded-lg border border-[#E5DECA]">
                <span className="text-xs text-[#78716C]">Active Purchase Orders</span>
                <p className="text-2xl font-bold text-[#292524] mt-1">{pos.length}</p>
              </div>
              <div className="bg-[#F3EFE0] p-4 rounded-lg border border-[#E5DECA]">
                <span className="text-xs text-[#78716C]">Deliveries Pending</span>
                <p className="text-2xl font-bold text-[#D97706] mt-1">300 Units</p>
              </div>
              <div className="bg-[#F3EFE0] p-4 rounded-lg border border-[#E5DECA]">
                <span className="text-xs text-[#78716C]">GRN Anomaly Risk</span>
                <p className="text-2xl font-bold text-green-700 mt-1">Low Risk</p>
              </div>
            </div>

            {/* ADD PROJECT MODAL */}
            {isProjectModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-[#F3EFE0] border border-[#E5DECA] p-6 rounded-xl shadow-xl w-full max-w-lg space-y-4">
                  <div className="flex justify-between items-center border-b border-[#E5DECA] pb-3">
                    <h3 className="font-bold text-lg text-[#292524]">Create New Construction Project</h3>
                    <button onClick={() => setIsProjectModalOpen(false)} className="text-[#78716C] hover:text-[#292524]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateProject} className="space-y-4 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-[#57534E] mb-1">Project Name</label>
                      <input 
                        type="text" 
                        required 
                        value={newProject.name} 
                        onChange={e => setNewProject({...newProject, name: e.target.value})} 
                        className="w-full p-2.5 bg-[#FDFBF7] border border-[#D6CEB8] rounded focus:outline-none" 
                        placeholder="e.g. Green Valley Commercial Complex" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#57534E] mb-1">Site Location & Sector</label>
                      <input 
                        type="text" 
                        required 
                        value={newProject.location} 
                        onChange={e => setNewProject({...newProject, location: e.target.value})} 
                        className="w-full p-2.5 bg-[#FDFBF7] border border-[#D6CEB8] rounded focus:outline-none" 
                        placeholder="e.g. Plot 108, Phase 3" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#57534E] mb-1">Total BOQ Budget (₹)</label>
                        <input 
                          type="number" 
                          required 
                          value={newProject.budget} 
                          onChange={e => setNewProject({...newProject, budget: e.target.value})} 
                          className="w-full p-2.5 bg-[#FDFBF7] border border-[#D6CEB8] rounded focus:outline-none" 
                          placeholder="25000000" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#57534E] mb-1">Initial Physical Progress (%)</label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={newProject.physical_progress} 
                          onChange={e => setNewProject({...newProject, physical_progress: e.target.value})} 
                          className="w-full p-2.5 bg-[#FDFBF7] border border-[#D6CEB8] rounded focus:outline-none" 
                          placeholder="0" 
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-[#E5DECA]">
                      <button 
                        type="button" 
                        onClick={() => setIsProjectModalOpen(false)}
                        className="px-4 py-2 border border-[#D6CEB8] text-[#57534E] hover:bg-[#E5DECA] rounded font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-[#B45309] hover:bg-[#92400E] text-white rounded font-medium shadow"
                      >
                        Save Project
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REQUISITIONS (PR) TAB */}
        {activeTab === 'requisitions' && (
          <div className="space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-[#292524]">Purchase Requisitions (PR)</h1>
                <p className="text-sm text-[#78716C]">Detailed material specifications, WBS location tagging, and BOQ over-run audits</p>
              </div>

              <button 
                onClick={() => exportToCsv('purchase_requisitions', filteredPrs)}
                className="flex items-center gap-2 px-3 py-2 bg-[#F3EFE0] border border-[#E5DECA] text-[#57534E] hover:bg-[#E5DECA] text-xs font-semibold rounded"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </header>

            {/* Raise PR Form */}
            {currentUser.role === 'SITE_ENGINEER' && (
              <div className="bg-[#F3EFE0] border border-[#E5DECA] p-5 rounded-lg shadow-sm space-y-4">
                <h3 className="font-bold text-md text-[#292524] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#B45309]" /> Raise Site Material Requisition
                </h3>
                <form onSubmit={handleCreatePr} className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-[#57534E]">Target Project</label>
                    <select 
                      value={newPr.project_id} 
                      onChange={e => setNewPr({...newPr, project_id: e.target.value})}
                      className="w-full p-2 bg-[#FDFBF7] border border-[#D6CEB8] rounded"
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-[#57534E]">Material Description & Grade</label>
                    <input type="text" required value={newPr.item} onChange={e => setNewPr({...newPr, item: e.target.value})} className="w-full p-2 bg-[#FDFBF7] border border-[#D6CEB8] rounded" placeholder="e.g. Fe-550 TMT Steel Rebar 16mm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-[#57534E]">Brand / Company</label>
                    <input type="text" required value={newPr.company} onChange={e => setNewPr({...newPr, company: e.target.value})} className="w-full p-2 bg-[#FDFBF7] border border-[#D6CEB8] rounded" placeholder="e.g. JSW / UltraTech" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-[#57534E]">WBS Site Location Tag</label>
                    <input type="text" required value={newPr.sub_location} onChange={e => setNewPr({...newPr, sub_location: e.target.value})} className="w-full p-2 bg-[#FDFBF7] border border-[#D6CEB8] rounded" placeholder="e.g. Tower B / 3rd Slab" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-[#57534E]">Quantity & Unit</label>
                    <div className="flex gap-2">
                      <input type="number" required value={newPr.qty} onChange={e => setNewPr({...newPr, qty: e.target.value})} className="w-full p-2 bg-[#FDFBF7] border border-[#D6CEB8] rounded" placeholder="100" />
                      <select value={newPr.unit} onChange={e => setNewPr({...newPr, unit: e.target.value})} className="p-2 bg-[#FDFBF7] border border-[#D6CEB8] rounded">
                        <option>MT</option><option>Bags</option><option>Cu.m</option><option>Units</option><option>Rmtr</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-[#57534E]">Unit Rate (₹ Excl. Tax)</label>
                    <input type="number" required value={newPr.unit_price} onChange={e => setNewPr({...newPr, unit_price: e.target.value})} className="w-full p-2 bg-[#FDFBF7] border border-[#D6CEB8] rounded" placeholder="64000" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-[#57534E]">GST Sizing (%)</label>
                    <select value={newPr.gst_pct} onChange={e => setNewPr({...newPr, gst_pct: e.target.value})} className="w-full p-2 bg-[#FDFBF7] border border-[#D6CEB8] rounded">
                      <option value={18}>18% (Steel, RMC, Services)</option>
                      <option value={28}>28% (Cement)</option>
                      <option value={5}>5% (Aggregates / Sand)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full py-2 bg-[#B45309] hover:bg-[#92400E] text-white font-medium rounded transition">
                      Submit Requisition
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filter Bar */}
            <div className="bg-[#F3EFE0] p-4 rounded-lg border border-[#E5DECA] flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#78716C]" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter by PR #, Material Specs, Brand (e.g. Tata, UltraTech), or WBS Sub-location..." 
                  className="w-full pl-9 pr-4 py-2 text-sm bg-[#FDFBF7] border border-[#D6CEB8] rounded focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#78716C]" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm p-2 bg-[#FDFBF7] border border-[#D6CEB8] rounded">
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                </select>
              </div>
            </div>

            {/* PR Table */}
            <div className="bg-[#F3EFE0] border border-[#E5DECA] rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#E5DECA] text-[#57534E] text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-3">PR ID</th>
                    <th className="p-3">Project & Location</th>
                    <th className="p-3">Material Specs & Brand</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Base Rate (₹)</th>
                    <th className="p-3">Total Cost (Inc. GST)</th>
                    <th className="p-3">BOQ Limit Check</th>
                    <th className="p-3">Status</th>
                    {currentUser.role === 'PROJECT_HEAD' && <th className="p-3">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DECA]">
                  {filteredPrs.map(pr => (
                    <tr key={pr.id} className="hover:bg-[#FDFBF7]/50">
                      <td className="p-3 font-semibold">#{pr.id}</td>
                      <td className="p-3">
                        <div className="font-medium text-[#292524]">{pr.project}</div>
                        <div className="text-xs text-[#78716C]">{pr.sub_location}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-[#292524]">{pr.item}</div>
                        <div className="text-xs text-[#78716C]">Brand: <span className="font-semibold">{pr.company}</span></div>
                      </td>
                      <td className="p-3">{pr.qty} {pr.unit}</td>
                      <td className="p-3">₹{pr.unit_price.toLocaleString('en-IN')}</td>
                      <td className="p-3 font-semibold text-[#B45309]">₹{pr.total_price.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        {pr.qty + pr.boq_consumed > pr.boq_limit ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" /> Exceeds BOQ
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded w-fit">
                            Within BOQ
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${pr.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {pr.status}
                        </span>
                      </td>
                      {currentUser.role === 'PROJECT_HEAD' && (
                        <td className="p-3">
                          {pr.status === 'PENDING' && (
                            <button onClick={() => {
                              setPrs(prs.map(p => p.id === pr.id ? {...p, status: 'APPROVED'} : p));
                            }} className="px-2.5 py-1 bg-[#B45309] hover:bg-[#92400E] text-white text-xs font-medium rounded shadow">
                              Approve
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SOFT COMPUTING FUZZY VENDOR EVALUATION TAB */}
        {activeTab === 'fuzzy' && (
          <div className="space-y-6">
            <header>
              <h1 className="text-2xl font-bold text-[#292524]">Soft Computing: Fuzzy Logic Vendor Evaluator</h1>
              <p className="text-sm text-[#78716C]">Multi-criteria risk scoring across delivery delay, quality compliance, and price markup</p>
            </header>

            <div className="bg-[#F3EFE0] border border-[#E5DECA] p-6 rounded-lg space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-[#57534E] mb-1">Delivery Delay (Days): {fuzzyParams.delay_days} Days</label>
                <input type="range" min="0" max="15" value={fuzzyParams.delay_days} onChange={e => setFuzzyParams({...fuzzyParams, delay_days: parseInt(e.target.value)})} className="w-full accent-[#B45309]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#57534E] mb-1">Defect / Quality Rejection Rate (%): {fuzzyParams.defect_rate}%</label>
                <input type="range" min="0" max="20" value={fuzzyParams.defect_rate} onChange={e => setFuzzyParams({...fuzzyParams, defect_rate: parseInt(e.target.value)})} className="w-full accent-[#B45309]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#57534E] mb-1">Price Markup Variance from BOQ (%): {fuzzyParams.price_dev}%</label>
                <input type="range" min="0" max="25" value={fuzzyParams.price_dev} onChange={e => setFuzzyParams({...fuzzyParams, price_dev: parseInt(e.target.value)})} className="w-full accent-[#B45309]" />
              </div>

              <button onClick={runFuzzyEvaluation} className="w-full py-2.5 bg-[#B45309] hover:bg-[#92400E] text-white font-semibold rounded shadow transition">
                Compute Defuzzified Vendor Score
              </button>

              {fuzzyResult && (
                <div className="p-4 bg-[#FDFBF7] border border-[#D6CEB8] rounded-md text-center space-y-1">
                  <p className="text-xs text-[#78716C] uppercase font-semibold">Defuzzified Output Rating</p>
                  <p className="text-3xl font-bold text-[#292524]">{fuzzyResult.score} / 100</p>
                  <p className={`text-sm font-bold ${fuzzyResult.score < 50 ? 'text-red-700' : 'text-green-800'}`}>
                    {fuzzyResult.category}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PURCHASE ORDERS (PO) TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-[#292524]">Active Purchase Orders (PO)</h1>
                <p className="text-sm text-[#78716C]">Issued orders with live remaining balance tracking and vendor commitments</p>
              </div>
              <button onClick={() => exportToCsv('purchase_orders', pos)} className="flex items-center gap-2 px-3 py-2 bg-[#F3EFE0] border border-[#E5DECA] text-[#57534E] text-xs font-semibold rounded">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </header>

            <div className="bg-[#F3EFE0] border border-[#E5DECA] rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#E5DECA] text-[#57534E] text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-3">PO ID</th>
                    <th className="p-3">Vendor / Supplier</th>
                    <th className="p-3">Item & Brand</th>
                    <th className="p-3">Order Qty</th>
                    <th className="p-3">Pending Balance</th>
                    <th className="p-3">Agreed Amount (₹)</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DECA]">
                  {pos.map(po => (
                    <tr key={po.id}>
                      <td className="p-3 font-semibold">#{po.id}</td>
                      <td className="p-3 font-medium">{po.vendor}</td>
                      <td className="p-3">
                        <div>{po.item}</div>
                        <div className="text-xs text-[#78716C]">Brand: {po.company}</div>
                      </td>
                      <td className="p-3">{po.total_qty} Units</td>
                      <td className="p-3 text-[#D97706] font-bold">{po.remaining_qty} Units</td>
                      <td className="p-3 font-semibold text-[#B45309]">₹{po.agreed_inr.toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GOODS RECEIPTS (GRN) TAB */}
        {activeTab === 'grn' && (
          <div className="space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-[#292524]">Goods Received Notes (GRN) & Intake Audit</h1>
                <p className="text-sm text-[#78716C]">Upload physical delivery challans with ML anomaly detection</p>
              </div>
              <button onClick={() => exportToCsv('goods_receipts', grns)} className="flex items-center gap-2 px-3 py-2 bg-[#F3EFE0] border border-[#E5DECA] text-[#57534E] text-xs font-semibold rounded">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </header>

            {/* GRN Creation Form with Challan Upload */}
            {currentUser.role === 'SITE_ENGINEER' && (
              <div className="bg-[#F3EFE0] border border-[#E5DECA] p-5 rounded-lg shadow-sm space-y-4">
                <h3 className="font-bold text-md text-[#292524] flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#B45309]" /> Record Site Delivery & Attach Physical Challan
                </h3>
                <form onSubmit={handleCreateGrn} className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-[#57534E]">Target Purchase Order</label>
                    <select 
                      value={newGrn.po_id} 
                      onChange={e => setNewGrn({...newGrn, po_id: e.target.value})}
                      className="w-full p-2 bg-[#FDFBF7] border border-[#D6CEB8] rounded"
                    >
                      {pos.map(po => (
                        <option key={po.id} value={po.id}>PO #{po.id} - {po.item} ({po.vendor})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-[#57534E]">Quantity Received</label>
                    <input type="number" required value={newGrn.qty_received} onChange={e => setNewGrn({...newGrn, qty_received: e.target.value})} className="w-full p-2 bg-[#FDFBF7] border border-[#D6CEB8] rounded" placeholder="300" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-[#57534E]">Billed Unit Price (₹)</label>
                    <input type="number" required value={newGrn.unit_price} onChange={e => setNewGrn({...newGrn, unit_price: e.target.value})} className="w-full p-2 bg-[#FDFBF7] border border-[#D6CEB8] rounded" placeholder="380" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-[#57534E]">Upload Delivery Challan (PDF/JPG)</label>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.png" 
                      required
                      onChange={e => setNewGrn({...newGrn, challan_file: e.target.files[0]})}
                      className="w-full text-xs p-1 bg-[#FDFBF7] border border-[#D6CEB8] rounded"
                    />
                  </div>
                  <div className="col-span-4 flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-[#B45309] hover:bg-[#92400E] text-white font-medium rounded transition">
                      Submit Intake & Audit
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* GRN Table */}
            <div className="bg-[#F3EFE0] border border-[#E5DECA] rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#E5DECA] text-[#57534E] text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-3">GRN ID</th>
                    <th className="p-3">Material & Vendor</th>
                    <th className="p-3">Received Qty</th>
                    <th className="p-3">Billed Rate (₹)</th>
                    <th className="p-3">Challan Document</th>
                    <th className="p-3">ML Anomaly Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DECA]">
                  {grns.map(g => (
                    <tr key={g.id}>
                      <td className="p-3 font-semibold">#{g.id}</td>
                      <td className="p-3 font-medium">{g.item} <br/><span className="text-xs text-[#78716C]">{g.vendor}</span></td>
                      <td className="p-3">{g.qty_received} Units</td>
                      <td className="p-3">₹{g.unit_price}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 text-xs text-[#B45309] underline font-medium cursor-pointer">
                          <Paperclip className="w-3.5 h-3.5" /> {g.challan_doc}
                        </span>
                      </td>
                      <td className="p-3">
                        {g.is_flagged ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded flex items-center gap-1 w-fit">
                            <XCircle className="w-3.5 h-3.5" /> Flagged
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3.5 h-3.5" /> Passed & Inventoried
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STORE ISSUE NOTES (SIN) TAB */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            <header className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-[#292524]">Store Issue Notes (SIN) & Site Consumption</h1>
                <p className="text-sm text-[#78716C]">Track materials issued from central site store to sub-contractors and casting activities</p>
              </div>
              <button onClick={() => exportToCsv('store_issue_notes', sins)} className="flex items-center gap-2 px-3 py-2 bg-[#F3EFE0] border border-[#E5DECA] text-[#57534E] text-xs font-semibold rounded">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </header>

            <div className="bg-[#F3EFE0] border border-[#E5DECA] rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#E5DECA] text-[#57534E] text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-3">SIN ID</th>
                    <th className="p-3">WBS Casting Location</th>
                    <th className="p-3">Material Description</th>
                    <th className="p-3">Quantity Issued</th>
                    <th className="p-3">Issued To Subcontractor</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DECA]">
                  {sins.map(s => (
                    <tr key={s.id}>
                      <td className="p-3 font-semibold">#{s.id}</td>
                      <td className="p-3 font-medium">{s.sub_location}</td>
                      <td className="p-3">{s.item}</td>
                      <td className="p-3 font-bold text-[#B45309]">{s.qty_issued} {s.unit}</td>
                      <td className="p-3 text-xs">{s.issued_to}</td>
                      <td className="p-3 text-xs">{s.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DATABASE MIGRATION TAB */}
        {activeTab === 'migration' && (
          <div className="space-y-6">
            <header>
              <h1 className="text-2xl font-bold text-[#292524]">Legacy Database Migration Engine</h1>
              <p className="text-sm text-[#78716C]">Bulk load company databases, vendor histories, and master material catalogs</p>
            </header>

            <div className="bg-[#F3EFE0] border border-[#E5DECA] p-6 rounded-lg space-y-4 max-w-xl">
              <h3 className="font-bold text-md text-[#292524] flex items-center gap-2">
                <Database className="w-5 h-5 text-[#B45309]" /> Upload Existing ERP / Excel Database Backup
              </h3>
              <p className="text-xs text-[#78716C]">
                Select a legacy dump file (`.csv` or `.json`) containing master item catalogs, opening stock balances, or vendor history tables.
              </p>

              <input 
                type="file" 
                accept=".csv,.json" 
                onChange={handleDatabaseMigration}
                className="w-full p-3 bg-[#FDFBF7] border border-[#D6CEB8] rounded text-sm"
              />

              {migrationStatus && (
                <div className="p-3 bg-green-100 border border-green-300 text-green-800 text-xs rounded flex items-center gap-2">
                  <FileCheck className="w-4 h-4 shrink-0" />
                  {migrationStatus}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}