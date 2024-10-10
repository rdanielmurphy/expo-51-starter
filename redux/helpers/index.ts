export function updateObjectInArray(array: any[], action: { index: number, item: any }) {
    return array.map((item, index) => {
        if (index !== action.index) {
            // This isn't the item we care about - keep it as-is
            return item
        }

        // Otherwise, this is the one we want - return an updated value
        return {
            ...item,
            ...action.item
        }
    })
}