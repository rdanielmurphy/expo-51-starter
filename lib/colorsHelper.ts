function componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export const rgbToHex = (r: number, g: number, b: number) => (
    "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
);

export const numberToHex = (colorNumber: number) => {
    const red = (colorNumber >> 16) & 0x0ff;
    const green = (colorNumber >> 8) & 0x0ff;
    const blue = (colorNumber) & 0x0ff;

    return rgbToHex(red, green, blue);
}