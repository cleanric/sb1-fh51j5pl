import { useState, useEffect } from "react";
import { Search, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth0 } from "@auth0/auth0-react";
import { getStoredResumeText, storeResumeText } from "@/lib/storage";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  location: string;
  setLocation: (location: string) => void;
  onSearch: (resumeText?: string) => void;
  initialResumeApplied?: boolean;
  analysisStatement?: string | null;
}

export function SearchBar({ 
  query, 
  setQuery, 
  location, 
  setLocation, 
  onSearch,
  initialResumeApplied = false,
  analysisStatement
}: SearchBarProps) {
  const [isActive, setIsActive] = useState(false);
  const [showResumeField, setShowResumeField] = useState(true);
  const [resumeText, setResumeText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isResumeApplied, setIsResumeApplied] = useState(initialResumeApplied);
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  
  useEffect(() => {
    if (isAuthenticated) {
      const storedText = getStoredResumeText();
      setResumeText(storedText);
      setIsResumeApplied(Boolean(storedText && initialResumeApplied));
    }
  }, [isAuthenticated, initialResumeApplied]);
  
  const handleSignIn = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login',
      },
      appState: {
        returnTo: window.location.pathname
      }
    });
  };

  const handleResumeTextChange = (text: string) => {
    setResumeText(text);
    setIsResumeApplied(false);
    if (isAuthenticated) {
      storeResumeText(text);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      if (showResumeField && resumeText.trim()) {
        setIsResumeApplied(true);
      }
      await onSearch(showResumeField ? resumeText : undefined);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleResumeToggle = (checked: boolean) => {
    setShowResumeField(checked);
    setIsResumeApplied(false);
    if (!checked) {
      storeResumeText('');
    }
  };
  
  return (
    <div 
      className={cn(
        "mx-auto max-w-2xl transition-all duration-300 space-y-3 sm:space-y-4 px-4 sm:px-0",
        isActive ? "transform scale-[1.02] sm:scale-105" : ""
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4 justify-start">
        <div className="flex items-center space-x-2">
          <Switch
            id="resume-toggle"
            checked={showResumeField}
            onCheckedChange={handleResumeToggle}
            className="data-[state=checked]:bg-[#00BFFF] scale-90 sm:scale-100"
          />
          <Label htmlFor="resume-toggle" className="text-xs sm:text-sm text-gray-600 cursor-pointer">Add Resume Text</Label>
        </div>
      </div>

      {showResumeField && (
        <div className="bg-gradient-to-r from-[#00BFFF] to-[#00CED1] p-[1px] rounded-2xl sm:rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="bg-white rounded-2xl sm:rounded-full flex items-center p-2 sm:p-1.5 md:p-2">
            {isAuthenticated ? (
              <div className="relative flex-1">
                <textarea
                  value={resumeText}
                  onChange={(e) => handleResumeTextChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste your resume text here..."
                  className={cn(
                    "w-full px-3 sm:px-4 py-2 text-sm text-gray-700 bg-transparent border-none outline-none resize-none min-h-[60px] sm:min-h-[40px]",
                    isResumeApplied && "pr-10"
                  )}
                  rows={window.innerWidth < 640 ? 3 : 1}
                  readOnly={isResumeApplied}
                />
                {isResumeApplied && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full px-3 sm:px-4 py-2 text-sm text-gray-500 flex items-center justify-between">
                <span>Please <a href="#" onClick={(e) => { e.preventDefault(); handleSignIn(); }} className="text-[#00BFFF] hover:text-[#00CED1] underline">sign in</a> to paste your resume text</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-r from-[#00BFFF] to-[#00CED1] p-[1px] rounded-2xl sm:rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="bg-white rounded-2xl sm:rounded-full flex flex-col sm:flex-row items-stretch sm:items-center p-2 sm:p-1.5 md:p-2 gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center flex-1 sm:px-3 md:px-4 sm:divide-x divide-gray-200 gap-2 sm:gap-0">
            <div className="flex items-center flex-1 sm:pr-3 px-2 sm:px-0">
              <Search className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Job title, keyword, or company" 
                className="flex-1 outline-none bg-transparent placeholder-gray-400 text-sm md:text-base py-2 sm:py-0"
                onFocus={() => setIsActive(true)}
                onBlur={() => setIsActive(false)}
              />
            </div>
            <div className="flex items-center flex-1 sm:pl-3 px-2 sm:px-0">
              <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Location" 
                className="flex-1 outline-none bg-transparent placeholder-gray-400 text-sm md:text-base py-2 sm:py-0"
                onFocus={() => setIsActive(true)}
                onBlur={() => setIsActive(false)}
              />
            </div>
          </div>
          <Button 
            className="rounded-xl sm:rounded-full bg-gradient-to-r from-[#00BFFF] to-[#00CED1] text-white px-4 sm:px-5 py-3 sm:py-2 
                     hover:shadow-inner transition-all duration-300 flex-shrink-0 text-sm sm:text-base font-medium"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {analysisStatement && (
        <div className="px-3 sm:px-4 py-3 bg-[#F0F9FF] rounded-lg text-sm text-gray-600 mx-4 sm:mx-0">
          {analysisStatement}
        </div>
      )}
    </div>
  );
}