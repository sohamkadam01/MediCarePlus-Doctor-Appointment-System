import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Beaker, ShieldCheck } from 'lucide-react';
import labService from '../services/LabService';

const LabDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadLab = async () => {
      try {
        setLoading(true);
        const data = await labService.getLab(id);
        if (isMounted) setLab(data);
      } catch (err) {
        if (isMounted) setError(err?.message || 'Failed to load lab details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadLab();
    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e2e8f0,transparent_40%),linear-gradient(160deg,#f8fafc,#eef2ff)]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <button
          type="button"
          onClick={() => navigate('/labs')}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to labs
        </button>

        {loading && (
          <div className="mt-6 space-y-4">
            <div className="h-28 rounded-3xl bg-white/70 shadow-sm animate-pulse" />
            <div className="h-60 rounded-3xl bg-white/70 shadow-sm animate-pulse" />
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        {!loading && !error && lab && (
          <div className="mt-6 space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-500">Lab Profile</p>
                  <h1 className="mt-3 text-3xl font-semibold text-slate-900">{lab.name}</h1>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4 text-indigo-400" />
                    <span>{lab.address}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="h-4 w-4 text-indigo-400" />
                    <span>{lab.contact}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                    <div className="flex items-center gap-2 font-semibold">
                      <Beaker className="h-4 w-4" />
                      {lab.tests?.length || 0} tests available
                    </div>
                    <p className="mt-1 text-xs text-indigo-500">
                      Verified partner lab
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <div className="flex items-center gap-2 font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      Trusted & secure
                    </div>
                    <p className="mt-1 text-xs text-emerald-500">
                      Reports delivered digitally
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Tests & pricing</h2>
                <span className="text-xs uppercase tracking-[0.25em] text-slate-400">Updated</span>
              </div>

              {lab.tests?.length ? (
                <div className="mt-5 grid gap-4">
                  {lab.tests.map((test) => (
                    <div
                      key={test.id}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{test.testName}</p>
                        <p className="text-xs text-slate-500">{test.description}</p>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        ₹{Number(test.price || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  No tests listed for this lab yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabDetail;
