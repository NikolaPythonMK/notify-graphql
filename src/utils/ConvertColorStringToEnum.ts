import { Color } from "@prisma/client";

export function convertToColorEnum(color: string): Color | null{
    color = color.toUpperCase();
    if (color === 'GREEN')
        return Color.GREEN;
    else if (color === 'RED')
        return Color.RED;
    else if (color === 'GRAY')
        return Color.GRAY
    else if (color === 'BLUE')
        return Color.BLUE
    else if (color === 'ORANGE')
        return Color.ORANGE
    else if (color === 'YELLOW')
        return Color.YELLOW
    return null;
}