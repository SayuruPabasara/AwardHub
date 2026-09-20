import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import ThemeToggle from '../common/ThemeToggle';
import { 
  Trophy, 
  Sparkles, 
  UserCheck, 
  Scale, 
  Vote, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail,
  CheckCircle2
} from 'lucide-react';

export default function LoginView() {
  const { login, users } = useAwardHub();

  const [email, setEmail] = useState('kalinga.s@sliit.lk');
  const [password, setPassword] = useState('••••••••');
  const [selectedRole, setSelectedRole] = useState('organizer');

  const roleProfiles = [
    {
      role: 'organizer',
      title: 'Award Organizer',
      name: 'Prof. Kalinga Silva',
      email: 'kalinga.s@sliit.lk',
      desc: 'Oversees 5-stage lifecycle, reviews nominations & publishes winners',
      icon: Sparkles,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
    },
    {
      role: 'nominee',
      title: 'Nominee',
      name: 'Kavindu Perera',
      email: 'it25101477@my.sliit.lk',
      desc: 'Submits project proposals, uploads whitepapers & tracks status',
      icon: UserCheck,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
    },
    {
      role: 'judge',
      title: 'Judge / Evaluator',
      name: 'Dr. Anoma Wijesinghe',
      email: 'anoma.w@industrylabs.io',
      desc: 'Conducts blind rubric evaluations & submits weighted scores',
      icon: Scale,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
    },
    {
      role: 'voter',
      title: 'Public Voter',
      name: 'Dinuka Fernando',
      email: 'dinuka.f@student.sliit.lk',
      desc: 'Authenticates with Sri Lankan NIC & casts category ballots',
      icon: Vote,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
    },
    {
      role: 'admin',
      title: 'System Administrator',
      name: 'Dr. Sanath Jayawardena',
      email: 'admin.awards@sliit.lk',
      desc: 'Manages user accounts, system security & immutable audit logs',
      icon: ShieldCheck,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
    }
  ];

  const handleSelectRoleProfile = (prof) => {
    setSelectedRole(prof.role);
    setEmail(prof.email);
    setPassword('••••••••');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const matchedUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      login(matchedUser.role);
    } else {
      login(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200 relative">
      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl w-full mx-auto space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 shadow-xl shadow-indigo-500/20 text-white mb-2">
            <Trophy className="w-8 h-8 text-amber-300" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Award<span className="text-amber-500 dark:text-amber-400">Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Web-based Voting System for Award Nominations • SLIIT SE2030 (2026-Y2-S1-MLB-B10G2-06)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick Stakeholder Login Selector (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                Role-Based Authentication
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Select a Stakeholder Profile to Enter
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Click any role to load its permissions, core function tabs, and datasets:
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {roleProfiles.map((prof) => {
                const Icon = prof.icon;
                const isSelected = selectedRole === prof.role;
                return (
                  <div
                    key={prof.role}
                    onClick={() => handleSelectRoleProfile(prof)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400/30 shadow-md dark:bg-slate-800 dark:border-amber-400'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 dark:bg-slate-800/60 dark:border-slate-800 dark:hover:bg-slate-800/90'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${prof.badgeColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{prof.title}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">({prof.name})</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">{prof.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-400/10 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-400/20">
                          <CheckCircle2 className="w-3 h-3" /> Selected
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            login(prof.role);
                          }}
                          className="px-2.5 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white text-xs font-semibold border border-slate-300 dark:border-slate-600 transition-colors"
                        >
                          Login →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Credentials Form (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Sign In to AwardHub</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Role-based session access
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Stakeholder Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Enter AwardHub Platform
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                <p>Protected by RBAC and immutable audit logging</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
