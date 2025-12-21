import React, { useState } from 'react';
import { practiceService } from '../services/otherServices';
import { useNavigate } from 'react-router-dom';

const Practice = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        subject: '',
        num_questions: 10,
        difficulty: 'Medium'
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            const response = await practiceService.create(formData);
            // Navigate to take practice exam
            navigate(`/app/practice/${response.practice_id}/take`);
        } catch (err) {
            setError(err.message || 'Không thể tạo bài tự luyện');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold gradient-text mb-2">Tự luyện</h1>
                <p className="text-gray-500">Tạo bài tập tự luyện cá nhân</p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            <div className="card-glass p-8">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Môn học
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="input-glass"
                            placeholder="VD: Lập trình Web"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Số câu hỏi
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={formData.num_questions}
                            onChange={(e) => setFormData({ ...formData, num_questions: parseInt(e.target.value) })}
                            className="input-glass"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Độ khó
                        </label>
                        <select
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            className="input-glass"
                        >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary disabled:opacity-50"
                    >
                        {loading ? 'Đang tạo...' : 'Tạo bài tự luyện'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Practice;
