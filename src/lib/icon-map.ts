import { Car, Home, UtensilsCrossed, Smile, HeartPulse, ShoppingBag, DollarSign, Sprout, Repeat, LucideIcon, HelpCircle, Palette, Plane, Shirt, BookOpen, Gift, Dumbbell, Dog, GraduationCap, Gamepad2, Settings, Landmark } from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
    Home,
    UtensilsCrossed,
    Car,
    Smile,
    HeartPulse,
    ShoppingBag,
    DollarSign,
    Repeat,
    Sprout,
    HelpCircle,
    Palette,
    Plane,
    Shirt,
    BookOpen,
    Gift,
    Dumbbell,
    Dog,
    GraduationCap,
    Gamepad2,
    Settings,
    Landmark
};

export type IconName = keyof typeof iconMap;

export const availableIcons: { name: IconName, icon: LucideIcon }[] = Object.entries(iconMap).map(([name, icon]) => ({
    name: name as IconName,
    icon: icon
}));

export const getIcon = (name: IconName | undefined): LucideIcon => {
    return name ? iconMap[name] : HelpCircle;
};
