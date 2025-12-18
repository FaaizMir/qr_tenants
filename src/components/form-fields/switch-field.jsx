import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SwitchField({ label, description, name, checked, onCheckedChange }) {
    return (
        <div className="flex justify-between items-center p-4 border mb-4 rounded-lg">
            <div>
                <Label className="text-sm font-medium">{label || "Label"}</Label>
                <p className="text-sm text-muted-foreground">
                    {description || "Description goes here"}
                </p>
            </div>
            <Switch id={name} checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}
