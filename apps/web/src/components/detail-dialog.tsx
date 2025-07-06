import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

interface DetailDialogProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function DetailDialog({
  title,
  description,
  isOpen,
  onOpenChange,
  children,
}: DetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ScrollArea className="pr-4">{children}</ScrollArea>
      </DialogContent>
    </Dialog>
  );
}