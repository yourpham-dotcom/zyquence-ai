import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Track } from "../MusicStudio";

interface EffectsPanelProps {
  selectedTrack?: Track;
  onEffectsChange: (effects: any) => void;
}

const EffectsPanel = ({ selectedTrack, onEffectsChange }: EffectsPanelProps) => {
  if (!selectedTrack) {
    return (
      <div className="h-full p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Select a track to edit effects</p>
        </Card>
      </div>
    );
  }

  const effects = selectedTrack.effects || {};

  const updateEffect = (key: string, value: any) => {
    onEffectsChange({ ...effects, [key]: value });
  };

  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h3 className="text-xl font-semibold">Effects - {selectedTrack.name}</h3>

        {/* Reverb */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="reverb-enable" className="text-base font-semibold">
                Reverb
              </Label>
              <Switch
                id="reverb-enable"
                checked={effects.reverbEnabled || false}
                onCheckedChange={(checked) => updateEffect("reverbEnabled", checked)}
              />
            </div>
            
            {effects.reverbEnabled && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Room Size</Label>
                  <Slider
                    value={[effects.reverbSize || 50]}
                    onValueChange={([v]) => updateEffect("reverbSize", v)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">Wet/Dry Mix</Label>
                  <Slider
                    value={[effects.reverbMix || 30]}
                    onValueChange={([v]) => updateEffect("reverbMix", v)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* EQ */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="eq-enable" className="text-base font-semibold">
                Equalizer
              </Label>
              <Switch
                id="eq-enable"
                checked={effects.eqEnabled || false}
                onCheckedChange={(checked) => updateEffect("eqEnabled", checked)}
              />
            </div>
            
            {effects.eqEnabled && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Low (Bass)</Label>
                  <Slider
                    value={[effects.eqLow || 50]}
                    onValueChange={([v]) => updateEffect("eqLow", v)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">Mid</Label>
                  <Slider
                    value={[effects.eqMid || 50]}
                    onValueChange={([v]) => updateEffect("eqMid", v)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">High (Treble)</Label>
                  <Slider
                    value={[effects.eqHigh || 50]}
                    onValueChange={([v]) => updateEffect("eqHigh", v)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Compressor */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="comp-enable" className="text-base font-semibold">
                Compressor
              </Label>
              <Switch
                id="comp-enable"
                checked={effects.compressorEnabled || false}
                onCheckedChange={(checked) => updateEffect("compressorEnabled", checked)}
              />
            </div>
            
            {effects.compressorEnabled && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Threshold</Label>
                  <Slider
                    value={[effects.compressorThreshold || 50]}
                    onValueChange={([v]) => updateEffect("compressorThreshold", v)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">Ratio</Label>
                  <Slider
                    value={[effects.compressorRatio || 30]}
                    onValueChange={([v]) => updateEffect("compressorRatio", v)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EffectsPanel;