"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface Stats {
  totalFeedbacks: number;
  averageScores: {
    toolBuildQuality: number | null;
    packaging: number | null;
    onTimeDelivery: number | null;
    afterSalesSupport: number | null;
    productUsability: number | null;
    recommendationScore: number | null;
  };
  recentFeedbacks: Array<{
    id: string;
    contactName: string;
    companyName: string;
    recommendationScore: number;
    createdAt: string;
  }>;
}

interface Feedback {
  id: string;
  email: string;
  date: string;
  contactName: string;
  companyName: string;
  country: string;
  salesOrderNumber: string;
  toolBuildQuality: number;
  packaging: number;
  onTimeDelivery: number;
  afterSalesSupport: number;
  productUsability: number;
  recommendationScore: number;
  suggestions: string | null;
  createdAt: string;
}

//update

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchStats();
      fetchFeedbacks();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch("/api/feedback?limit=50");
      const data = await response.json();
      if (data.success) {
        setFeedbacks(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D6312F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const getNPSCategory = (score: number) => {
    if (score >= 9)
      return {
        label: "Promoter",
        color: "bg-green-100 text-green-700 border-green-200",
      };
    if (score >= 7)
      return {
        label: "Passive",
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      };
    return {
      label: "Detractor",
      color: "bg-red-100 text-red-700 border-red-200",
    };
  };

  const calculateOverallScore = () => {
    if (!stats) return 0;
    const scores = [
      stats.averageScores.toolBuildQuality,
      stats.averageScores.packaging,
      stats.averageScores.onTimeDelivery,
      stats.averageScores.afterSalesSupport,
      stats.averageScores.productUsability,
    ].filter((s) => s !== null) as number[];

    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D6312F] to-[#A52520] rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00 2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Tritorc Admin
                </h1>
                <p className="text-xs text-gray-500">Feedback Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-700">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500">{session.user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#D6312F] hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 border border-gray-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  Total Responses
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalFeedbacks}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  All time submissions
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D6312F] to-[#A52520] rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  Overall Score
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {calculateOverallScore().toFixed(1)}
                  <span className="text-xl text-gray-500">/10</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Average across all metrics
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  NPS Score
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.averageScores.recommendationScore?.toFixed(1) || "N/A"}
                  <span className="text-xl text-gray-500">/10</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Net Promoter Score</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  Delivery Score
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.averageScores.onTimeDelivery?.toFixed(1) || "N/A"}
                  <span className="text-xl text-gray-500">/10</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  On-time delivery rating
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Average Scores */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D6312F] to-[#A52520] rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00 2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Performance Metrics
                  </h3>
                </div>
                <div className="space-y-5">
                  <ScoreBar
                    label="Tool Build Quality"
                    score={stats.averageScores.toolBuildQuality}
                    icon="🔧"
                  />
                  <ScoreBar
                    label="Packaging"
                    score={stats.averageScores.packaging}
                    icon="📦"
                  />
                  <ScoreBar
                    label="On-Time Delivery"
                    score={stats.averageScores.onTimeDelivery}
                    icon="🚚"
                  />
                  <ScoreBar
                    label="After-Sales Support"
                    score={stats.averageScores.afterSalesSupport}
                    icon="💬"
                  />
                  <ScoreBar
                    label="Product Usability"
                    score={stats.averageScores.productUsability}
                    icon="⚙️"
                  />
                </div>
              </div>

              {/* Recent Feedback */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Recent Feedback
                  </h3>
                </div>
                <div className="space-y-4">
                  {stats.recentFeedbacks.map((feedback) => {
                    const nps = getNPSCategory(feedback.recommendationScore);
                    return (
                      <div
                        key={feedback.id}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#D6312F] transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {feedback.contactName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {feedback.companyName}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${nps.color}`}
                          >
                            {feedback.recommendationScore}/10
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${nps.color}`}
                          >
                            {nps.label}
                          </span>
                          <p className="text-xs text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* All Feedback Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-6 py-5 border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#D6312F] to-[#A52520] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    All Submissions
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feedbacks.length} total responses
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    NPS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedbacks.map((feedback) => {
                  const nps = getNPSCategory(feedback.recommendationScore);
                  return (
                    <tr
                      key={feedback.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {feedback.contactName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {feedback.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {feedback.companyName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {feedback.country}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-900 bg-gray-50 rounded">
                        {feedback.salesOrderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${nps.color}`}
                        >
                          {feedback.recommendationScore}/10
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(feedback.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedFeedback(feedback)}
                          className="text-[#D6312F] hover:text-[#A52520] text-sm font-semibold flex items-center gap-1 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-[#D6312F] to-[#A52520] text-white px-6 py-5 flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Feedback Details</h3>
                <p className="text-sm text-white/90 mt-1">
                  Complete response information
                </p>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#D6312F]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField
                    label="Contact Name"
                    value={selectedFeedback.contactName}
                  />
                  <InfoField label="Email" value={selectedFeedback.email} />
                  <InfoField
                    label="Company"
                    value={selectedFeedback.companyName}
                  />
                  <InfoField label="Country" value={selectedFeedback.country} />
                  <InfoField
                    label="Order Number"
                    value={selectedFeedback.salesOrderNumber}
                  />
                  <InfoField
                    label="Date"
                    value={new Date(selectedFeedback.date).toLocaleDateString()}
                  />
                </div>
              </div>

              {/* Ratings */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#D6312F]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00 2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Performance Ratings
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <RatingCard
                    label="Build Quality"
                    score={selectedFeedback.toolBuildQuality}
                    icon="🔧"
                  />
                  <RatingCard
                    label="Packaging"
                    score={selectedFeedback.packaging}
                    icon="📦"
                  />
                  <RatingCard
                    label="Delivery"
                    score={selectedFeedback.onTimeDelivery}
                    icon="🚚"
                  />
                  <RatingCard
                    label="Support"
                    score={selectedFeedback.afterSalesSupport}
                    icon="💬"
                  />
                  <RatingCard
                    label="Usability"
                    score={selectedFeedback.productUsability}
                    icon="⚙️"
                  />
                  <RatingCard
                    label="NPS Score"
                    score={selectedFeedback.recommendationScore}
                    icon="⭐"
                    highlight
                  />
                </div>
              </div>

              {/* Suggestions */}
              {selectedFeedback.suggestions && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#D6312F]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    Customer Feedback & Suggestions
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-lg border border-blue-100">
                    {selectedFeedback.suggestions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  score,
  icon,
}: {
  label: string;
  score: number | null;
  icon?: string;
}) {
  const percentage = score ? (score / 10) * 100 : 0;
  const displayScore = score?.toFixed(1) || "N/A";

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span className="text-sm font-bold text-gray-900">
          {displayScore}
          <span className="text-gray-500 text-xs">/10</span>
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#D6312F] to-[#A52520] h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function RatingCard({
  label,
  score,
  icon,
  highlight,
}: {
  label: string;
  score: number;
  icon?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border-2 ${
        highlight
          ? "bg-gradient-to-br from-[#D6312F]/10 to-[#A52520]/10 border-[#D6312F]"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-lg">{icon}</span>}
        <p className="text-xs font-medium text-gray-600">{label}</p>
      </div>
      <p
        className={`text-2xl font-bold ${
          highlight ? "text-[#D6312F]" : "text-gray-900"
        }`}
      >
        {score}
        <span className="text-sm text-gray-500">/10</span>
      </p>
    </div>
  );
}
