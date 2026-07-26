import React, { useState, useEffect } from "react";
import { Code2, PanelRightClose, Copy, Check, FileCode } from "lucide-react";
import { useSelector } from "react-redux";

const ArtEffect = () => {
  const { artifacts } = useSelector((state) => state.message);
  const activeArtifact = artifacts?.[0];
  const files = activeArtifact?.files || [];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSelectedIndex(0);
    setCopied(false);
  }, [activeArtifact?.id]);

  const selectedFile = files[selectedIndex];

  const handleCopy = async () => {
    if (!selectedFile?.code) return;
    try {
      await navigator.clipboard.writeText(selectedFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="hidden lg:flex h-full border-l border-white/[0.06] flex-col overflow-hidden shrink-0 w-[250px]">
      <div className="flex flex-col h-full bg-[#0d0f14]">
        <div className="h-14 px-4 border-b border-white/[0.06] flex items-center gap-3 shrink-0">
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all duration-200">
            <PanelRightClose className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Code2 className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="truncate text-sm text-slate-200">
              {activeArtifact?.title || "No artifact yet"}
            </div>
          </div>
        </div>

        {activeArtifact ? (
          <div className="flex flex-col flex-1 min-h-0">
            {files.length > 0 && (
              <div className="flex flex-col border-b border-white/[0.06] max-h-[35%] overflow-y-auto shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {files.map((file, index) => (
                  <button
                    key={file.filename + index}
                    onClick={() => setSelectedIndex(index)}
                    className={`flex items-center gap-2 px-4 py-2 text-left text-xs transition-colors ${
                      index === selectedIndex
                        ? "bg-white/[0.06] text-slate-100"
                        : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                    }`}
                    title={file.description}
                  >
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{file.filename}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedFile?.description && (
              <p className="px-4 py-2 text-[11px] text-slate-500 border-b border-white/[0.06] leading-relaxed shrink-0">
                {selectedFile.description}
              </p>
            )}

            <div className="relative flex-1 min-h-0 overflow-hidden">
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.06] hover:bg-white/10 text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
              <pre className="h-full overflow-auto px-4 py-3 text-[11px] leading-relaxed text-slate-300 font-mono whitespace-pre-wrap break-words [scrollbar-width:thin]">
                <code>{selectedFile?.code || "// No code available"}</code>
              </pre>
            </div>

            {activeArtifact.runInstructions?.length > 0 && (
              <div className="px-4 py-3 border-t border-white/[0.06] shrink-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1.5">
                  Run
                </p>
                <ul className="space-y-1">
                  {activeArtifact.runInstructions.map((step, i) => (
                    <li
                      key={i}
                      className="text-[11px] font-mono text-slate-400 truncate"
                    >
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-2">
            <Code2 className="w-6 h-6 text-slate-600" />
            <p className="text-xs text-slate-500">
              Generated code and files will show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtEffect;