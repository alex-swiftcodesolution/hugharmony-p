"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  File,
  Download,
  ExternalLink,
  X,
  Table,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FileAttachmentProps {
  url: string;
  type?: string;
  isOwn: boolean;
  className?: string;
}

// File type categories with their extensions and icons
const FILE_CATEGORIES = {
  image: {
    extensions: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"],
    icon: FileImage,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    ownColor: "text-green-300",
    ownBgColor: "bg-green-500/30",
  },
  pdf: {
    extensions: ["pdf"],
    icon: FileText,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    ownColor: "text-red-300",
    ownBgColor: "bg-red-500/30",
  },
  document: {
    extensions: ["doc", "docx", "odt", "rtf", "txt"],
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    ownColor: "text-blue-300",
    ownBgColor: "bg-blue-500/30",
  },
  spreadsheet: {
    extensions: ["xls", "xlsx", "csv", "ods"],
    icon: Table,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    ownColor: "text-emerald-300",
    ownBgColor: "bg-emerald-500/30",
  },
  presentation: {
    extensions: ["ppt", "pptx", "odp"],
    icon: FileText,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    ownColor: "text-orange-300",
    ownBgColor: "bg-orange-500/30",
  },
  video: {
    extensions: ["mp4", "mov", "avi", "mkv", "webm", "wmv", "flv"],
    icon: FileVideo,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    ownColor: "text-purple-300",
    ownBgColor: "bg-purple-500/30",
  },
  audio: {
    extensions: ["mp3", "wav", "ogg", "m4a", "flac", "aac"],
    icon: FileAudio,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    ownColor: "text-pink-300",
    ownBgColor: "bg-pink-500/30",
  },
  archive: {
    extensions: ["zip", "rar", "7z", "tar", "gz", "bz2"],
    icon: FileArchive,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    ownColor: "text-yellow-300",
    ownBgColor: "bg-yellow-500/30",
  },
  code: {
    extensions: [
      "js",
      "ts",
      "jsx",
      "tsx",
      "html",
      "css",
      "json",
      "py",
      "java",
      "cpp",
      "c",
      "go",
      "rs",
      "php",
      "rb",
      "swift",
      "kt",
    ],
    icon: FileCode,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    ownColor: "text-cyan-300",
    ownBgColor: "bg-cyan-500/30",
  },
};

function getFileInfo(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const fullName = pathname.split("/").pop() || "file";
    const extMatch = fullName.match(/\.([^.?]+)(?:\?|$)/);
    const extension = extMatch ? extMatch[1].toLowerCase() : "";
    const cleanName = fullName
      .replace(/-[a-zA-Z0-9]{6,}(?=\.[^.]+$)/, "")
      .replace(/\?.*$/, "");

    return { name: cleanName, extension, fullName };
  } catch {
    return { name: "file", extension: "", fullName: "file" };
  }
}

function getFileCategory(extension: string) {
  for (const [category, config] of Object.entries(FILE_CATEGORIES)) {
    if (config.extensions.includes(extension)) {
      return { category, ...config };
    }
  }
  return {
    category: "other",
    extensions: [],
    icon: File,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    ownColor: "text-gray-300",
    ownBgColor: "bg-gray-500/30",
  };
}

