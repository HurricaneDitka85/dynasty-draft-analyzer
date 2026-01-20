import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Users, Target, Award, Calendar, RefreshCw, AlertCircle, Trophy, TrendingDown } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leagueData, setLeagueData] = useState(null);
  const [allDrafts, setAllDrafts] = useState([]);
  const [ownerStats, setOwnerStats] = useState([]);
  const [userStats, setUserStats] = useState(null);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#14b8a6'];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      
      setLeagueData(data.league);
      setAllDrafts(data.drafts);
      setOwnerStats(data.ownerStats);
      setUserStats(data.userStats);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Analyzing 6 years of draft data...</p>
          <p className="text-purple-300 text-sm mt-2">This may take a moment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-200 text-lg mb-4">Error: {error}</p>
          <button 
            onClick={fetchAllData}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-6xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Dynasty Draft Intelligence
          </h1>
          <p className="text-purple-200 text-xl">{leagueData?.name}</p>
          <p className="text-purple-300 text-sm mt-1">2019-2024 Performance Analysis</p>
        </div>

        {userStats && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Your Draft Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <span className="text-3xl font-bold text-white">{userStats.leagueRank}</span>
                </div>
                <p className="text-purple-200">League Rank</p>
                <p className="text-purple-300 text-xs mt-1">of {ownerStats.length} owners</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-green-400" />
                  <span className="text-3xl font-bold text-white">{userStats.hitRate}%</span>
                </div>
                <p className="text-purple-200">Hit Rate</p>
                <p className="text-purple-300 text-xs mt-1">Picks still rostered or 500+ pts</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-blue-400" />
                  <span className="text-3xl font-bold text-white">{userStats.retentionRate}%</span>
                </div>
                <p className="text-purple-200">Retention Rate</p>
                <p className="text-purple-300 text-xs mt-1">Still on your roster</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <span className="text-3xl font-bold text-white">{userStats.avgPointsPerPick}</span>
                </div>
                <p className="text-purple-200">Avg Pts/Pick</p>
                <p className="text-purple-300 text-xs mt-1">Career points per draft pick</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">League Drafter Rankings (2019-2024)</h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Rank</th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Owner</th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Hit Rate</th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Retention</th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Avg Pts/Pick</th>
                    <th className="text-left py-3 px-4 text-purple-200 font-semibold">Total Picks</th>
                  </tr>
                </thead>
                <tbody>
                  {ownerStats.map((owner, idx) => (
                    <tr key={idx} className={`border-b border-white/10 hover:bg-white/5 transition ${owner.isYou ? 'bg-blue-500/20' : ''}`}>
                      <td className="py-3 px-4">
                        {idx === 0 && <Trophy className="w-5 h-5 text-yellow-400 inline mr-2" />}
                        <span className="text-white font-semibold">{idx + 1}</span>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {owner.name}
                        {owner.isYou && <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded-full">YOU</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${owner.hitRate > 50 ? 'text-green-400' : owner.hitRate > 35 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {owner.hitRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">{owner.retentionRate}%</td>
                      <td className="py-3 px-4 text-white">{owner.avgPointsPerPick}</td>
                      <td className="py-3 px-4 text-purple-200">{owner.totalPicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {userStats && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">🎯 Your Draft Intelligence</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-green-500/10 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
                <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  Your Strengths
                </h3>
                <ul className="space-y-2 text-green-200">
                  {userStats.strengths?.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-500/10 backdrop-blur-lg rounded-xl p-6 border border-red-500/30">
                <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center">
                  <TrendingDown className="w-6 h-6 mr-2" />
                  Areas to Improve
                </h3>
                <ul className="space-y-2 text-red-200">
                  {userStats.weaknesses?.map((weakness, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {userStats?.tradeRecommendations && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">💡 Trade Strategy Recommendations</h2>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="space-y-4">
                {userStats.tradeRecommendations.map((rec, idx) => (
                  <div key={idx} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-white font-medium">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={fetchAllData}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition shadow-lg transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5 inline mr-2" />
            Refresh Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
