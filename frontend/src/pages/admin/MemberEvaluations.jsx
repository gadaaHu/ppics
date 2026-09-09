import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartBar, FaPlus, FaTimes, FaSpinner, FaTrash, FaCheckCircle, FaStar, FaBuilding, FaUserCheck, FaEdit } from 'react-icons/fa';
import { getEvaluations, createEvaluation, deleteEvaluation, approveEvaluation, updateEvaluation } from '../../api/evaluationApi';
import { getMembers } from '../../api/memberApi';
import { getSettings } from '../../api/settingsApi';
import { useAuth } from '../../context/AuthContext';

const MemberEvaluations = () => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [evaluationCriteria, setEvaluationCriteria] = useState([]);

  const [formData, setFormData] = useState({
    member_id: '',
    evaluation_period: '',
    criteria_scores: {},
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evalRes, membersRes, settingsRes] = await Promise.all([
        getEvaluations(),
        getMembers(),
        getSettings()
      ]);

      if (evalRes.success) setEvaluations(evalRes.data);
      if (membersRes.success) setMembers(membersRes.data);
      if (settingsRes.success && settingsRes.data && settingsRes.data.evaluation_criteria) {
        try {
          const criteria = JSON.parse(settingsRes.data.evaluation_criteria);
          setEvaluationCriteria(criteria);

          // Initialize criteria scores in formData
          const initialScores = {};
          criteria.forEach(c => {
            initialScores[c.id] = 0;
          });
          setFormData(prev => ({ ...prev, criteria_scores: initialScores }));
        } catch (e) {
          console.error('Failed to parse evaluation criteria', e);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (criteriaId, val) => {
    setFormData(prev => ({
      ...prev,
      criteria_scores: {
        ...prev.criteria_scores,
        [criteriaId]: parseInt(val) || 0
      }
    }));
  };

  const calculateTotal = () => {
    return Object.values(formData.criteria_scores).reduce((sum, score) => sum + (score || 0), 0);
  };

  const getMaxTotal = () => {
    return evaluationCriteria.reduce((sum, c) => sum + (parseInt(c.max_score) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.member_id || !formData.evaluation_period) {
      alert("Please select a member and period.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        member_id: formData.member_id,
        evaluation_period: formData.evaluation_period,
        total_score: calculateTotal(),
        criteria_scores: formData.criteria_scores,
        remarks: formData.remarks
      };

      let res;
      if (editingId) {
        res = await updateEvaluation(editingId, payload);
      } else {
        res = await createEvaluation(payload);
      }

      if (res.success) {
        setMessage(editingId ? 'Evaluation updated successfully' : 'Evaluation saved successfully');
        setShowModal(false);
        resetForm();
        fetchData();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      const msg = error.response?.data?.message || 'Failed to save evaluation';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    const resetScores = {};
    evaluationCriteria.forEach(c => {
      resetScores[c.id] = 0;
    });
    setFormData({
      member_id: '',
      evaluation_period: '',
      criteria_scores: resetScores,
      remarks: ''
    });
    setEditingId(null);
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (evalRecord) => {
    let parsedScores = {};
    try {
      parsedScores = typeof evalRecord.criteria_scores === 'string' 
        ? JSON.parse(evalRecord.criteria_scores) 
        : evalRecord.criteria_scores || {};
    } catch (e) {
      console.error('Error parsing criteria scores', e);
    }

    setFormData({
      member_id: evalRecord.member_id,
      evaluation_period: evalRecord.evaluation_period,
      criteria_scores: parsedScores,
      remarks: evalRecord.remarks || ''
    });
    setEditingId(evalRecord.evaluation_id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this evaluation?")) return;
    try {
      const res = await deleteEvaluation(id);
      if (res.success) {
        setEvaluations(evaluations.filter(e => e.evaluation_id !== id));
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approveEvaluation(id);
      if (res.success) {
        setMessage('Evaluation approved successfully');
        fetchData(); // Refresh to update status
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error approving evaluation:', error);
      alert('Failed to approve evaluation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FaSpinner className="animate-spin text-blue-500 text-4xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaChartBar className="text-blue-600" />
            Member Activity Evaluations
          </h1>
          <p className="text-gray-500 mt-1">
            Track and evaluate the performance of party members
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
        >
          <FaPlus /> New Evaluation
        </button>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-2">
          <FaCheckCircle /> {message}
        </div>
      )}

      {/* Evaluations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 text-sm font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left">Member</th>
                <th className="px-6 py-4 text-left">Period</th>
                <th className="px-6 py-4 text-left">Total Score</th>
                <th className="px-6 py-4 text-left">Evaluator</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No evaluations found.
                  </td>
                </tr>
              ) : (
                evaluations.map((evalRecord) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={evalRecord.evaluation_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{evalRecord.member_name}</div>
                      <div className="text-xs text-gray-500">{evalRecord.member_phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {evalRecord.evaluation_period}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          getMaxTotal() > 0 
                            ? (evalRecord.total_score >= (getMaxTotal() * 0.75) ? 'text-green-600' : 
                               evalRecord.total_score >= (getMaxTotal() * 0.5) ? 'text-yellow-600' : 'text-red-600')
                            : 'text-blue-600'
                        }`}>
                          {evalRecord.total_score} {getMaxTotal() > 0 ? `/ ${getMaxTotal()}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {evalRecord.evaluator_name} ({evalRecord.evaluator_role})
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        evalRecord.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {evalRecord.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(evalRecord.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {evalRecord.status !== 'Approved' && (user?.role === 'admin' || user?.role === 'leader') && (
                          <button
                            onClick={() => handleApprove(evalRecord.evaluation_id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve Evaluation"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                        {evalRecord.status !== 'Approved' && (
                          <button
                            onClick={() => handleEdit(evalRecord)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Evaluation"
                          >
                            <FaEdit />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(evalRecord.evaluation_id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Evaluation"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Evaluation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h5 className="text-lg font-semibold flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                {editingId ? 'Edit Member Evaluation' : 'New Member Evaluation'}
              </h5>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Member *</label>
                  <select
                    required
                    disabled={!!editingId} // Disable changing member while editing
                    value={formData.member_id}
                    onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map(m => (
                      <option key={m.member_id} value={m.member_id}>
                        {m.full_name} ({m.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Period *</label>
                  <input
                    type="text"
                    required
                    value={formData.evaluation_period}
                    onChange={(e) => setFormData({ ...formData, evaluation_period: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Q3 2026 or August 2026"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUserCheck className="text-blue-500" />
                  Scoring Criteria (Max {getMaxTotal()})
                </h4>

                <div className="space-y-4">
                  {evaluationCriteria.map(criterion => (
                    <div key={criterion.id} className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                      <label className="text-sm text-gray-700 w-1/2 font-medium">
                        {criterion.name} (0-{criterion.max_score})
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={criterion.max_score}
                          value={formData.criteria_scores[criterion.id] || 0}
                          onChange={(e) => {
                            let val = parseInt(e.target.value) || 0;
                            if (val > criterion.max_score) val = criterion.max_score;
                            handleScoreChange(criterion.id, val);
                          }}
                          className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-blue-700"
                        />
                        <span className="text-xs text-gray-400 font-medium">/ {criterion.max_score}</span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-200 flex justify-between items-center bg-blue-50 -mx-5 -mb-5 px-5 py-4 rounded-b-xl">
                    <span className="font-bold text-gray-800 text-lg">Total Score:</span>
                    <span className={`text-2xl font-bold ${calculateTotal() >= (getMaxTotal() * 0.75) ? 'text-green-600' : calculateTotal() >= (getMaxTotal() * 0.5) ? 'text-yellow-600' : 'text-red-600'}`}>
                      {calculateTotal()} <span className="text-sm text-gray-500 font-normal">/ {getMaxTotal()}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks & Feedback</label>
                <textarea
                  rows="3"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Provide comments on the member's performance..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || calculateTotal() > getMaxTotal()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  {editingId ? 'Update Evaluation' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberEvaluations;
