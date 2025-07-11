/**
 * @file Este arquivo fornece um mapeamento centralizado de nomes de ícones para seus respectivos componentes `lucide-react`.
 * Permite a renderização dinâmica de ícones com base em um nome de string, o que é útil para UIs orientadas a dados,
 * como a seleção de categoria.
 */

import { Car, Home, UtensilsCrossed, Smile, HeartPulse, ShoppingBag, DollarSign, Sprout, Repeat, LucideIcon, HelpCircle, Palette, Plane, Shirt, BookOpen, Gift, Dumbbell, Dog, GraduationCap, Gamepad2, Settings, Landmark, CalendarClock } from "lucide-react";

/**
 * Um registro que mapeia chaves de string (nomes de ícones) para componentes de ícone `lucide-react`.
 */
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
    Landmark,
    CalendarClock
};

/**
 * Um tipo que representa os nomes válidos dos ícones disponíveis no `iconMap`.
 */
export type IconName = keyof typeof iconMap;

/**
 * Um array de ícones disponíveis, útil para preencher inputs de seleção.
 * Cada objeto contém o nome do ícone e seu componente.
 */
export const availableIcons: { name: IconName, icon: LucideIcon }[] = Object.entries(iconMap).map(([name, icon]) => ({
    name: name as IconName,
    icon: icon
}));

/**
 * Uma função utilitária para recuperar um componente de ícone do mapa pelo seu nome.
 * Retorna um ícone padrão `HelpCircle` se o nome solicitado não for encontrado.
 *
 * @param {IconName | undefined} name - O nome do ícone a ser recuperado.
 * @returns {LucideIcon} O componente de ícone correspondente, ou um ícone padrão.
 */
export const getIcon = (name: IconName | undefined): LucideIcon => {
    return name ? iconMap[name] : HelpCircle;
};
