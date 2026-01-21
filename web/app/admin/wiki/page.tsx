'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

export default function AdminWiki() {
    const [files, setFiles] = useState<any[]>([]);
    const [indexing, setIndexing] = useState(false);
    const { showToast } = useToast();

    const fetchFiles = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/kb/files`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setFiles(await res.json());
    };

    useEffect(() => { fetchFiles(); }, []);

    const handleReindex = async () => {
        if (!confirm('确定要重新索引整个知识库吗？这会消耗大量 API 额度（Embedding）并花费较长时间。')) return;
        
        setIndexing(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/admin/kb/reindex`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            showToast('索引任务已在后台启动', 'success');
        } else {
            showToast('任务启动失败', 'error');
        }
        setTimeout(() => setIndexing(false), 5000);
    };

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-ink font-serif tracking-widest">知识库管理</h2>
                    <p className="text-xs text-stone-400 mt-1">管理 RAG 原始文档与向量索引</p>
                </div>
                <button 
                    onClick={handleReindex}
                    disabled={indexing}
                    className={`btn-seal px-6 py-2 text-sm ${indexing ? 'opacity-50' : ''}`}
                >
                    {indexing ? '正在提交任务...' : '重新建立索引'}
                </button>
            </div>

            <div className="ink-card p-0 bg-white overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-stone-800 text-white text-[10px] uppercase tracking-widest">
                            <th className="px-6 py-4">文件名</th>
                            <th className="px-6 py-4">相对路径</th>
                            <th className="px-6 py-4 text-right">大小 (KB)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-serif">
                        {files.map((file, idx) => (
                            <tr key={idx} className="hover:bg-stone-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-bold text-ink">{file.name}</td>
                                <td className="px-6 py-4 text-xs text-stone-400 font-mono">{file.path}</td>
                                <td className="px-6 py-4 text-xs text-stone-500 text-right">{(file.size / 1024).toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
