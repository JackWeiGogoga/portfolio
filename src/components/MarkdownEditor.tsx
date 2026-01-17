import { useState } from "react";
import { Eye, Edit3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MarkdownRenderer from "./MarkdownRenderer";

interface MarkdownEditorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  label = "Description",
  placeholder = "Write your description here... (Markdown supported)",
  required = false,
  maxLength,
  disabled = false,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState("edit");

  return (
    <div className="space-y-2">
      {label && <Label>{label} *</Label>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="gap-2" disabled={disabled}>
            <Edit3 className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2" disabled={disabled}>
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-2">
          <Textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={6}
            maxLength={maxLength}
            className="max-h-[300px] resize-none overflow-y-auto text-sm break-all overflow-x-hidden"
            required={required}
            disabled={disabled}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-2">
          <div className="min-h-[180px] max-h-[300px] overflow-y-auto overflow-x-hidden rounded-md border border-input bg-background px-4 py-3 wrap-break-word">
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nothing to preview yet. Write something in the Edit tab.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {value.length}
          {maxLength && ` / ${maxLength}`} characters
        </span>
        <span className="italic">Markdown supported</span>
      </div>
    </div>
  );
}
