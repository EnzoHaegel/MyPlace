export interface Connection {
    changePixel: "ChangePixel";
}

export interface Pixel {
    row: number;
    col: number;
    color: string;
}