export function FileAttachment({ url, isOwn, className }: FileAttachmentProps) {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fileInfo = getFileInfo(url);
  const fileCategory = getFileCategory(fileInfo.extension);
  const isImage = fileCategory.category === "image";
  const isVideo = fileCategory.category === "video";
  const isAudio = fileCategory.category === "audio";
  const isPdf = fileCategory.category === "pdf";

  const IconComponent = fileCategory.icon;

  // Render image attachment
  if (isImage && !imageError) {
    return (
      <>
        <div
          className={cn("cursor-pointer group relative", className)}
          onClick={() => setImagePreviewOpen(true)}
        >
          <div className="relative max-w-[280px] overflow-hidden rounded-lg">
            <Image
              src={url}
              alt={fileInfo.name}
              width={280}
              height={280}
              className="object-cover transition-opacity group-hover:opacity-90"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "280px",
                maxHeight: "280px",
              }}
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(url, "_blank");
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-black/95 border-none">
            <DialogClose className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
            <div className="flex items-center justify-center p-4">
              <Image
                src={url}
                alt={fileInfo.name}
                width={1200}
                height={900}
                className="max-w-full max-h-[80vh] object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <a href={url} target="_blank" rel="noopener noreferrer" download>
                <Button variant="secondary" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </a>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </a>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Render video attachment
  if (isVideo) {
    return (
      <div
        className={cn(
          "max-w-[320px] rounded-lg overflow-hidden border",
          isOwn ? "border-white/20" : "border-border",
          className
        )}
      >
        <video src={url} controls className="w-full" preload="metadata">
          Your browser does not support the video tag.
        </video>
        <div
          className={cn(
            "flex items-center justify-between px-3 py-2",
            isOwn ? "bg-black/20" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "text-xs truncate flex-1 font-medium",
              isOwn ? "text-white" : "text-muted-foreground"
            )}
          >
            {fileInfo.name}
          </span>
          <a href={url} target="_blank" rel="noopener noreferrer" download>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6",
                isOwn && "text-white hover:text-white hover:bg-white/20"
              )}
            >
              <Download className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // Render audio attachment
  if (isAudio) {
    return (
      <div
        className={cn(
          "rounded-lg overflow-hidden min-w-[250px] border",
          isOwn ? "bg-black/20 border-white/20" : "bg-muted border-border",
          className
        )}
      >
        <div className="flex items-center gap-3 p-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              isOwn ? fileCategory.ownBgColor : fileCategory.bgColor
            )}
          >
            <IconComponent
              className={cn(
                "w-5 h-5",
                isOwn ? fileCategory.ownColor : fileCategory.color
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-medium truncate",
                isOwn ? "text-white" : "text-foreground"
              )}
            >
              {fileInfo.name}
            </p>
            <p
              className={cn(
                "text-xs uppercase font-medium",
                isOwn ? "text-white/70" : "text-muted-foreground"
              )}
            >
              {fileInfo.extension}
            </p>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" download>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 shrink-0",
                isOwn && "text-white hover:text-white hover:bg-white/20"
              )}
            >
              <Download className="h-4 w-4" />
            </Button>
          </a>
        </div>
        <audio src={url} controls className="w-full h-10" preload="metadata" />
      </div>
    );
  }

  // Render PDF with preview option
  if (isPdf) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg transition-colors min-w-[220px] max-w-[300px] border",
          isOwn
            ? "bg-black/20 border-white/20 hover:bg-black/30"
            : "bg-muted border-border hover:bg-muted/80",
          className
        )}
      >
        {/* PDF Icon */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "w-12 h-14 rounded-lg flex items-center justify-center border-2",
              isOwn
                ? "border-red-400/50 bg-red-500/20"
                : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
            )}
          >
            <FileText
              className={cn("w-6 h-6", isOwn ? "text-red-300" : "text-red-500")}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
            PDF
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium truncate",
              isOwn ? "text-white" : "text-foreground"
            )}
          >
            {fileInfo.name}
          </p>
          <p
            className={cn(
              "text-xs",
              isOwn ? "text-white/70" : "text-muted-foreground"
            )}
          >
            Click to view
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 shrink-0",
            isOwn && "text-white hover:text-white hover:bg-white/20"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const link = document.createElement("a");
            link.href = url;
            link.download = fileInfo.name;
            link.click();
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
      </a>
    );
  }

  // Render generic file attachment
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg min-w-[220px] max-w-[300px] border",
        isOwn ? "bg-black/20 border-white/20" : "bg-muted border-border",
        className
      )}
    >
      {/* File icon with category color */}
      <div
        className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
          isOwn ? fileCategory.ownBgColor : fileCategory.bgColor
        )}
      >
        <IconComponent
          className={cn(
            "w-6 h-6",
            isOwn ? fileCategory.ownColor : fileCategory.color
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isOwn ? "text-white" : "text-foreground"
          )}
        >
          {fileInfo.name}
        </p>
        <p
          className={cn(
            "text-xs uppercase font-medium",
            isOwn ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {fileInfo.extension || "File"}
        </p>
      </div>

      <div className="flex gap-1 shrink-0">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              isOwn && "text-white hover:text-white hover:bg-white/20"
            )}
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
        <a href={url} download={fileInfo.name}>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              isOwn && "text-white hover:text-white hover:bg-white/20"
            )}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}
