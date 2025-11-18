'use client';

import { useState, useEffect } from 'react';
import { Trophy, Plus, Gift, Star, Zap, Edit2, Trash2, Award } from 'lucide-react';
import { customRewardsApi, rewardsApi } from '@/lib/api';
import { useToast } from '@/components/ui/ToastContainer';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const REWARD_ICONS = ['🎁', '🏆', '🎉', '🍕', '🎮', '📺', '☕', '🍰', '🎬', '🛍️', '💆', '🎵'];

function RewardModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_required: 100,
    icon: REWARD_ICONS[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        points_required: initialData.points_required || 100,
        icon: initialData.icon || REWARD_ICONS[0],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        points_required: 100,
        icon: REWARD_ICONS[0],
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error saving reward:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {initialData ? 'Edit Reward' : 'New Custom Reward'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Reward Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Movie Night, Coffee Break"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="Describe your reward..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Points Required <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.points_required}
              onChange={(e) => setFormData({ ...formData, points_required: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {REWARD_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`text-2xl p-3 rounded-lg border-2 transition-all ${
                    formData.icon === icon
                      ? 'border-indigo-500 bg-indigo-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [redeemingId, setRedeemingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rewardsRes, userRes] = await Promise.all([
        customRewardsApi.getAll(),
        rewardsApi.getAll(),
      ]);
      setRewards(rewardsRes.data);
      setUserPoints(userRes.data.points || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.showError('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedReward) {
        await customRewardsApi.update(selectedReward.id, data);
        toast.showSuccess('Reward updated successfully');
      } else {
        await customRewardsApi.create(data);
        toast.showSuccess('Reward created successfully');
      }
      await fetchData();
      setShowModal(false);
      setSelectedReward(null);
    } catch (error) {
      console.error('Error saving reward:', error);
      toast.showError('Failed to save reward');
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!rewardToDelete) return;

    setDeleteLoading(true);
    try {
      await customRewardsApi.delete(rewardToDelete.id);
      toast.showSuccess('Reward deleted successfully');
      await fetchData();
      setShowDeleteConfirm(false);
      setRewardToDelete(null);
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.showError('Failed to delete reward');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    if (userPoints < reward.points_required) {
      toast.showWarning('Not enough points to redeem this reward');
      return;
    }

    if (!confirm(`Redeem "${reward.title}" for ${reward.points_required} points?`)) {
      return;
    }

    setRedeemingId(reward.id);
    try {
      await customRewardsApi.redeem(reward.id);
      toast.showSuccess(`🎉 Reward redeemed! Enjoy your ${reward.title}`);
      await fetchData();
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.showError('Failed to redeem reward');
    } finally {
      setRedeemingId(null);
    }
  };

  const availableRewards = rewards.filter(r => !r.is_redeemed);
  const redeemedRewards = rewards.filter(r => r.is_redeemed);

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header with Points */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Rewards</h1>
            </div>
            <p className="text-gray-600">Create custom rewards and redeem them with your points</p>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Your Points</p>
                <p className="text-3xl font-bold">{userPoints}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setSelectedReward(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Custom Reward
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Available Rewards */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6 text-green-600" />
              Available Rewards
            </h2>

            {availableRewards.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rewards yet</h3>
                <p className="text-gray-600 mb-4">Create your first custom reward</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create Reward
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRewards.map((reward) => {
                  const canAfford = userPoints >= reward.points_required;
                  const isRedeeming = redeemingId === reward.id;

                  return (
                    <div
                      key={reward.id}
                      className={`bg-white rounded-lg border-2 p-6 transition-all ${
                        canAfford ? 'border-green-300 hover:shadow-lg' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{reward.icon}</div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedReward(reward);
                              setShowModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setRewardToDelete(reward);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                          <Zap className="w-5 h-5" />
                          {reward.points_required} points
                        </div>

                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={!canAfford || isRedeeming}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            canAfford && !isRedeeming
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isRedeeming ? 'Redeeming...' : 'Redeem'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Redeemed Rewards */}
          {redeemedRewards.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-600" />
                Redeemed Rewards
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {redeemedRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="bg-gray-50 rounded-lg border border-gray-300 p-6 opacity-75"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl grayscale">{reward.icon}</div>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                        Redeemed
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{reward.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                    <div className="flex items-center gap-2 text-gray-500 text-sm pt-4 border-t border-gray-200">
                      <Zap className="w-4 h-4" />
                      Cost: {reward.points_required} points
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Reward Modal */}
      <RewardModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedReward(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedReward}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setRewardToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Reward"
        message={`Are you sure you want to delete "${rewardToDelete?.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
