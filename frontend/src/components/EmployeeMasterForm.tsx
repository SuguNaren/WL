import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { PencilLine, Power } from 'lucide-react';
import { api } from '../lib/api';
import { Employee } from '../types';
import { Input } from './Input';
import { SectionCard } from './SectionCard';

type EmployeeFormValues = {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  dob: string;
};

type UpdateEmployeePayload = Partial<EmployeeFormValues> & {
  isActive?: boolean;
};

export function EmployeeMasterForm() {
  const queryClient = useQueryClient();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { register, handleSubmit, reset } = useForm<EmployeeFormValues>();

  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await api.get<Employee[]>('/employees')).data
  });

  const sortedEmployees = useMemo(
    () =>
      [...(employeesQuery.data ?? [])].sort((left, right) => Number(right.isActive) - Number(left.isActive)),
    [employeesQuery.data]
  );

  const createEmployee = useMutation({
    mutationFn: async (payload: EmployeeFormValues) => api.post('/employees', payload),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateEmployeePayload }) =>
      api.patch(`/employees/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setEditingEmployee(null);
    }
  });

  const onCreate = handleSubmit((values) => createEmployee.mutate(values));

  const onEdit = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  const onSaveEdit = (employee: Employee) => {
    updateEmployee.mutate({
      id: employee.id,
      payload: {
        employeeId: employee.employeeId,
        name: employee.name,
        designation: employee.designation,
        department: employee.department,
        dob: toDateInputValue(employee.dob),
        isActive: employee.isActive
      }
    });
  };

  const onToggleStatus = (employee: Employee) => {
    updateEmployee.mutate({
      id: employee.id,
      payload: { isActive: !employee.isActive }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard
        title="Employee Master"
        description="Create employee records and initialize first-login credentials from date of birth."
      >
        <form className="space-y-4" onSubmit={onCreate}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Employee ID">
              <Input {...register('employeeId', { required: true })} />
            </Field>
            <Field label="Employee Name">
              <Input {...register('name', { required: true })} />
            </Field>
            <Field label="Designation">
              <Input {...register('designation', { required: true })} />
            </Field>
            <Field label="Department">
              <Input {...register('department', { required: true })} />
            </Field>
            <Field label="Date of Birth">
              <Input type="date" {...register('dob', { required: true })} />
            </Field>
          </div>
          <button type="submit" className="h-11 bg-brand-500 px-5 text-sm font-semibold text-white">
            Add Employee
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title="Employees"
        description="Edit employee details and mark records active or inactive when needed."
      >
        <div className="space-y-4">
          {sortedEmployees.map((employee) => {
            const isEditing = editingEmployee?.id === employee.id;
            const currentEmployee = isEditing && editingEmployee ? editingEmployee : employee;
            return (
              <div key={employee.id} className="border border-stone-200 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="grid flex-1 gap-3 md:grid-cols-2">
                    <EditableField
                      label="Emp ID"
                      value={currentEmployee.employeeId}
                      editable={isEditing}
                      onChange={(value) => setEditingEmployeeValue(setEditingEmployee, employee, 'employeeId', value)}
                    />
                    <EditableField
                      label="Employee Name"
                      value={currentEmployee.name}
                      editable={isEditing}
                      onChange={(value) => setEditingEmployeeValue(setEditingEmployee, employee, 'name', value)}
                    />
                    <EditableField
                      label="Designation"
                      value={currentEmployee.designation}
                      editable={isEditing}
                      onChange={(value) => setEditingEmployeeValue(setEditingEmployee, employee, 'designation', value)}
                    />
                    <EditableField
                      label="Department"
                      value={currentEmployee.department}
                      editable={isEditing}
                      onChange={(value) => setEditingEmployeeValue(setEditingEmployee, employee, 'department', value)}
                    />
                    <EditableField
                      label="DOB"
                      value={currentEmployee.dob}
                      type={isEditing ? 'date' : 'text'}
                      inputValue={isEditing && editingEmployee ? toDateInputValue(editingEmployee.dob) : employee.dob}
                      editable={isEditing}
                      onChange={(value) => setEditingEmployeeValue(setEditingEmployee, employee, 'dob', fromDateInputValue(value))}
                    />
                    <div>
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Status
                      </span>
                      <span
                        className={`inline-flex border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                          employee.isActive
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-rose-300 bg-rose-50 text-rose-700'
                        }`}
                      >
                        {currentEmployee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:w-[180px] sm:flex-col">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => editingEmployee && onSaveEdit(editingEmployee)}
                          className="h-10 flex-1 bg-brand-500 px-4 text-sm font-semibold text-white sm:flex-none"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingEmployee(null)}
                          className="h-10 flex-1 border border-stone-300 px-4 text-sm font-semibold text-slate-700 sm:flex-none"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(employee)}
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 border border-stone-300 px-4 text-sm font-semibold text-slate-700 sm:flex-none"
                        >
                          <PencilLine className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleStatus(employee)}
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 border border-stone-300 px-4 text-sm font-semibold text-slate-700 sm:flex-none"
                        >
                          <Power className="h-4 w-4" />
                          {employee.isActive ? 'Inactivate' : 'Activate'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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

function EditableField({
  label,
  value,
  editable,
  onChange,
  type = 'text',
  inputValue
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (value: string) => void;
  type?: 'text' | 'date';
  inputValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      {editable ? (
        <Input type={type} value={inputValue ?? value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <div className="border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-slate-900">{value}</div>
      )}
    </label>
  );
}

function setEditingEmployeeValue(
  setEditingEmployee: Dispatch<SetStateAction<Employee | null>>,
  employee: Employee,
  key: keyof Employee,
  value: string
) {
  setEditingEmployee((current) => ({
    ...(current ?? employee),
    [key]: value
  }));
}

function toDateInputValue(formattedDob: string) {
  const [day, month, year] = formattedDob.split('-');
  return `${year}-${month}-${day}`;
}

function fromDateInputValue(inputDob: string) {
  const [year, month, day] = inputDob.split('-');
  return `${day}-${month}-${year}`;
}
