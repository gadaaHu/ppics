import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaPlus, FaTimes, FaSpinner, FaTrash, FaCheckCircle, FaPrint, FaFileInvoiceDollar, FaBuilding } from 'react-icons/fa';
import { getPayments, createPayment, deletePayment, approvePayment } from '../../api/paymentApi';
import { getMembers } from '../../api/memberApi';
import { useAuth } from '../../context/AuthContext';

const MemberPayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  
  // Receipt viewing state
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    payment_month: new Date().toLocaleString('default', { month: 'long' }),
    payment_year: new Date().getFullYear()
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, memRes] = await Promise.all([
        getPayments(),
        getMembers()
      ]);

      if (payRes.success) setPayments(payRes.data);
      if (memRes.success) setMembers(memRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberChange = (e) => {
    const memberId = e.target.value;
    const member = members.find(m => m.member_id.toString() === memberId);
    setFormData({
      ...formData,
      member_id: memberId,
      amount: member ? member.membership_fee || '' : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.member_id || !formData.amount) {
      alert("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await createPayment(formData);
      if (res.success) {
        setMessage('Payment logged successfully');
        setShowModal(false);
        setFormData({
          member_id: '',
          amount: '',
          payment_month: new Date().toLocaleString('default', { month: 'long' }),
          payment_year: new Date().getFullYear()
        });
        fetchData();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      const msg = error.response?.data?.message || 'Failed to save payment';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approvePayment(id);
      if (res.success) {
        setMessage(`Payment approved. Receipt Generated: ${res.receipt_number}`);
        fetchData();
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to approve payment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    try {
      const res = await deletePayment(id);
      if (res.success) {
        setPayments(payments.filter(p => p.payment_id !== id));
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const openReceipt = (payment) => {
    setSelectedReceipt(payment);
    setShowReceipt(true);
  };

  const printReceipt = () => {
    window.print();
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
      {/* Hide controls during printing */}
      <div className="print:hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-600" />
              Monthly Membership Fees
            </h1>
            <p className="text-gray-500 mt-1">
              Track and approve monthly fee payments
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm"
          >
            <FaPlus /> Log Payment
          </button>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-2">
            <FaCheckCircle /> {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 text-sm font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Member</th>
                  <th className="px-6 py-4 text-left">Period</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Receipt No.</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={payment.payment_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{payment.member_name}</div>
                        <div className="text-xs text-gray-500">{payment.member_phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-700">
                          {payment.payment_month} {payment.payment_year}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600">
                        {payment.amount} Birr
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {payment.receipt_number || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {payment.status !== 'Approved' && (
                            <button
                              onClick={() => handleApprove(payment.payment_id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve & Generate Receipt"
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                          {payment.status === 'Approved' && (
                            <button
                              onClick={() => openReceipt(payment)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View/Print Receipt"
                            >
                              <FaPrint />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(payment.payment_id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Record"
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
      </div>

      {/* New Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h5 className="text-lg font-semibold flex items-center gap-2">
                <FaFileInvoiceDollar className="text-green-500" />
                Log Monthly Payment
              </h5>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member *</label>
                  <select
                    required
                    value={formData.member_id}
                    onChange={handleMemberChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">-- Choose Member --</option>
                    {members.map(m => (
                      <option key={m.member_id} value={m.member_id}>
                        {m.full_name} ({m.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                    <select
                      required
                      value={formData.payment_month}
                      onChange={(e) => setFormData({ ...formData, payment_month: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      {months.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                    <select
                      required
                      value={formData.payment_year}
                      onChange={(e) => setFormData({ ...formData, payment_year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Birr) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-bold text-green-700"
                    placeholder="e.g. 100.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Amount is auto-filled based on the member's set monthly fee, but can be overridden.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {showReceipt && selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:block">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 print:w-full print:max-w-none print:shadow-none print:border-none shadow-2xl relative">
            
            {/* Action buttons (hidden when printing) */}
            <div className="absolute top-4 right-4 flex gap-2 print:hidden">
              <button
                onClick={printReceipt}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaPrint /> Print Certificate
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            {/* Certificate Content */}
            <div className="border-4 border-double border-gray-300 p-8 rounded-lg mt-8 print:mt-0 relative overflow-hidden bg-white">
              {/* Watermark Logo Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <FaBuilding className="text-[300px]" />
              </div>
              
              <div className="text-center border-b-2 border-gray-200 pb-6 mb-6">
                <h1 className="text-3xl font-serif font-bold text-gray-800 uppercase tracking-widest">Official Receipt</h1>
                <h2 className="text-lg text-gray-600 mt-2 font-serif">Prosperity Party Cooperative</h2>
              </div>
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Receipt No.</p>
                  <p className="text-lg font-mono font-bold text-gray-800">{selectedReceipt.receipt_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Date of Issue</p>
                  <p className="text-lg font-medium text-gray-800">{new Date(selectedReceipt.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 mb-8">
                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Received From</p>
                    <p className="text-xl font-bold text-gray-800">{selectedReceipt.member_name}</p>
                    <p className="text-sm text-gray-600">{selectedReceipt.member_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Amount Received</p>
                    <p className="text-2xl font-bold text-green-700">{selectedReceipt.amount} Birr</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">For Payment Of</p>
                    <p className="text-lg font-medium text-gray-800">
                      Monthly Membership Fee - <span className="font-bold">{selectedReceipt.payment_month} {selectedReceipt.payment_year}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end mt-12 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="w-48 border-b border-gray-400 mb-2"></div>
                  <p className="text-sm font-medium text-gray-600">Member Signature</p>
                </div>
                <div className="text-center">
                  <div className="w-48 border-b border-gray-400 mb-2">
                    <span className="font-handwriting text-xl text-blue-800">{selectedReceipt.approver_name}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">Authorized Official</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MemberPayments;
