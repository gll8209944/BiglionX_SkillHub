'use client';

import { useState } from 'react';

interface FeedbackButtonProps {
  skillSlug: string;
  currentCategory?: string;
  currentSubcategory?: string;
}

export default function FeedbackButton({ 
  skillSlug, 
  currentCategory,
  currentSubcategory 
}: FeedbackButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('subcategory_correction');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [suggestedSubcategory, setSuggestedSubcategory] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`/api/skills/${skillSlug}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackType,
          suggestedCategory: suggestedCategory || undefined,
          suggestedSubcategory: suggestedSubcategory || undefined,
          reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.feedback.message);
        setTimeout(() => {
          setShowModal(false);
          setMessage('');
          setReason('');
          setSuggestedCategory('');
          setSuggestedSubcategory('');
        }, 2000);
      } else {
        setMessage(data.error || '提交失败，请重试');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage('网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        报告分类错误
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              onClick={() => setShowModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    报告分类错误
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-4">
                      帮助我们改进分类系统。如果您发现这个技能的分类不正确，请告诉我们正确的分类应该是什么。
                    </p>

                    {message && (
                      <div className={`mb-4 p-3 rounded-md ${
                        message.includes('感谢') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}>
                        {message}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          反馈类型
                        </label>
                        <select
                          value={feedbackType}
                          onChange={(e) => setFeedbackType(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="subcategory_correction">子分类错误</option>
                          <option value="category_correction">主分类错误</option>
                          <option value="tag_correction">标签错误</option>
                          <option value="other">其他问题</option>
                        </select>
                      </div>

                      {(feedbackType === 'category_correction' || feedbackType === 'subcategory_correction') && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              当前分类
                            </label>
                            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
                              {currentCategory}
                              {currentSubcategory && ` > ${currentSubcategory}`}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              建议的分类（可选）
                            </label>
                            <input
                              type="text"
                              value={suggestedCategory}
                              onChange={(e) => setSuggestedCategory(e.target.value)}
                              placeholder="例如: ai_ml"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              建议的子分类（可选）
                            </label>
                            <input
                              type="text"
                              value={suggestedSubcategory}
                              onChange={(e) => setSuggestedSubcategory(e.target.value)}
                              placeholder="例如: llm_tools"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          详细说明 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          required
                          rows={4}
                          placeholder="请详细说明为什么您认为分类不正确，以及正确的分类应该是什么..."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? '提交中...' : '提交反馈'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          取消
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
