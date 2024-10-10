export const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const removeSpanTags = (s?: string) => s ? s.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '') : undefined;