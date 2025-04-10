import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Prompt } from "~/lib/prompts";
import { ExternalLink, Copy, Check, ChevronRight, Tag, Folder } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { toast } from "sonner";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Function to create ChatGPT URL with prompt content
  const createChatGPTUrl = () => {
    const encodedPrompt = encodeURIComponent(prompt.content);
    return `https://chatgpt.com/?prompt=${encodedPrompt}`;
  };

  // Function to create Claude URL with prompt content
  const createClaudeUrl = () => {
    const encodedPrompt = encodeURIComponent(prompt.content);
    return `https://claude.ai/new?q=${encodedPrompt}`;
  };

  // Function to create GitHub Copilot URL with prompt content
  const createGitHubCopilotUrl = () => {
    const encodedPrompt = encodeURIComponent(prompt.content);
    return `https://github.com/copilot?prompt=${encodedPrompt}`;
  };

  // Function to copy prompt content to clipboard
  const copyToClipboard = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click when clicking copy button
    }
    navigator.clipboard.writeText(prompt.content);
    toast("Prompt copied to clipboard!", {
      description: prompt.frontmatter.title,
      icon: <Check className="h-4 w-4" />,
      duration: 2000,
    });
  };

  // Function to handle action selection
  const handleAction = (value: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click when using select
    }

    switch (value) {
      case "chatgpt":
        window.open(createChatGPTUrl(), "_blank");
        break;
      case "claude":
        window.open(createClaudeUrl(), "_blank");
        break;
      case "copilot":
        window.open(createGitHubCopilotUrl(), "_blank");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Card
        className="h-full flex flex-col hover:shadow-md transition-all duration-200 cursor-pointer border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
        onClick={() => setIsOpen(true)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg leading-tight line-clamp-2">{prompt.frontmatter.title}</CardTitle>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300 shrink-0">
              <Folder className="h-3 w-3" />
              {prompt.frontmatter.category}
            </span>
          </div>
          <CardDescription className="flex items-center gap-1 mt-1">
            By {prompt.frontmatter.authorLink ? (
              <a
                href={prompt.frontmatter.authorLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center"
                onClick={(e) => e.stopPropagation()} // Prevent card click event
              >
                {prompt.frontmatter.author}
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            ) : (
              prompt.frontmatter.author
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow pt-0">
          <div className="prose dark:prose-invert prose-sm max-h-32 overflow-hidden relative mb-2">
            <div dangerouslySetInnerHTML={{ __html: prompt.html }} className="text-neutral-700 dark:text-neutral-300" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-neutral-950 to-transparent"></div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {prompt.frontmatter.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
              >
                {tag}
              </span>
            ))}
            {prompt.frontmatter.tags.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                +{prompt.frontmatter.tags.length - 3}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-1 pb-3 px-4 border-t border-neutral-100 dark:border-neutral-800 mt-auto">
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full bg-neutral-50 dark:bg-neutral-900"
                onClick={(e) => copyToClipboard(e)}
                title="Copy to clipboard"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>

              <Select onValueChange={(value) => handleAction(value)}>
                <SelectTrigger
                  className="h-7 w-auto min-w-[110px] text-xs rounded-full px-2.5 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SelectValue placeholder="Open in..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chatgpt">Open in ChatGPT</SelectItem>
                  <SelectItem value="claude">Open in Claude</SelectItem>
                  <SelectItem value="copilot">Open in GitHub Copilot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 flex items-center gap-0.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              onClick={() => setIsOpen(true)}
            >
              Details
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Full prompt modal dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-xl">{prompt.frontmatter.title}</DialogTitle>
              <div className="flex items-center justify-between gap-2">
                <DialogDescription className="flex items-center gap-1">
                  By {prompt.frontmatter.authorLink ? (
                    <a
                      href={prompt.frontmatter.authorLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline dark:text-blue-400 inline-flex items-center"
                    >
                      {prompt.frontmatter.author}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  ) : (
                    prompt.frontmatter.author
                  )}
                </DialogDescription>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  <Folder className="h-3.5 w-3.5" />
                  {prompt.frontmatter.category}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="prose dark:prose-invert my-5 overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: prompt.html }} />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <div className="w-full text-sm text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              Tags:
            </div>
            {prompt.frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-sm font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <DialogFooter className="flex items-center flex-wrap gap-3 border-t dark:border-neutral-800 pt-4">
            <div className="flex items-center gap-2">
              <Select onValueChange={handleAction}>
                <SelectTrigger className="w-[180px] rounded-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                  <SelectValue placeholder="Open in..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chatgpt">Open in ChatGPT</SelectItem>
                  <SelectItem value="claude">Open in Claude</SelectItem>
                  <SelectItem value="copilot">Open in GitHub Copilot</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                onClick={copyToClipboard}
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
