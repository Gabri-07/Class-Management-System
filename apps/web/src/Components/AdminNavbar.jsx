import logo from "../Assets/Landing_Logo_icon.png";

export default function AdminNavbar({ activeTab, setActiveTab, onLogout }) {
  const tabs = ["Timetable", "Students"];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-8xl mx-auto px-6 py-2 flex items-center justify-between">
        
        {/* LEFT: LOGO + TITLE */}
        <div className="flex items-center gap-4">
          <img src={logo} alt="ALGEON" className="h-auto w-48" />

          <div className="leading-tight">
            <h1 className="text-lg font-black text-slate-900">
              &nbsp;&nbsp;&nbsp;&nbsp;Admin Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ALGEON Management
            </p>
          </div>
        </div>

        {/* CENTER: NAV BUTTONS */}
        <div className="flex items-center gap-4 relative -left-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition
                ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-indigo-50"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* RIGHT: LOGOUT */}
        <button
          onClick={onLogout}
          className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
