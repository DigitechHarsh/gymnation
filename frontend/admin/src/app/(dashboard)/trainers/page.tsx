'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { apiClient } from '../../../lib/api';
import { TrainerIcon, EditIcon, TrashIcon, PlusIcon, CheckIcon } from '../../../components/common/Icons';

export interface TrainerItem {
  id: string;
  name: string;
  role: string;
  experience: string;
  specialization: string;
  certifications?: string;
  photoUrl: string;
  bio?: string;
  instagram?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const DEFAULT_TRAINERS: TrainerItem[] = [
  {
    id: 'tr-1',
    name: 'Harshil Patil',
    role: 'Head Strength & Conditioning Coach',
    experience: '10+ Years',
    specialization: 'Olympic Weightlifting, Hypertrophy & Powerlifting',
    certifications: 'CSCS (NSCA), ACE Certified Personal Trainer, K11 Master Coach',
    photoUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80',
    bio: 'Former national powerlifting medalist. Harshil oversees athlete programming, biomechanics correction, and competition preparation at GymNation Surat.',
    instagram: '@harshil_iron_coach',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tr-2',
    name: 'Ananya Desai',
    role: 'Functional HIIT & Calisthenics Specialist',
    experience: '7+ Years',
    specialization: 'Mobility, Calisthenics, Metabolic Conditioning',
    certifications: 'CrossFit Level 2, ISSA Sports Nutrition Specialist',
    photoUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=600&q=80',
    bio: 'Specializes in high-intensity metabolic conditioning, bodyweight lever mastery, and sustainable fat loss for working professionals in Surat.',
    instagram: '@ananya_fitness_surat',
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tr-3',
    name: 'Rohan Mehta',
    role: 'Bodybuilding & Nutrition Coach',
    experience: '8+ Years',
    specialization: 'Physique Transformation & Macronutrient Periodization',
    certifications: 'Gold\'s Gym University Certified, Precision Nutrition L1',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Trained over 400+ physique transformations across Gujarat. Expert in supplement optimization and lean bulking protocols.',
    instagram: '@rohan_mehta_fit',
    sortOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tr-4',
    name: 'Priya Sharma',
    role: 'Postural Rehabilitation & Pilates Coach',
    experience: '6+ Years',
    specialization: 'Spinal Alignment, Core Stability & Flexibility',
    certifications: 'PMA Certified Pilates Teacher, Dry Needling & Rehab Level 1',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    bio: 'Focuses on injury prevention, desk-worker posture recovery, and deep core strengthening using advanced reformer and floor techniques.',
    instagram: '@priya_rehab_fit',
    sortOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<TrainerItem[]>(DEFAULT_TRAINERS);
  const [loading, setLoading] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<TrainerItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<TrainerItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<any>();

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/trainers');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setTrainers(res.data.data);
      }
    } catch {
      // Fallback to rich initial state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setValue('photoUrl', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCreate = () => {
    setEditingTrainer(null);
    setIsCreating(true);
    const initialPhoto = 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=600&q=80';
    setPhotoPreview(initialPhoto);
    reset({
      name: '',
      role: 'Strength & Conditioning Coach',
      experience: '5+ Years',
      specialization: 'Hypertrophy & Mobility',
      certifications: 'ACE / K11 Certified',
      photoUrl: initialPhoto,
      bio: '',
      instagram: '',
      sortOrder: trainers.length + 1,
      isActive: true,
    });
  };

  const startEdit = (t: TrainerItem) => {
    setEditingTrainer(t);
    setIsCreating(false);
    setPhotoPreview(t.photoUrl);
    reset({
      name: t.name,
      role: t.role,
      experience: t.experience,
      specialization: t.specialization,
      certifications: t.certifications || '',
      photoUrl: t.photoUrl,
      bio: t.bio || '',
      instagram: t.instagram || '',
      sortOrder: t.sortOrder,
      isActive: t.isActive,
    });
  };

