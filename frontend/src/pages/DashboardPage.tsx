import { useEffect, useState, useCallback } from "react";
import API from "../api/axios";
import { CSVLink } from "react-csv";
import toast, { Toaster } from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useDebounce } from "../hooks/useDebounce";

type Lead = {
  _id: string;
  name: string;
  email: string;
  status: string;
  source: string;
  createdAt: string;
};

type ActiveTab = "dashboard" | "leads" | "analytics";

function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("New");
  const [source, setSource] = useState("Website");
  const [editingId, setEditingId] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // ✅ Debounced search — 300ms delay
  const debouncedSearch = useDebounce(search, 300);

  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark = saved ? JSON.parse(saved) : false;
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    return isDark;
  });

  const toggleDarkMode = () => {
    setDarkMode((prev: boolean) => {
      const next = !prev;
      localStorage.setItem("darkMode", JSON.stringify(next));
      if (next) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return next;
    });
  };

  const fetchLeads = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeads(response.data.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // ✅ Reset to page 1 when debounced search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editingId) {
        await API.put(`/leads/${editingId}`, { name, email, status, source }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Lead updated successfully", {
          duration: 3000,
          position: "top-right",
          style: { background: "#10B981", color: "#fff", fontWeight: "600", borderRadius: "12px", padding: "12px 20px" },
          iconTheme: { primary: "#fff", secondary: "#10B981" },
        });
      } else {
        await API.post("/leads", { name, email, status, source }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Lead added successfully", {
          duration: 3000,
          position: "top-right",
          style: { background: "#3B82F6", color: "#fff", fontWeight: "600", borderRadius: "12px", padding: "12px 20px" },
          iconTheme: { primary: "#fff", secondary: "#3B82F6" },
        });
      }
      setName(""); setEmail(""); setStatus("New"); setSource("Website"); setEditingId("");
      fetchLeads();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong", {
        duration: 3000,
        position: "top-right",
        style: { background: "#EF4444", color: "#fff", fontWeight: "600", borderRadius: "12px", padding: "12px 20px" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
    }
  };

  const deleteLead = async (id: string) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/leads/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Lead deleted successfully", {
        duration: 3000,
        position: "top-right",
        style: { background: "#EF4444", color: "#fff", fontWeight: "600", borderRadius: "12px", padding: "12px 20px" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
      fetchLeads();
    } catch (error) {
      console.log(error);
      toast.error("Delete failed", {
        duration: 3000,
        position: "top-right",
        style: { background: "#EF4444", color: "#fff", fontWeight: "600", borderRadius: "12px", padding: "12px 20px" },
        iconTheme: { primary: "#fff", secondary: "#EF4444" },
      });
    }
  };

  const editLead = (lead: Lead) => {
    setEditingId(lead._id);
    setName(lead.name);
    setEmail(lead.email);
    setStatus(lead.status);
    setSource(lead.source);
    setActiveTab("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // ✅ Use debouncedSearch instead of search for filtering
  const filteredLeads = [...leads]
    .filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lead.email.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = filterStatus === "" || lead.status === filterStatus;
      const matchesSource = filterSource === "" || lead.source === filterSource;
      return matchesSearch && matchesStatus && matchesSource;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  const chartData = [
    { name: "New", value: leads.filter((l) => l.status === "New").length },
    { name: "Contacted", value: leads.filter((l) => l.status === "Contacted").length },
    { name: "Qualified", value: leads.filter((l) => l.status === "Qualified").length },
    { name: "Lost", value: leads.filter((l) => l.status === "Lost").length },
  ];

  const sourceChartData = [
    { name: "Website", value: leads.filter((l) => l.source === "Website").length },
    { name: "Instagram", value: leads.filter((l) => l.source === "Instagram").length },
    { name: "Referral", value: leads.filter((l) => l.source === "Referral").length },
  ];

  const COLORS = ["#3B82F6", "#F59E0B", "#10B981", "#EF4444"];
  const SOURCE_COLORS = ["#8B5CF6", "#EC4899", "#06B6D4"];

  const getStatusBadge = (s: string) => {
    const styles: Record<string, string> = {
      New: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      Contacted: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
      Qualified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
      Lost: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[s] || ""}`}>{s}</span>;
  };

  const getSourceBadge = (src: string) => {
    const styles: Record<string, string> = {
      Website: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      Instagram: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
      Referral: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[src] || ""}`}>{src}</span>;
  };

  const navItems: { key: ActiveTab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "leads", label: "Leads" },
    { key: "analytics", label: "Analytics" },
  ];

  const pageTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: { title: "Dashboard", subtitle: "Manage your leads efficiently" },
    leads: { title: "Leads", subtitle: "View and manage all your leads" },
    analytics: { title: "Analytics", subtitle: "Insights into your lead pipeline" },
  };

  const inputCls = "w-full border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const selectCls = "border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  const SearchAndTable = (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Search</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {/* ✅ search state updates instantly (for responsive input feel),
                but filtering uses debouncedSearch (300ms delay) */}
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className={`${selectCls} min-w-[150px]`}>
            <option value="">All Status</option>
            <option>New</option><option>Contacted</option><option>Qualified</option><option>Lost</option>
          </select>
          <select value={filterSource} onChange={(e) => { setFilterSource(e.target.value); setCurrentPage(1); }} className={`${selectCls} min-w-[150px]`}>
            <option value="">All Sources</option>
            <option>Website</option><option>Instagram</option><option>Referral</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={`${selectCls} min-w-[140px]`}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Leads</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                {["Name", "Email", "Status", "Source", "Actions"].map((h) => (
                  <th key={h} className={`px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {currentLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No leads found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Create a new lead to get started</p>
                  </td>
                </tr>
              ) : (
                currentLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{lead.email}</td>
                    <td className="px-6 py-4">{getStatusBadge(lead.status)}</td>
                    <td className="px-6 py-4">{getSourceBadge(lead.source)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => editLead(lead)}
                          className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                          Edit
                        </button>
                        <button onClick={() => deleteLead(lead._id)}
                          className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {indexOfFirstLead + 1}–{Math.min(indexOfLastLead, filteredLeads.length)} of {filteredLeads.length}
            </p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-colors ${currentPage === page ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"}`}>
                  {page}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-right" />

      {/* SIDEBAR */}
      <div className="w-72 bg-gradient-to-b from-blue-600 to-blue-800 dark:from-gray-900 dark:to-gray-800 text-white p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Smart Leads</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left ${
                activeTab === key ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">U</div>
            <div>
              <p className="text-sm font-medium">User</p>
              <p className="text-xs text-white/60">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* NAVBAR */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{pageTitles[activeTab].title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{pageTitles[activeTab].subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode}
              className="relative w-14 h-8 bg-gray-200 dark:bg-gray-600 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle dark mode">
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${darkMode ? "translate-x-6" : "translate-x-0"}`}>
                {darkMode
                  ? <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                  : <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                }
              </div>
            </button>

            <CSVLink data={filteredLeads} filename="leads-data.csv"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all">
              Export CSV
            </CSVLink>

            <button onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all">
              Logout
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {chartData.map((item, index) => (
                  <div key={item.name} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.name} Leads</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{item.value}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS[index]}20` }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{editingId ? "Update Lead" : "Create New Lead"}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lead Name</label>
                    <input type="text" placeholder="Enter lead name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lead Email</label>
                    <input type="email" placeholder="Enter lead email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                      <option>New</option><option>Contacted</option><option>Qualified</option><option>Lost</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source</label>
                    <select value={source} onChange={(e) => setSource(e.target.value)} className={inputCls}>
                      <option>Website</option><option>Instagram</option><option>Referral</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold transition-all">
                      {editingId ? "Update Lead" : "Create Lead"}
                    </button>
                  </div>
                </form>
              </div>

              {SearchAndTable}
            </>
          )}

          {/* LEADS TAB */}
          {activeTab === "leads" && SearchAndTable}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {chartData.map((item, index) => (
                  <div key={item.name} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.name} Leads</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{item.value}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${COLORS[index]}20` }}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Leads by Status</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={5}
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", border: "none", borderRadius: "12px" }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Leads by Source</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sourceChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={5}
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                          {sourceChartData.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", border: "none", borderRadius: "12px" }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Conversion Breakdown</h3>
                <div className="space-y-4">
                  {chartData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-4">
                      <span className="w-24 text-sm font-medium text-gray-600 dark:text-gray-400">{item.name}</span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                        <div className="h-3 rounded-full transition-all duration-500"
                          style={{ width: leads.length > 0 ? `${(item.value / leads.length) * 100}%` : "0%", backgroundColor: COLORS[index] }} />
                      </div>
                      <span className="w-12 text-sm font-semibold text-gray-900 dark:text-white text-right">
                        {leads.length > 0 ? `${Math.round((item.value / leads.length) * 100)}%` : "0%"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
