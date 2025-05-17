export function formatRupiah(value: string): string {
    const numberString = value.replace(/[^,\d]/g, "").toString();
    const split = numberString.split(",");
    const sisa = split[0].length % 3;
    const rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/g);

    let formatted = rupiah;
    if (ribuan) {
        const separator = sisa ? "." : "";
        formatted += separator + ribuan.join(".");
    }

    return split[1] !== undefined ? `${formatted},${split[1]}` : formatted;
}
