"use client";

import { cn } from "../utils/cn";
import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
  useState,
  useRef,
  useEffect,
  ChangeEvent,
} from "react";
import { Eye, EyeOff, UploadCloud, X, Calendar, Clock } from "lucide-react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as SliderPrimitive from "@radix-ui/react-slider";

// Label Helper
export function Label({ className, children, ...props }: HTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-bold text-slate-700 dark:text-slate-300 select-none", className)}
      {...props}
    >
      {children}
    </label>
  );
}
import { HTMLAttributes } from "react";

// Input Component
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && <Label>{label}</Label>}
        <div className="relative">
          {icon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 transition disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900",
              icon && "pl-10",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// Textarea Component
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && <Label>{label}</Label>}
        <textarea
          ref={ref}
          className={cn(
            "w-full min-h-[100px] p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// Password Input
export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && <Label>{label}</Label>}
        <div className="relative">
          <input
            ref={ref}
            type={show ? "text" : "password"}
            className={cn(
              "w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 cursor-pointer"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

// OTP / Pin Input
export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

export function OTPInput({ length = 6, value, onChange, error, label }: OTPInputProps) {
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const otpArray = value.split("").concat(Array(length).fill("")).slice(0, length);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value;
    const newOtp = [...otpArray];
    newOtp[idx] = val.substring(val.length - 1);
    const result = newOtp.join("");
    onChange(result);

    if (val && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !otpArray[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="space-y-1.5 text-left">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        {Array(length)
          .fill(null)
          .map((_, idx) => (
            <input
              key={idx}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              ref={(el) => {
                if (el) inputsRef.current[idx] = el;
              }}
              value={otpArray[idx] || ""}
              onChange={(e) => handleTextChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={cn(
                "w-11 h-11 text-center font-bold text-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition",
                error && "border-red-500 focus:ring-red-500"
              )}
            />
          ))}
      </div>
      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}

// Checkbox Component
export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  id: string;
}

export function Checkbox({ checked, onCheckedChange, label, id }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2 text-left">
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={(val) => onCheckedChange(!!val)}
        className="w-5 h-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
      >
        <CheckboxPrimitive.Indicator className="text-indigo-600 dark:text-indigo-400">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  );
}

// Switch Component
export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export function Switch({ checked, onCheckedChange, label }: SwitchProps) {
  return (
    <div className="flex items-center gap-3 text-left">
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full relative focus:outline-none focus:ring-2 focus:ring-indigo-500 transition data-[state=checked]:bg-indigo-650 cursor-pointer"
      >
        <SwitchPrimitive.Thumb className="block w-5 h-5 bg-white rounded-full shadow transition-transform translate-x-0.5 will-change-transform data-[state=checked]:translate-x-5" />
      </SwitchPrimitive.Root>
      {label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-350">{label}</span>
      )}
    </div>
  );
}

// Slider Component
export interface SliderProps {
  value: number[];
  onValueChange: (val: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, label }: SliderProps) {
  return (
    <div className="w-full space-y-2 text-left">
      <div className="flex justify-between">
        {label && <Label>{label}</Label>}
        <span className="text-xs text-slate-500 font-mono font-bold">{value[0]}</span>
      </div>
      <SliderPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        className="relative flex items-center select-none touch-none w-full h-5"
      >
        <SliderPrimitive.Track className="bg-slate-200 dark:bg-slate-800 relative flex-grow h-1.5 rounded-full">
          <SliderPrimitive.Range className="absolute bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block w-5 h-5 bg-white border-2 border-indigo-500 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer" />
      </SliderPrimitive.Root>
    </div>
  );
}

// Select Component
export interface SelectProps {
  options: { label: string; value: string }[];
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select option",
  label,
}: SelectProps) {
  return (
    <div className="space-y-1.5 text-left w-full">
      {label && <Label>{label}</Label>}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
        <SelectPrimitive.Trigger className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer">
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon className="text-slate-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.5 8.5l4.5 4.5 4.5-4.5z" />
            </svg>
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 p-1">
            <SelectPrimitive.Viewport className="p-1">
              {options.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex items-center px-8 py-2 rounded-lg text-sm text-slate-800 dark:text-slate-200 select-none hover:bg-slate-100 dark:hover:bg-slate-900 focus:bg-slate-100 dark:focus:bg-slate-900 focus:outline-none cursor-pointer"
                >
                  <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}

// RadioGroup Component
export interface RadioGroupProps {
  options: { label: string; value: string }[];
  value: string;
  onValueChange: (val: string) => void;
  label?: string;
}

export function RadioGroup({ options, value, onValueChange, label }: RadioGroupProps) {
  return (
    <div className="space-y-1.5 text-left">
      {label && <Label>{label}</Label>}
      <RadioGroupPrimitive.Root value={value} onValueChange={onValueChange} className="space-y-2">
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2.5">
            <RadioGroupPrimitive.Item
              value={opt.value}
              id={opt.value}
              className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <RadioGroupPrimitive.Indicator className="w-2.5 h-2.5 rounded-full bg-indigo-650" />
            </RadioGroupPrimitive.Item>
            <label
              htmlFor={opt.value}
              className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {opt.label}
            </label>
          </div>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
}

// MultiSelect Component
export interface MultiSelectProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items",
  label,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSelect = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((item) => item !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="space-y-1.5 text-left w-full relative">
      {label && <Label>{label}</Label>}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[44px] py-1 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-wrap gap-1.5 items-center justify-between cursor-pointer focus:ring-2 focus:ring-indigo-500"
      >
        {selected.length === 0 ? (
          <span className="text-sm text-slate-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((val) => {
              const label = options.find((o) => o.value === val)?.label || val;
              return (
                <span
                  key={val}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(val);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30"
                >
                  {label}
                  <X className="w-3 h-3 hover:text-indigo-850 cursor-pointer" />
                </span>
              );
            })}
          </div>
        )}
        <span className="text-slate-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.5 8.5l4.5 4.5 4.5-4.5z" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 p-1">
          {options.map((opt) => {
            const isSel = selected.includes(opt.value);
            return (
              <div
                key={opt.value}
                onClick={() => toggleSelect(opt.value)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm select-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900",
                  isSel &&
                    "bg-indigo-50/20 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400"
                )}
              >
                <span>{opt.label}</span>
                {isSel && (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Autocomplete Component
export interface AutocompleteProps {
  options: { label: string; value: string }[];
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
  label?: string;
}

export function Autocomplete({
  options,
  value,
  onValueChange,
  placeholder = "Search...",
  label,
}: AutocompleteProps) {
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const matched = options.filter((opt) => opt.label.toLowerCase().includes(filter.toLowerCase()));

  const curLabel = options.find((opt) => opt.value === value)?.label || "";

  return (
    <div className="space-y-1.5 text-left w-full relative">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <input
          type="text"
          value={isOpen ? filter : curLabel}
          placeholder={placeholder}
          onFocus={() => {
            setIsOpen(true);
            setFilter("");
          }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onChange={(e) => {
            setFilter(e.target.value);
            setIsOpen(true);
          }}
          className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      {isOpen && matched.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-full max-h-48 overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 p-1">
          {matched.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onValueChange(opt.value);
                setFilter(opt.label);
                setIsOpen(false);
              }}
              className="px-3.5 py-2.5 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer select-none"
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// DatePicker & TimePicker Mock Shells
export function DatePicker({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5 text-left w-full">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
    </div>
  );
}

export function TimePicker({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5 text-left w-full">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
    </div>
  );
}

// File Upload Component
export interface FileUploadProps {
  label?: string;
  onFileSelect?: (file: File) => void;
  accept?: string;
}

export function FileUpload({ label, onFileSelect, accept }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      onFileSelect?.(selected);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full text-left space-y-1.5">
      {label && <Label>{label}</Label>}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer transition"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />
        {file ? (
          <div className="flex items-center gap-3 w-full justify-between px-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-2.5 rounded-xl">
            <span className="text-sm font-semibold truncate text-slate-700 dark:text-slate-350 max-w-[200px]">
              {file.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        ) : (
          <div className="text-center space-y-1">
            <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Click to upload files
            </p>
            <p className="text-xs text-slate-400">PDF, ZIP, DOCX up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Image Upload
export function ImageUpload({
  label,
  onImageSelect,
}: {
  label?: string;
  onImageSelect?: (src: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const src = reader.result as string;
        setPreview(src);
        onImageSelect?.(src);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full text-left space-y-1.5">
      {label && <Label>{label}</Label>}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 overflow-hidden flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer relative transition"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        {preview ? (
          <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <span className="text-xs text-slate-500 font-semibold">Add Image</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Color Picker Component
export function ColorPicker({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5 text-left w-fit">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2 p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border-0 rounded-lg cursor-pointer bg-transparent"
        />
        <span className="text-sm font-mono font-bold uppercase pr-2 text-slate-700 dark:text-slate-300">
          {value}
        </span>
      </div>
    </div>
  );
}

// MarkdownEditor & RichTextEditor Mocks
export function MarkdownEditor({ label }: { label?: string }) {
  const [text, setText] = useState("# Hello World\n\nWrite markdown preview here.");
  return (
    <div className="w-full text-left space-y-1.5">
      {label && <Label>{label}</Label>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="p-4 min-h-[160px] font-mono text-sm focus:outline-none border-r border-slate-200 dark:border-slate-800 bg-transparent resize-none"
        />
        <div className="p-4 min-h-[160px] bg-slate-50 dark:bg-slate-900/50 prose prose-sm dark:prose-invert">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">
            Live Preview
          </p>
          <div className="text-sm leading-relaxed">{text}</div>
        </div>
      </div>
    </div>
  );
}

export function RichTextEditor({ label }: { label?: string }) {
  const [text, setText] = useState("Boldly build the future.");
  return (
    <div className="w-full text-left space-y-1.5">
      {label && <Label>{label}</Label>}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 p-2 bg-slate-50/50 dark:bg-slate-950/20">
          <button
            type="button"
            className="px-2.5 py-1 text-xs font-bold rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            B
          </button>
          <button
            type="button"
            className="px-2.5 py-1 text-xs font-italic rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            I
          </button>
          <button
            type="button"
            className="px-2.5 py-1 text-xs underline rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            U
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-4 min-h-[120px] text-sm focus:outline-none bg-transparent resize-none"
        />
      </div>
    </div>
  );
}
