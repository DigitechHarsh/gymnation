'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../../lib/api';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { register, handleSubmit, reset } = useForm<any>();

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/faq');
      setFaqs(res.data.data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load FAQs' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const startEdit = (f: FaqItem) => {
    setEditingItem(f);
    setIsCreating(false);
    reset({
      question: f.question,
      answer: f.answer,
      category: f.category,
      isActive: f.isActive,
      sortOrder: f.sortOrder,
    });
  };

  const startCreate = () => {
    setEditingItem(null);
    setIsCreating(true);
    reset({
      question: '',
      answer: '',
      category: 'MEMBERSHIP',
      isActive: true,
      sortOrder: faqs.length + 1,
    });
  };

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        question: data.question,
        answer: data.answer,
        category: data.category.toUpperCase(),
        isActive: Boolean(data.isActive),
        sortOrder: Number(data.sortOrder) || 1,
      };

      if (editingItem) {
        await apiClient.put(`/admin/faq/${editingItem.id}`, payload);
        setFeedback({ type: 'success', message: 'FAQ updated' });
      } else {
        await apiClient.post('/admin/faq', payload);
        setFeedback({ type: 'success', message: 'FAQ created' });
      }

      setEditingItem(null);
      setIsCreating(false);
      fetchFaqs();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/faq/${id}`);
      setFeedback({ type: 'success', message: 'FAQ deleted' });
      fetchFaqs();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Delete failed' });
    }
  };

  const handleMove = async (index: number, direction: 'UP' | 'DOWN') => {
    const list = [...faqs];
    const target = direction === 'UP' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
    setFaqs(list);
    try {
      await apiClient.patch('/admin/faq/reorder', {
        ids: list.map((f) => f.id),
      });
    } catch {
      fetchFaqs();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-gn-ivory">FREQUENTLY ASKED QUESTIONS</h1>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            WEBSITE ACCORDION QUESTIONS & DETAILED ANSWERS
          </p>
        </div>
        {!editingItem && !isCreating && (
          <button
            onClick={startCreate}
            className="mt-4 sm:mt-0 px-4 py-2 bg-gn-maroon hover:bg-gn-maroon-dark text-white border border-gn-maroon text-xs uppercase font-mono tracking-wider transition-colors"
          >
            + ADD QUESTION
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3 text-xs font-mono border ${
            feedback.type === 'success'
              ? 'bg-green-950/40 border-green-800 text-green-300'
              : 'bg-red-950/40 border-red-800 text-red-300'
          }`}
        >
          [{feedback.type.toUpperCase()}]: {feedback.message}
        </div>
      )}

      {(editingItem || isCreating) && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gn-surface border border-gn-border p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gn-border pb-3">
            <span className="font-heading text-xl font-bold text-gn-ivory uppercase">
              {editingItem ? 'EDIT FAQ ITEM' : 'ADD NEW FAQ ITEM'}
            </span>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 border border-gn-border hover:border-gn-ivory text-xs font-mono uppercase tracking-wider text-gn-muted hover:text-gn-ivory transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                QUESTION
              </label>
              <input
                type="text"
                required
                {...register('question')}
                placeholder="What membership plans are available?"
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                CATEGORY
              </label>
              <select
                {...register('category')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory uppercase font-mono"
              >
                <option value="MEMBERSHIP">MEMBERSHIP</option>
                <option value="FACILITY">FACILITY & TIMINGS</option>
                <option value="TRAINING">PERSONAL TRAINING</option>
                <option value="SUPPLEMENTS">STORE & SUPPLEMENTS</option>
                <option value="SHIPPING">DELIVERY & SHIPPING</option>
                <option value="POLICIES">POLICIES & REFUNDS</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                ANSWER
              </label>
              <textarea
                rows={4}
                required
                {...register('answer')}
                className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-gn-black border border-gn-border md:col-span-3">
              <input
                type="checkbox"
                defaultChecked
                {...register('isActive')}
                className="w-4 h-4 accent-gn-maroon"
              />
              <span className="text-xs font-mono uppercase text-gn-ivory">VISIBLE IN FAQ ACCORDION</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gn-maroon hover:bg-gn-maroon-dark text-white font-mono text-xs uppercase tracking-wider"
            >
              SAVE FAQ
            </button>
          </div>
        </form>
      )}

      {/* FAQs List Accordion Preview */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-gn-muted uppercase">
            LOADING FAQS...
          </div>
        ) : (
          faqs.map((faq, index) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-gn-surface border border-gn-border overflow-hidden transition-colors"
              >
                <div className="p-4 flex items-center justify-between">
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="flex-1 cursor-pointer flex items-center gap-3"
                  >
                    <span className="text-xs font-mono text-gn-gold font-bold">
                      #{faq.sortOrder}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-gn-black border border-gn-border text-gn-muted">
                      {faq.category}
                    </span>
                    <span className="font-heading text-lg font-bold text-gn-ivory uppercase tracking-wide">
                      {faq.question}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <div className="flex flex-col">
                      <button
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'UP')}
                        className="text-[9px] hover:text-white disabled:opacity-20"
                      >
                        ▲
                      </button>
                      <button
                        disabled={index === faqs.length - 1}
                        onClick={() => handleMove(index, 'DOWN')}
                        className="text-[9px] hover:text-white disabled:opacity-20"
                      >
                        ▼
                      </button>
                    </div>
                    <button
                      onClick={() => startEdit(faq)}
                      className="text-xs font-mono uppercase text-gn-gold hover:underline"
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-xs font-mono uppercase text-red-400 hover:text-red-300"
                    >
                      DELETE
                    </button>
                    <span
                      onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                      className="cursor-pointer font-mono text-gn-muted text-sm px-1"
                    >
                      {isExpanded ? '−' : '+'}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-gn-black/60 border-t border-gn-border text-xs text-gn-ivory/80 leading-relaxed font-sans">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
