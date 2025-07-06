import { MarkdownReadonly } from '@repo/ui/components/markdown/markdown-readonly';
import { Button } from '@repo/ui/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from "sonner";

import { translateText } from '@/lib/utils/translation';

interface TranslateDialogProps {
  content: string;
}

export function TranslateDialog({ content }: TranslateDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!content) return;

    setIsTranslating(true);
    try {
      const translated = await translateText(content);
      setTranslatedContent(translated);
    } catch (error) {
      console.error('Translation failed:', error);
      toast.error("翻译失败", {
        description: '无法完成文档翻译，请稍后重试。'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!translatedContent) {
      handleTranslate();
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handleOpen}>
        翻译内容
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>文档翻译</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
            <div className="overflow-y-auto border rounded-lg p-4">
              <h3 className="font-medium mb-2">原文</h3>
              <div className="prose dark:prose-invert max-w-none">
                <MarkdownReadonly>{content}</MarkdownReadonly>
              </div>
            </div>

            <div className="overflow-y-auto border rounded-lg p-4">
              <h3 className="font-medium mb-2">译文</h3>
              {isTranslating ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : translatedContent ? (
                <div className="prose dark:prose-invert max-w-none">
                  <MarkdownReadonly>{translatedContent}</MarkdownReadonly>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  暂无翻译内容
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}