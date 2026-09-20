import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import StatusBadge from '../common/StatusBadge';
import CategoryManagerModal from './CategoryManagerModal';
import { 
  Award, 
  Plus, 
  Edit, 
  Archive, 
  Search, 
  Sliders, 
  Calendar,
  Users,
  Vote
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function CategoryListView() {
  const { categories, nominations, votes, archiveCategory } = useAwardHub();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const filteredCategories = categories.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Award Categories & Schedule Configuration</h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Module 1
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure eligibility criteria, nomination and voting timelines, and evaluation weighting algorithms.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Category
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs transition-colors">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category by title or code..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Category Statuses</option>
            <option value="Nomination Open">Nomination Open</option>
            <option value="Evaluation">Evaluation</option>
            <option value="Voting Active">Voting Active</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
              <tr>
                <th className="px-4 py-3">Category Title & Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Evaluation Approach</th>
                <th className="px-4 py-3">Nomination Schedule</th>
                <th className="px-4 py-3">Voting Schedule</th>
                <th className="px-4 py-3 text-center">Submissions / Votes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCategories.map((cat) => {
                const nomsCount = nominations.filter((n) => n.categoryId === cat.id).length;
                const votesCount = votes.filter((v) => v.categoryId === cat.id).length;

                return (
                  <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      <div className="font-bold">{cat.name}</div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold">{cat.code}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={cat.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                        {cat.evaluationMode.replace('_', ' ')}
                      </span>
                      {cat.evaluationMode === 'hybrid' && (
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                          {cat.weights?.judge}% Judge / {cat.weights?.public}% Public
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {formatDate(cat.schedules?.nominationStart)} – {formatDate(cat.schedules?.nominationEnd)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {formatDate(cat.schedules?.votingStart)} – {formatDate(cat.schedules?.votingEnd)}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{nomsCount} noms</span>
                      <span className="text-slate-400"> / </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{votesCount} votes</span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      {cat.status !== 'Archived' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Archive category "${cat.name}"?`)) {
                              archiveCategory(cat.id);
                            }
                          }}
                          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                        >
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryManagerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={editingCategory}
      />
    </div>
  );
}
