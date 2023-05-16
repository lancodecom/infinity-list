export const isNumber = (value: string | number) => {
    return /^\d+$/.test(String(value))
}