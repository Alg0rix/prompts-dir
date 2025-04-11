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
        className="h-full flex flex-col group hover:shadow-xl transition-all duration-300 cursor-pointer border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm overflow-hidden hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-blue-100 dark:hover:shadow-blue-900/5"
        onClick={() => setIsOpen(true)}
      >
        {/* Card header with badge */}
        <div className="relative">
          <div className="absolute top-0 right-0 w-24 h-24">
            <div className="absolute transform rotate-45 bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white text-xs font-medium py-1 right-[-35px] top-[20px] w-[150px] text-center">
              {prompt.frontmatter.category}
            </div>
          </div>
        </div>

        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-base md:text-lg leading-tight line-clamp-2 pr-12 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {prompt.frontmatter.title}
          </CardTitle>

          <CardDescription className="flex items-center gap-1 mt-1.5 text-xs sm:text-sm">
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
              <span className="text-neutral-600 dark:text-neutral-400">{prompt.frontmatter.author}</span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow pt-0">
          <div className="prose dark:prose-invert prose-sm max-h-24 sm:max-h-28 overflow-hidden relative mb-3">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3" dangerouslySetInnerHTML={{ __html: prompt.html }} />
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent"></div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-auto">
            {prompt.frontmatter.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200/50 dark:border-neutral-700/50 group-hover:bg-blue-50 group-hover:text-blue-700 dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-300 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {prompt.frontmatter.tags.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-700/50">
                +{prompt.frontmatter.tags.length - 3}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-4 px-4 border-t border-neutral-100 dark:border-neutral-800/50 mt-auto">
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-neutral-50 dark:bg-neutral-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                onClick={(e) => copyToClipboard(e)}
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>

              <Select onValueChange={(value) => handleAction(value)}>
                <SelectTrigger
                  className="h-8 w-auto min-w-[110px] text-xs rounded-full px-3 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-700 focus:ring-blue-500/20 dark:focus:ring-blue-500/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SelectValue placeholder="Use with..." />
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
              className="h-8 px-3 text-xs flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 group/btn"
            >
              <span>Details</span>
              <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Full prompt modal dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl w-[calc(100%-2rem)] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-lg sm:text-xl">{prompt.frontmatter.title}</DialogTitle>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 self-start sm:self-auto">
                  <Folder className="h-3.5 w-3.5" />
                  {prompt.frontmatter.category}
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable content area */}
          <div className="flex-grow overflow-y-auto py-2">
            <div className="mb-4 sm:mb-5">
              {/* Display raw formatted prompt with proper whitespace and line breaks */}
              <pre className="whitespace-pre-wrap bg-neutral-50 dark:bg-neutral-900 p-3 sm:p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs sm:text-sm font-mono overflow-x-auto">
                {prompt.content}
              </pre>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              <div className="w-full text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                Tags:
              </div>
              {prompt.frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs sm:text-sm font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-3 border-t dark:border-neutral-800 pt-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select onValueChange={handleAction}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 rounded-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
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
                className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 h-9 w-9"
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
