import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Download, PencilLine, Upload } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { api } from '../lib/api';
import { Workload } from '../types';
import { Input, Textarea } from './Input';
import { SectionCard } from './SectionCard';

type WorkloadFormValues = {
  workDate: string;
  workType: string;
  detailedDescription: string;
};

const defaultValues: WorkloadFormValues = {
  workDate: '',
  workType: '',
  detailedDescription: ''
};

export function WorkloadEntryForm() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [editingWorkload, setEditingWorkload] = useState<Workload | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<WorkloadFormValues>({
    defaultValues
  });

  const workloadQuery = useQuery({
    queryKey: ['workloads'],
    queryFn: async () => (await api.get<Workload[]>('/workloads')).data
  });

  useEffect(() => {
    if (!editingWorkload) {
      reset(defaultValues);
      return;
    }

    setValue('workDate', toDateInputValue(editingWorkload.workDate));
    setValue('workType', editingWorkload.workType);
    setValue('detailedDescription', editingWorkload.detailedDescription);
  }, [editingWorkload, reset, setValue]);

  const createWorkload = useMutation({
    mutationFn: async (payload: WorkloadFormValues) =>
      api.post('/workloads', {
        ...payload,
        status: 'COMPLETED',
        otherStatus: '',
        workDescription: '',
        workSharedByTeam: ''
      }),
    onSuccess: () => {
      setSaveError('');
      setSaveMessage('Workload saved successfully.');
      setEditingWorkload(null);
      reset(defaultValues);
      queryClient.invalidateQueries({ queryKey: ['workloads'] });
      queryClient.invalidateQueries({ queryKey: ['report-workloads'] });
    },
    onError: (error) => {
      setSaveMessage('');
      setSaveError(formatWorkloadError(error));
    }
  });

  const updateWorkload = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: WorkloadFormValues }) =>
      api.patch(`/workloads/${id}`, {
        ...payload,
        status: editingWorkload?.status ?? 'COMPLETED',
        otherStatus: editingWorkload?.otherStatus ?? '',
        workDescription: '',
        workSharedByTeam: ''
      }),
    onSuccess: () => {
      setSaveError('');
      setSaveMessage('Workload updated successfully.');
      setEditingWorkload(null);
      reset(defaultValues);
      queryClient.invalidateQueries({ queryKey: ['workloads'] });
      queryClient.invalidateQueries({ queryKey: ['report-workloads'] });
    },
    onError: (error) => {
      setSaveMessage('');
      setSaveError(formatWorkloadError(error));
    }
  });

  const uploadWorkloads = useMutation({
    mutationFn: async (rows: WorkloadFormValues[]) => {
      for (const row of rows) {
        await api.post('/workloads', {
          ...row,
          status: 'COMPLETED',
          otherStatus: '',
          workDescription: '',
          workSharedByTeam: ''
        });
      }
    },
    onSuccess: (_, rows) => {
      setSaveError('');
      setSaveMessage(`${rows.length} workload entr${rows.length === 1 ? 'y' : 'ies'} uploaded successfully.`);
      setEditingWorkload(null);
      reset(defaultValues);
      queryClient.invalidateQueries({ queryKey: ['workloads'] });
      queryClient.invalidateQueries({ queryKey: ['report-workloads'] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      setSaveMessage('');
      setSaveError(formatWorkloadError(error));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  });

  const isSaving = createWorkload.isPending || updateWorkload.isPending || uploadWorkloads.isPending;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard
        title={editingWorkload ? 'Edit Workload Entry' : 'Daily Workload Entry'}
        description="Record the daily workload details for the signed-in employee."
      >
        <div className="mb-6 space-y-3 border border-stone-200 p-4">
          <div className="flex flex-wrap gap-3">
            <a
              href="/daily-workload-format.xlsx"
              download
              className="inline-flex h-11 items-center gap-2 border border-stone-300 px-4 text-sm font-semibold text-slate-700"
            >
              <Download className="h-4 w-4" />
              Download Format
            </a>
            <label className="inline-flex h-11 cursor-pointer items-center gap-2 bg-brand-500 px-4 text-sm font-semibold text-white">
              <Upload className="h-4 w-4" />
              Upload Excel
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  setSaveMessage('');
                  setSaveError('');

                  try {
                    const parsedRows = await parseWorkbook(file);
                    if (!parsedRows.length) {
                      throw new Error('The selected Excel file does not contain any workload rows.');
                    }

                    uploadWorkloads.mutate(parsedRows);
                  } catch (error) {
                    setSaveMessage('');
                    setSaveError(error instanceof Error ? error.message : 'Unable to read the selected Excel file.');
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }
                }}
              />
            </label>
          </div>
          <p className="text-sm text-slate-500">
            Excel columns must be <span className="font-semibold">Date</span>,{' '}
            <span className="font-semibold">Work Type</span>, and{' '}
            <span className="font-semibold">Work Detailed Description</span>. Date format must be{' '}
            <span className="font-semibold">DD-MM-YYYY</span>.
          </p>
          <a
            href="/daily-workload-format.xlsx"
            download
            className="inline-flex text-sm font-semibold text-brand-600 underline underline-offset-2"
          >
            Download sample Excel format
          </a>
        </div>
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => {
            setSaveMessage('');
            setSaveError('');
            if (editingWorkload) {
              updateWorkload.mutate({ id: editingWorkload.id, payload: values });
              return;
            }
            createWorkload.mutate(values);
          })}
        >
          <Field label="Date">
            <Input type="date" {...register('workDate', { required: true })} />
          </Field>
          <Field label="Work Type">
            <Input {...register('workType', { required: true })} />
          </Field>
          <Field label="Work Detailed Description">
            <Textarea {...register('detailedDescription', { required: true })} />
          </Field>
          {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
          {saveMessage ? <p className="text-sm text-emerald-700">{saveMessage}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="h-11 bg-brand-500 px-5 text-sm font-semibold text-white disabled:opacity-70"
            >
              {isSaving ? 'Saving...' : editingWorkload ? 'Update Workload' : 'Save Workload'}
            </button>
            {editingWorkload ? (
              <button
                type="button"
                onClick={() => {
                  setEditingWorkload(null);
                  setSaveError('');
                  setSaveMessage('');
                  reset(defaultValues);
                }}
                className="h-11 border border-stone-300 px-5 text-sm font-semibold text-slate-700"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Recent Entries" description="Latest work logs for the signed-in employee.">
        <div className="space-y-4">
          {workloadQuery.data?.map((item) => (
            <div key={item.id} className="border border-stone-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.workType}</p>
                  <p className="text-sm text-slate-500">{item.workDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWorkload(item);
                      setSaveError('');
                      setSaveMessage('');
                    }}
                    className="inline-flex h-9 items-center justify-center border border-stone-300 px-3 text-sm font-semibold text-slate-700"
                  >
                    <PencilLine className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.detailedDescription}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function formatWorkloadError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Backend server is not running. Please start the API first.';
    }

    return typeof error.response.data?.message === 'string'
      ? error.response.data.message
      : 'Unable to save workload right now.';
  }

  return 'Unable to save workload right now.';
}

function toDateInputValue(formattedDate: string) {
  const [day, month, year] = formattedDate.split('-');
  return `${year}-${month}-${day}`;
}

async function parseWorkbook(file: File): Promise<WorkloadFormValues[]> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const firstSheet = workbook.SheetNames[0];

  if (!firstSheet) {
    throw new Error('The selected Excel file does not contain a worksheet.');
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheet], {
    defval: '',
    raw: false
  });

  const parsedRows = rows
    .map((row, index) => parseRow(row, index))
    .filter((row): row is WorkloadFormValues => row !== null);

  return parsedRows;
}

