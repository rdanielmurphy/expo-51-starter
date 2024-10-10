export const numberToUSD = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
}

//formatCurrency({ amount: reportData.totalFee || 0, code: "USD" })[0]