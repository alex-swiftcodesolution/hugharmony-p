"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, Search } from "lucide-react";

export default function LocationSection({
  location,
  setLocation,
}: {
  location: string;
  setLocation: (loc: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{ display_name: string; lat: string; lon: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: 40.7128, lng: -74.006 });
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || !open) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json&limit=6&addressdetails=1`
        );
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query, open]);

  // When selecting a suggestion
  const selectLocation = (s: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    setLocation(s.display_name);
    setCoords({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) });
    setSuggestions([]);
    setQuery(s.display_name);
  };

  // Current location
  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        setLocation(
          data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        );
      },
      () => alert("Location access denied")
    );
  };

  return (
    <div className="space-y-2">
      <Label>Location</Label>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="relative group cursor-pointer">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <Input
              value={location}
              readOnly
              placeholder="Set your location..."
              className="pl-9 cursor-pointer hover:bg-accent/50 transition-colors"
            />
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Set Location</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
              {loading && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />
              )}

              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm truncate"
                      onClick={() => selectLocation(s)}
                    >
                      {s.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              onClick={useCurrentLocation}
              className="w-full"
              disabled={loading}
            >
              <MapPin className="mr-2 h-4 w-4" /> Use Current Location
            </Button>

            <div className="rounded-md border overflow-hidden h-[200px] w-full bg-muted relative">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  coords.lng - 0.05
                },${coords.lat - 0.05},${coords.lng + 0.05},${
                  coords.lat + 0.05
                }&layer=mapnik&marker=${coords.lat},${coords.lng}`}
                className="opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setOpen(false)}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
