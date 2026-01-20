'use client';

import { useEffect, useState } from 'react';

export default function AdminLogs() {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/logs?limit=50`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(setLogs)
        .catch(console.error);
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <h2 className="text-2xl font-bold text-ink font-serif tracking-wider">系统日志 (最新50条)</h2>
                <button className="text-xs text-stone-500 hover:text-ink transition-colors" onClick={() => window.location.reload()}>刷新</button>
            </div>
            
            <div className="ink-card overflow-hidden">
                <table className="min-w-full divide-y divide-stone-100">
                    <thead className="bg-[#f5f5f0]/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">时间</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">方法</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">路径</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">状态</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">耗时</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">IP / 用户</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-stone-50">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-[#fffcf5] transition-colors">
                                <td className="px-6 py-3 whitespace-nowrap text-[10px] text-stone-400 font-mono">
                                    {new Date(log.time).toLocaleTimeString()}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                        log.method === 'GET' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        log.method === 'POST' ? 'bg-green-50 text-green-600 border-green-100' :
                                        'bg-stone-50 text-stone-500 border-stone-200'
                                    }`}>{log.method}</span>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-xs text-stone-600 font-mono max-w-[200px] truncate" title={log.endpoint}>
                                    {log.endpoint}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap">
                                    <span className={`text-[10px] font-bold ${
                                        log.status >= 500 ? 'text-red-600' :
                                        log.status >= 400 ? 'text-amber-500' :
                                        'text-emerald-600'
                                    }`}>
                                        {log.status}
                                    </span>
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-[10px] text-stone-400 font-mono">
                                    {log.latency.toFixed(0)}ms
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-[10px] text-stone-500">
                                    <div className="flex flex-col">
                                        <span>{log.ip}</span>
                                        <span className="text-stone-300">{log.username}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