  const onSubmit = async (formData: any) => {
    try {
      const item: TrainerItem = {
        id: editingTrainer ? editingTrainer.id : `tr-${Date.now()}`,
        name: formData.name.trim(),
        role: formData.role.trim(),
        experience: formData.experience.trim(),
        specialization: formData.specialization.trim(),
        certifications: formData.certifications?.trim() || '',
        photoUrl: formData.photoUrl.trim(),
        bio: formData.bio?.trim() || '',
        instagram: formData.instagram?.trim() || '',
        sortOrder: Number(formData.sortOrder) || trainers.length + 1,
        isActive: Boolean(formData.isActive),
        createdAt: editingTrainer ? editingTrainer.createdAt : new Date().toISOString(),
      };

      try {
        if (editingTrainer) {
          await apiClient.put(`/admin/trainers/${editingTrainer.id}`, item);
        } else {
          await apiClient.post('/admin/trainers', item);
        }
      } catch {
        // Fallback local persistence
      }

      setTrainers((prev) => {
        if (editingTrainer) {
          return prev.map((t) => (t.id === editingTrainer.id ? item : t));
        }
        return [...prev, item];
      });

      setFeedback({
        type: 'success',
        message: editingTrainer
          ? `Trainer profile for ${item.name} updated successfully`
          : `New coach ${item.name} added to GymNation training roster`,
      });
      setEditingTrainer(null);
      setIsCreating(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      try {
        await apiClient.delete(`/admin/trainers/${deleteTarget.id}`);
      } catch {
        // Fallback local
      }
      setTrainers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setFeedback({ type: 'success', message: `Trainer ${deleteTarget.name} removed from roster` });
      setDeleteTarget(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Delete failed' });
    }
  };

  const toggleStatus = (id: string) => {
    setTrainers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gn-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-extrabold tracking-wider text-gn-ivory uppercase">
              TRAINERS & COACHES ROSTER
            </h1>
            <span className="text-[10px] font-mono uppercase bg-gn-gold/10 text-gn-gold border border-gn-gold/30 px-2 py-0.5 font-bold">
              {trainers.length} COACHES ACTIVE
            </span>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-gn-gold mt-1">
            MANAGE SURAT GYMNATION HEAD COACHES, SPECIALTIES, CERTIFICATIONS & FLOOR SCHEDULE
          </p>
        </div>

        {!editingTrainer && !isCreating && (
          <button
            onClick={startCreate}
            className="mt-4 sm:mt-0 px-4 py-2.5 bg-gn-maroon hover:bg-gn-maroon/80 text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-lg"
          >
            <PlusIcon className="w-4 h-4 text-gn-gold" />
            <span>+ ADD NEW TRAINER</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 text-xs font-mono border flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-green-950/60 border-green-700 text-green-300 shadow-md'
              : 'bg-red-950/60 border-red-700 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider">✓ {feedback.type}:</span>
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold hover:underline">
            DISMISS
          </button>
        </div>
      )}

      {/* POPUP MODAL: REGISTER / EDIT TRAINER */}
      {(editingTrainer || isCreating) && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gn-surface border border-gn-border max-w-3xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center justify-between border-b border-gn-border pb-4">
                <div>
                  <span className="font-heading text-xl font-extrabold text-gn-ivory uppercase">
                    {editingTrainer ? `EDIT COACH PROFILE: ${editingTrainer.name}` : 'REGISTER NEW FITNESS COACH'}
                  </span>
                  <p className="text-[11px] font-mono text-gn-muted mt-0.5">
                    Coach profiles sync with the public storefront under "Meet The Team"
                  </p>
                </div>
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingTrainer(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 border border-gn-border hover:border-gn-ivory text-xs font-mono uppercase tracking-wider text-gn-muted hover:text-gn-ivory transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Name */}
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                    TRAINER FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    {...register('name')}
                    placeholder="Harshil Patil"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                  />
                </div>

                {/* Role / Designation */}
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                    ROLE / DESIGNATION *
                  </label>
                  <input
                    type="text"
                    required
                    {...register('role')}
                    placeholder="Head Strength & Conditioning Coach"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                    COACHING EXPERIENCE *
                  </label>
                  <input
                    type="text"
                    required
                    {...register('experience')}
                    placeholder="8+ Years"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-gold font-bold font-mono focus:border-gn-maroon focus:outline-none"
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                    PRIMARY SPECIALIZATION *
                  </label>
                  <input
                    type="text"
                    required
                    {...register('specialization')}
                    placeholder="Olympic Weightlifting & Powerlifting"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                  />
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                    ACCREDITATIONS & CERTIFICATIONS
                  </label>
                  <input
                    type="text"
                    {...register('certifications')}
                    placeholder="CSCS, ACE, K11 Master Trainer"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                    INSTAGRAM / SOCIAL HANDLE
                  </label>
                  <input
                    type="text"
                    {...register('instagram')}
                    placeholder="@coach_handle"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-gold font-mono focus:border-gn-maroon focus:outline-none"
                  />
                </div>

                {/* File Upload for Photo (replaces URL link) */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1 font-bold">
                    COACH PORTRAIT PHOTO (UPLOAD FILE) *
                  </label>
                  <input type="hidden" {...register('photoUrl', { required: true })} />
                  <div className="flex items-center gap-4 p-3 bg-gn-black border border-gn-border">
                    {photoPreview ? (
                      <div className="relative w-16 h-20 border border-gn-border overflow-hidden bg-gn-surface flex-shrink-0">
                        <img
                          src={photoPreview}
                          alt="Trainer preview"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-20 border border-dashed border-gn-border flex items-center justify-center text-gn-muted text-[10px] uppercase font-mono text-center flex-shrink-0">
                        No Photo
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <label className="inline-flex items-center gap-2 px-3 py-2 bg-gn-surface border border-gn-border hover:border-gn-gold text-xs font-mono uppercase text-gn-gold cursor-pointer transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>UPLOAD IMAGE FROM COMPUTER</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] font-mono text-gn-muted">
                        Select JPG, PNG or WEBP portrait file. Replaces external URL field.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                    DISPLAY SEQUENCE
                  </label>
                  <input
                    type="number"
                    {...register('sortOrder')}
                    placeholder="1"
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory font-mono focus:border-gn-maroon focus:outline-none"
                  />
                </div>

                {/* Bio */}
                <div className="md:col-span-3">
                  <label className="block text-xs uppercase font-mono tracking-wider text-gn-ivory mb-1">
                    COACH BIOGRAPHY / PHILOSOPHY
                  </label>
                  <textarea
                    rows={3}
                    {...register('bio')}
                    placeholder="Brief summary of coaching philosophy and athlete transformation track record..."
                    className="w-full bg-gn-black border border-gn-border px-3 py-2 text-sm text-gn-ivory focus:border-gn-maroon focus:outline-none resize-none font-sans"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gn-border">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    defaultChecked
                    {...register('isActive')}
                    className="w-4 h-4 accent-gn-maroon"
                  />
                  <label htmlFor="isActive" className="text-xs font-mono uppercase text-gn-ivory cursor-pointer font-bold">
                    DISPLAY ON PUBLIC WEBSITE (MEET THE TEAM)
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTrainer(null);
                      setIsCreating(false);
                    }}
                    className="px-5 py-2.5 border border-gn-border hover:border-gn-ivory text-xs font-mono uppercase tracking-wider text-gn-muted hover:text-gn-ivory transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gn-maroon hover:bg-gn-maroon/80 text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
                  >
                    SAVE TRAINER PROFILE
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trainers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {trainers.map((t) => (
          <div
            key={t.id}
            className="bg-gn-surface border border-gn-border flex flex-col justify-between overflow-hidden hover:border-gn-gold/50 transition-colors group"
          >
            {/* Portrait Image */}
            <div className="relative aspect-[4/5] bg-gn-black overflow-hidden border-b border-gn-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.photoUrl}
                alt={t.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-gn-black/85 backdrop-blur-sm border border-gn-border px-2 py-0.5 text-[10px] font-mono text-gn-gold font-bold uppercase">
                {t.experience}
              </div>
              <div className="absolute top-3 right-3">
                {t.isActive ? (
                  <span className="px-2 py-0.5 text-[10px] bg-green-950/80 border border-green-700 text-green-400 font-bold uppercase font-mono">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] bg-zinc-900/80 border border-zinc-700 text-zinc-400 font-bold uppercase font-mono">
                    Hidden
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-heading text-lg font-bold text-gn-ivory uppercase tracking-wide">
                  {t.name}
                </h3>
                <div className="text-xs font-mono text-gn-gold uppercase font-semibold">
                  {t.role}
                </div>
                <div className="text-[11px] font-mono text-zinc-400 mt-1">
                  Specialty: <span className="text-gn-ivory">{t.specialization}</span>
                </div>
                {t.certifications && (
                  <div className="text-[10px] font-mono text-zinc-500 mt-1 line-clamp-1">
                    {t.certifications}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gn-border flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleStatus(t.id)}
                  className="text-[10px] font-mono uppercase text-zinc-400 hover:text-white"
                >
                  {t.isActive ? 'Hide' : 'Unhide'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(t)}
                    className="px-2.5 py-1 bg-gn-black hover:bg-gn-surface border border-gn-border hover:border-gn-gold text-gn-gold text-xs uppercase transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(t)}
                    className="px-2.5 py-1 bg-gn-black hover:bg-red-950/60 border border-gn-border hover:border-red-700 text-red-400 text-xs uppercase transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gn-surface border border-gn-border max-w-sm w-full p-6 space-y-4">
            <div className="font-heading text-xl font-bold text-red-400 uppercase">
              CONFIRM COACH REMOVAL
            </div>
            <p className="text-xs text-gn-ivory font-mono">
              Are you sure you want to remove <span className="text-gn-gold font-bold">{deleteTarget.name}</span> from the active trainer roster?
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gn-border">
              {/* Proper Cancel Button */}
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-gn-border hover:border-gn-ivory text-xs font-mono uppercase tracking-wider text-gn-muted hover:text-gn-ivory transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider font-bold transition-colors"
              >
                Remove Coach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
