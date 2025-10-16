import React from 'react';
import {
  BookOpen,
  Plus,
  FilePenLine,
  Trash2,
  ArrowLeft,
  Sparkles,
  GripVertical,
  Upload,
  Download,
  Eye,
  Code,
} from 'lucide-react';

// Replaced custom SVGs with the 'lucide-react' library for a more modern and professional UI.
// Props are set to closely match the appearance of the previous icons.

const commonProps = {
  size: 20,
  strokeWidth: 1.5,
};

export const BookIcon = () => <BookOpen {...commonProps} />;
export const PlusIcon = () => <Plus {...commonProps} />;
export const EditIcon = () => <FilePenLine {...commonProps} />;
export const TrashIcon = () => <Trash2 {...commonProps} />;
export const BackIcon = () => <ArrowLeft size={24} strokeWidth={1.5} />;
export const WandIcon = () => <Sparkles {...commonProps} />;
export const GripVerticalIcon = () => <GripVertical {...commonProps} className="text-slate-400" />;
export const UploadIcon = () => <Upload {...commonProps} />;
export const DownloadIcon = () => <Download {...commonProps} />;
export const EyeIcon = () => <Eye {...commonProps} />;
export const CodeIcon = () => <Code {...commonProps} />;