function parseRow(row: Record<string, unknown>, index: number): WorkloadFormValues | null {
  const dateValue = readColumn(row, 'Date');
  const workTypeValue = readColumn(row, 'Work Type');
  const detailedDescriptionValue = readColumn(row, 'Work Detailed Description');

  if (!dateValue && !workTypeValue && !detailedDescriptionValue) {
    return null;
  }

  if (!dateValue || !workTypeValue || !detailedDescriptionValue) {
    throw new Error(`Row ${index + 2} is incomplete. Date, Work Type, and Work Detailed Description are required.`);
  }

  return {
    workDate: toApiDateValue(dateValue, index),
    workType: workTypeValue,
    detailedDescription: detailedDescriptionValue
  };
}

function readColumn(row: Record<string, unknown>, columnName: string) {
  const matchedKey = Object.keys(row).find((key) => key.trim().toLowerCase() === columnName.toLowerCase());
  const value = matchedKey ? row[matchedKey] : '';
  return String(value ?? '').trim();
}

function toApiDateValue(value: string, index: number) {
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (!match) {
    throw new Error(`Row ${index + 2} has invalid date "${value}". Use DD-MM-YYYY format.`);
  }

  const [, day, month, year] = match;
  const isoDate = `${year}-${month}-${day}`;
  const parsed = new Date(`${isoDate}T00:00:00`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== Number(year) ||
    parsed.getMonth() + 1 !== Number(month) ||
    parsed.getDate() !== Number(day)
  ) {
    throw new Error(`Row ${index + 2} has invalid date "${value}".`);
  }

  return isoDate;
}
